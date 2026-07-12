import type { LogDetail, ServiceIdentity, SpanDetail } from "@belfry/telemetry";
import {
	LogDetailSchema,
	ResourceDetailSchema,
	ScopeDetailSchema,
	SpanDetailSchema,
	serviceIdentityKey,
} from "@belfry/telemetry";
import { Effect } from "effect";
import type { SqlClient as SqlClientType } from "effect/unstable/sql/SqlClient";

import {
	type AttributeProjection,
	anyValueText,
	decodeJson,
	encodeDetailJson,
	encodeJson,
	projectAttributes,
	projectionSearchText,
	spanSearchText,
} from "./record-codec.js";
import { analyzeStructure, type SpanRow } from "./record-model.js";
import { chunks, deleteSpanProjections, execute, executeRows, placeholders, query } from "./sql.js";
import type { LogWriteRecord, StorageDiagnosticInput } from "./types.js";

type PreparedIdentity = {
	readonly resourceFingerprint: string;
	readonly scopeFingerprint: string;
	readonly service: ServiceIdentity;
	readonly serviceKey: string;
	readonly observedNs: bigint;
};

type PreparedSpan = PreparedIdentity & {
	readonly span: SpanDetail;
	readonly detail: SpanDetail;
	readonly projections: ReadonlyArray<AttributeProjection>;
	readonly truncatedValues: number;
};

type PreparedLog = PreparedIdentity & {
	readonly id: string;
	readonly log: LogWriteRecord;
	readonly detail: LogDetail;
	readonly projections: ReadonlyArray<AttributeProjection>;
	readonly truncatedValues: number;
};

export const writeSpans = (
	client: SqlClientType,
	input: ReadonlyArray<SpanDetail>,
	maxIndexedAttributes: number,
	maxIndexedValueBytes: number,
	maxIndexedAttributeKeys: number,
	maxIndexedValuesPerKey: number,
) =>
	Effect.gen(function* () {
		const lastByIdentity = new Map<string, SpanDetail>();
		for (const span of input) lastByIdentity.set(`${span.traceId}:${span.spanId}`, span);
		const spans = [...lastByIdentity.values()];
		const candidates = spans.map((span) => {
			const projected = projectAttributes(span.attributes, maxIndexedAttributes, maxIndexedValueBytes);
			return { span, projected };
		});
		const admitted = yield* admittedProjectionCardinality(
			client,
			candidates.flatMap(({ projected }) => projected.projections),
			maxIndexedAttributeKeys,
			maxIndexedValuesPerKey,
		);
		const prepared: ReadonlyArray<PreparedSpan> = candidates.map(({ span, projected }) => {
			const projections = projected.projections.filter((projection) =>
				admitted.has(projectionIdentity(projection)),
			);
			return {
				span,
				detail: { ...span, filterableAttributeKeys: projections.map(({ key }) => key) },
				projections,
				truncatedValues: projected.truncatedValues + (projected.projections.length - projections.length),
				resourceFingerprint: encodeJson(ResourceDetailSchema, span.resource),
				scopeFingerprint: encodeJson(ScopeDetailSchema, span.scope),
				service: span.service,
				serviceKey: serviceIdentityKey(span.service),
				observedNs: span.startTimeNs,
			};
		});
		const references = yield* ensureReferences(client, prepared);
		yield* ensureServices(client, prepared);

		const traceSeeds = new Map<string, SpanDetail>();
		for (const span of spans) if (!traceSeeds.has(span.traceId)) traceSeeds.set(span.traceId, span);
		yield* executeRows(
			client,
			"INSERT INTO traces(trace_id, root_operation, start_time_ns, active, span_count, error_count, warnings_json)",
			[...traceSeeds.values()].map((span) => [
				span.traceId,
				span.name,
				span.startTimeNs,
				span.endTimeNs === undefined ? 1 : 0,
				0,
				0,
				"[]",
			]),
			"ON CONFLICT(trace_id) DO NOTHING",
		);
		yield* executeRows(
			client,
			`INSERT INTO spans(
				trace_id, span_id, parent_span_id, service_key, resource_id, scope_id, name, kind,
				start_time_ns, end_time_ns, status_code, detail_json
			)`,
			prepared.map(({ span, detail, resourceFingerprint, scopeFingerprint, serviceKey }) => [
				span.traceId,
				span.spanId,
				span.parentSpanId ?? null,
				serviceKey,
				referenceId(references.resources, resourceFingerprint, "resource"),
				referenceId(references.scopes, scopeFingerprint, "scope"),
				span.name,
				span.kind,
				span.startTimeNs,
				span.endTimeNs ?? null,
				span.status.code,
				encodeDetailJson(SpanDetailSchema, detail),
			]),
			`ON CONFLICT(trace_id, span_id) DO UPDATE SET
				parent_span_id = excluded.parent_span_id,
				service_key = excluded.service_key,
				resource_id = excluded.resource_id,
				scope_id = excluded.scope_id,
				name = excluded.name,
				kind = excluded.kind,
				start_time_ns = excluded.start_time_ns,
				end_time_ns = excluded.end_time_ns,
				status_code = excluded.status_code,
				detail_json = excluded.detail_json`,
		);

		const spanKeys = spans.map((span) => [span.traceId, span.spanId] as const);
		yield* deleteSpanProjections(client, "span_attributes", spanKeys);
		yield* executeRows(
			client,
			"INSERT INTO span_attributes(trace_id, span_id, attribute_key, value_type, value_text)",
			prepared.flatMap(({ span, projections }) =>
				projections.map((projection) => [
					span.traceId,
					span.spanId,
					projection.key,
					projection.type,
					projection.value,
				]),
			),
		);
		yield* deleteSpanProjections(client, "span_search", spanKeys);
		yield* executeRows(
			client,
			"INSERT INTO span_search(trace_id, span_id, text)",
			prepared.map(({ span, projections }) => [span.traceId, span.spanId, spanSearchText(span, projections)]),
		);
		return {
			traceIds: new Set(spans.map((span) => span.traceId)),
			droppedRecords: spans.reduce((total, span) => total + droppedSpanItems(span), 0n),
			truncatedValues: BigInt(prepared.reduce((total, span) => total + span.truncatedValues, 0)),
		};
	});

export const writeLogs = (
	client: SqlClientType,
	logs: ReadonlyArray<LogWriteRecord>,
	maxIndexedAttributes: number,
	maxIndexedValueBytes: number,
	maxIndexedAttributeKeys: number,
	maxIndexedValuesPerKey: number,
) =>
	Effect.gen(function* () {
		const candidates = logs.map((log) => {
			const id = crypto.randomUUID();
			const observedNs = log.timestampNs ?? log.observedTimeNs ?? BigInt(Date.now()) * 1_000_000n;
			const normalizedLog =
				log.timestampNs === undefined && log.observedTimeNs === undefined
					? { ...log, observedTimeNs: observedNs }
					: log;
			const bodyText = anyValueText(normalizedLog.body);
			const bodyPreview = bodyText.slice(0, 240);
			const projected = projectAttributes(normalizedLog.attributes, maxIndexedAttributes, maxIndexedValueBytes);
			return { id, normalizedLog, bodyText, bodyPreview, projected, observedNs };
		});
		const admitted = yield* admittedProjectionCardinality(
			client,
			candidates.flatMap(({ projected }) => projected.projections),
			maxIndexedAttributeKeys,
			maxIndexedValuesPerKey,
		);
		const prepared: ReadonlyArray<PreparedLog> = candidates.map(
			({ id, normalizedLog, bodyText, bodyPreview, projected, observedNs }) => {
				const projections = projected.projections.filter((projection) =>
					admitted.has(projectionIdentity(projection)),
				);
				return {
					id,
					log: normalizedLog,
					detail: {
						...normalizedLog,
						id,
						bodyPreview,
						truncated: bodyText.length > bodyPreview.length,
						filterableAttributeKeys: projections.map(({ key }) => key),
					},
					projections,
					truncatedValues:
						projected.truncatedValues +
						(projected.projections.length - projections.length) +
						(bodyText.length > bodyPreview.length ? 1 : 0),
					resourceFingerprint: encodeJson(ResourceDetailSchema, normalizedLog.resource),
					scopeFingerprint: encodeJson(ScopeDetailSchema, normalizedLog.scope),
					service: normalizedLog.service,
					serviceKey: serviceIdentityKey(normalizedLog.service),
					observedNs,
				};
			},
		);
		const references = yield* ensureReferences(client, prepared);
		yield* ensureServices(client, prepared);
		yield* executeRows(
			client,
			`INSERT INTO logs(
				log_id, timestamp_ns, observed_time_ns, service_key, resource_id, scope_id,
				severity_number, severity_text, trace_id, span_id, body_preview, detail_json
			)`,
			prepared.map(({ id, log, detail, resourceFingerprint, scopeFingerprint, serviceKey }) => [
				id,
				log.timestampNs ?? null,
				log.observedTimeNs ?? null,
				serviceKey,
				referenceId(references.resources, resourceFingerprint, "resource"),
				referenceId(references.scopes, scopeFingerprint, "scope"),
				log.severityNumber ?? null,
				log.severityText ?? null,
				log.traceId ?? null,
				log.spanId ?? null,
				detail.bodyPreview,
				encodeDetailJson(LogDetailSchema, detail),
			]),
		);
		yield* executeRows(
			client,
			"INSERT INTO log_attributes(log_id, attribute_key, value_type, value_text)",
			prepared.flatMap(({ id, projections }) =>
				projections.map((projection) => [id, projection.key, projection.type, projection.value]),
			),
		);
		yield* executeRows(
			client,
			"INSERT INTO log_search(log_id, text)",
			prepared.map(({ id, log, projections }) => [
				id,
				[
					anyValueText(log.body),
					log.severityText ?? "",
					log.eventName ?? "",
					projectionSearchText(projections),
				].join(" "),
			]),
		);
		return {
			ids: prepared.map(({ id }) => id),
			droppedRecords: logs.reduce((total, log) => total + droppedLogItems(log), 0n),
			truncatedValues: BigInt(prepared.reduce((total, log) => total + log.truncatedValues, 0)),
		};
	});

type AttributeKeyRow = { readonly attribute_key: string };
type AttributeValueRow = { readonly value_type: string; readonly value_text: string };

const admittedProjectionCardinality = (
	client: SqlClientType,
	projections: ReadonlyArray<AttributeProjection>,
	maxKeys: number,
	maxValuesPerKey: number,
) =>
	Effect.gen(function* () {
		const candidateKeys = [...new Set(projections.map(({ key }) => key))].sort();
		if (candidateKeys.length === 0) return new Set<string>();
		const existingKeyRows = yield* query<AttributeKeyRow>(
			client,
			`SELECT attribute_key FROM (
				SELECT attribute_key FROM span_attributes
				UNION
				SELECT attribute_key FROM log_attributes
			) ORDER BY attribute_key LIMIT ?`,
			[Math.max(1, maxKeys)],
		);
		const admittedKeys = new Set(existingKeyRows.map(({ attribute_key }) => attribute_key));
		for (const key of candidateKeys) {
			if (admittedKeys.has(key)) continue;
			if (admittedKeys.size >= maxKeys) break;
			admittedKeys.add(key);
		}

		const admitted = new Set<string>();
		for (const key of candidateKeys) {
			if (!admittedKeys.has(key)) continue;
			const existingRows = yield* query<AttributeValueRow>(
				client,
				`SELECT value_type, value_text FROM (
					SELECT value_type, value_text FROM span_attributes WHERE attribute_key = ?
					UNION
					SELECT value_type, value_text FROM log_attributes WHERE attribute_key = ?
				) ORDER BY value_type, value_text LIMIT ?`,
				[key, key, Math.max(1, maxValuesPerKey)],
			);
			const values = new Set(
				existingRows.map(({ value_type, value_text }) => `${value_type}\u0000${value_text}`),
			);
			const candidates = projections
				.filter((projection) => projection.key === key)
				.sort((left, right) =>
					left.type === right.type
						? left.value.localeCompare(right.value)
						: left.type.localeCompare(right.type),
				);
			for (const projection of candidates) {
				const value = `${projection.type}\u0000${projection.value}`;
				if (!values.has(value) && values.size >= maxValuesPerKey) continue;
				values.add(value);
				admitted.add(projectionIdentity(projection));
			}
		}
		return admitted;
	});

const projectionIdentity = ({ key, type, value }: AttributeProjection): string => `${key}\u0000${type}\u0000${value}`;

const droppedSpanItems = (span: SpanDetail): bigint =>
	BigInt(
		(span.droppedAttributesCount ?? 0) +
			(span.droppedEventsCount ?? 0) +
			(span.droppedLinksCount ?? 0) +
			(span.resource.droppedAttributesCount ?? 0) +
			(span.scope.droppedAttributesCount ?? 0) +
			span.events.reduce((total, event) => total + (event.droppedAttributesCount ?? 0), 0) +
			span.links.reduce((total, link) => total + (link.droppedAttributesCount ?? 0), 0),
	);

const droppedLogItems = (log: LogWriteRecord): bigint =>
	BigInt(
		(log.droppedAttributesCount ?? 0) +
			(log.resource.droppedAttributesCount ?? 0) +
			(log.scope.droppedAttributesCount ?? 0),
	);

const ensureReferences = (client: SqlClientType, records: ReadonlyArray<PreparedIdentity>) =>
	Effect.gen(function* () {
		const resources = yield* ensureReferenceIds(
			client,
			"resources",
			records.map(({ resourceFingerprint }) => resourceFingerprint),
		);
		const scopes = yield* ensureReferenceIds(
			client,
			"scopes",
			records.map(({ scopeFingerprint }) => scopeFingerprint),
		);
		return { resources, scopes };
	});

const ensureReferenceIds = (
	client: SqlClientType,
	table: "resources" | "scopes",
	fingerprints: ReadonlyArray<string>,
) =>
	Effect.gen(function* () {
		const unique = [...new Set(fingerprints)];
		yield* executeRows(
			client,
			`INSERT INTO ${table}(fingerprint, data_json)`,
			unique.map((fingerprint) => [fingerprint, fingerprint]),
			"ON CONFLICT(fingerprint) DO NOTHING",
		);
		const ids = new Map<string, bigint>();
		for (const chunk of chunks(unique, 500)) {
			const rows = yield* query<{ id: bigint; fingerprint: string }>(
				client,
				`SELECT id, fingerprint FROM ${table} WHERE fingerprint IN (${placeholders(chunk.length)})`,
				chunk,
			);
			for (const row of rows) ids.set(row.fingerprint, row.id);
		}
		if (ids.size !== unique.length) return yield* Effect.die(`Could not resolve all ${table} identities`);
		return ids;
	});

const ensureServices = (client: SqlClientType, records: ReadonlyArray<PreparedIdentity>) => {
	const observations = new Map<
		string,
		{ readonly service: ServiceIdentity; firstSeenNs: bigint; lastSeenNs: bigint }
	>();
	for (const record of records) {
		const existing = observations.get(record.serviceKey);
		if (existing === undefined) {
			observations.set(record.serviceKey, {
				service: record.service,
				firstSeenNs: record.observedNs,
				lastSeenNs: record.observedNs,
			});
			continue;
		}
		if (record.observedNs < existing.firstSeenNs) existing.firstSeenNs = record.observedNs;
		if (record.observedNs > existing.lastSeenNs) existing.lastSeenNs = record.observedNs;
	}
	return executeRows(
		client,
		"INSERT INTO services(service_key, namespace, name, environment, unknown_service, first_seen_ns, last_seen_ns)",
		[...observations].map(([key, observation]) => [
			key,
			observation.service.namespace ?? null,
			observation.service.name,
			observation.service.environment ?? null,
			observation.service.name === "unknown_service" ? 1 : 0,
			observation.firstSeenNs,
			observation.lastSeenNs,
		]),
		`ON CONFLICT(service_key) DO UPDATE SET
			first_seen_ns = MIN(first_seen_ns, excluded.first_seen_ns),
			last_seen_ns = MAX(last_seen_ns, excluded.last_seen_ns)`,
	);
};

const referenceId = (ids: ReadonlyMap<string, bigint>, fingerprint: string, kind: string): bigint => {
	const id = ids.get(fingerprint);
	if (id === undefined) throw new Error(`Missing ${kind} identity after upsert`);
	return id;
};

export const materializeTrace = (client: SqlClientType, traceId: string) =>
	Effect.gen(function* () {
		const rows = yield* query<SpanRow & { start_time_ns: bigint; end_time_ns: bigint | null; status_code: bigint }>(
			client,
			"SELECT trace_id, span_id, detail_json, start_time_ns, end_time_ns, status_code FROM spans WHERE trace_id = ? ORDER BY start_time_ns, span_id",
			[traceId],
		);
		if (rows.length === 0) return;
		const spans = rows.map((row) => decodeJson(SpanDetailSchema, row.detail_json));
		const structure = analyzeStructure(spans);
		const startTimeNs = spans.reduce(
			(current, span) => (span.startTimeNs < current ? span.startTimeNs : current),
			spans[0]?.startTimeNs ?? 0n,
		);
		const active = spans.some((span) => span.endTimeNs === undefined);
		const endTimeNs = active
			? undefined
			: spans.reduce(
					(current, span) =>
						span.endTimeNs !== undefined && span.endTimeNs > current ? span.endTimeNs : current,
					spans[0]?.endTimeNs ?? startTimeNs,
				);
		const root = structure.roots[0] ?? spans[0];
		yield* execute(
			client,
			`UPDATE traces SET
				root_span_id = ?, root_operation = ?, start_time_ns = ?, end_time_ns = ?, duration_ns = ?,
				active = ?, span_count = ?, error_count = ?, warnings_json = ?
			 WHERE trace_id = ?`,
			[
				root?.spanId ?? null,
				root?.name ?? "unknown operation",
				startTimeNs,
				endTimeNs ?? null,
				endTimeNs === undefined ? null : endTimeNs - startTimeNs,
				active ? 1 : 0,
				spans.length,
				spans.filter((span) => span.status.code === 2).length,
				JSON.stringify([...structure.traceWarnings]),
				traceId,
			],
		);
		yield* execute(client, "DELETE FROM trace_services WHERE trace_id = ?", [traceId]);
		const services = new Set(spans.map((span) => serviceIdentityKey(span.service)));
		for (const serviceKey of services) {
			yield* execute(client, "INSERT INTO trace_services(trace_id, service_key) VALUES (?, ?)", [
				traceId,
				serviceKey,
			]);
		}
	});

export const writeDiagnostic = (client: SqlClientType, diagnostic: StorageDiagnosticInput) =>
	execute(
		client,
		"INSERT INTO diagnostics(id, time_ns, signal, code, message, details_json) VALUES (?, ?, ?, ?, ?, ?)",
		[
			crypto.randomUUID(),
			BigInt(Date.now()) * 1_000_000n,
			diagnostic.signal ?? null,
			diagnostic.code,
			diagnostic.message,
			diagnostic.details === undefined ? null : JSON.stringify(diagnostic.details),
		],
	);

export const incrementCounter = (client: SqlClientType, counter: string, amount: bigint) =>
	execute(
		client,
		"INSERT INTO ingestion_counters(counter, value) VALUES (?, ?) ON CONFLICT(counter) DO UPDATE SET value = value + excluded.value",
		[counter, amount],
	);
