import type { CursorPosition, FacetPageSchema, FacetRequestSchema } from "@belfry/query-api";
import type { ServiceIdentity } from "@belfry/telemetry";
import { serviceIdentityKey } from "@belfry/telemetry";
import { Effect } from "effect";
import type { SqlClient as SqlClientType } from "effect/unstable/sql/SqlClient";

import { escapeLike, placeholders, query } from "./sql.js";

type FacetRow = {
	readonly value: string;
	readonly cursor_id: string;
	readonly count: bigint;
	readonly namespace?: string | null;
	readonly name?: string | null;
	readonly environment?: string | null;
};

export const buildFacetQuery = (
	client: SqlClientType,
	request: typeof FacetRequestSchema.Type,
	cursor?: CursorPosition,
): Effect.Effect<typeof FacetPageSchema.Type, unknown> => {
	const limit = Math.max(1, Math.min(100, Math.trunc(request.limit)));
	const prefix = `${escapeLike(request.prefix ?? "")}%`;
	const serviceKeys = request.services.map(serviceIdentityKey);
	const cursorClause = cursor === undefined ? "" : "HAVING count < ? OR (count = ? AND cursor_id > ?)";
	const finishParameters = (parameters: Array<unknown>) => {
		if (cursor !== undefined) parameters.push(cursor.timeNs, cursor.timeNs, cursor.id);
		parameters.push(limit + 1);
		return parameters;
	};

	let operation: Effect.Effect<ReadonlyArray<FacetRow>, unknown>;
	if (request.kind === "service") {
		const clauses =
			request.signal === "traces"
				? [
						"sp.start_time_ns BETWEEN ? AND ?",
						"(s.name LIKE ? ESCAPE '\\' OR COALESCE(s.namespace, '') LIKE ? ESCAPE '\\' OR COALESCE(s.environment, '') LIKE ? ESCAPE '\\')",
					]
				: [
						"COALESCE(l.timestamp_ns, l.observed_time_ns) BETWEEN ? AND ?",
						"(s.name LIKE ? ESCAPE '\\' OR COALESCE(s.namespace, '') LIKE ? ESCAPE '\\' OR COALESCE(s.environment, '') LIKE ? ESCAPE '\\')",
					];
		const parameters: Array<unknown> = [request.fromNs, request.toNs, prefix, prefix, prefix];
		if (serviceKeys.length > 0) {
			clauses.push(
				request.signal === "traces"
					? `EXISTS (SELECT 1 FROM trace_services selected_service WHERE selected_service.trace_id = sp.trace_id AND selected_service.service_key IN (${placeholders(serviceKeys.length)}))`
					: `l.service_key IN (${placeholders(serviceKeys.length)})`,
			);
			parameters.push(...serviceKeys);
		}
		operation = query<FacetRow>(
			client,
			request.signal === "traces"
				? `SELECT s.name AS value, s.service_key AS cursor_id, s.namespace, s.name, s.environment,
					COUNT(DISTINCT sp.trace_id) AS count
				   FROM spans sp JOIN services s ON s.service_key = sp.service_key
				   WHERE ${clauses.join(" AND ")}
				   GROUP BY s.service_key ${cursorClause} ORDER BY count DESC, cursor_id ASC LIMIT ?`
				: `SELECT s.name AS value, s.service_key AS cursor_id, s.namespace, s.name, s.environment,
					COUNT(*) AS count
				   FROM logs l JOIN services s ON s.service_key = l.service_key
				   WHERE ${clauses.join(" AND ")}
				   GROUP BY s.service_key ${cursorClause} ORDER BY count DESC, cursor_id ASC LIMIT ?`,
			finishParameters(parameters),
		);
	} else if (request.kind === "operation") {
		const clauses = ["t.start_time_ns BETWEEN ? AND ?", "t.root_operation LIKE ? ESCAPE '\\'"];
		const parameters: Array<unknown> = [request.fromNs, request.toNs, prefix];
		if (serviceKeys.length > 0) {
			clauses.push(
				`EXISTS (SELECT 1 FROM trace_services selected_service WHERE selected_service.trace_id = t.trace_id AND selected_service.service_key IN (${placeholders(serviceKeys.length)}))`,
			);
			parameters.push(...serviceKeys);
		}
		operation = query<FacetRow>(
			client,
			`SELECT t.root_operation AS value, t.root_operation AS cursor_id, COUNT(*) AS count
			 FROM traces t WHERE ${clauses.join(" AND ")} GROUP BY t.root_operation ${cursorClause}
			 ORDER BY count DESC, cursor_id ASC LIMIT ?`,
			finishParameters(parameters),
		);
	} else if (request.kind === "severity") {
		const clauses = [
			"COALESCE(l.timestamp_ns, l.observed_time_ns) BETWEEN ? AND ?",
			"l.severity_number IS NOT NULL",
			"CAST(l.severity_number AS TEXT) LIKE ? ESCAPE '\\'",
		];
		const parameters: Array<unknown> = [request.fromNs, request.toNs, prefix];
		if (serviceKeys.length > 0) {
			clauses.push(`l.service_key IN (${placeholders(serviceKeys.length)})`);
			parameters.push(...serviceKeys);
		}
		operation = query<FacetRow>(
			client,
			`SELECT CAST(l.severity_number AS TEXT) AS value, CAST(l.severity_number AS TEXT) AS cursor_id,
				COUNT(*) AS count
			 FROM logs l WHERE ${clauses.join(" AND ")} GROUP BY l.severity_number ${cursorClause}
			 ORDER BY count DESC, cursor_id ASC LIMIT ?`,
			finishParameters(parameters),
		);
	} else {
		const traceSignal = request.signal === "traces";
		const valueColumn = request.kind === "attribute-key" ? "a.attribute_key" : "a.value_text";
		const clauses = [
			traceSignal
				? "t.start_time_ns BETWEEN ? AND ?"
				: "COALESCE(l.timestamp_ns, l.observed_time_ns) BETWEEN ? AND ?",
			`${valueColumn} LIKE ? ESCAPE '\\'`,
		];
		const parameters: Array<unknown> = [request.fromNs, request.toNs, prefix];
		if (request.kind === "attribute-value") {
			clauses.push("a.attribute_key = ?");
			parameters.push(request.key ?? "");
		}
		if (serviceKeys.length > 0) {
			clauses.push(
				traceSignal
					? `EXISTS (SELECT 1 FROM trace_services selected_service WHERE selected_service.trace_id = t.trace_id AND selected_service.service_key IN (${placeholders(serviceKeys.length)}))`
					: `l.service_key IN (${placeholders(serviceKeys.length)})`,
			);
			parameters.push(...serviceKeys);
		}
		operation = query<FacetRow>(
			client,
			traceSignal
				? `SELECT ${valueColumn} AS value, ${valueColumn} AS cursor_id, COUNT(*) AS count
				   FROM span_attributes a JOIN traces t ON t.trace_id = a.trace_id
				   WHERE ${clauses.join(" AND ")} GROUP BY ${valueColumn} ${cursorClause}
				   ORDER BY count DESC, cursor_id ASC LIMIT ?`
				: `SELECT ${valueColumn} AS value, ${valueColumn} AS cursor_id, COUNT(*) AS count
				   FROM log_attributes a JOIN logs l ON l.log_id = a.log_id
				   WHERE ${clauses.join(" AND ")} GROUP BY ${valueColumn} ${cursorClause}
				   ORDER BY count DESC, cursor_id ASC LIMIT ?`,
			finishParameters(parameters),
		);
	}

	return operation.pipe(
		Effect.map((rows) => {
			const pageRows = rows.slice(0, limit);
			return {
				items: pageRows.map((row) => {
					const service = serviceFromFacetRow(row);
					return {
						value: service === undefined ? row.value : formatService(service),
						count: Number(row.count),
						...(service === undefined ? {} : { service }),
					};
				}),
				bounds: { fromNs: request.fromNs, toNs: request.toNs, limit },
				truncated: rows.length > limit,
			};
		}),
	);
};

const serviceFromFacetRow = (row: FacetRow): ServiceIdentity | undefined =>
	row.name === undefined || row.name === null
		? undefined
		: {
				name: row.name,
				...(row.namespace === undefined || row.namespace === null ? {} : { namespace: row.namespace }),
				...(row.environment === undefined || row.environment === null ? {} : { environment: row.environment }),
			};

const formatService = (service: ServiceIdentity): string =>
	`${service.namespace === undefined ? "" : `${service.namespace}/`}${service.name}${service.environment === undefined ? "" : ` · ${service.environment}`}`;
