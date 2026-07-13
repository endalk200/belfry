import {
	BoundedLimitSchema,
	DiagnosticPageSchema,
	FacetPageSchema,
	FacetRequestSchema,
	LogDetailSchema,
	LogPageSchema,
	LogSearchRequestSchema,
	ServicePageSchema,
	TimeRangeSchema,
	TraceDetailSchema,
	TracePageSchema,
	TraceSearchRequestSchema,
	TraceSpanDetailSchema,
} from "@belfry/query-api";
import { NanosecondsSchema, SpanIdSchema, TraceIdSchema } from "@belfry/telemetry";
import { Schema } from "effect";

export const QueryWorkerConfigurationSchema = Schema.Struct({
	databasePath: Schema.String,
	maxTraceDetailSpans: BoundedLimitSchema,
});
export type QueryWorkerConfiguration = typeof QueryWorkerConfigurationSchema.Type;

const CursorPositionSchema = Schema.Struct({
	sort: Schema.Literals(["newest", "oldest", "slowest"]),
	timeNs: NanosecondsSchema,
	id: Schema.String,
});

const InitializeRequestSchema = Schema.Struct({
	_tag: Schema.Literal("initialize"),
	id: Schema.String,
	configuration: QueryWorkerConfigurationSchema,
});

const SearchTracesRequestSchema = Schema.Struct({
	_tag: Schema.Literal("search-traces"),
	id: Schema.String,
	query: TraceSearchRequestSchema,
	cursor: Schema.optional(CursorPositionSchema),
});

const GetTraceRequestSchema = Schema.Struct({
	_tag: Schema.Literal("get-trace"),
	id: Schema.String,
	traceId: TraceIdSchema,
});

const GetSpanRequestSchema = Schema.Struct({
	_tag: Schema.Literal("get-span"),
	id: Schema.String,
	traceId: TraceIdSchema,
	spanId: SpanIdSchema,
});

const ListTraceLogsRequestSchema = Schema.Struct({
	_tag: Schema.Literal("list-trace-logs"),
	id: Schema.String,
	traceId: TraceIdSchema,
	spanId: Schema.optional(SpanIdSchema),
	limit: BoundedLimitSchema,
	cursor: Schema.optional(CursorPositionSchema),
});

const SearchLogsRequestSchema = Schema.Struct({
	_tag: Schema.Literal("search-logs"),
	id: Schema.String,
	query: LogSearchRequestSchema,
	cursor: Schema.optional(CursorPositionSchema),
});

const GetLogRequestSchema = Schema.Struct({
	_tag: Schema.Literal("get-log"),
	id: Schema.String,
	logId: Schema.String,
});

const ListServicesRequestSchema = Schema.Struct({
	_tag: Schema.Literal("list-services"),
	id: Schema.String,
	range: TimeRangeSchema,
	limit: BoundedLimitSchema,
	cursor: Schema.optional(CursorPositionSchema),
});

const ListDiagnosticsRequestSchema = Schema.Struct({
	_tag: Schema.Literal("list-diagnostics"),
	id: Schema.String,
	range: TimeRangeSchema,
	limit: BoundedLimitSchema,
	cursor: Schema.optional(CursorPositionSchema),
});

const FacetsRequestSchema = Schema.Struct({
	_tag: Schema.Literal("facets"),
	id: Schema.String,
	request: FacetRequestSchema,
	cursor: Schema.optional(CursorPositionSchema),
});

const ShutdownRequestSchema = Schema.Struct({
	_tag: Schema.Literal("shutdown"),
	id: Schema.String,
});

export const QueryWorkerRequestSchema = Schema.Union([
	InitializeRequestSchema,
	SearchTracesRequestSchema,
	GetTraceRequestSchema,
	GetSpanRequestSchema,
	ListTraceLogsRequestSchema,
	SearchLogsRequestSchema,
	GetLogRequestSchema,
	ListServicesRequestSchema,
	ListDiagnosticsRequestSchema,
	FacetsRequestSchema,
	ShutdownRequestSchema,
]);
export type QueryWorkerRequest = typeof QueryWorkerRequestSchema.Type;

const ReadyResponseSchema = Schema.Struct({ _tag: Schema.Literal("ready"), id: Schema.String });
const TracePageResponseSchema = Schema.Struct({
	_tag: Schema.Literal("trace-page"),
	id: Schema.String,
	result: TracePageSchema,
});
const TraceDetailResponseSchema = Schema.Struct({
	_tag: Schema.Literal("trace-detail"),
	id: Schema.String,
	result: TraceDetailSchema,
});
const SpanDetailResponseSchema = Schema.Struct({
	_tag: Schema.Literal("span-detail"),
	id: Schema.String,
	result: TraceSpanDetailSchema,
});
const LogPageResponseSchema = Schema.Struct({
	_tag: Schema.Literal("log-page"),
	id: Schema.String,
	result: LogPageSchema,
});
const LogDetailResponseSchema = Schema.Struct({
	_tag: Schema.Literal("log-detail"),
	id: Schema.String,
	result: LogDetailSchema,
});
const ServicePageResponseSchema = Schema.Struct({
	_tag: Schema.Literal("service-page"),
	id: Schema.String,
	result: ServicePageSchema,
});
const DiagnosticPageResponseSchema = Schema.Struct({
	_tag: Schema.Literal("diagnostic-page"),
	id: Schema.String,
	result: DiagnosticPageSchema,
});
const FacetsResponseSchema = Schema.Struct({
	_tag: Schema.Literal("facets-result"),
	id: Schema.String,
	result: FacetPageSchema,
});
const StorageFailureResponseSchema = Schema.Struct({
	_tag: Schema.Literal("storage-failure"),
	id: Schema.String,
	code: Schema.Literals([
		"open_failed",
		"migration_failed",
		"write_failed",
		"read_failed",
		"retention_failed",
		"maintenance_failed",
		"query_timeout",
	]),
	message: Schema.String,
});
const NotFoundResponseSchema = Schema.Struct({
	_tag: Schema.Literal("not-found"),
	id: Schema.String,
	entity: Schema.Literals(["trace", "span", "log"]),
	entityId: Schema.String,
	message: Schema.String,
});
const ProtocolFailureResponseSchema = Schema.Struct({
	_tag: Schema.Literal("protocol-failure"),
	id: Schema.String,
	message: Schema.String,
});
const ShutdownSuccessResponseSchema = Schema.Struct({
	_tag: Schema.Literal("shutdown-success"),
	id: Schema.String,
});

export const QueryWorkerResponseSchema = Schema.Union([
	ReadyResponseSchema,
	TracePageResponseSchema,
	TraceDetailResponseSchema,
	SpanDetailResponseSchema,
	LogPageResponseSchema,
	LogDetailResponseSchema,
	ServicePageResponseSchema,
	DiagnosticPageResponseSchema,
	FacetsResponseSchema,
	StorageFailureResponseSchema,
	NotFoundResponseSchema,
	ProtocolFailureResponseSchema,
	ShutdownSuccessResponseSchema,
]);
export type QueryWorkerResponse = typeof QueryWorkerResponseSchema.Type;
