import {
	LogDetailSchema,
	SpanIdSchema,
	TraceDetailSchema,
	TraceIdSchema,
	TraceSpanDetailSchema,
} from "@belfry/telemetry";
import { Schema } from "effect";
import {
	HttpApi,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiMiddleware,
	HttpApiSchema,
	OpenApi,
} from "effect/unstable/httpapi";

import {
	BoundedLimitSchema,
	DiagnosticPageSchema,
	DocumentationIndexSchema,
	FacetPageSchema,
	FacetRequestSchema,
	HealthSchema,
	IngestionStatsSchema,
	LogPageSchema,
	LogSearchRequestSchema,
	PagedTimeRangeQuerySchema,
	ServicePageSchema,
	TracePageSchema,
	TraceSearchRequestSchema,
} from "./model.js";

export class InvalidQuery extends Schema.TaggedErrorClass<InvalidQuery>()("InvalidQuery", {
	code: Schema.Literals(["invalid_query", "invalid_cursor", "range_too_large", "limit_exceeded"]),
	message: Schema.String,
}) {}

export class QueryRecordNotFound extends Schema.TaggedErrorClass<QueryRecordNotFound>()("QueryRecordNotFound", {
	code: Schema.Literal("not_found"),
	message: Schema.String,
}) {}

export class QueryUnavailable extends Schema.TaggedErrorClass<QueryUnavailable>()("QueryUnavailable", {
	code: Schema.Literals(["store_unavailable", "migration_unavailable", "query_timeout"]),
	message: Schema.String,
}) {}

export const InvalidQueryResponse = InvalidQuery.pipe(HttpApiSchema.status(400));
export const QueryRecordNotFoundResponse = QueryRecordNotFound.pipe(HttpApiSchema.status(404));
export const QueryUnavailableResponse = QueryUnavailable.pipe(HttpApiSchema.status(503));
const QueryErrors = [InvalidQueryResponse, QueryRecordNotFoundResponse, QueryUnavailableResponse] as const;

export class QuerySchemaErrorMiddleware extends HttpApiMiddleware.Service<QuerySchemaErrorMiddleware>()(
	"@belfry/query-api/QuerySchemaErrorMiddleware",
	{ error: InvalidQueryResponse },
) {}

const TracePath = Schema.Struct({ traceId: TraceIdSchema });
const SpanPath = Schema.Struct({ traceId: TraceIdSchema, spanId: SpanIdSchema });
const LogPath = Schema.Struct({ logId: Schema.String });
const TraceLogsQuery = Schema.Struct({
	limit: Schema.optional(BoundedLimitSchema),
	cursor: Schema.optional(Schema.String.check(Schema.isMaxLength(2_048))),
	spanId: Schema.optional(SpanIdSchema),
});

class HealthGroup extends HttpApiGroup.make("health").add(
	HttpApiEndpoint.get("getHealth", "/health", { success: HealthSchema }),
) {}

class ServicesGroup extends HttpApiGroup.make("services").add(
	HttpApiEndpoint.get("listServices", "/services", {
		query: PagedTimeRangeQuerySchema,
		success: ServicePageSchema,
		error: QueryErrors,
	}),
) {}

class TracesGroup extends HttpApiGroup.make("traces")
	.add(
		HttpApiEndpoint.post("searchTraces", "/traces/search", {
			payload: TraceSearchRequestSchema,
			success: TracePageSchema,
			error: QueryErrors,
		}),
	)
	.add(
		HttpApiEndpoint.get("getTrace", "/traces/:traceId", {
			params: TracePath,
			success: TraceDetailSchema,
			error: QueryErrors,
		}),
	)
	.add(
		HttpApiEndpoint.get("getTraceLogs", "/traces/:traceId/logs", {
			params: TracePath,
			query: TraceLogsQuery,
			success: LogPageSchema,
			error: QueryErrors,
		}),
	)
	.add(
		HttpApiEndpoint.get("getSpan", "/traces/:traceId/spans/:spanId", {
			params: SpanPath,
			success: TraceSpanDetailSchema,
			error: QueryErrors,
		}),
	) {}

class LogsGroup extends HttpApiGroup.make("logs")
	.add(
		HttpApiEndpoint.post("searchLogs", "/logs/search", {
			payload: LogSearchRequestSchema,
			success: LogPageSchema,
			error: QueryErrors,
		}),
	)
	.add(
		HttpApiEndpoint.get("getLog", "/logs/:logId", {
			params: LogPath,
			success: LogDetailSchema,
			error: QueryErrors,
		}),
	) {}

class FacetsGroup extends HttpApiGroup.make("facets").add(
	HttpApiEndpoint.post("listFacets", "/facets", {
		payload: FacetRequestSchema,
		success: FacetPageSchema,
		error: QueryErrors,
	}),
) {}

class IngestionGroup extends HttpApiGroup.make("ingestion")
	.add(
		HttpApiEndpoint.get("getStats", "/ingestion/stats", {
			success: IngestionStatsSchema,
			error: QueryUnavailableResponse,
		}),
	)
	.add(
		HttpApiEndpoint.get("listDiagnostics", "/ingestion/diagnostics", {
			query: PagedTimeRangeQuerySchema,
			success: DiagnosticPageSchema,
			error: QueryErrors,
		}),
	) {}

class DocumentationGroup extends HttpApiGroup.make("documentation").add(
	HttpApiEndpoint.get("getDocumentationIndex", "/docs", { success: DocumentationIndexSchema }),
) {}

export class BelfryApi extends HttpApi.make("belfry")
	.add(HealthGroup)
	.add(ServicesGroup)
	.add(TracesGroup)
	.add(LogsGroup)
	.add(FacetsGroup)
	.add(IngestionGroup)
	.add(DocumentationGroup)
	.middleware(QuerySchemaErrorMiddleware)
	.prefix("/api")
	.annotateMerge(
		OpenApi.annotations({
			title: "Belfry Query API",
			version: "0.1.0",
			description: "Bounded local trace and log queries used by Belfry interfaces, scripts, and agents.",
		}),
	) {}
