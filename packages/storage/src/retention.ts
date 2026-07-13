import { statSync } from "node:fs";
import { Effect } from "effect";
import type { SqlClient as SqlClientType } from "effect/unstable/sql/SqlClient";

import { execute, placeholders, query } from "./sql.js";
import type { RetentionOptions, RetentionResult } from "./types.js";

export const runRetention = (
	writer: SqlClientType,
	options: RetentionOptions,
	databaseSize: Effect.Effect<bigint, unknown>,
): Effect.Effect<RetentionResult, unknown> =>
	Effect.gen(function* () {
		const batchSize = Math.max(1, Math.min(10_000, Math.trunc(options.batchSize)));
		const cutoff = options.nowNs - options.maxAgeNs;
		const before = yield* telemetryRecordCount(writer);
		const oldCandidates = yield* retentionCandidates(writer, batchSize, cutoff);
		yield* deleteCandidates(writer, oldCandidates);
		let deleted = before - (yield* telemetryRecordCount(writer));
		let size = yield* databaseSize;
		if (size > options.maxBytes && deleted < batchSize) {
			const oldest = yield* retentionCandidates(writer, batchSize - deleted);
			yield* deleteCandidates(writer, oldest);
			deleted = before - (yield* telemetryRecordCount(writer));
		}
		yield* execute(writer, "PRAGMA incremental_vacuum(128)");
		size = yield* databaseSize;
		const moreOld = yield* query<{ count: bigint }>(
			writer,
			`SELECT
				(SELECT COUNT(*) FROM traces WHERE start_time_ns < ?) +
				(SELECT COUNT(*) FROM logs WHERE COALESCE(timestamp_ns, observed_time_ns) < ?) AS count`,
			[cutoff, cutoff],
		);
		const remaining = yield* telemetryRecordCount(writer);
		return {
			deletedRecords: deleted,
			databaseSizeBytes: size,
			needsMore: (moreOld[0]?.count ?? 0n) > 0n || (size > options.maxBytes && remaining > 0),
		};
	});

export const databaseSizeFor = (client: SqlClientType): Effect.Effect<bigint, unknown> =>
	Effect.gen(function* () {
		const [pageCount] = yield* query<{ page_count: bigint }>(client, "PRAGMA page_count");
		const [freeList] = yield* query<{ freelist_count: bigint }>(client, "PRAGMA freelist_count");
		const [pageSize] = yield* query<{ page_size: bigint }>(client, "PRAGMA page_size");
		return ((pageCount?.page_count ?? 0n) - (freeList?.freelist_count ?? 0n)) * (pageSize?.page_size ?? 0n);
	});

export const storageFileSizesFor = (
	databasePath: string,
): Effect.Effect<{ readonly storageSizeBytes: bigint; readonly walSizeBytes: bigint }, unknown> =>
	Effect.try({
		try: () => {
			const databaseSizeBytes = fileSize(databasePath);
			const walSizeBytes = fileSize(`${databasePath}-wal`);
			const sharedMemorySizeBytes = fileSize(`${databasePath}-shm`);
			return {
				storageSizeBytes: databaseSizeBytes + walSizeBytes + sharedMemorySizeBytes,
				walSizeBytes,
			};
		},
		catch: (cause) => cause,
	});

const fileSize = (path: string): bigint => {
	try {
		return statSync(path, { bigint: true }).size;
	} catch (cause) {
		if (typeof cause === "object" && cause !== null && "code" in cause && cause.code === "ENOENT") return 0n;
		throw cause;
	}
};

const deleteTelemetry = (client: SqlClientType, traceIds: ReadonlyArray<string>, logIds: ReadonlyArray<string>) =>
	Effect.gen(function* () {
		if (traceIds.length > 0) {
			yield* execute(
				client,
				`DELETE FROM span_search WHERE trace_id IN (${placeholders(traceIds.length)})`,
				traceIds,
			);
			yield* execute(client, `DELETE FROM traces WHERE trace_id IN (${placeholders(traceIds.length)})`, traceIds);
		}
		if (logIds.length > 0) {
			yield* execute(client, `DELETE FROM log_search WHERE log_id IN (${placeholders(logIds.length)})`, logIds);
			yield* execute(client, `DELETE FROM logs WHERE log_id IN (${placeholders(logIds.length)})`, logIds);
		}
		yield* execute(
			client,
			"DELETE FROM services WHERE NOT EXISTS (SELECT 1 FROM spans WHERE spans.service_key = services.service_key) AND NOT EXISTS (SELECT 1 FROM logs WHERE logs.service_key = services.service_key)",
		);
		yield* execute(
			client,
			"DELETE FROM resources WHERE NOT EXISTS (SELECT 1 FROM spans WHERE spans.resource_id = resources.id) AND NOT EXISTS (SELECT 1 FROM logs WHERE logs.resource_id = resources.id)",
		);
		yield* execute(
			client,
			"DELETE FROM scopes WHERE NOT EXISTS (SELECT 1 FROM spans WHERE spans.scope_id = scopes.id) AND NOT EXISTS (SELECT 1 FROM logs WHERE logs.scope_id = scopes.id)",
		);
	});

type RetentionCandidate = {
	readonly kind: "trace" | "log";
	readonly id: string;
};

const retentionCandidates = (
	client: SqlClientType,
	limit: number,
	cutoff?: bigint,
): Effect.Effect<ReadonlyArray<RetentionCandidate>, unknown> => {
	const traceWhere = cutoff === undefined ? "" : "WHERE start_time_ns < ?";
	const logWhere = cutoff === undefined ? "" : "WHERE COALESCE(timestamp_ns, observed_time_ns) < ?";
	const parameters: Array<unknown> = cutoff === undefined ? [limit] : [cutoff, cutoff, limit];
	return query<RetentionCandidate>(
		client,
		`SELECT kind, id FROM (
			SELECT 'trace' AS kind, trace_id AS id, start_time_ns AS time_ns FROM traces ${traceWhere}
			UNION ALL
			SELECT 'log' AS kind, log_id AS id, COALESCE(timestamp_ns, observed_time_ns) AS time_ns FROM logs ${logWhere}
		) ORDER BY time_ns, kind, id LIMIT ?`,
		parameters,
	);
};

const deleteCandidates = (client: SqlClientType, candidates: ReadonlyArray<RetentionCandidate>) =>
	deleteTelemetry(
		client,
		candidates.filter((candidate) => candidate.kind === "trace").map((candidate) => candidate.id),
		candidates.filter((candidate) => candidate.kind === "log").map((candidate) => candidate.id),
	);

const telemetryRecordCount = (client: SqlClientType): Effect.Effect<number, unknown> =>
	query<{ count: bigint }>(
		client,
		"SELECT (SELECT COUNT(*) FROM traces) + (SELECT COUNT(*) FROM logs) AS count",
	).pipe(Effect.map((rows) => Number(rows[0]?.count ?? 0n)));
