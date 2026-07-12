import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
	CursorPosition,
	Diagnostic,
	FacetRequestSchema,
	Health,
	IngestionStats,
	LogSearchQuery,
	TimeRange,
	TraceSearchQuery,
} from "@belfry/query-api";
import type { ServiceIdentity, TraceDetail } from "@belfry/telemetry";
import { LogDetailSchema, SpanDetailSchema, serviceIdentityKey } from "@belfry/telemetry";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Context, Effect, Layer } from "effect";
import { Reactivity } from "effect/unstable/reactivity";
import type { SqlClient as SqlClientType } from "effect/unstable/sql/SqlClient";
import * as SqlClient from "effect/unstable/sql/SqlClient";

import { StorageFailure, StorageNotFound } from "./errors.js";
import { buildFacetQuery } from "./facets.js";
import { runMigrations } from "./migrations.js";
import { decodeJson } from "./record-codec.js";
import {
	type LogRow,
	logSummary,
	orderSpanTree,
	type ServiceRow,
	type SpanRow,
	serviceIdentityFromRow,
	serviceSummaryFromRow,
	type TraceRow,
	traceSummaryFromRow,
} from "./record-model.js";
import { databaseSizeFor, runRetention } from "./retention.js";
import { escapeLike, execute, ftsPhrase, placeholders, query } from "./sql.js";
import type {
	RetentionOptions,
	StorageDiagnosticInput,
	StorageInformation,
	StorageWriteResult,
	TelemetryReaderService,
	TelemetryStorageService,
	TelemetryWriteBatch,
} from "./types.js";
import { incrementCounter, materializeTrace, writeDiagnostic, writeLogs, writeSpans } from "./writer.js";

export type TelemetryStorageOptions = {
	readonly databasePath: string;
	readonly maxIndexedAttributesPerRecord?: number;
	readonly maxIndexedValueBytes?: number;
	readonly maxIndexedAttributeKeys?: number;
	readonly maxIndexedValuesPerKey?: number;
};

const defaultMaxIndexedAttributes = 64;
const defaultMaxIndexedValueBytes = 512;

export class TelemetryStorage extends Context.Service<TelemetryStorage, TelemetryStorageService>()(
	"@belfry/storage/TelemetryStorage",
) {
	static readonly layer = (options: TelemetryStorageOptions) =>
		Layer.effect(TelemetryStorage)(openTelemetryStorage(options));
}

export const openTelemetryStorage = (
	options: TelemetryStorageOptions,
): Effect.Effect<TelemetryStorageService, StorageFailure, import("effect").Scope.Scope> => {
	const acquire = Effect.gen(function* () {
		yield* Effect.try({
			try: () => mkdirSync(dirname(options.databasePath), { recursive: true }),
			catch: (cause) => storageFailure("open_failed", "Could not create the Telemetry Store directory.", cause),
		});

		const writer = yield* SqliteClient.make({ filename: options.databasePath }).pipe(
			Effect.provide(Reactivity.layer),
		);
		yield* writer`PRAGMA foreign_keys = ON`;
		yield* writer`PRAGMA synchronous = NORMAL`;
		yield* writer`PRAGMA wal_autocheckpoint = 1000`;
		yield* writer`PRAGMA auto_vacuum = INCREMENTAL`;
		yield* runMigrations.pipe(Effect.provideService(SqlClient.SqlClient, writer));
		const reader = yield* SqliteClient.make({
			filename: options.databasePath,
			readonly: true,
			readwrite: false,
			create: false,
			disableWAL: true,
		}).pipe(Effect.provide(Reactivity.layer));
		yield* reader`PRAGMA foreign_keys = ON`;

		return makeStorage(writer, reader, options);
	});

	return acquire.pipe(
		Effect.mapError((cause) =>
			cause instanceof StorageFailure
				? cause
				: storageFailure("migration_failed", "Could not open or migrate the Telemetry Store.", cause),
		),
	);
};

export const openTelemetryReader = (
	options: TelemetryStorageOptions,
): Effect.Effect<TelemetryReaderService, StorageFailure, import("effect").Scope.Scope> =>
	SqliteClient.make({
		filename: options.databasePath,
		readonly: true,
		readwrite: false,
		create: false,
		disableWAL: true,
	}).pipe(
		Effect.provide(Reactivity.layer),
		Effect.tap((reader) => reader`PRAGMA foreign_keys = ON`),
		Effect.map((reader) => {
			const storage = makeStorage(reader, reader, options);
			return {
				information: storage.information,
				searchTraces: storage.searchTraces,
				getTrace: storage.getTrace,
				getSpan: storage.getSpan,
				listTraceLogs: storage.listTraceLogs,
				searchLogs: storage.searchLogs,
				getLog: storage.getLog,
				listServices: storage.listServices,
				listDiagnostics: storage.listDiagnostics,
				facets: storage.facets,
				health: storage.health,
				ingestionStats: storage.ingestionStats,
			};
		}),
		Effect.catchCause((cause) =>
			Effect.fail(storageFailure("open_failed", "Could not open the read-only Telemetry Store role.", cause)),
		),
	);

const makeStorage = (
	writer: SqlClientType,
	reader: SqlClientType,
	options: TelemetryStorageOptions,
): TelemetryStorageService => {
	const writeLatencies: Array<number> = [];
	const maxIndexedAttributes = options.maxIndexedAttributesPerRecord ?? defaultMaxIndexedAttributes;
	const maxIndexedValueBytes = options.maxIndexedValueBytes ?? defaultMaxIndexedValueBytes;
	const maxIndexedAttributeKeys = options.maxIndexedAttributeKeys ?? 256;
	const maxIndexedValuesPerKey = options.maxIndexedValuesPerKey ?? 1_024;

	const databaseSize = databaseSizeFor(reader);

	const write = (batch: TelemetryWriteBatch): Effect.Effect<StorageWriteResult, StorageFailure> => {
		const startedAt = performance.now();
		const operation = writer.withTransaction(
			Effect.gen(function* () {
				let logIds: ReadonlyArray<string> = [];
				let droppedRecords = 0n;
				let truncatedValues = 0n;
				if (batch.signal === "traces") {
					const result = yield* writeSpans(
						writer,
						batch.spans,
						maxIndexedAttributes,
						maxIndexedValueBytes,
						maxIndexedAttributeKeys,
						maxIndexedValuesPerKey,
					);
					for (const traceId of result.traceIds) yield* materializeTrace(writer, traceId);
					droppedRecords = result.droppedRecords;
					truncatedValues = result.truncatedValues;
					yield* incrementCounter(writer, "accepted_trace_records", BigInt(batch.spans.length));
				} else {
					const result = yield* writeLogs(
						writer,
						batch.logs,
						maxIndexedAttributes,
						maxIndexedValueBytes,
						maxIndexedAttributeKeys,
						maxIndexedValuesPerKey,
					);
					logIds = result.ids;
					droppedRecords = result.droppedRecords;
					truncatedValues = result.truncatedValues;
					yield* incrementCounter(writer, "accepted_log_records", BigInt(batch.logs.length));
				}
				if (droppedRecords > 0n) yield* incrementCounter(writer, "dropped_records", droppedRecords);
				if (truncatedValues > 0n) yield* incrementCounter(writer, "truncated_values", truncatedValues);
				for (const diagnostic of batch.diagnostics ?? []) yield* writeDiagnostic(writer, diagnostic);

				const durationMs = performance.now() - startedAt;
				writeLatencies.push(durationMs);
				if (writeLatencies.length > 1_024) writeLatencies.shift();
				return {
					records: batch.signal === "traces" ? batch.spans.length : batch.logs.length,
					logIds,
					durationMs,
				};
			}),
		);
		return mapStorageFailure(operation, "write_failed", "Could not durably write the OTLP batch.");
	};

	const searchTraces = (queryRequest: TraceSearchQuery, cursor?: CursorPosition) => {
		const clauses = ["t.start_time_ns >= ?", "t.start_time_ns <= ?"];
		const parameters: Array<unknown> = [queryRequest.fromNs, queryRequest.toNs];
		let from = "FROM traces t";
		if (queryRequest.text !== undefined && queryRequest.text.trim() !== "") {
			from =
				"FROM (SELECT DISTINCT trace_id FROM span_search WHERE span_search MATCH ?) text_match JOIN traces t ON t.trace_id = text_match.trace_id";
			parameters.unshift(ftsPhrase(queryRequest.text));
		}

		if (queryRequest.services.length > 0) {
			const keys = queryRequest.services.map(serviceIdentityKey);
			clauses.push(
				`EXISTS (SELECT 1 FROM trace_services filtered_services WHERE filtered_services.trace_id = t.trace_id AND filtered_services.service_key IN (${placeholders(keys.length)}))`,
			);
			parameters.push(...keys);
		}
		if (queryRequest.operation !== undefined) {
			clauses.push("t.root_operation LIKE ? ESCAPE '\\'");
			parameters.push(`%${escapeLike(queryRequest.operation)}%`);
		}
		if (queryRequest.status === "error") clauses.push("t.error_count > 0");
		if (queryRequest.status === "ok") clauses.push("t.error_count = 0 AND t.active = 0");
		if (queryRequest.status === "active") clauses.push("t.active = 1");
		if (queryRequest.minimumDurationNs !== undefined) {
			clauses.push("t.duration_ns >= ?");
			parameters.push(queryRequest.minimumDurationNs);
		}
		if (queryRequest.maximumDurationNs !== undefined) {
			clauses.push("t.duration_ns <= ?");
			parameters.push(queryRequest.maximumDurationNs);
		}
		if (queryRequest.traceId !== undefined) {
			clauses.push("t.trace_id = ?");
			parameters.push(queryRequest.traceId);
		}
		for (const [index, filter] of queryRequest.attributes.entries()) {
			const alias = `attribute_${index}`;
			clauses.push(
				`EXISTS (SELECT 1 FROM span_attributes ${alias} WHERE ${alias}.trace_id = t.trace_id AND ${alias}.attribute_key = ? AND ${alias}.value_text ${filter.operator === "equals" ? "= ?" : "LIKE ? ESCAPE '\\'"})`,
			);
			parameters.push(filter.key, filter.operator === "equals" ? filter.value : `%${escapeLike(filter.value)}%`);
		}
		if (cursor !== undefined) {
			if (queryRequest.sort === "oldest") {
				clauses.push("(t.start_time_ns > ? OR (t.start_time_ns = ? AND t.trace_id > ?))");
				parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
			} else if (queryRequest.sort === "slowest") {
				clauses.push(
					"(COALESCE(t.duration_ns, -1) < ? OR (COALESCE(t.duration_ns, -1) = ? AND t.trace_id < ?))",
				);
				parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
			} else {
				clauses.push("(t.start_time_ns < ? OR (t.start_time_ns = ? AND t.trace_id < ?))");
				parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
			}
		}

		const order =
			queryRequest.sort === "oldest"
				? "t.start_time_ns ASC, t.trace_id ASC"
				: queryRequest.sort === "slowest"
					? "t.duration_ns DESC, t.trace_id DESC"
					: "t.start_time_ns DESC, t.trace_id DESC";
		parameters.push(queryRequest.limit + 1);
		const operation = Effect.gen(function* () {
			const rows = yield* query<TraceRow>(
				reader,
				`SELECT t.* ${from} WHERE ${clauses.join(" AND ")} ORDER BY ${order} LIMIT ?`,
				parameters,
			);
			const truncated = rows.length > queryRequest.limit;
			const pageRows = rows.slice(0, queryRequest.limit);
			const services = yield* servicesForTraces(
				reader,
				pageRows.map((row) => row.trace_id),
			);
			return {
				items: pageRows.map((row) => traceSummaryFromRow(row, services.get(row.trace_id) ?? [])),
				bounds: { fromNs: queryRequest.fromNs, toNs: queryRequest.toNs, limit: queryRequest.limit },
				truncated,
			};
		});
		return mapStorageFailure(operation, "read_failed", "Could not search traces.");
	};

	const getTrace = (traceId: string) => {
		const operation = Effect.gen(function* () {
			const rows = yield* query<TraceRow>(reader, "SELECT * FROM traces WHERE trace_id = ?", [traceId]);
			const trace = rows[0];
			if (trace === undefined) {
				return yield* Effect.fail(
					new StorageNotFound({ entity: "trace", id: traceId, message: `Trace ${traceId} was not found.` }),
				);
			}
			const spanRows = yield* query<SpanRow>(
				reader,
				`SELECT s.trace_id, s.span_id, s.detail_json,
					(SELECT COUNT(*) FROM logs l WHERE l.trace_id = s.trace_id AND l.span_id = s.span_id) AS log_count
				 FROM spans s WHERE s.trace_id = ? ORDER BY s.start_time_ns, s.span_id`,
				[traceId],
			);
			const parsedSpans = spanRows.map((row) => ({
				...decodeJson(SpanDetailSchema, row.detail_json),
				logCount: Number(row.log_count ?? 0n),
			}));
			const spans = orderSpanTree(parsedSpans);
			const logRows = yield* query<LogRow>(
				reader,
				"SELECT log_id, detail_json FROM logs WHERE trace_id = ? ORDER BY COALESCE(timestamp_ns, observed_time_ns), log_id",
				[traceId],
			);
			const serviceMap = yield* servicesForTraces(reader, [traceId]);
			return {
				...traceSummaryFromRow(trace, serviceMap.get(traceId) ?? []),
				spans,
				logs: logRows.map((row) => logSummary(decodeJson(LogDetailSchema, row.detail_json))),
			} satisfies TraceDetail;
		});
		return mapStorageFailureExceptNotFound(operation, "Could not load the trace.");
	};

	const getSpan = (traceId: string, spanId: string) =>
		getTrace(traceId).pipe(
			Effect.flatMap((trace) => {
				const span = trace.spans.find((candidate) => candidate.spanId === spanId);
				return span === undefined
					? Effect.fail(
							new StorageNotFound({
								entity: "span",
								id: `${traceId}/${spanId}`,
								message: `Span ${spanId} was not found in trace ${traceId}.`,
							}),
						)
					: Effect.succeed(span);
			}),
		);

	const searchLogs = (queryRequest: LogSearchQuery, cursor?: CursorPosition) => {
		const clauses = [
			"COALESCE(l.timestamp_ns, l.observed_time_ns) >= ?",
			"COALESCE(l.timestamp_ns, l.observed_time_ns) <= ?",
		];
		const parameters: Array<unknown> = [queryRequest.fromNs, queryRequest.toNs];
		let from = "FROM logs l";
		if (queryRequest.text !== undefined && queryRequest.text.trim() !== "") {
			from = "FROM log_search JOIN logs l ON l.log_id = log_search.log_id";
			clauses.unshift("log_search MATCH ?");
			parameters.unshift(ftsPhrase(queryRequest.text));
		}
		if (queryRequest.services.length > 0) {
			const keys = queryRequest.services.map(serviceIdentityKey);
			clauses.push(`l.service_key IN (${placeholders(keys.length)})`);
			parameters.push(...keys);
		}
		if (queryRequest.minimumSeverity !== undefined) {
			clauses.push("l.severity_number >= ?");
			parameters.push(queryRequest.minimumSeverity);
		}
		if (queryRequest.maximumSeverity !== undefined) {
			clauses.push("l.severity_number <= ?");
			parameters.push(queryRequest.maximumSeverity);
		}
		if (queryRequest.traceId !== undefined) {
			clauses.push("l.trace_id = ?");
			parameters.push(queryRequest.traceId);
		}
		if (queryRequest.spanId !== undefined) {
			clauses.push("l.span_id = ?");
			parameters.push(queryRequest.spanId);
		}
		for (const [index, filter] of queryRequest.attributes.entries()) {
			const alias = `attribute_${index}`;
			clauses.push(
				`EXISTS (SELECT 1 FROM log_attributes ${alias} WHERE ${alias}.log_id = l.log_id AND ${alias}.attribute_key = ? AND ${alias}.value_text ${filter.operator === "equals" ? "= ?" : "LIKE ? ESCAPE '\\'"})`,
			);
			parameters.push(filter.key, filter.operator === "equals" ? filter.value : `%${escapeLike(filter.value)}%`);
		}
		if (cursor !== undefined) {
			const comparison = queryRequest.sort === "oldest" ? ">" : "<";
			clauses.push(
				`(COALESCE(l.timestamp_ns, l.observed_time_ns) ${comparison} ? OR (COALESCE(l.timestamp_ns, l.observed_time_ns) = ? AND l.log_id ${comparison} ?))`,
			);
			parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
		}
		const order =
			queryRequest.sort === "oldest"
				? "COALESCE(l.timestamp_ns, l.observed_time_ns) ASC, l.log_id ASC"
				: "COALESCE(l.timestamp_ns, l.observed_time_ns) DESC, l.log_id DESC";
		parameters.push(queryRequest.limit + 1);
		const operation = Effect.gen(function* () {
			const rows = yield* query<LogRow>(
				reader,
				`SELECT l.log_id, l.detail_json ${from} WHERE ${clauses.join(" AND ")} ORDER BY ${order} LIMIT ?`,
				parameters,
			);
			const truncated = rows.length > queryRequest.limit;
			return {
				items: rows
					.slice(0, queryRequest.limit)
					.map((row) => logSummary(decodeJson(LogDetailSchema, row.detail_json))),
				bounds: { fromNs: queryRequest.fromNs, toNs: queryRequest.toNs, limit: queryRequest.limit },
				truncated,
			};
		});
		return mapStorageFailure(operation, "read_failed", "Could not search logs.");
	};

	const getLog = (logId: string) => {
		const operation = Effect.gen(function* () {
			const rows = yield* query<LogRow>(reader, "SELECT log_id, detail_json FROM logs WHERE log_id = ?", [logId]);
			const row = rows[0];
			if (row === undefined) {
				return yield* Effect.fail(
					new StorageNotFound({ entity: "log", id: logId, message: `Log ${logId} was not found.` }),
				);
			}
			return decodeJson(LogDetailSchema, row.detail_json);
		});
		return mapStorageFailureExceptNotFound(operation, "Could not load the log.");
	};

	const listServices = (range: TimeRange, limit: number, cursor?: CursorPosition) => {
		const boundedLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
		const operation = Effect.gen(function* () {
			const cursorClause =
				cursor === undefined ? "" : "WHERE (a.last_seen_ns < ? OR (a.last_seen_ns = ? AND s.service_key > ?))";
			const parameters: Array<unknown> = [range.fromNs, range.toNs, range.fromNs, range.toNs];
			if (cursor !== undefined) parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
			parameters.push(boundedLimit + 1);
			const rows = yield* query<ServiceRow>(
				reader,
				`WITH observations AS (
					SELECT service_key, start_time_ns AS observed_ns, 1 AS span_count, 0 AS log_count,
						CASE WHEN status_code = 2 THEN 1 ELSE 0 END AS error_count
					FROM spans WHERE start_time_ns BETWEEN ? AND ?
					UNION ALL
					SELECT service_key, COALESCE(timestamp_ns, observed_time_ns) AS observed_ns,
						0 AS span_count, 1 AS log_count, 0 AS error_count
					FROM logs WHERE COALESCE(timestamp_ns, observed_time_ns) BETWEEN ? AND ?
				), aggregated AS (
					SELECT service_key, MIN(observed_ns) AS first_seen_ns, MAX(observed_ns) AS last_seen_ns,
						SUM(span_count) AS span_count, SUM(log_count) AS log_count, SUM(error_count) AS error_count
					FROM observations GROUP BY service_key
				)
				SELECT s.service_key, s.namespace, s.name, s.environment, s.unknown_service,
					a.first_seen_ns, a.last_seen_ns, a.span_count, a.log_count, a.error_count
				FROM aggregated a JOIN services s ON s.service_key = a.service_key
				${cursorClause}
				ORDER BY a.last_seen_ns DESC, s.service_key ASC LIMIT ?`,
				parameters,
			);
			return {
				items: rows.slice(0, boundedLimit).map(serviceSummaryFromRow),
				bounds: { ...range, limit: boundedLimit },
				truncated: rows.length > boundedLimit,
			};
		});
		return mapStorageFailure(operation, "read_failed", "Could not list Services.");
	};

	const listDiagnostics = (range: TimeRange, limit: number, cursor?: CursorPosition) => {
		const boundedLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
		const cursorClause = cursor === undefined ? "" : "AND (time_ns < ? OR (time_ns = ? AND id < ?))";
		const parameters: Array<unknown> = [range.fromNs, range.toNs];
		if (cursor !== undefined) parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
		parameters.push(boundedLimit + 1);
		const operation = query<{
			id: string;
			time_ns: bigint;
			signal: Diagnostic["signal"] | null;
			code: string;
			message: string;
			details_json: string | null;
		}>(
			reader,
			`SELECT * FROM diagnostics WHERE time_ns BETWEEN ? AND ? ${cursorClause}
			 ORDER BY time_ns DESC, id DESC LIMIT ?`,
			parameters,
		).pipe(
			Effect.map((rows) => ({
				items: rows.slice(0, boundedLimit).map(
					(row): Diagnostic => ({
						id: row.id,
						timeNs: row.time_ns,
						signal: row.signal ?? undefined,
						code: row.code,
						message: row.message,
						details: row.details_json === null ? undefined : JSON.parse(row.details_json),
					}),
				),
				bounds: { ...range, limit: boundedLimit },
				truncated: rows.length > boundedLimit,
			})),
		);
		return mapStorageFailure(operation, "read_failed", "Could not list ingestion diagnostics.");
	};

	const facets = (request: typeof FacetRequestSchema.Type, cursor?: CursorPosition) => {
		const operation = buildFacetQuery(reader, request, cursor);
		return mapStorageFailure(operation, "read_failed", "Could not load filter facets.");
	};

	const health = Effect.gen(function* () {
		const databaseSizeBytes = yield* databaseSize;
		const retention = yield* query<{ last_error: string | null }>(
			reader,
			"SELECT last_error FROM retention_state WHERE id = 1",
		);
		const retentionError = retention[0]?.last_error ?? undefined;
		return {
			status: retentionError === undefined ? "ok" : "degraded",
			live: true,
			migrationReady: true,
			writerReady: retentionError === undefined,
			readsAvailable: true,
			queueDepth: 0,
			queueBytes: 0n,
			databaseSizeBytes,
			...(retentionError === undefined ? {} : { message: retentionError }),
		} satisfies Health;
	}).pipe((effect) => mapStorageFailure(effect, "read_failed", "Could not inspect Telemetry Store health."));

	const ingestionStats = Effect.gen(function* () {
		const rows = yield* query<{ counter: string; value: bigint }>(
			reader,
			"SELECT counter, value FROM ingestion_counters",
		);
		const counters = new Map(rows.map((row) => [row.counter, row.value]));
		const retention = yield* query<{ running: bigint; deleted_records: bigint }>(
			reader,
			"SELECT running, deleted_records FROM retention_state WHERE id = 1",
		);
		const sortedLatency = [...writeLatencies].sort((left, right) => left - right);
		return {
			acceptedTraceRecords: counters.get("accepted_trace_records") ?? 0n,
			acceptedLogRecords: counters.get("accepted_log_records") ?? 0n,
			rejectedRequests: counters.get("rejected_requests") ?? 0n,
			decodeErrors: counters.get("decode_errors") ?? 0n,
			queueDepth: 0,
			queueBytes: 0n,
			writeLatencyP50Ms: percentile(sortedLatency, 0.5),
			writeLatencyP95Ms: percentile(sortedLatency, 0.95),
			droppedRecords: counters.get("dropped_records") ?? 0n,
			droppedDiagnostics: 0n,
			truncatedValues: counters.get("truncated_values") ?? 0n,
			databaseSizeBytes: yield* databaseSize,
			retentionDeletedRecords: retention[0]?.deleted_records ?? 0n,
			retentionRunning: retention[0]?.running === 1n,
		} satisfies IngestionStats;
	}).pipe((effect) => mapStorageFailure(effect, "read_failed", "Could not load ingestion statistics."));

	const information = Effect.gen(function* () {
		const [journal] = yield* query<{ journal_mode: string }>(reader, "PRAGMA journal_mode");
		const [migration] = yield* query<{ version: bigint | null }>(
			reader,
			"SELECT MAX(migration_id) AS version FROM belfry_migrations",
		);
		return {
			databasePath: options.databasePath,
			journalMode: journal?.journal_mode ?? "unknown",
			writerRole: "read-write",
			readerRole: "read-only",
			schemaVersion: Number(migration?.version ?? 0n),
			databaseSizeBytes: yield* databaseSize,
		} satisfies StorageInformation;
	}).pipe((effect) => mapStorageFailure(effect, "read_failed", "Could not inspect the Telemetry Store."));

	const recordIngestionFailure = (decodeError: boolean, diagnostic?: StorageDiagnosticInput) =>
		mapStorageFailure(
			writer.withTransaction(
				Effect.gen(function* () {
					yield* incrementCounter(writer, "rejected_requests", 1n);
					if (decodeError) yield* incrementCounter(writer, "decode_errors", 1n);
					if (diagnostic !== undefined) yield* writeDiagnostic(writer, diagnostic);
				}),
			),
			"write_failed",
			"Could not record an ingestion failure.",
		).pipe(Effect.asVoid);

	const retain = (retention: RetentionOptions) => {
		const operation = mapStorageFailure(
			Effect.gen(function* () {
				yield* writer.withTransaction(
					execute(writer, "UPDATE retention_state SET running = 1, last_error = NULL WHERE id = 1"),
				);
				// The separate committed state transition lets read-only health clients observe progress.
				yield* Effect.sleep(1);
				const result = yield* writer.withTransaction(runRetention(writer, retention, databaseSizeFor(writer)));
				yield* writer.withTransaction(
					execute(
						writer,
						"UPDATE retention_state SET running = 0, deleted_records = deleted_records + ?, last_run_ns = ? WHERE id = 1",
						[result.deletedRecords, retention.nowNs],
					),
				);
				return result;
			}),
			"retention_failed",
			"Could not complete Telemetry Store retention.",
		);
		return operation.pipe(
			Effect.tapError(() =>
				writer
					.withTransaction(
						Effect.gen(function* () {
							const message =
								"Telemetry retention failed; ingestion is paused until the Daemon can be restarted safely.";
							yield* execute(
								writer,
								"UPDATE retention_state SET running = 0, last_error = ? WHERE id = 1",
								[message],
							);
							yield* writeDiagnostic(writer, {
								signal: "retention",
								code: "retention_failed",
								message,
							});
						}),
					)
					.pipe(Effect.ignore),
			),
		);
	};

	const listTraceLogs = (traceId: string, limit: number, cursor?: CursorPosition, spanId?: string) => {
		const boundedLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
		const operation = Effect.gen(function* () {
			const traces = yield* query<TraceRow>(reader, "SELECT * FROM traces WHERE trace_id = ?", [traceId]);
			const trace = traces[0];
			if (trace === undefined) {
				return yield* Effect.fail(
					new StorageNotFound({ entity: "trace", id: traceId, message: `Trace ${traceId} was not found.` }),
				);
			}
			const cursorClause =
				cursor === undefined
					? ""
					: "AND (COALESCE(timestamp_ns, observed_time_ns) > ? OR (COALESCE(timestamp_ns, observed_time_ns) = ? AND log_id > ?))";
			const spanClause = spanId === undefined ? "" : "AND span_id = ?";
			const parameters: Array<unknown> = [traceId];
			if (spanId !== undefined) parameters.push(spanId);
			if (cursor !== undefined) parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
			parameters.push(boundedLimit + 1);
			const rows = yield* query<LogRow>(
				reader,
				`SELECT log_id, detail_json FROM logs WHERE trace_id = ? ${spanClause} ${cursorClause}
				 ORDER BY COALESCE(timestamp_ns, observed_time_ns), log_id LIMIT ?`,
				parameters,
			);
			return {
				items: rows
					.slice(0, boundedLimit)
					.map((row) => logSummary(decodeJson(LogDetailSchema, row.detail_json))),
				bounds: {
					fromNs: trace.start_time_ns,
					toNs: trace.end_time_ns ?? BigInt(Date.now()) * 1_000_000n,
					limit: boundedLimit,
				},
				truncated: rows.length > boundedLimit,
			};
		});
		return mapStorageFailureExceptNotFound(operation, "Could not list trace logs.");
	};

	const checkpoint = mapStorageFailure(
		execute(writer, "PRAGMA wal_checkpoint(TRUNCATE)"),
		"maintenance_failed",
		"Could not checkpoint the Telemetry Store WAL.",
	).pipe(Effect.asVoid);

	const vacuum = mapStorageFailure(
		execute(writer, "VACUUM"),
		"maintenance_failed",
		"Could not vacuum the Telemetry Store.",
	).pipe(Effect.asVoid);

	const reset = mapStorageFailure(
		writer.withTransaction(
			Effect.gen(function* () {
				yield* execute(writer, "DELETE FROM span_search");
				yield* execute(writer, "DELETE FROM log_search");
				yield* execute(writer, "DELETE FROM logs");
				yield* execute(writer, "DELETE FROM spans");
				yield* execute(writer, "DELETE FROM traces");
				yield* execute(writer, "DELETE FROM diagnostics");
				yield* execute(writer, "DELETE FROM services");
				yield* execute(writer, "DELETE FROM scopes");
				yield* execute(writer, "DELETE FROM resources");
				yield* execute(writer, "UPDATE ingestion_counters SET value = 0");
				yield* execute(
					writer,
					"UPDATE retention_state SET running = 0, deleted_records = 0, last_run_ns = NULL, last_error = NULL WHERE id = 1",
				);
			}),
		),
		"maintenance_failed",
		"Could not reset the Telemetry Store.",
	).pipe(Effect.asVoid);

	return {
		information,
		write,
		searchTraces,
		getTrace,
		getSpan,
		listTraceLogs,
		searchLogs,
		getLog,
		listServices,
		listDiagnostics,
		facets,
		health,
		ingestionStats,
		recordIngestionFailure,
		retain,
		checkpoint,
		vacuum,
		reset,
	};
};

const servicesForTraces = (client: SqlClientType, traceIds: ReadonlyArray<string>) => {
	if (traceIds.length === 0) return Effect.succeed(new Map<string, Array<ServiceIdentity>>());
	return query<ServiceRow & { trace_id: string }>(
		client,
		`SELECT ts.trace_id, s.* FROM trace_services ts JOIN services s ON s.service_key = ts.service_key
		 WHERE ts.trace_id IN (${placeholders(traceIds.length)})
		 ORDER BY COALESCE(s.namespace, ''), s.name, COALESCE(s.environment, '')`,
		traceIds,
	).pipe(
		Effect.map((rows) => {
			const result = new Map<string, Array<ServiceIdentity>>();
			for (const row of rows) {
				const services = result.get(row.trace_id) ?? [];
				services.push(serviceIdentityFromRow(row));
				result.set(row.trace_id, services);
			}
			return result;
		}),
	);
};

const mapStorageFailure = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
	code: StorageFailure["code"],
	message: string,
): Effect.Effect<A, StorageFailure, R> =>
	effect.pipe(
		Effect.mapError((cause) => (cause instanceof StorageFailure ? cause : storageFailure(code, message, cause))),
	);

const mapStorageFailureExceptNotFound = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
	message: string,
): Effect.Effect<A, StorageFailure | StorageNotFound, R> =>
	effect.pipe(
		Effect.mapError((cause) =>
			cause instanceof StorageNotFound || cause instanceof StorageFailure
				? cause
				: storageFailure("read_failed", message, cause),
		),
	);

const storageFailure = (code: StorageFailure["code"], message: string, cause: unknown) =>
	new StorageFailure({
		code,
		message: `${message} ${formatCause(cause)}`.trim(),
	});

const formatCause = (cause: unknown): string => {
	if (cause instanceof Error) return cause.message;
	if (typeof cause === "object" && cause !== null && "message" in cause) return String(cause.message);
	return String(cause);
};

const percentile = (values: ReadonlyArray<number>, fraction: number): number => {
	if (values.length === 0) return 0;
	return values[Math.min(values.length - 1, Math.floor((values.length - 1) * fraction))] ?? 0;
};
