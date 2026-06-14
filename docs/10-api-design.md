# API Design

## API Goals

- Serve the browser UI.
- Support automation and agent queries.
- Keep SQL hidden.
- Enforce limits centrally.
- Be stable enough for future MCP/CLI integration.

## Endpoint Groups

### OTLP Ingestion

```text
POST /v1/traces
POST /v1/logs
POST /v1/metrics
```

These are protocol endpoints, not UI API endpoints.

### Application API

Prefix:

```text
/api
```

## Services

```http
GET /api/services?from=...&to=...
GET /api/services/:serviceName
GET /api/services/:serviceName/summary?from=...&to=...
```

Response shape:

```json
{
  "items": [
    {
      "name": "checkout",
      "namespace": "local",
      "environment": "dev",
      "lastSeenNs": "1781430000000000000",
      "spanCount": 120,
      "logCount": 43,
      "metricStreamCount": 18,
      "errorCount": 2
    }
  ]
}
```

## Logs

```http
POST /api/logs/search
GET /api/logs/:id
GET /api/traces/:traceId/logs
```

Search request:

```json
{
  "fromNs": "1781420000000000000",
  "toNs": "1781430000000000000",
  "serviceNames": ["checkout"],
  "severityMin": 17,
  "text": "timeout",
  "attributes": [
    { "key": "http.route", "op": "=", "value": "/checkout" }
  ],
  "limit": 100
}
```

## Traces

```http
POST /api/traces/search
GET /api/traces/:traceId
GET /api/traces/:traceId/spans
GET /api/traces/:traceId/summary
```

Trace detail response:

```json
{
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "startTimeNs": "1781420000000000000",
  "durationNs": "253000000",
  "services": ["frontend", "checkout", "payment"],
  "spans": [],
  "logs": []
}
```

## Metrics

```http
GET /api/metrics
GET /api/metrics/:metricName/streams
POST /api/metrics/query
GET /api/metrics/exemplars/:traceId
```

Metric query request:

```json
{
  "metricName": "http.server.request.duration",
  "serviceNames": ["api"],
  "fromNs": "1781420000000000000",
  "toNs": "1781430000000000000",
  "groupBy": ["http.route"],
  "downsample": "10s"
}
```

## Search Metadata

```http
GET /api/search/attribute-keys?signal=logs&prefix=http
GET /api/search/attribute-values?signal=spans&key=http.route&prefix=/checkout
```

## Ingestion Health

```http
GET /api/ingestion/stats
GET /api/ingestion/errors
```

## Settings

```http
GET /api/settings
PATCH /api/settings
POST /api/admin/reset
POST /api/admin/vacuum
```

Admin endpoints should bind to localhost only by default and require a local token if remote binding is enabled.

## Response Conventions

Success:

```json
{
  "items": [],
  "nextCursor": null
}
```

Error:

```json
{
  "error": {
    "code": "query_rejected",
    "message": "Time range is required for log search"
  }
}
```

## Pagination

Use cursor format:

```text
base64url(json({ timeNs, id, sort }))
```

Never expose offset pagination for large tables.

## API Schema

Use Effect Schema for:

- Request validation.
- Response typing.
- UI client types.
- Test fixture generation.

## Future MCP API

Keep agent-friendly endpoints:

- recent errors by service
- find trace by ID
- find logs by trace ID
- summarize ingestion errors

Later expose via MCP:

```text
otel.list_services
otel.search_logs
otel.get_trace
otel.search_traces
otel.query_metrics
```
