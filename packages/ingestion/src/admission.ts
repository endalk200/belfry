import type { RetentionResult, TelemetryStorageOptions } from "@belfry/storage";
import { Context, Deferred, Effect, Layer, Queue, Ref, Schema } from "effect";

import {
	type IngestionError,
	IngestionInvalidPayload,
	IngestionOverloaded,
	IngestionPayloadTooLarge,
	IngestionUnavailable,
	IngestionUnsupportedEncoding,
	IngestionUnsupportedMediaType,
} from "./errors.js";
import {
	type WriterConfiguration,
	type WriterDiagnostic,
	type WriterRequest,
	type WriterResponse,
	WriterRetentionResultSchema,
} from "./worker-protocol.js";
import { WriterWorkerTransport } from "./writer-transport.js";

export type IngestionRequest = {
	readonly signal: "traces" | "logs";
	readonly contentType: string;
	readonly contentEncoding?: string | undefined;
	readonly body: Uint8Array;
};

export type IngestionRequestMetadata = Omit<IngestionRequest, "body">;

export type IngestionResult = {
	readonly records: number;
	readonly logIds: ReadonlyArray<string>;
	readonly durationMs: number;
};

export type AdmissionSnapshot = {
	readonly accepting: boolean;
	readonly writerFailure?: string | undefined;
	readonly queueDepth: number;
	readonly queueBytes: number;
	readonly requestCapacity: number;
	readonly byteCapacity: number;
	readonly writeLatencyP50Ms: number;
	readonly writeLatencyP95Ms: number;
	readonly unpersistedRejectedRequests: bigint;
	readonly droppedDiagnostics: bigint;
};

export type IngestionReservation = {
	readonly submit: (body: Uint8Array) => Effect.Effect<IngestionResult, IngestionError>;
	readonly release: Effect.Effect<void>;
};

export type IngestionAdmissionOptions = {
	readonly storage: TelemetryStorageOptions;
	readonly maxCompressedBytes: number;
	readonly maxDecompressedBytes: number;
	readonly queueRequestCapacity: number;
	readonly queueByteCapacity: number;
	readonly writerTimeoutMs: number;
	readonly drainTimeoutMs: number;
	readonly retentionMaxAgeNs: bigint;
	readonly retentionMaxBytes: bigint;
	readonly retentionBatchSize: number;
	readonly workerUrl?: URL | undefined;
};

export type IngestionAdmissionService = {
	readonly submit: (request: IngestionRequest) => Effect.Effect<IngestionResult, IngestionError>;
	readonly reserve: (
		request: IngestionRequestMetadata,
		compressedBytes: number,
	) => Effect.Effect<IngestionReservation, IngestionError>;
	readonly snapshot: Effect.Effect<AdmissionSnapshot>;
	readonly recordRejected: (diagnostic: WriterDiagnostic) => Effect.Effect<void>;
	readonly runRetention: Effect.Effect<RetentionResult, IngestionUnavailable>;
	readonly checkpoint: Effect.Effect<void, IngestionUnavailable>;
	readonly shutdown: Effect.Effect<void>;
};

type QueuedRequest = {
	readonly request: Extract<WriterRequest, { readonly _tag: "ingest" }>;
	readonly deferred: Deferred.Deferred<IngestionResult, IngestionError>;
	readonly bytes: number;
};

type QueuedDiagnostic = {
	readonly diagnostic: WriterDiagnostic;
};

type CapacityState = {
	readonly requests: number;
	readonly bytes: number;
	readonly accepting: boolean;
	readonly writerFailure?: string | undefined;
};

export class IngestionAdmission extends Context.Service<IngestionAdmission, IngestionAdmissionService>()(
	"@belfry/ingestion/IngestionAdmission",
) {
	static readonly layer = (options: IngestionAdmissionOptions) =>
		Layer.effect(IngestionAdmission)(openIngestionAdmission(options));
}

export const openIngestionAdmission = (
	options: IngestionAdmissionOptions,
): Effect.Effect<IngestionAdmissionService, IngestionUnavailable, import("effect").Scope.Scope> =>
	Effect.gen(function* () {
		const queue = yield* Queue.dropping<QueuedRequest>(options.queueRequestCapacity);
		const diagnosticQueue = yield* Queue.dropping<QueuedDiagnostic>(Math.max(1, options.queueRequestCapacity));
		const capacity = yield* Ref.make<CapacityState>({ requests: 0, bytes: 0, accepting: true });
		const diagnosticPending = yield* Ref.make(0);
		const writeLatencies = yield* Ref.make<ReadonlyArray<number>>([]);
		const unpersistedRejectedRequests = yield* Ref.make(0n);
		const droppedDiagnostics = yield* Ref.make(0n);
		const recordUnpersistedRejection = Effect.all([
			Ref.update(unpersistedRejectedRequests, (count) => count + 1n),
			Ref.update(droppedDiagnostics, (count) => count + 1n),
		]).pipe(Effect.asVoid);
		const releaseCapacity = (bytes: number) =>
			Ref.update(capacity, (state) => ({
				...state,
				requests: Math.max(0, state.requests - 1),
				bytes: Math.max(0, state.bytes - bytes),
			}));
		const markWriterUnavailable = Ref.update(capacity, (state) => ({
			...state,
			accepting: false,
			writerFailure:
				"The telemetry writer became unavailable; restart the Belfry Daemon after checking storage and retention diagnostics.",
		}));
		const transportContext = yield* Layer.build(
			WriterWorkerTransport.layer({
				timeoutMs: options.writerTimeoutMs,
				workerUrl: options.workerUrl,
				onUnavailable: markWriterUnavailable,
			}),
		);
		const transport = Context.get(transportContext, WriterWorkerTransport);
		const callWorker = transport.call;
		const configuration: WriterConfiguration = {
			databasePath: options.storage.databasePath,
			maxIndexedAttributesPerRecord: options.storage.maxIndexedAttributesPerRecord ?? 64,
			maxIndexedValueBytes: options.storage.maxIndexedValueBytes ?? 512,
			maxIndexedAttributeKeys: options.storage.maxIndexedAttributeKeys ?? 256,
			maxIndexedValuesPerKey: options.storage.maxIndexedValuesPerKey ?? 1_024,
			maxDecompressedBytes: options.maxDecompressedBytes,
			retentionMaxAgeNs: options.retentionMaxAgeNs,
			retentionMaxBytes: options.retentionMaxBytes,
			retentionBatchSize: options.retentionBatchSize,
		};
		const initialization = yield* callWorker({
			_tag: "initialize",
			id: crypto.randomUUID(),
			configuration,
		});
		if (initialization._tag !== "ready") {
			return yield* Effect.fail(maintenanceFailure(initialization));
		}

		const maintenance = (
			operation: "retention" | "checkpoint" | "record-rejected" | "record-decode-error",
			diagnostic?: WriterDiagnostic,
		) =>
			Effect.suspend(() =>
				callWorker({ _tag: "maintenance", id: crypto.randomUUID(), operation, diagnostic }),
			).pipe(
				Effect.flatMap((response) =>
					response._tag === "maintenance-success"
						? Effect.succeed(response.result)
						: Effect.fail(maintenanceFailure(response)),
				),
				Effect.tapError(() => markWriterUnavailable),
			);
		const persistRejection = (diagnostic: WriterDiagnostic) => maintenance("record-rejected", diagnostic);
		const recordRejected = (diagnostic: WriterDiagnostic): Effect.Effect<void> =>
			Effect.gen(function* () {
				const state = yield* Ref.get(capacity);
				if (state.writerFailure !== undefined) {
					yield* recordUnpersistedRejection;
					return;
				}
				const offered = yield* Effect.uninterruptible(
					Ref.update(diagnosticPending, (pending) => pending + 1).pipe(
						Effect.andThen(Queue.offer(Queue.asEnqueue(diagnosticQueue), { diagnostic })),
						Effect.tap((accepted) =>
							accepted
								? Effect.void
								: Ref.update(diagnosticPending, (pending) => Math.max(0, pending - 1)).pipe(
										Effect.andThen(recordUnpersistedRejection),
									),
						),
					),
				);
				if (!offered) return;
			});
		const diagnosticConsumer = Effect.forever(
			Queue.take(Queue.asDequeue(diagnosticQueue)).pipe(
				Effect.flatMap((item) =>
					Effect.gen(function* () {
						const persisted = yield* Effect.result(persistRejection(item.diagnostic));
						if (persisted._tag === "Failure") yield* recordUnpersistedRejection;
					}).pipe(
						Effect.ignore,
						Effect.ensuring(Ref.update(diagnosticPending, (pending) => Math.max(0, pending - 1))),
					),
				),
			),
		);
		yield* Effect.forkScoped(diagnosticConsumer);
		const consumer = Effect.forever(
			Queue.take(Queue.asDequeue(queue)).pipe(
				Effect.flatMap((item) =>
					Effect.gen(function* () {
						const response = yield* Effect.result(callWorker(item.request));
						yield* releaseCapacity(item.bytes);
						if (response._tag === "Failure") {
							yield* markWriterUnavailable;
							yield* recordUnpersistedRejection;
							yield* Deferred.fail(item.deferred, response.failure);
						} else {
							const workerResponse = response.success;
							if (isFatalWriterResponse(workerResponse)) {
								yield* markWriterUnavailable;
								yield* recordUnpersistedRejection;
							}
							if (workerResponse._tag === "ingest-success") {
								const durationMs = workerResponse.durationMs;
								yield* Ref.update(writeLatencies, (current) => [...current.slice(-1_023), durationMs]);
							}
							yield* Deferred.completeWith(item.deferred, responseToIngestion(workerResponse));
						}
					}),
				),
			),
		);
		yield* Effect.forkScoped(consumer);

		const snapshot = Effect.gen(function* () {
			const state = yield* Ref.get(capacity);
			const sortedLatencies = [...(yield* Ref.get(writeLatencies))].sort((left, right) => left - right);
			return {
				accepting: state.accepting,
				writerFailure: state.writerFailure,
				queueDepth: state.requests,
				queueBytes: state.bytes,
				requestCapacity: options.queueRequestCapacity,
				byteCapacity: options.queueByteCapacity,
				writeLatencyP50Ms: percentile(sortedLatencies, 0.5),
				writeLatencyP95Ms: percentile(sortedLatencies, 0.95),
				unpersistedRejectedRequests: yield* Ref.get(unpersistedRejectedRequests),
				droppedDiagnostics: yield* Ref.get(droppedDiagnostics),
			};
		});

		const reserve = (
			request: IngestionRequestMetadata,
			compressedBytes: number,
		): Effect.Effect<IngestionReservation, IngestionError> =>
			Effect.gen(function* () {
				const contentType = normalizeContentType(request.contentType);
				if (contentType === undefined) {
					const message = "Belfry accepts OTLP application/x-protobuf and application/json payloads.";
					yield* recordRejected({ signal: request.signal, code: "unsupported_content_type", message }).pipe(
						Effect.ignore,
					);
					return yield* Effect.fail(
						new IngestionUnsupportedMediaType({ contentType: request.contentType, message }),
					);
				}
				const contentEncoding = normalizeContentEncoding(request.contentEncoding);
				if (contentEncoding === undefined) {
					const message = "Belfry accepts identity or gzip request encoding.";
					yield* recordRejected({
						signal: request.signal,
						code: "unsupported_content_encoding",
						message,
					}).pipe(Effect.ignore);
					return yield* Effect.fail(
						new IngestionUnsupportedEncoding({
							contentEncoding: request.contentEncoding ?? "",
							message,
						}),
					);
				}
				if (
					!Number.isSafeInteger(compressedBytes) ||
					compressedBytes < 0 ||
					compressedBytes > options.maxCompressedBytes
				) {
					const message = "The compressed OTLP request exceeds Belfry's configured limit.";
					yield* recordRejected({
						signal: request.signal,
						code: "compressed_payload_too_large",
						message,
					}).pipe(Effect.ignore);
					return yield* Effect.fail(
						new IngestionPayloadTooLarge({
							stage: "compressed",
							limitBytes: options.maxCompressedBytes,
							actualBytes: compressedBytes,
							message,
						}),
					);
				}

				const admitted = yield* Ref.modify(capacity, (state) => {
					const allowed =
						state.accepting &&
						state.requests < options.queueRequestCapacity &&
						state.bytes + compressedBytes <= options.queueByteCapacity;
					return [
						allowed,
						allowed
							? { ...state, requests: state.requests + 1, bytes: state.bytes + compressedBytes }
							: state,
					] as const;
				});
				if (!admitted) {
					const current = yield* Ref.get(capacity);
					if (!current.accepting) {
						if (current.writerFailure !== undefined) {
							return yield* Effect.fail(
								new IngestionUnavailable({
									code: "writer_unavailable",
									message: current.writerFailure,
								}),
							);
						}
						const message = "Belfry is shutting down.";
						yield* recordRejected({ signal: request.signal, code: "shutdown", message }).pipe(
							Effect.ignore,
						);
						return yield* Effect.fail(new IngestionUnavailable({ code: "shutdown", message }));
					}
					const message = "Belfry's bounded ingestion queue is full; retry with backoff.";
					yield* recordRejected({ signal: request.signal, code: "queue_saturated", message }).pipe(
						Effect.ignore,
					);
					return yield* Effect.fail(
						new IngestionOverloaded({
							queueDepth: current.requests,
							queueBytes: current.bytes,
							message,
						}),
					);
				}

				let released = false;
				let handedOff = false;
				const release = Effect.suspend(() => {
					if (released || handedOff) return Effect.void;
					released = true;
					return releaseCapacity(compressedBytes);
				});
				const submitReserved = (body: Uint8Array): Effect.Effect<IngestionResult, IngestionError> =>
					Effect.gen(function* () {
						if (body.byteLength > options.maxCompressedBytes) {
							const message = "The compressed OTLP request exceeds Belfry's configured limit.";
							yield* recordRejected({
								signal: request.signal,
								code: "compressed_payload_too_large",
								message,
							}).pipe(Effect.ignore);
							return yield* Effect.fail(
								new IngestionPayloadTooLarge({
									stage: "compressed",
									limitBytes: options.maxCompressedBytes,
									actualBytes: body.byteLength,
									message,
								}),
							);
						}
						if (body.byteLength > compressedBytes) {
							const current = yield* Ref.get(capacity);
							return yield* Effect.fail(
								new IngestionOverloaded({
									queueDepth: current.requests,
									queueBytes: current.bytes,
									message: "The streamed request exceeded its reserved ingestion capacity; retry.",
								}),
							);
						}

						const deferred = yield* Deferred.make<IngestionResult, IngestionError>();
						const offered = yield* Effect.uninterruptible(
							Queue.offer(Queue.asEnqueue(queue), {
								request: {
									_tag: "ingest",
									id: crypto.randomUUID(),
									signal: request.signal,
									contentType,
									contentEncoding,
									body,
								},
								deferred,
								bytes: compressedBytes,
							}).pipe(
								Effect.tap((accepted) =>
									Effect.sync(() => {
										handedOff = accepted;
									}),
								),
							),
						);
						if (!offered) {
							const current = yield* Ref.get(capacity);
							const message = "Belfry's bounded ingestion queue is full; retry with backoff.";
							yield* recordRejected({ signal: request.signal, code: "queue_saturated", message }).pipe(
								Effect.ignore,
							);
							return yield* Effect.fail(
								new IngestionOverloaded({
									queueDepth: current.requests,
									queueBytes: current.bytes,
									message,
								}),
							);
						}
						return yield* Deferred.await(deferred);
					});
				return { submit: submitReserved, release };
			});

		const submit = (request: IngestionRequest): Effect.Effect<IngestionResult, IngestionError> =>
			reserve(request, request.body.byteLength).pipe(
				Effect.flatMap((reservation) =>
					reservation.submit(request.body).pipe(Effect.ensuring(reservation.release)),
				),
			);

		const shutdown = Effect.gen(function* () {
			yield* Ref.update(capacity, (state) => ({ ...state, accepting: false }));
			yield* waitUntilDrained(capacity, options.drainTimeoutMs);
			yield* waitUntilZero(diagnosticPending, options.drainTimeoutMs);
			yield* transport.shutdown;
			yield* Queue.shutdown(queue);
			yield* Queue.shutdown(diagnosticQueue);
		}).pipe(Effect.ignore);
		yield* Effect.addFinalizer(() => shutdown);

		return {
			submit,
			reserve,
			snapshot,
			recordRejected,
			runRetention: maintenance("retention").pipe(
				Effect.flatMap((result) =>
					Schema.decodeUnknownEffect(WriterRetentionResultSchema)(result).pipe(
						Effect.mapError(
							() =>
								new IngestionUnavailable({
									code: "worker_protocol_error",
									message: "The telemetry writer returned an invalid retention result.",
								}),
						),
					),
				),
				Effect.tapError(() => markWriterUnavailable),
			),
			checkpoint: maintenance("checkpoint").pipe(Effect.asVoid),
			shutdown,
		};
	});

const responseToIngestion = (response: WriterResponse): Effect.Effect<IngestionResult, IngestionError> =>
	response._tag === "ingest-success"
		? Effect.succeed({ records: response.records, logIds: response.logIds, durationMs: response.durationMs })
		: Effect.fail(workerFailure(response));

const workerFailure = (response: WriterResponse): IngestionError => {
	if (response._tag !== "failure") {
		return new IngestionUnavailable({
			code: "worker_protocol_error",
			message: `Unexpected writer response: ${response._tag}`,
		});
	}
	switch (response.code) {
		case "unsupported_content_type":
			return new IngestionUnsupportedMediaType({ contentType: "unknown", message: response.message });
		case "unsupported_content_encoding":
			return new IngestionUnsupportedEncoding({ contentEncoding: "unknown", message: response.message });
		case "decompressed_too_large":
			return new IngestionPayloadTooLarge({
				stage: "decompressed",
				limitBytes: response.limitBytes ?? 0,
				actualBytes: response.actualBytes ?? 0,
				message: response.message,
			});
		case "malformed_payload":
		case "invalid_trace_id":
		case "invalid_span_id":
			return new IngestionInvalidPayload({ code: response.code, message: response.message });
		case "storage_unavailable":
		case "maintenance_failed":
			return new IngestionUnavailable({ code: "storage_unavailable", message: response.message });
		case "worker_protocol_error":
			return new IngestionUnavailable({ code: "worker_protocol_error", message: response.message });
	}
};

const maintenanceFailure = (response: WriterResponse): IngestionUnavailable =>
	new IngestionUnavailable({
		code:
			response._tag === "failure" &&
			(response.code === "storage_unavailable" || response.code === "maintenance_failed")
				? "storage_unavailable"
				: "worker_protocol_error",
		message: response._tag === "failure" ? response.message : `Unexpected writer response: ${response._tag}`,
	});

const isFatalWriterResponse = (response: WriterResponse): boolean =>
	response._tag === "failure" &&
	(response.code === "storage_unavailable" ||
		response.code === "maintenance_failed" ||
		response.code === "worker_protocol_error");

const waitUntilDrained = (capacity: Ref.Ref<CapacityState>, timeoutMs: number): Effect.Effect<void> =>
	Effect.promise(
		() =>
			new Promise<void>((resolve) => {
				const startedAt = Date.now();
				const poll = () => {
					const state = Ref.getUnsafe(capacity);
					if (state.requests === 0 || Date.now() - startedAt >= timeoutMs) resolve();
					else setTimeout(poll, 10);
				};
				poll();
			}),
	);

const waitUntilZero = (pending: Ref.Ref<number>, timeoutMs: number): Effect.Effect<void> =>
	Effect.promise(
		() =>
			new Promise<void>((resolve) => {
				const startedAt = Date.now();
				const poll = () => {
					if (Ref.getUnsafe(pending) === 0 || Date.now() - startedAt >= timeoutMs) resolve();
					else setTimeout(poll, 10);
				};
				poll();
			}),
	);

const percentile = (values: ReadonlyArray<number>, fraction: number): number => {
	if (values.length === 0) return 0;
	return values[Math.min(values.length - 1, Math.floor((values.length - 1) * fraction))] ?? 0;
};

const normalizeContentType = (value: string): "application/json" | "application/x-protobuf" | undefined => {
	const mediaType = value.split(";", 1)[0]?.trim().toLowerCase();
	return mediaType === "application/json" || mediaType === "application/x-protobuf" ? mediaType : undefined;
};

const normalizeContentEncoding = (value: string | undefined): "identity" | "gzip" | undefined => {
	const normalized = value?.trim().toLowerCase() ?? "identity";
	return normalized === "identity" || normalized === "gzip" ? normalized : undefined;
};
