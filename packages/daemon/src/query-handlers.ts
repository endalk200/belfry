import type { IngestionAdmissionService } from "@belfry/ingestion";
import {
	BelfryApi,
	type DaemonIdentity,
	decodeCursor,
	encodeCursor,
	InvalidQuery,
	QueryRecordNotFound,
	QuerySchemaErrorMiddleware,
	QueryUnavailable,
} from "@belfry/query-api";
import { type StorageFailure, StorageNotFound, type TelemetryReaderService } from "@belfry/storage";
import { serviceIdentityKey } from "@belfry/telemetry";
import { Effect, Layer } from "effect";
import { HttpApiBuilder, HttpApiMiddleware } from "effect/unstable/httpapi";

export type QueryHandlersOptions = {
	readonly reader: TelemetryReaderService;
	readonly admission: IngestionAdmissionService;
	readonly queryTimeoutMs: number;
	readonly queryMaxLookbackNs: bigint;
	readonly queryMaxResults: number;
	readonly cursorSecret: Uint8Array;
	readonly daemonIdentity: DaemonIdentity;
	readonly writerUnavailableMessage?: string | undefined;
	readonly queryUnavailableMessage?: string | undefined;
};

export const makeQueryApiLayer = (options: QueryHandlersOptions) => {
	const QuerySchemaErrorsLive = HttpApiMiddleware.layerSchemaErrorTransform(QuerySchemaErrorMiddleware, () =>
		Effect.fail(
			new InvalidQuery({
				code: "invalid_query",
				message:
					"The request does not match the Query API schema. Check required fields, parameter types, ranges, and limits.",
			}),
		),
	);
	const runQuery = <A>(
		effect: Effect.Effect<A, StorageFailure | StorageNotFound>,
	): Effect.Effect<A, QueryRecordNotFound | QueryUnavailable> =>
		effect.pipe(
			Effect.mapError((error) => {
				if (error instanceof StorageNotFound) {
					return new QueryRecordNotFound({ code: "not_found", message: error.message });
				}
				if (error.code === "query_timeout") {
					return new QueryUnavailable({
						code: "query_timeout",
						message: `The bounded query exceeded ${options.queryTimeoutMs} ms; narrow the time range or filters.`,
					});
				}
				return new QueryUnavailable({
					code: error.code === "migration_failed" ? "migration_unavailable" : "store_unavailable",
					message:
						"The Telemetry Store cannot complete this query. Check /api/health and ingestion diagnostics, then retry.",
				});
			}),
		);
	const runAvailableQuery = <A>(
		effect: Effect.Effect<A, StorageFailure | StorageNotFound>,
	): Effect.Effect<A, QueryUnavailable> =>
		runQuery(effect).pipe(
			Effect.mapError((error) =>
				error instanceof QueryUnavailable
					? error
					: new QueryUnavailable({
							code: "store_unavailable",
							message: "The Telemetry Store could not provide ingestion statistics.",
						}),
			),
		);

	const HealthLive = HttpApiBuilder.group(BelfryApi, "health", (handlers) =>
		handlers.handle("getHealth", () =>
			Effect.gen(function* () {
				const [health, queue] = yield* Effect.all([
					Effect.result(options.reader.health),
					options.admission.snapshot,
				]);
				const writerFailure = options.writerUnavailableMessage ?? queue.writerFailure;
				const queryFailure = options.queryUnavailableMessage;
				if (health._tag === "Failure") {
					return {
						status: "degraded" as const,
						live: true,
						migrationReady: false,
						writerReady: queue.accepting,
						readsAvailable: false,
						queueDepth: queue.queueDepth,
						queueBytes: BigInt(queue.queueBytes),
						databaseSizeBytes: 0n,
						storageSizeBytes: 0n,
						walSizeBytes: 0n,
						message:
							queryFailure ??
							writerFailure ??
							"The Telemetry Store cannot be inspected safely; read-only queries may be unavailable.",
						daemon: options.daemonIdentity,
					};
				}
				return {
					...health.success,
					status:
						writerFailure !== undefined || queryFailure !== undefined
							? ("degraded" as const)
							: queue.accepting
								? health.success.status
								: ("stopping" as const),
					writerReady: queue.accepting && health.success.writerReady,
					readsAvailable: queryFailure === undefined && health.success.readsAvailable,
					queueDepth: queue.queueDepth,
					queueBytes: BigInt(queue.queueBytes),
					daemon: options.daemonIdentity,
					...(queryFailure === undefined && writerFailure === undefined
						? {}
						: { message: queryFailure ?? writerFailure }),
				};
			}),
		),
	);

	const ServicesLive = HttpApiBuilder.group(BelfryApi, "services", (handlers) =>
		handlers.handle("listServices", ({ query }) =>
			Effect.gen(function* () {
				yield* validateQueryBounds(query, query.limit, options);
				const cursorQuery = { endpoint: "services" as const, ...query };
				const cursor =
					query.cursor === undefined
						? undefined
						: yield* decodeQueryCursor(query.cursor, cursorQuery, options.cursorSecret);
				const page = yield* runQuery(options.reader.listServices(query, query.limit, cursor));
				const last = page.items.at(-1);
				const nextCursor =
					page.truncated && last !== undefined
						? yield* encodeQueryCursor(
								{
									sort: "newest",
									timeNs: last.lastSeenNs,
									id: serviceIdentityKey(last.service),
								},
								cursorQuery,
								options.cursorSecret,
							)
						: undefined;
				return { ...page, nextCursor };
			}),
		),
	);

	const TracesLive = HttpApiBuilder.group(BelfryApi, "traces", (handlers) =>
		handlers
			.handle("searchTraces", ({ payload }) =>
				Effect.gen(function* () {
					yield* validateQueryBounds(payload, payload.limit, options);
					const cursor =
						payload.cursor === undefined
							? undefined
							: yield* decodeQueryCursor(payload.cursor, payload, options.cursorSecret);
					const page = yield* runQuery(options.reader.searchTraces(payload, cursor));
					const last = page.items.at(-1);
					const nextCursor =
						page.truncated && last !== undefined
							? yield* encodeQueryCursor(
									{
										sort: payload.sort,
										timeNs:
											payload.sort === "slowest" ? (last.durationNs ?? -1n) : last.startTimeNs,
										id: last.traceId,
									},
									payload,
									options.cursorSecret,
								)
							: undefined;
					return { ...page, nextCursor };
				}),
			)
			.handle("getTrace", ({ params }) => runQuery(options.reader.getTrace(params.traceId)))
			.handle("getTraceLogs", ({ params, query }) =>
				Effect.gen(function* () {
					const limit = query.limit ?? Math.min(100, options.queryMaxResults);
					yield* validateResultLimit(limit, options);
					const cursorQuery = {
						traceId: params.traceId,
						spanId: query.spanId,
						limit,
						sort: "oldest" as const,
					};
					const cursor =
						query.cursor === undefined
							? undefined
							: yield* decodeQueryCursor(query.cursor, cursorQuery, options.cursorSecret);
					const page = yield* runQuery(
						options.reader.listTraceLogs(params.traceId, limit, cursor, query.spanId),
					);
					const last = page.items.at(-1);
					const nextCursor =
						page.truncated && last !== undefined
							? yield* encodeQueryCursor(
									{ sort: "oldest", timeNs: logTime(last), id: last.id },
									cursorQuery,
									options.cursorSecret,
								)
							: undefined;
					return { ...page, nextCursor };
				}),
			)
			.handle("getSpan", ({ params }) => runQuery(options.reader.getSpan(params.traceId, params.spanId))),
	);

	const LogsLive = HttpApiBuilder.group(BelfryApi, "logs", (handlers) =>
		handlers
			.handle("searchLogs", ({ payload }) =>
				Effect.gen(function* () {
					yield* validateQueryBounds(payload, payload.limit, options);
					const cursor =
						payload.cursor === undefined
							? undefined
							: yield* decodeQueryCursor(payload.cursor, payload, options.cursorSecret);
					const page = yield* runQuery(options.reader.searchLogs(payload, cursor));
					const last = page.items.at(-1);
					const nextCursor =
						page.truncated && last !== undefined
							? yield* encodeQueryCursor(
									{
										sort: payload.sort,
										timeNs: last.timestampNs ?? last.observedTimeNs ?? 0n,
										id: last.id,
									},
									payload,
									options.cursorSecret,
								)
							: undefined;
					return { ...page, nextCursor };
				}),
			)
			.handle("getLog", ({ params }) => runQuery(options.reader.getLog(params.logId))),
	);

	const FacetsLive = HttpApiBuilder.group(BelfryApi, "facets", (handlers) =>
		handlers.handle("listFacets", ({ payload }) =>
			Effect.gen(function* () {
				yield* validateQueryBounds(payload, payload.limit, options);
				const cursorQuery = { endpoint: "facets" as const, ...payload };
				const cursor =
					payload.cursor === undefined
						? undefined
						: yield* decodeQueryCursor(payload.cursor, cursorQuery, options.cursorSecret);
				const page = yield* runQuery(options.reader.facets(payload, cursor));
				const last = page.items.at(-1);
				const nextCursor =
					page.truncated && last !== undefined
						? yield* encodeQueryCursor(
								{
									sort: "slowest",
									timeNs: BigInt(last.count),
									id: last.service === undefined ? last.value : serviceIdentityKey(last.service),
								},
								cursorQuery,
								options.cursorSecret,
							)
						: undefined;
				return { ...page, nextCursor };
			}),
		),
	);

	const IngestionLive = HttpApiBuilder.group(BelfryApi, "ingestion", (handlers) =>
		handlers
			.handle("getStats", () =>
				Effect.gen(function* () {
					const [stored, queue] = yield* Effect.all([
						runAvailableQuery(options.reader.ingestionStats),
						options.admission.snapshot,
					]);
					return {
						...stored,
						rejectedRequests: stored.rejectedRequests + queue.unpersistedRejectedRequests,
						queueDepth: queue.queueDepth,
						queueBytes: BigInt(queue.queueBytes),
						writeLatencyP50Ms: queue.writeLatencyP50Ms,
						writeLatencyP95Ms: queue.writeLatencyP95Ms,
						droppedDiagnostics: stored.droppedDiagnostics + queue.droppedDiagnostics,
					};
				}),
			)
			.handle("listDiagnostics", ({ query }) =>
				Effect.gen(function* () {
					yield* validateQueryBounds(query, query.limit, options);
					const cursorQuery = { endpoint: "diagnostics" as const, ...query };
					const cursor =
						query.cursor === undefined
							? undefined
							: yield* decodeQueryCursor(query.cursor, cursorQuery, options.cursorSecret);
					const page = yield* runQuery(options.reader.listDiagnostics(query, query.limit, cursor));
					const last = page.items.at(-1);
					const nextCursor =
						page.truncated && last !== undefined
							? yield* encodeQueryCursor(
									{ sort: "newest", timeNs: last.timeNs, id: last.id },
									cursorQuery,
									options.cursorSecret,
								)
							: undefined;
					return { ...page, nextCursor };
				}),
			),
	);

	return HttpApiBuilder.layer(BelfryApi, { openapiPath: "/openapi.json" }).pipe(
		Layer.provide(HealthLive.pipe(Layer.provide(QuerySchemaErrorsLive))),
		Layer.provide(ServicesLive.pipe(Layer.provide(QuerySchemaErrorsLive))),
		Layer.provide(TracesLive.pipe(Layer.provide(QuerySchemaErrorsLive))),
		Layer.provide(LogsLive.pipe(Layer.provide(QuerySchemaErrorsLive))),
		Layer.provide(FacetsLive.pipe(Layer.provide(QuerySchemaErrorsLive))),
		Layer.provide(IngestionLive.pipe(Layer.provide(QuerySchemaErrorsLive))),
	);
};

const decodeQueryCursor = (cursor: string, query: unknown, secret: Uint8Array) =>
	Effect.tryPromise({
		try: () => decodeCursor(cursor, query, secret),
		catch: (cause) =>
			cause instanceof InvalidQuery
				? cause
				: new InvalidQuery({ code: "invalid_cursor", message: "The query cursor could not be decoded." }),
	});

const encodeQueryCursor = (position: Parameters<typeof encodeCursor>[0], query: unknown, secret: Uint8Array) =>
	Effect.tryPromise({
		try: () => encodeCursor(position, query, secret),
		catch: () =>
			new InvalidQuery({ code: "invalid_cursor", message: "The next query cursor could not be encoded." }),
	});

const validateQueryBounds = (
	range: { readonly fromNs: bigint; readonly toNs: bigint },
	limit: number,
	options: Pick<QueryHandlersOptions, "queryMaxLookbackNs" | "queryMaxResults">,
) =>
	Effect.gen(function* () {
		if (range.fromNs > range.toNs) {
			return yield* Effect.fail(
				new InvalidQuery({ code: "invalid_query", message: "fromNs must not be after toNs." }),
			);
		}
		if (range.toNs - range.fromNs > options.queryMaxLookbackNs) {
			return yield* Effect.fail(
				new InvalidQuery({
					code: "range_too_large",
					message: `The query range exceeds the configured ${options.queryMaxLookbackNs} nanosecond lookback.`,
				}),
			);
		}
		yield* validateResultLimit(limit, options);
	});

const validateResultLimit = (
	limit: number,
	options: Pick<QueryHandlersOptions, "queryMaxResults">,
): Effect.Effect<void, InvalidQuery> => {
	if (!Number.isSafeInteger(limit) || limit < 1) {
		return Effect.fail(
			new InvalidQuery({
				code: "invalid_query",
				message: "The requested limit must be a positive integer.",
			}),
		);
	}
	return limit > options.queryMaxResults
		? Effect.fail(
				new InvalidQuery({
					code: "limit_exceeded",
					message: `The requested limit exceeds the configured maximum of ${options.queryMaxResults}.`,
				}),
			)
		: Effect.void;
};

const logTime = (log: { readonly timestampNs?: bigint; readonly observedTimeNs?: bigint }): bigint =>
	log.timestampNs ?? log.observedTimeNs ?? 0n;
