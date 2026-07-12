import { opentelemetry } from "@belfry/otlp-proto";
import type {
	OtlpAnyValue,
	ResourceDetail,
	ScopeDetail,
	ServiceIdentity,
	SpanDetail,
	TelemetryAttributes,
} from "@belfry/telemetry";
import { Schema } from "effect";
import type { IngestionDiagnostic, NormalizedLog, NormalizedLogBatch, NormalizedTraceBatch } from "./types.js";

type ProtoAnyValue = opentelemetry.proto.common.v1.AnyValue.$Properties;
type ProtoKeyValue = opentelemetry.proto.common.v1.KeyValue.$Properties;
type ProtoResource = opentelemetry.proto.resource.v1.Resource.$Properties;
type ProtoScope = opentelemetry.proto.common.v1.InstrumentationScope.$Properties;
type ProtoSpan = opentelemetry.proto.trace.v1.Span.$Properties;
type ProtoSpanEvent = opentelemetry.proto.trace.v1.Span.Event.$Properties;
type ProtoSpanLink = opentelemetry.proto.trace.v1.Span.Link.$Properties;
type ProtoLogRecord = opentelemetry.proto.logs.v1.LogRecord.$Properties;

export class UnsupportedOtlpContentType extends Schema.TaggedErrorClass<UnsupportedOtlpContentType>()(
	"UnsupportedOtlpContentType",
	{
		contentType: Schema.String,
		message: Schema.String,
	},
) {}

export class OtlpDecodeError extends Schema.TaggedErrorClass<OtlpDecodeError>()("OtlpDecodeError", {
	signal: Schema.Literals(["traces", "logs"]),
	code: Schema.Literals(["malformed_payload", "invalid_trace_id", "invalid_span_id"]),
	message: Schema.String,
}) {}

type OtlpEncoding = "protobuf" | "json";

const parseContentType = (contentType: string): OtlpEncoding => {
	const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase();
	if (mediaType === "application/x-protobuf") return "protobuf";
	if (mediaType === "application/json") return "json";
	throw new UnsupportedOtlpContentType({
		contentType,
		message: `Unsupported OTLP content type: ${contentType}`,
	});
};

const parseJson = (bytes: Uint8Array): unknown => JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));

const parseOtlpJson = (bytes: Uint8Array): Record<string, unknown> =>
	normalizeJsonIdentities(asJsonObject(parseJson(bytes)));

export const decodeOtlpTraces = (bytes: Uint8Array, contentType: string): NormalizedTraceBatch => {
	const encoding = parseContentType(contentType);
	try {
		const requestType = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest;
		const request =
			encoding === "protobuf" ? requestType.decode(bytes) : requestType.fromObject(parseOtlpJson(bytes));
		const verification = requestType.verify(request);
		if (verification !== null) throw new Error(verification);

		const spans: Array<SpanDetail> = [];
		const diagnostics: Array<IngestionDiagnostic> = [];
		for (const resourceSpans of request.resourceSpans) {
			const resource = normalizeResource(resourceSpans.resource);
			const service = serviceFromResource(resource.attributes, diagnostics);
			for (const scopeSpans of resourceSpans.scopeSpans ?? []) {
				const scope = normalizeScope(scopeSpans.scope);
				for (const span of scopeSpans.spans ?? []) {
					spans.push(normalizeSpan(span, resource, scope, service));
				}
			}
		}

		return { signal: "traces", spans, diagnostics };
	} catch (error) {
		if (error instanceof OtlpDecodeError || error instanceof UnsupportedOtlpContentType) throw error;
		throw new OtlpDecodeError({
			signal: "traces",
			code: "malformed_payload",
			message: `Could not decode OTLP trace export request: ${errorMessage(error)}`,
		});
	}
};

export const decodeOtlpLogs = (bytes: Uint8Array, contentType: string): NormalizedLogBatch => {
	const encoding = parseContentType(contentType);
	try {
		const requestType = opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest;
		const request =
			encoding === "protobuf" ? requestType.decode(bytes) : requestType.fromObject(parseOtlpJson(bytes));
		const verification = requestType.verify(request);
		if (verification !== null) throw new Error(verification);

		const logs: Array<NormalizedLog> = [];
		const diagnostics: Array<IngestionDiagnostic> = [];
		for (const resourceLogs of request.resourceLogs) {
			const resource = normalizeResource(resourceLogs.resource);
			const service = serviceFromResource(resource.attributes, diagnostics);
			for (const scopeLogs of resourceLogs.scopeLogs ?? []) {
				const scope = normalizeScope(scopeLogs.scope);
				for (const log of scopeLogs.logRecords ?? []) {
					logs.push(normalizeLog(log, resource, scope, service));
				}
			}
		}

		return { signal: "logs", logs, diagnostics };
	} catch (error) {
		if (error instanceof OtlpDecodeError || error instanceof UnsupportedOtlpContentType) throw error;
		throw new OtlpDecodeError({
			signal: "logs",
			code: "malformed_payload",
			message: `Could not decode OTLP log export request: ${errorMessage(error)}`,
		});
	}
};

const asJsonObject = (value: unknown): Record<string, unknown> => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error("Expected an OTLP export request object.");
	}
	return value as Record<string, unknown>;
};

const identityFields = new Set(["traceId", "spanId", "parentSpanId"]);

const normalizeJsonIdentities = (object: Record<string, unknown>): Record<string, unknown> =>
	Object.fromEntries(
		Object.entries(object).map(([key, value]) => [
			key,
			identityFields.has(key) && typeof value === "string"
				? hexadecimalBytes(value)
				: Array.isArray(value)
					? value.map((item) =>
							typeof item === "object" && item !== null && !Array.isArray(item)
								? normalizeJsonIdentities(item as Record<string, unknown>)
								: item,
						)
					: typeof value === "object" && value !== null
						? normalizeJsonIdentities(value as Record<string, unknown>)
						: value,
		]),
	);

const hexadecimalBytes = (value: string): Uint8Array => {
	if (value.length % 2 !== 0 || !/^[0-9a-f]*$/iu.test(value)) return new Uint8Array();
	const bytes = new Uint8Array(value.length / 2);
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
	}
	return bytes;
};

const normalizeSpan = (
	span: ProtoSpan,
	resource: ResourceDetail,
	scope: ScopeDetail,
	service: ServiceIdentity,
): SpanDetail => {
	const endTimeNs = nanoseconds(span.endTimeUnixNano);
	return {
		traceId: canonicalId(span.traceId, 16, "traces", "invalid_trace_id"),
		spanId: canonicalId(span.spanId, 8, "traces", "invalid_span_id"),
		parentSpanId: optionalCanonicalId(span.parentSpanId, 8, "traces", "invalid_span_id"),
		traceState: nonEmpty(span.traceState),
		flags: span.flags ?? 0,
		name: span.name ?? "",
		kind: span.kind ?? 0,
		startTimeNs: nanoseconds(span.startTimeUnixNano),
		endTimeNs: endTimeNs === 0n ? undefined : endTimeNs,
		service,
		status: {
			code: span.status?.code ?? 0,
			message: nonEmpty(span.status?.message),
		},
		attributes: normalizeAttributes(span.attributes),
		droppedAttributesCount: positive(span.droppedAttributesCount),
		events: (span.events ?? []).map(normalizeEvent),
		droppedEventsCount: positive(span.droppedEventsCount),
		links: (span.links ?? []).map(normalizeLink),
		droppedLinksCount: positive(span.droppedLinksCount),
		resource,
		scope,
		logCount: 0,
		warnings: endTimeNs === 0n ? ["running-span"] : [],
	};
};

const normalizeEvent = (event: ProtoSpanEvent) => ({
	name: event.name ?? "",
	timeNs: nanoseconds(event.timeUnixNano),
	attributes: normalizeAttributes(event.attributes),
	droppedAttributesCount: positive(event.droppedAttributesCount),
});

const normalizeLink = (link: ProtoSpanLink) => ({
	traceId: canonicalId(link.traceId, 16, "traces", "invalid_trace_id"),
	spanId: canonicalId(link.spanId, 8, "traces", "invalid_span_id"),
	traceState: nonEmpty(link.traceState),
	flags: link.flags ?? 0,
	attributes: normalizeAttributes(link.attributes),
	droppedAttributesCount: positive(link.droppedAttributesCount),
});

const normalizeLog = (
	log: ProtoLogRecord,
	resource: ResourceDetail,
	scope: ScopeDetail,
	service: ServiceIdentity,
): NormalizedLog => ({
	timestampNs: optionalNanoseconds(log.timeUnixNano),
	observedTimeNs: optionalNanoseconds(log.observedTimeUnixNano),
	service,
	severityNumber:
		log.severityNumber === undefined || log.severityNumber === null || log.severityNumber === 0
			? undefined
			: log.severityNumber,
	severityText: nonEmpty(log.severityText),
	traceId: optionalCanonicalId(log.traceId, 16, "logs", "invalid_trace_id"),
	spanId: optionalCanonicalId(log.spanId, 8, "logs", "invalid_span_id"),
	traceFlags: log.flags ?? 0,
	body: normalizeAnyValue(log.body),
	attributes: normalizeAttributes(log.attributes),
	droppedAttributesCount: positive(log.droppedAttributesCount),
	eventName: nonEmpty(log.eventName),
	resource,
	scope,
});

const normalizeResource = (resource: ProtoResource | null | undefined): ResourceDetail => ({
	attributes: normalizeAttributes(resource?.attributes),
	droppedAttributesCount: positive(resource?.droppedAttributesCount),
});

const normalizeScope = (scope: ProtoScope | null | undefined): ScopeDetail => ({
	name: scope?.name ?? "",
	version: nonEmpty(scope?.version),
	attributes: normalizeAttributes(scope?.attributes),
	droppedAttributesCount: positive(scope?.droppedAttributesCount),
});

const normalizeAttributes = (attributes: ReadonlyArray<ProtoKeyValue> | null | undefined): TelemetryAttributes => {
	const normalized: Record<string, OtlpAnyValue> = {};
	for (const attribute of attributes ?? []) {
		const key = attribute.key ?? "";
		if (key !== "") normalized[key] = normalizeAnyValue(attribute.value);
	}
	return normalized;
};

const normalizeAnyValue = (value: ProtoAnyValue | null | undefined): OtlpAnyValue => {
	if (value?.stringValue !== undefined && value.stringValue !== null) {
		return { type: "string", value: value.stringValue };
	}
	if (value?.boolValue !== undefined && value.boolValue !== null) {
		return { type: "boolean", value: value.boolValue };
	}
	if (value?.intValue !== undefined && value.intValue !== null) {
		return { type: "integer", value: BigInt(value.intValue.toString()) };
	}
	if (value?.doubleValue !== undefined && value.doubleValue !== null) {
		return { type: "double", value: value.doubleValue };
	}
	if (value?.bytesValue !== undefined && value.bytesValue !== null) {
		return { type: "bytes", value: new Uint8Array(value.bytesValue) };
	}
	if (value?.arrayValue !== undefined && value.arrayValue !== null) {
		return { type: "array", value: (value.arrayValue.values ?? []).map(normalizeAnyValue) };
	}
	if (value?.kvlistValue !== undefined && value.kvlistValue !== null) {
		return { type: "key-value-list", value: normalizeAttributes(value.kvlistValue.values) };
	}
	return { type: "empty" };
};

const serviceFromResource = (
	attributes: TelemetryAttributes,
	diagnostics: Array<IngestionDiagnostic>,
): ServiceIdentity => {
	const serviceName = stringAttribute(attributes["service.name"]);
	if (serviceName === undefined) {
		diagnostics.push({
			code: "unknown_service",
			message: "Telemetry is missing service.name; set OTEL_SERVICE_NAME so this Service can be identified.",
		});
	}
	return {
		namespace: stringAttribute(attributes["service.namespace"]),
		name: serviceName ?? "unknown_service",
		environment:
			stringAttribute(attributes["deployment.environment.name"]) ??
			stringAttribute(attributes["deployment.environment"]),
	};
};

const stringAttribute = (value: OtlpAnyValue | undefined): string | undefined =>
	value?.type === "string" && value.value !== "" ? value.value : undefined;

const canonicalId = (
	value: Uint8Array | null | undefined,
	length: number,
	signal: "traces" | "logs",
	code: "invalid_trace_id" | "invalid_span_id",
): string => {
	if (value === undefined || value === null || value.length !== length || value.every((byte) => byte === 0)) {
		throw new OtlpDecodeError({
			signal,
			code,
			message: `Expected a non-zero ${length}-byte OpenTelemetry identity.`,
		});
	}
	return Buffer.from(value).toString("hex");
};

const optionalCanonicalId = (
	value: Uint8Array | null | undefined,
	length: number,
	signal: "traces" | "logs",
	code: "invalid_trace_id" | "invalid_span_id",
): string | undefined => {
	if (value === undefined || value === null || value.length === 0) return undefined;
	return canonicalId(value, length, signal, code);
};

const nanoseconds = (value: number | { toString(): string } | null | undefined): bigint =>
	BigInt(value?.toString() ?? "0");
const optionalNanoseconds = (value: number | { toString(): string } | null | undefined): bigint | undefined => {
	const normalized = nanoseconds(value);
	return normalized === 0n ? undefined : normalized;
};
const nonEmpty = (value: string | null | undefined): string | undefined =>
	value === undefined || value === null || value === "" ? undefined : value;
const positive = (value: number | null | undefined): number | undefined =>
	value === undefined || value === null || value === 0 ? undefined : value;

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));
