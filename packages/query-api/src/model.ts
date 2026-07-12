import {
	LogDetailSchema,
	LogSummarySchema,
	NanosecondsSchema,
	ServiceIdentitySchema,
	SpanDetailSchema,
	SpanIdSchema,
	TraceDetailSchema,
	TraceIdSchema,
	TraceSpanDetailSchema,
	TraceSummarySchema,
} from "@belfry/telemetry";
import { Schema } from "effect";

export const MAX_QUERY_RESULTS = 500;
export const MAX_QUERY_TEXT_LENGTH = 4_096;
export const MAX_ATTRIBUTE_KEY_LENGTH = 512;
export const MAX_SERVICE_FILTERS = 100;
export const MAX_ATTRIBUTE_FILTERS = 32;

export const BoundedLimitSchema = Schema.Number.check(
	Schema.isInt(),
	Schema.isBetween({ minimum: 1, maximum: MAX_QUERY_RESULTS }),
);
const ShortTextSchema = Schema.String.check(Schema.isMaxLength(MAX_QUERY_TEXT_LENGTH));
const AttributeKeySchema = Schema.String.check(Schema.isLengthBetween(1, MAX_ATTRIBUTE_KEY_LENGTH));
const validateTimeRange = ({ fromNs, toNs }: { readonly fromNs: bigint; readonly toNs: bigint }) =>
	fromNs > toNs ? { path: ["fromNs"], issue: "fromNs must not be after toNs" } : undefined;

const TimeRangeFilter = Schema.makeFilter(validateTimeRange, { identifier: "OrderedTimeRange" });

export const AttributeFilterSchema = Schema.Struct({
	key: AttributeKeySchema,
	operator: Schema.Literals(["equals", "contains"]),
	value: ShortTextSchema,
}).annotate({ identifier: "AttributeFilter" });
export type AttributeFilter = typeof AttributeFilterSchema.Type;

export const TimeRangeSchema = Schema.Struct({
	fromNs: NanosecondsSchema,
	toNs: NanosecondsSchema,
}).check(TimeRangeFilter);
export type TimeRange = typeof TimeRangeSchema.Type;

export const PagedTimeRangeQuerySchema = Schema.Struct({
	...TimeRangeSchema.fields,
	limit: BoundedLimitSchema,
	cursor: Schema.optional(Schema.String.check(Schema.isMaxLength(2_048))),
})
	.check(TimeRangeFilter)
	.annotate({ identifier: "PagedTimeRangeQuery" });

const ServiceFilterSchema = Schema.Array(ServiceIdentitySchema).check(Schema.isMaxLength(MAX_SERVICE_FILTERS));
const AttributeFiltersSchema = Schema.Array(AttributeFilterSchema).check(Schema.isMaxLength(MAX_ATTRIBUTE_FILTERS));

export const TraceSearchRequestSchema = Schema.Struct({
	...TimeRangeSchema.fields,
	services: ServiceFilterSchema,
	operation: Schema.optional(ShortTextSchema),
	status: Schema.optional(Schema.Literals(["all", "error", "ok", "active"])),
	minimumDurationNs: Schema.optional(NanosecondsSchema),
	maximumDurationNs: Schema.optional(NanosecondsSchema),
	traceId: Schema.optional(TraceIdSchema),
	text: Schema.optional(ShortTextSchema),
	attributes: AttributeFiltersSchema,
	sort: Schema.Literals(["newest", "oldest", "slowest"]),
	limit: BoundedLimitSchema,
	cursor: Schema.optional(Schema.String.check(Schema.isMaxLength(2_048))),
})
	.check(TimeRangeFilter)
	.check(
		Schema.makeFilter(({ maximumDurationNs, minimumDurationNs }) => {
			if (
				minimumDurationNs !== undefined &&
				maximumDurationNs !== undefined &&
				minimumDurationNs > maximumDurationNs
			) {
				return { path: ["minimumDurationNs"], issue: "minimum duration exceeds maximum duration" };
			}
		}),
	)
	.annotate({ identifier: "TraceSearchRequest" });
export type TraceSearchQuery = typeof TraceSearchRequestSchema.Type;

export const LogSearchRequestSchema = Schema.Struct({
	...TimeRangeSchema.fields,
	services: ServiceFilterSchema,
	minimumSeverity: Schema.optional(
		Schema.Number.check(Schema.isInt(), Schema.isBetween({ minimum: 1, maximum: 24 })),
	),
	maximumSeverity: Schema.optional(
		Schema.Number.check(Schema.isInt(), Schema.isBetween({ minimum: 1, maximum: 24 })),
	),
	traceId: Schema.optional(TraceIdSchema),
	spanId: Schema.optional(SpanIdSchema),
	text: Schema.optional(ShortTextSchema),
	attributes: AttributeFiltersSchema,
	sort: Schema.Literals(["newest", "oldest"]),
	limit: BoundedLimitSchema,
	cursor: Schema.optional(Schema.String.check(Schema.isMaxLength(2_048))),
})
	.check(TimeRangeFilter)
	.check(
		Schema.makeFilter(({ maximumSeverity, minimumSeverity }) => {
			if (minimumSeverity !== undefined && maximumSeverity !== undefined && minimumSeverity > maximumSeverity) {
				return { path: ["minimumSeverity"], issue: "minimum severity exceeds maximum severity" };
			}
		}),
	)
	.annotate({ identifier: "LogSearchRequest" });
export type LogSearchQuery = typeof LogSearchRequestSchema.Type;

export const AppliedBoundsSchema = Schema.Struct({
	fromNs: NanosecondsSchema,
	toNs: NanosecondsSchema,
	limit: BoundedLimitSchema,
});

export const pageSchema = <S extends Schema.Top>(item: S, identifier: string) =>
	Schema.Struct({
		items: Schema.Array(item),
		bounds: AppliedBoundsSchema,
		truncated: Schema.Boolean,
		nextCursor: Schema.optional(Schema.String),
	}).annotate({ identifier });

export type Page<A> = {
	readonly items: ReadonlyArray<A>;
	readonly bounds: typeof AppliedBoundsSchema.Type;
	readonly truncated: boolean;
	readonly nextCursor?: string | undefined;
};

export const TracePageSchema = pageSchema(TraceSummarySchema, "TracePage");
export const LogPageSchema = pageSchema(LogSummarySchema, "LogPage");

export const ServiceSummarySchema = Schema.Struct({
	service: ServiceIdentitySchema,
	firstSeenNs: NanosecondsSchema,
	lastSeenNs: NanosecondsSchema,
	spanCount: Schema.Number,
	logCount: Schema.Number,
	errorCount: Schema.Number,
	unknownService: Schema.Boolean,
});
export type ServiceSummary = typeof ServiceSummarySchema.Type;
export const ServicePageSchema = pageSchema(ServiceSummarySchema, "ServicePage");

export const FacetRequestSchema = Schema.Struct({
	...TimeRangeSchema.fields,
	signal: Schema.Literals(["traces", "logs"]),
	kind: Schema.Literals(["service", "operation", "severity", "attribute-key", "attribute-value"]),
	services: ServiceFilterSchema,
	key: Schema.optional(AttributeKeySchema),
	prefix: Schema.optional(Schema.String.check(Schema.isMaxLength(512))),
	limit: Schema.Number.check(Schema.isInt(), Schema.isBetween({ minimum: 1, maximum: 100 })),
	cursor: Schema.optional(Schema.String.check(Schema.isMaxLength(2_048))),
})
	.check(TimeRangeFilter)
	.check(
		Schema.makeFilter(({ kind, key }) => {
			if (kind === "attribute-value" && key === undefined) {
				return { path: ["key"], issue: "attribute-value facets require an attribute key" };
			}
		}),
	)
	.check(
		Schema.makeFilter(({ kind, signal }) => {
			if (kind === "operation" && signal !== "traces") {
				return { path: ["signal"], issue: "operation facets require the traces signal" };
			}
			if (kind === "severity" && signal !== "logs") {
				return { path: ["signal"], issue: "severity facets require the logs signal" };
			}
		}),
	)
	.annotate({ identifier: "FacetRequest" });

export const FacetItemSchema = Schema.Struct({
	value: Schema.String,
	count: Schema.Number,
	service: Schema.optional(ServiceIdentitySchema),
});
export const FacetPageSchema = pageSchema(FacetItemSchema, "FacetPage");

export const DaemonIdentitySchema = Schema.Struct({
	pid: Schema.Number,
	startedAt: Schema.Number,
	nonce: Schema.String,
	endpoint: Schema.String,
});
export type DaemonIdentity = typeof DaemonIdentitySchema.Type;

export const HealthSchema = Schema.Struct({
	status: Schema.Literals(["starting", "ok", "degraded", "stopping"]),
	live: Schema.Boolean,
	migrationReady: Schema.Boolean,
	writerReady: Schema.Boolean,
	readsAvailable: Schema.Boolean,
	queueDepth: Schema.Number,
	queueBytes: Schema.BigIntFromString,
	databaseSizeBytes: Schema.BigIntFromString,
	daemon: Schema.optional(DaemonIdentitySchema),
	message: Schema.optional(Schema.String),
}).annotate({ identifier: "Health" });
export type Health = typeof HealthSchema.Type;

export const IngestionStatsSchema = Schema.Struct({
	acceptedTraceRecords: Schema.BigIntFromString,
	acceptedLogRecords: Schema.BigIntFromString,
	rejectedRequests: Schema.BigIntFromString,
	decodeErrors: Schema.BigIntFromString,
	queueDepth: Schema.Number,
	queueBytes: Schema.BigIntFromString,
	writeLatencyP50Ms: Schema.Number,
	writeLatencyP95Ms: Schema.Number,
	droppedRecords: Schema.BigIntFromString,
	droppedDiagnostics: Schema.BigIntFromString,
	truncatedValues: Schema.BigIntFromString,
	databaseSizeBytes: Schema.BigIntFromString,
	retentionDeletedRecords: Schema.BigIntFromString,
	retentionRunning: Schema.Boolean,
}).annotate({ identifier: "IngestionStats" });
export type IngestionStats = typeof IngestionStatsSchema.Type;

export const DiagnosticSchema = Schema.Struct({
	id: Schema.String,
	timeNs: NanosecondsSchema,
	signal: Schema.optional(Schema.Literals(["traces", "logs", "storage", "retention", "daemon"])),
	code: Schema.String,
	message: Schema.String,
	details: Schema.optional(Schema.Json),
});
export type Diagnostic = typeof DiagnosticSchema.Type;
export const DiagnosticPageSchema = pageSchema(DiagnosticSchema, "DiagnosticPage");

export const DocumentationEntrySchema = Schema.Struct({
	slug: Schema.String,
	title: Schema.String,
	description: Schema.String,
	href: Schema.String,
});
export const DocumentationIndexSchema = Schema.Struct({
	items: Schema.Array(DocumentationEntrySchema),
	openapi: Schema.String,
	debuggingSkill: Schema.String,
});

export { LogDetailSchema, SpanDetailSchema, TraceDetailSchema, TraceSpanDetailSchema };
