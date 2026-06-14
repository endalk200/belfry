# Query, Search, And Correlation

## Query Principles

- Every query must be bounded by time or an exact ID.
- Default sort is newest first for logs and traces.
- Use cursor pagination, not offset, for large result sets.
- Prefer structured filters over raw SQL.
- Return small records for lists and full records for detail views.

## Common Filter Model

```ts
interface TelemetryFilter {
  fromNs: string
  toNs: string
  serviceNames?: string[]
  environments?: string[]
  traceId?: string
  spanId?: string
  text?: string
  attributes?: Array<{ key: string; op: "=" | "!=" | "contains"; value: string }>
  limit?: number
  cursor?: string
}
```

## Logs Search

Capabilities:

- Time range.
- Service.
- Severity.
- Trace ID.
- Span ID.
- Text search over body and indexed attributes.
- Attribute filters.

Implementation:

- Use `logs` table for structured filters.
- Use `logs_fts` for full-text search.
- Join by `rowid = logs.id`.

Example:

```sql
SELECT l.*
FROM logs l
JOIN logs_fts f ON f.rowid = l.id
WHERE logs_fts MATCH ?
  AND l.timestamp_ns BETWEEN ? AND ?
  AND l.service_name IN (...)
ORDER BY l.timestamp_ns DESC
LIMIT ?;
```

## Trace Search

Trace list should be derived from root spans when available, with fallback grouping by trace ID.

Useful columns:

- Trace ID.
- Start time.
- Duration.
- Root span name.
- Services involved.
- Span count.
- Error count.

Derived query:

- Group spans by `trace_id`.
- `min(start_time_ns)` as trace start.
- `max(end_time_ns) - min(start_time_ns)` as duration.
- root span where `parent_span_id` is null or empty.
- services via distinct service names.

For performance, add a materialized `traces` table later:

```sql
CREATE TABLE traces (
  trace_id TEXT PRIMARY KEY,
  root_span_id TEXT,
  root_name TEXT,
  start_time_ns INTEGER,
  end_time_ns INTEGER,
  duration_ns INTEGER,
  span_count INTEGER,
  error_count INTEGER,
  services_json TEXT,
  last_updated_ns INTEGER
);
```

MVP can compute this from spans. Add materialization when query latency demands it.

## Span Waterfall

To render a trace:

```sql
SELECT *
FROM spans
WHERE trace_id = ?
ORDER BY start_time_ns ASC;
```

Build tree in application code:

- Map span ID to span.
- Attach children by parent span ID.
- Mark orphan spans.
- Sort children by start time.

Show:

- Relative start.
- Duration.
- Service.
- Span kind.
- Status.
- Attributes.
- Events.
- Linked logs.

## Metrics Query

Metric explorer flow:

1. List metric streams by service and metric name.
2. Select one or more streams.
3. Query points for time range.
4. Downsample to chart width.

Downsampling:

- For gauges: min/max/avg per bucket.
- For counters/sums: last value or rate depending temporality.
- For histograms: chart count, sum, avg, min/max, and approximate quantiles if enough bucket data exists.

MVP rate handling:

- Cumulative monotonic sum: calculate positive deltas over time divided by elapsed seconds.
- Delta sum: divide point value by interval.
- Non-monotonic sum: show raw value.

## Correlation Model

### Logs To Traces

If a log has `trace_id`:

- Show "Open trace".
- In trace detail, show logs with same `trace_id`.

If a log has `span_id`:

- Attach it to the span row in waterfall.

Query:

```sql
SELECT *
FROM logs
WHERE trace_id = ?
ORDER BY timestamp_ns ASC;
```

### Spans To Logs

For a span:

```sql
SELECT *
FROM logs
WHERE trace_id = ?
  AND (span_id = ? OR span_id IS NULL)
  AND timestamp_ns BETWEEN ? AND ?
ORDER BY timestamp_ns ASC;
```

Also show all trace logs in a side panel.

### Metrics To Traces

OTel exemplars may include trace/span IDs. Store exemplars JSON and later extract exemplar trace/span IDs into:

```sql
CREATE TABLE metric_exemplars (
  id INTEGER PRIMARY KEY,
  metric_point_id INTEGER NOT NULL REFERENCES metric_points(id),
  trace_id TEXT,
  span_id TEXT,
  time_ns INTEGER,
  value REAL,
  filtered_attributes_json TEXT
);

CREATE INDEX idx_exemplars_trace ON metric_exemplars(trace_id, span_id);
CREATE INDEX idx_exemplars_time ON metric_exemplars(time_ns);
```

UI:

- Render exemplar markers on charts.
- Clicking a marker opens the trace.

### Service Correlation

Service detail should show:

- Recent traces where any span belongs to service.
- Recent logs from service.
- Metrics emitted by service.
- Error trends.
- Top span names.
- Top log severities.
- Top attributes by selected keys.

## Search Syntax

Start with structured controls rather than inventing a query language.

Later support a simple search language:

```text
service:api severity:error trace:abc123 http.route:/checkout text:"timeout"
```

Compile this into the same filter model. Do not expose raw SQL.

## Attribute Autocomplete

Use `attributes_index` to power key/value suggestions.

Default only low-cardinality keys:

- `http.request.method`
- `http.route`
- `http.response.status_code`
- `rpc.system`
- `rpc.service`
- `db.system`
- `messaging.system`
- `exception.type`

Track key cardinality in memory and persist summary later.

## Saved Views

Local saved views are useful for dev:

- "Errors last 15m"
- "Service logs"
- "Slow traces"
- "HTTP 500s"

Store in SQLite:

```sql
CREATE TABLE saved_views (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  filter_json TEXT NOT NULL,
  created_at_ns INTEGER NOT NULL,
  updated_at_ns INTEGER NOT NULL
);
```
