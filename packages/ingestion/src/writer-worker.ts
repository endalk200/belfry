import {
	TelemetryDiagnostics,
	type TelemetryDiagnosticsService,
	TelemetryRetention,
	type TelemetryRetentionService,
	TelemetryWriter,
	type TelemetryWriterService,
	telemetryWriterRuntimeLayer,
} from "@belfry/storage";
import { Context, Effect, Exit, Layer, Schema, Scope } from "effect";

import { IngestionPayloadTooLarge } from "./errors.js";
import { OtlpDecodeError, UnsupportedOtlpContentType } from "./otlp/decoder.js";
import { OtlpDecoder, type OtlpDecoderService } from "./otlp/service.js";
import {
	type WriterConfiguration,
	type WriterRequest,
	WriterRequestSchema,
	type WriterResponse,
	WriterResponseSchema,
} from "./worker-protocol.js";

type WorkerGlobal = {
	onmessage: ((event: MessageEvent<unknown>) => void) | null;
	postMessage: (message: unknown) => void;
	close: () => void;
};

const workerGlobal = globalThis as unknown as WorkerGlobal;
type WriterRuntime = TelemetryWriterService & TelemetryRetentionService & TelemetryDiagnosticsService;

let storage: WriterRuntime | undefined;
let decoder: OtlpDecoderService | undefined;
let configuration: WriterConfiguration | undefined;
let storageScope: Scope.Closeable | undefined;
let messageChain = Promise.resolve();

workerGlobal.onmessage = (event) => {
	messageChain = messageChain.then(async () => {
		let request: WriterRequest;
		try {
			request = Schema.decodeUnknownSync(WriterRequestSchema)(event.data);
		} catch (cause) {
			post({
				_tag: "failure",
				id: requestId(event.data),
				code: "worker_protocol_error",
				message: `Invalid writer request: ${errorMessage(cause)}`,
			});
			return;
		}

		const response = await Effect.runPromise(handleRequest(request));
		post(response);
		if (response._tag === "shutdown-success") workerGlobal.close();
	});
};

const handleRequest = (request: WriterRequest): Effect.Effect<WriterResponse> => {
	if (request._tag === "initialize") return initialize(request.id, request.configuration);
	if (storage === undefined || decoder === undefined || configuration === undefined) {
		return Effect.succeed({
			_tag: "failure",
			id: request.id,
			code: "storage_unavailable",
			message: "The writer worker has not initialized its Telemetry Store.",
		});
	}
	if (request._tag === "ingest") return ingest(request, storage, decoder, configuration);
	if (request._tag === "maintenance") return maintenance(request, storage, configuration);
	return shutdown(request.id, storage);
};

const initialize = (id: string, nextConfiguration: WriterConfiguration): Effect.Effect<WriterResponse> =>
	Effect.gen(function* () {
		if (storage !== undefined) {
			return {
				_tag: "failure",
				id,
				code: "worker_protocol_error",
				message: "The writer worker is already initialized.",
			} as const;
		}
		const scope = yield* Scope.make();
		const opened = yield* Effect.result(
			Layer.build(
				telemetryWriterRuntimeLayer({
					databasePath: nextConfiguration.databasePath,
					maxIndexedAttributesPerRecord: nextConfiguration.maxIndexedAttributesPerRecord,
					maxIndexedValueBytes: nextConfiguration.maxIndexedValueBytes,
					maxIndexedAttributeKeys: nextConfiguration.maxIndexedAttributeKeys,
					maxIndexedValuesPerKey: nextConfiguration.maxIndexedValuesPerKey,
				}).pipe(Layer.merge(OtlpDecoder.layer)),
			).pipe(Scope.provide(scope)),
		);
		if (opened._tag === "Failure") {
			yield* Scope.close(scope, Exit.fail(opened.failure));
			return {
				_tag: "failure",
				id,
				code: "storage_unavailable",
				message: opened.failure.message,
			} as const;
		}
		const runtime: WriterRuntime = {
			...Context.get(opened.success, TelemetryWriter),
			...Context.get(opened.success, TelemetryRetention),
			...Context.get(opened.success, TelemetryDiagnostics),
		};
		const health = yield* Effect.result(runtime.health);
		if (health._tag === "Failure") {
			yield* Scope.close(scope, Exit.fail(health.failure));
			return {
				_tag: "failure",
				id,
				code: "storage_unavailable",
				message: "The writer could not verify Telemetry Store health; read-only inspection remains available.",
			} as const;
		}
		if (!health.success.writerReady) {
			const retention = yield* Effect.result(
				runtime.retain({
					nowNs: BigInt(Date.now()) * 1_000_000n,
					maxAgeNs: nextConfiguration.retentionMaxAgeNs,
					maxBytes: nextConfiguration.retentionMaxBytes,
					batchSize: nextConfiguration.retentionBatchSize,
				}),
			);
			if (retention._tag === "Failure") {
				yield* Scope.close(scope, Exit.fail(retention.failure));
				return {
					_tag: "failure",
					id,
					code: "storage_unavailable",
					message:
						"The writer could not recover bounded retention safely; read-only inspection remains available.",
				} as const;
			}
		}
		storageScope = scope;
		storage = runtime;
		decoder = Context.get(opened.success, OtlpDecoder);
		configuration = nextConfiguration;
		return { _tag: "ready", id } as const;
	});

const ingest = (
	request: Extract<WriterRequest, { readonly _tag: "ingest" }>,
	store: WriterRuntime,
	otlp: OtlpDecoderService,
	config: WriterConfiguration,
): Effect.Effect<WriterResponse> =>
	Effect.gen(function* () {
		const decodedResult = yield* Effect.result(
			otlp.decode({
				signal: request.signal,
				contentType: request.contentType,
				contentEncoding: request.contentEncoding,
				body: request.body,
				maxDecompressedBytes: config.maxDecompressedBytes,
			}),
		);
		if (decodedResult._tag === "Failure") {
			const cause = decodedResult.failure;
			if (cause instanceof IngestionPayloadTooLarge) {
				yield* store
					.recordIngestionFailure(false, {
						signal: request.signal,
						code: "decompressed_payload_too_large",
						message: cause.message,
					})
					.pipe(Effect.ignore);
				return {
					_tag: "failure",
					id: request.id,
					code: "decompressed_too_large",
					message: cause.message,
					limitBytes: cause.limitBytes,
					actualBytes: cause.actualBytes,
				} as const;
			}
			if (cause instanceof UnsupportedOtlpContentType) {
				yield* store
					.recordIngestionFailure(false, {
						signal: request.signal,
						code: "unsupported_content_type",
						message: cause.message,
					})
					.pipe(Effect.ignore);
				return {
					_tag: "failure",
					id: request.id,
					code: "unsupported_content_type",
					message: cause.message,
				} as const;
			}
			if (cause instanceof OtlpDecodeError) {
				yield* store
					.recordIngestionFailure(true, {
						signal: request.signal,
						code: cause.code,
						message: cause.message,
					})
					.pipe(Effect.ignore);
				return {
					_tag: "failure",
					id: request.id,
					code: cause.code,
					message: cause.message,
				} as const;
			}
			const message = errorMessage(cause);
			yield* store
				.recordIngestionFailure(true, {
					signal: request.signal,
					code: "malformed_payload",
					message,
				})
				.pipe(Effect.ignore);
			return {
				_tag: "failure",
				id: request.id,
				code: "malformed_payload",
				message,
			} as const;
		}
		const decoded = decodedResult.success;

		const diagnostics = decoded.diagnostics.map((diagnostic) => ({
			signal: decoded.signal,
			code: diagnostic.code,
			message: diagnostic.message,
		}));
		const writeResult = yield* Effect.result(
			decoded.signal === "traces"
				? store.write({ signal: "traces", spans: decoded.spans, diagnostics })
				: store.write({ signal: "logs", logs: decoded.logs, diagnostics }),
		);
		if (writeResult._tag === "Failure") {
			return {
				_tag: "failure",
				id: request.id,
				code: "storage_unavailable",
				message: writeResult.failure.message,
			} as const;
		}
		return {
			_tag: "ingest-success",
			id: request.id,
			records: writeResult.success.records,
			logIds: writeResult.success.logIds,
			durationMs: writeResult.success.durationMs,
		} as const;
	});

const maintenance = (
	request: Extract<WriterRequest, { readonly _tag: "maintenance" }>,
	store: WriterRuntime,
	config: WriterConfiguration,
): Effect.Effect<WriterResponse> =>
	Effect.gen(function* () {
		const operation =
			request.operation === "retention"
				? store.retain({
						nowNs: BigInt(Date.now()) * 1_000_000n,
						maxAgeNs: config.retentionMaxAgeNs,
						maxBytes: config.retentionMaxBytes,
						batchSize: config.retentionBatchSize,
					})
				: request.operation === "checkpoint"
					? store.checkpoint
					: request.operation === "vacuum"
						? store.vacuum
						: request.operation === "reset"
							? store.reset
							: request.operation === "stats"
								? store.ingestionStats
								: store.recordIngestionFailure(
										request.operation === "record-decode-error",
										request.diagnostic,
									);
		const result = yield* Effect.result(operation);
		return result._tag === "Success"
			? ({
					_tag: "maintenance-success",
					id: request.id,
					result: jsonSafe(result.success),
				} as const)
			: ({
					_tag: "failure",
					id: request.id,
					code: "maintenance_failed",
					message: result.failure.message,
				} as const);
	});

const shutdown = (id: string, store: WriterRuntime): Effect.Effect<WriterResponse> =>
	Effect.gen(function* () {
		yield* store.checkpoint.pipe(Effect.ignore);
		if (storageScope !== undefined) yield* Scope.close(storageScope, Exit.void);
		storageScope = undefined;
		storage = undefined;
		decoder = undefined;
		configuration = undefined;
		return { _tag: "shutdown-success", id } as const;
	});

const post = (response: WriterResponse): void => {
	workerGlobal.postMessage(Schema.decodeUnknownSync(WriterResponseSchema)(response));
};

const requestId = (value: unknown): string =>
	typeof value === "object" && value !== null && "id" in value && typeof value.id === "string" ? value.id : "unknown";

const jsonSafe = (value: unknown): Schema.Json =>
	value === undefined
		? null
		: (JSON.parse(
				JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item)),
			) as Schema.Json);

const errorMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : String(cause));
