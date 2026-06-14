# UI And UX Design

## UX Goal

The UI should feel like a local debugging console, not a BI dashboard. It should be dense, fast, searchable, and service-centered.

## Main Navigation

Top-level views:

- Services
- Traces
- Logs
- Metrics
- Ingestion
- Settings

Global controls:

- Time range picker.
- Service selector.
- Text search.
- Pause/resume live refresh.
- Clear database.

## Services View

Purpose: answer "what is currently talking to this tool?"

Table columns:

- Service name.
- Namespace.
- Environment.
- Language/SDK.
- Instances.
- Last seen.
- Recent spans.
- Recent logs.
- Recent metrics.
- Error count.

Interactions:

- Click service -> service detail.
- Filter by environment.
- Sort by last seen or error count.

## Service Detail

Sections:

- Header: service identity, last seen, resource attributes.
- Health strip: spans/logs/metrics counts over time.
- Recent traces.
- Recent logs.
- Metrics list.
- Top operations.
- Error samples.

Do not hide data behind decorative cards. Use tables and compact panels.

## Traces Explorer

List columns:

- Start time.
- Duration.
- Root span.
- Services.
- Span count.
- Error count.
- Trace ID.

Filters:

- Service.
- Root span name.
- Duration min/max.
- Status.
- Attribute.
- Text.

Trace detail:

- Waterfall timeline.
- Span tree.
- Selected span details.
- Events.
- Links.
- Logs correlated by trace/span.
- Related metrics/exemplars if available.

## Logs Explorer

List columns:

- Time.
- Severity.
- Service.
- Message/body.
- Trace ID indicator.
- Span ID indicator.

Filters:

- Service.
- Severity.
- Trace ID.
- Span ID.
- Text.
- Attribute key/value.

Interactions:

- Click row -> side panel with full body, attributes, resource, scope.
- Click trace ID -> trace detail.
- Click span ID -> trace detail focused on span.

## Metrics Explorer

Flow:

- Select service.
- Select metric.
- Select stream/dimensions.
- Choose visualization.

Visualizations:

- Gauge line chart.
- Counter rate line chart.
- Histogram count/sum/avg.
- Histogram bucket table.
- Raw points table.

Controls:

- Group by attribute.
- Downsample interval.
- Show exemplars.
- Open exemplar trace.

## Ingestion View

Purpose: debug the debugger.

Show:

- Endpoint status.
- Accepted requests by signal.
- Decode errors.
- Queue depths.
- Write latency.
- Dropped records.
- DB size.
- Retention status.
- Last payload error.

This view is critical because OTel setup errors are common.

## Settings View

Settings:

- DB path.
- Retention time.
- Max DB size.
- Max body size.
- Indexed attribute keys.
- Theme.
- Anonymous local access toggle if auth is later added.
- Export/import.
- Reset database.

## Live Refresh

Default:

- Refresh every 2 seconds when window focused.
- Pause automatically when tab hidden.
- Manual refresh button.

Later:

- Server-sent events or WebSocket for live tail.

## Empty States

Empty states should be actionable:

- No services: show env vars and endpoint.
- No logs for filter: show active filters and "clear filters".
- Decode errors: show last error and common SDK config mistakes.

## UX Details That Matter

- Trace and span IDs should be copyable.
- Attribute keys should be clickable to filter.
- Attribute values should be clickable to filter exact match.
- Long log bodies should be collapsible.
- JSON should be syntax highlighted and searchable.
- Current time range should be obvious.
- All views should preserve filters in URL query params.

## Suggested Frontend Stack

Recommended:

- Vite.
- React or Solid.
- TanStack Table.
- TanStack Query.
- uPlot or lightweight charting for metrics.
- Monaco is too heavy for MVP; use a small JSON viewer.

Use a restrained visual style:

- Dense tables.
- Split panes.
- No marketing hero.
- No decorative background.
- Stable row heights.
- Keyboard-friendly search.

## API-Driven UI

The UI should not query SQLite directly. It should use the typed Query API. This keeps:

- Query limits centralized.
- SQL injection controls centralized.
- Future API/MCP reuse possible.
