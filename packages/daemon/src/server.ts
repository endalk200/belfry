import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { type BelfryConfiguration, daemonEndpoint } from "@belfry/config";
import { IngestionAdmission, type IngestionAdmissionService, IngestionUnavailable } from "@belfry/ingestion";
import { StorageFailure, TelemetryQuery, type TelemetryReaderService } from "@belfry/storage";
import { BunHttpServer } from "@effect/platform-bun";
import { Cause, Context, Effect, Exit, Layer, Schema, Scope } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";

import { makeQueryApiLayer } from "./query-handlers.js";
import { IsolatedTelemetryQuery } from "./query-transport.js";
import { runRetentionUntilCurrent } from "./retention-schedule.js";
import { localOnlyNetworkBoundary, makeOtlpRoutes, makeWebRoutes } from "./routes.js";

export type DaemonServerOptions = {
	readonly configuration: BelfryConfiguration;
	readonly webRoot?: string;
	readonly ingestionWorkerUrl?: URL;
	readonly queryWorkerUrl?: URL;
	readonly serviceVersion?: string;
};

export type DaemonServerHandle = {
	readonly endpoint: string;
	readonly host: string;
	readonly port: number;
	readonly startedAt: number;
	readonly nonce: string;
};

export class DaemonStartFailure extends Schema.TaggedErrorClass<DaemonStartFailure>()("DaemonStartFailure", {
	code: Schema.Literals(["state_unavailable", "writer_unavailable", "reader_unavailable", "listen_failed"]),
	message: Schema.String,
}) {}

const buildScopedLayer = <A, E, R>(
	layer: Layer.Layer<A, E, R>,
): Effect.Effect<Context.Context<A>, E, R | Scope.Scope> =>
	Effect.gen(function* () {
		const parentScope = yield* Scope.Scope;
		const childScope = yield* Scope.fork(parentScope);
		const result = yield* Effect.result(Layer.build(layer).pipe(Scope.provide(childScope)));
		if (result._tag === "Failure") {
			yield* Scope.close(childScope, Exit.fail(result.failure));
			return yield* Effect.fail(result.failure);
		}
		return result.success;
	});

export const startDaemonServer = (
	options: DaemonServerOptions,
): Effect.Effect<DaemonServerHandle, DaemonStartFailure, import("effect").Scope.Scope> => {
	const config = options.configuration;
	const start = Effect.gen(function* () {
		const startedAt = Date.now();
		const nonce = crypto.randomUUID();
		const daemonIdentity = {
			pid: process.pid,
			startedAt,
			nonce,
			endpoint: daemonEndpoint(config.daemon.host, config.daemon.port),
			serviceVersion: options.serviceVersion ?? "development",
		};
		const cursorSecret = yield* loadOrCreateCursorSecret(
			config.daemon.stateDirectory,
			config.query.cursorSecretPath,
		);
		const admissionResult = yield* Effect.result(
			buildScopedLayer(
				IngestionAdmission.layer({
					storage: {
						databasePath: config.storage.databasePath,
						maxIndexedAttributesPerRecord: config.storage.indexedAttributeLimit,
						maxIndexedValueBytes: config.storage.indexedValueMaxBytes,
						maxIndexedAttributeKeys: config.storage.indexedKeyLimit,
						maxIndexedValuesPerKey: config.storage.indexedValuesPerKeyLimit,
					},
					maxCompressedBytes: config.ingestion.maxCompressedBytes,
					maxDecompressedBytes: config.ingestion.maxDecompressedBytes,
					queueRequestCapacity: config.ingestion.queueRequestCapacity,
					queueByteCapacity: config.ingestion.queueByteCapacity,
					writerTimeoutMs: config.ingestion.writerTimeoutMs,
					drainTimeoutMs: config.ingestion.drainTimeoutMs,
					retentionMaxAgeNs: config.storage.retentionMaxAgeNs,
					retentionMaxBytes: config.storage.retentionMaxBytes,
					retentionBatchSize: config.storage.retentionBatchSize,
					workerUrl: options.ingestionWorkerUrl,
				}),
			).pipe(Effect.map((context) => Context.get(context, IngestionAdmission))),
		);
		const admission =
			admissionResult._tag === "Success"
				? admissionResult.success
				: unavailableAdmission(admissionResult.failure, config);
		const readerResult = yield* Effect.result(
			buildScopedLayer(
				TelemetryQuery.readerLayer({
					databasePath: config.storage.databasePath,
					maxTraceDetailSpans: config.query.maxResults,
				}),
			).pipe(Effect.map((context) => Context.get(context, TelemetryQuery))),
		);
		const queryReaderResult =
			readerResult._tag === "Success"
				? yield* Effect.result(
						buildScopedLayer(
							IsolatedTelemetryQuery.layer({
								databasePath: config.storage.databasePath,
								timeoutMs: config.query.timeoutMs,
								maxTraceDetailSpans: config.query.maxResults,
								workerUrl: options.queryWorkerUrl,
							}),
						).pipe(Effect.map((context) => Context.get(context, IsolatedTelemetryQuery))),
					)
				: readerResult;
		const queryUnavailableMessage =
			queryReaderResult._tag === "Failure" && readerResult._tag === "Success"
				? "The isolated Query worker is unavailable; health remains available."
				: undefined;
		const reader =
			readerResult._tag === "Failure"
				? unavailableReader(readerResult.failure)
				: queryReaderResult._tag === "Failure"
					? {
							...unavailableReader(queryReaderResult.failure),
							information: readerResult.success.information,
							health: readerResult.success.health,
							ingestionStats: readerResult.success.ingestionStats,
						}
					: { ...readerResult.success, ...queryReaderResult.success };
		if (admissionResult._tag === "Success") {
			yield* Effect.forkScoped(
				Effect.forever(
					runRetentionUntilCurrent(admission.runRetention).pipe(
						Effect.ignore,
						Effect.andThen(Effect.sleep(60_000)),
					),
				),
			);
		}
		const routes = Layer.mergeAll(
			localOnlyNetworkBoundary,
			makeQueryApiLayer({
				reader,
				admission,
				queryTimeoutMs: config.query.timeoutMs,
				queryMaxLookbackNs: config.query.maxLookbackNs,
				queryMaxResults: config.query.maxResults,
				writerUnavailableMessage:
					admissionResult._tag === "Failure"
						? "The writer is unavailable; reads remain available when the Store can be opened safely."
						: undefined,
				queryUnavailableMessage,
				cursorSecret,
				daemonIdentity,
			}),
			makeOtlpRoutes(admission, config.ingestion.maxCompressedBytes),
			makeWebRoutes(options.webRoot, {
				refreshIntervalMs: config.interfaces.refreshIntervalMs,
				defaultRangeMinutes: config.interfaces.defaultRangeMinutes,
				queryMaxResults: config.query.maxResults,
				queryMaxLookbackMinutes: Number(config.query.maxLookbackNs / 60_000_000_000n),
			}),
		);
		const serverLayer = HttpRouter.serve(routes, {
			disableListenLog: true,
			disableLogger: true,
		}).pipe(
			Layer.provideMerge(
				BunHttpServer.layer({
					hostname: config.daemon.host,
					port: config.daemon.port,
					maxRequestBodySize: Math.max(1_048_576, config.ingestion.maxCompressedBytes),
					gracefulShutdownTimeout: config.daemon.shutdownTimeoutMs,
				}),
			),
		);
		const context = yield* Layer.build(serverLayer).pipe(
			Effect.catchCause(() =>
				Effect.fail(
					new DaemonStartFailure({
						code: "listen_failed",
						message: `Could not bind the Belfry Daemon to ${config.daemon.host}:${config.daemon.port}.`,
					}),
				),
			),
		);
		const server = Context.get(context, HttpServer.HttpServer);
		if (server.address._tag !== "TcpAddress") {
			return yield* Effect.die("Belfry expected a TCP server address");
		}
		return {
			endpoint: daemonEndpoint(server.address.hostname, server.address.port),
			host: server.address.hostname,
			port: server.address.port,
			startedAt,
			nonce,
		};
	});

	return start.pipe(
		Effect.catchCause((cause) => {
			const failure = Cause.squash(cause);
			return Effect.fail(
				failure instanceof DaemonStartFailure
					? failure
					: new DaemonStartFailure({
							code: "state_unavailable",
							message: "The Belfry Daemon could not initialize its local runtime state.",
						}),
			);
		}),
	);
};

const loadOrCreateCursorSecret = (
	stateDirectory: string,
	secretPath: string,
): Effect.Effect<Uint8Array, DaemonStartFailure> =>
	Effect.tryPromise({
		try: async () => {
			await mkdir(stateDirectory, { recursive: true, mode: 0o700 });
			await chmod(stateDirectory, 0o700);
			try {
				const existing = await readFile(secretPath);
				if (existing.byteLength >= 32) {
					await chmod(secretPath, 0o600);
					return new Uint8Array(existing);
				}
				return replaceCursorSecret(secretPath);
			} catch (cause) {
				if (!isMissingFile(cause)) throw cause;
			}
			const secret = crypto.getRandomValues(new Uint8Array(32));
			try {
				await writeFile(secretPath, secret, { flag: "wx", mode: 0o600 });
				return secret;
			} catch (cause) {
				if (!isAlreadyExists(cause)) throw cause;
				const existing = await readFile(secretPath);
				if (existing.byteLength < 32) return replaceCursorSecret(secretPath);
				await chmod(secretPath, 0o600);
				return new Uint8Array(existing);
			}
		},
		catch: (cause) =>
			new DaemonStartFailure({
				code: "state_unavailable",
				message: `Could not initialize the machine state directory: ${cause instanceof Error ? cause.message : String(cause)}`,
			}),
	});

const replaceCursorSecret = async (secretPath: string): Promise<Uint8Array> => {
	const secret = crypto.getRandomValues(new Uint8Array(32));
	const temporary = `${secretPath}.${crypto.randomUUID()}.tmp`;
	try {
		await writeFile(temporary, secret, { flag: "wx", mode: 0o600 });
		await rename(temporary, secretPath);
		await chmod(secretPath, 0o600);
		return secret;
	} catch (cause) {
		await unlink(temporary).catch(() => undefined);
		throw cause;
	}
};

const isMissingFile = (cause: unknown): boolean =>
	typeof cause === "object" && cause !== null && "code" in cause && cause.code === "ENOENT";

const isAlreadyExists = (cause: unknown): boolean =>
	typeof cause === "object" && cause !== null && "code" in cause && cause.code === "EEXIST";

const unavailableAdmission = (
	cause: IngestionUnavailable,
	configuration: BelfryConfiguration,
): IngestionAdmissionService => {
	const unavailable = new IngestionUnavailable({
		code: cause.code,
		message: "The Belfry writer is unavailable. Inspect /api/health and the foreground Daemon output.",
	});
	return {
		submit: () => Effect.fail(unavailable),
		reserve: () => Effect.fail(unavailable),
		snapshot: Effect.succeed({
			accepting: false,
			writerFailure: unavailable.message,
			queueDepth: 0,
			queueBytes: 0,
			requestCapacity: configuration.ingestion.queueRequestCapacity,
			byteCapacity: configuration.ingestion.queueByteCapacity,
			writeLatencyP50Ms: 0,
			writeLatencyP95Ms: 0,
			unpersistedRejectedRequests: 0n,
			droppedDiagnostics: 0n,
		}),
		recordRejected: () => Effect.void,
		runRetention: Effect.fail(unavailable),
		checkpoint: Effect.fail(unavailable),
		shutdown: Effect.void,
	};
};

const unavailableReader = (_cause: StorageFailure): TelemetryReaderService => {
	const failure = new StorageFailure({
		code: "open_failed",
		message: "The Telemetry Store cannot be opened safely for reads.",
	});
	const unavailable = Effect.fail(failure);
	return {
		information: unavailable,
		searchTraces: () => unavailable,
		getTrace: () => unavailable,
		getSpan: () => unavailable,
		listTraceLogs: () => unavailable,
		searchLogs: () => unavailable,
		getLog: () => unavailable,
		listServices: () => unavailable,
		listDiagnostics: () => unavailable,
		facets: () => unavailable,
		health: unavailable,
		ingestionStats: unavailable,
	};
};
