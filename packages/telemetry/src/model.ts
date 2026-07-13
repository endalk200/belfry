import { Schema } from "effect";

export const NanosecondsSchema = Schema.BigIntFromString.annotate({ identifier: "Nanoseconds" });
export type Nanoseconds = typeof NanosecondsSchema.Type;

const TraceIdPattern = /^(?!0{32}$)[0-9a-f]{32}$/;
const SpanIdPattern = /^(?!0{16}$)[0-9a-f]{16}$/;

export const TraceIdSchema = Schema.String.check(
	Schema.isPattern(TraceIdPattern, {
		identifier: "TraceId",
		message: "Expected a canonical lowercase non-zero 16-byte trace ID",
	}),
);
export type TraceId = typeof TraceIdSchema.Type;

export const canonicalTraceId = (value: string | null | undefined): TraceId | undefined =>
	value !== null && value !== undefined && TraceIdPattern.test(value) ? value : undefined;

export const SpanIdSchema = Schema.String.check(
	Schema.isPattern(SpanIdPattern, {
		identifier: "SpanId",
		message: "Expected a canonical lowercase non-zero 8-byte span ID",
	}),
);
export type SpanId = typeof SpanIdSchema.Type;

export const canonicalSpanId = (value: string | null | undefined): SpanId | undefined =>
	value !== null && value !== undefined && SpanIdPattern.test(value) ? value : undefined;

const NonNegativeIntegerSchema = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0));

export const ServiceIdentitySchema = Schema.Struct({
	namespace: Schema.optional(Schema.String),
	name: Schema.NonEmptyString,
	environment: Schema.optional(Schema.String),
});
export type ServiceIdentity = typeof ServiceIdentitySchema.Type;

export type OtlpAnyValue =
	| { readonly type: "string"; readonly value: string }
	| { readonly type: "boolean"; readonly value: boolean }
	| { readonly type: "integer"; readonly value: bigint }
	| { readonly type: "double"; readonly value: number }
	| { readonly type: "bytes"; readonly value: Uint8Array }
	| { readonly type: "array"; readonly value: ReadonlyArray<OtlpAnyValue> }
	| { readonly type: "key-value-list"; readonly value: Readonly<Record<string, OtlpAnyValue>> }
	| { readonly type: "empty" };

export type EncodedOtlpAnyValue =
	| { readonly type: "string"; readonly value: string }
	| { readonly type: "boolean"; readonly value: boolean }
	| { readonly type: "integer"; readonly value: string }
	| { readonly type: "double"; readonly value: number }
	| { readonly type: "bytes"; readonly value: string }
	| { readonly type: "array"; readonly value: ReadonlyArray<EncodedOtlpAnyValue> }
	| {
			readonly type: "key-value-list";
			readonly value: Readonly<Record<string, EncodedOtlpAnyValue>>;
	  }
	| { readonly type: "empty" };

export const OtlpAnyValueSchema: Schema.Codec<OtlpAnyValue, EncodedOtlpAnyValue> = Schema.suspend(
	(): Schema.Codec<OtlpAnyValue, EncodedOtlpAnyValue> =>
		Schema.Union([
			Schema.Struct({ type: Schema.Literal("string"), value: Schema.String }),
			Schema.Struct({ type: Schema.Literal("boolean"), value: Schema.Boolean }),
			Schema.Struct({ type: Schema.Literal("integer"), value: Schema.BigIntFromString }),
			Schema.Struct({ type: Schema.Literal("double"), value: Schema.Number }),
			Schema.Struct({ type: Schema.Literal("bytes"), value: Schema.Uint8ArrayFromBase64 }),
			Schema.Struct({ type: Schema.Literal("array"), value: Schema.Array(OtlpAnyValueSchema) }),
			Schema.Struct({
				type: Schema.Literal("key-value-list"),
				value: Schema.Record(Schema.String, OtlpAnyValueSchema),
			}),
			Schema.Struct({ type: Schema.Literal("empty") }),
		]),
).annotate({ identifier: "OtlpAnyValue" });

export const TelemetryAttributesSchema = Schema.Record(Schema.String, OtlpAnyValueSchema).annotate({
	identifier: "TelemetryAttributes",
});
export type TelemetryAttributes = typeof TelemetryAttributesSchema.Type;

export const ResourceDetailSchema = Schema.Struct({
	attributes: TelemetryAttributesSchema,
	droppedAttributesCount: Schema.optional(NonNegativeIntegerSchema),
});
export type ResourceDetail = typeof ResourceDetailSchema.Type;

export const ScopeDetailSchema = Schema.Struct({
	name: Schema.String,
	version: Schema.optional(Schema.String),
	attributes: Schema.optional(TelemetryAttributesSchema),
	droppedAttributesCount: Schema.optional(NonNegativeIntegerSchema),
});
export type ScopeDetail = typeof ScopeDetailSchema.Type;

export const SpanEventSchema = Schema.Struct({
	name: Schema.String,
	timeNs: NanosecondsSchema,
	attributes: TelemetryAttributesSchema,
	droppedAttributesCount: Schema.optional(NonNegativeIntegerSchema),
});
export type SpanEvent = typeof SpanEventSchema.Type;

export const SpanLinkSchema = Schema.Struct({
	traceId: TraceIdSchema,
	spanId: SpanIdSchema,
	traceState: Schema.optional(Schema.String),
	flags: Schema.optional(NonNegativeIntegerSchema),
	attributes: TelemetryAttributesSchema,
	droppedAttributesCount: Schema.optional(NonNegativeIntegerSchema),
});
export type SpanLink = typeof SpanLinkSchema.Type;

export const SpanStatusSchema = Schema.Struct({
	code: Schema.Literals([0, 1, 2]),
	message: Schema.optional(Schema.String),
});
export type SpanStatus = typeof SpanStatusSchema.Type;

export const SpanStructuralWarningSchema = Schema.Literals([
	"missing-parent",
	"multiple-roots",
	"orphan-span",
	"running-span",
	"cycle",
]);
export type SpanStructuralWarning = typeof SpanStructuralWarningSchema.Type;

export const SpanDetailSchema = Schema.Struct({
	traceId: TraceIdSchema,
	spanId: SpanIdSchema,
	parentSpanId: Schema.optional(SpanIdSchema),
	traceState: Schema.optional(Schema.String),
	flags: Schema.optional(NonNegativeIntegerSchema),
	name: Schema.String,
	kind: Schema.Literals([0, 1, 2, 3, 4, 5]),
	startTimeNs: NanosecondsSchema,
	endTimeNs: Schema.optional(NanosecondsSchema),
	service: ServiceIdentitySchema,
	status: SpanStatusSchema,
	attributes: TelemetryAttributesSchema,
	/** Exact-match filters are offered only for keys present in the bounded scalar projection. */
	filterableAttributeKeys: Schema.optional(Schema.Array(Schema.String)),
	droppedAttributesCount: Schema.optional(NonNegativeIntegerSchema),
	events: Schema.Array(SpanEventSchema),
	droppedEventsCount: Schema.optional(NonNegativeIntegerSchema),
	links: Schema.Array(SpanLinkSchema),
	droppedLinksCount: Schema.optional(NonNegativeIntegerSchema),
	resource: ResourceDetailSchema,
	scope: ScopeDetailSchema,
	logCount: NonNegativeIntegerSchema,
	warnings: Schema.Array(SpanStructuralWarningSchema),
});
export type SpanDetail = typeof SpanDetailSchema.Type;

export const TraceSpanDetailSchema = Schema.Struct({
	...SpanDetailSchema.fields,
	depth: NonNegativeIntegerSchema,
});
export type TraceSpanDetail = typeof TraceSpanDetailSchema.Type;

export const TraceSummarySchema = Schema.Struct({
	traceId: TraceIdSchema,
	rootSpanId: Schema.optional(SpanIdSchema),
	rootOperation: Schema.String,
	startTimeNs: NanosecondsSchema,
	endTimeNs: Schema.optional(NanosecondsSchema),
	durationNs: Schema.optional(NanosecondsSchema),
	active: Schema.Boolean,
	spanCount: NonNegativeIntegerSchema,
	errorCount: NonNegativeIntegerSchema,
	services: Schema.Array(ServiceIdentitySchema),
	warnings: Schema.Array(SpanStructuralWarningSchema),
});
export type TraceSummary = typeof TraceSummarySchema.Type;

export const LogSummarySchema = Schema.Struct({
	id: Schema.String,
	timestampNs: Schema.optional(NanosecondsSchema),
	observedTimeNs: Schema.optional(NanosecondsSchema),
	service: ServiceIdentitySchema,
	severityNumber: Schema.optional(NonNegativeIntegerSchema),
	severityText: Schema.optional(Schema.String),
	bodyPreview: Schema.String,
	traceId: Schema.optional(TraceIdSchema),
	spanId: Schema.optional(SpanIdSchema),
	truncated: Schema.Boolean,
});
export type LogSummary = typeof LogSummarySchema.Type;

export const LogDetailSchema = Schema.Struct({
	...LogSummarySchema.fields,
	traceFlags: Schema.optional(NonNegativeIntegerSchema),
	body: OtlpAnyValueSchema,
	attributes: TelemetryAttributesSchema,
	/** Exact-match filters are offered only for keys present in the bounded scalar projection. */
	filterableAttributeKeys: Schema.optional(Schema.Array(Schema.String)),
	droppedAttributesCount: Schema.optional(NonNegativeIntegerSchema),
	eventName: Schema.optional(Schema.String),
	resource: ResourceDetailSchema,
	scope: ScopeDetailSchema,
});
export type LogDetail = typeof LogDetailSchema.Type;

export const TraceDetailSchema = Schema.Struct({
	...TraceSummarySchema.fields,
	spans: Schema.Array(TraceSpanDetailSchema),
	spansTruncated: Schema.Boolean,
});
export type TraceDetail = typeof TraceDetailSchema.Type;

export const serviceIdentityKey = (service: ServiceIdentity): string =>
	JSON.stringify([service.namespace ?? "", service.name, service.environment ?? ""]);
