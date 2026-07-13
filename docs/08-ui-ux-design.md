# Browser Workspace UX

## Shared Workspace behavior

The browser renderer consumes `@belfry/workspace`. Shared state owns the active
signal, Service Filter, bounded trace/log queries, selection, navigation
history, refresh pause, collapsed spans, correlation, and waterfall structure.

The default range is the configured `interfaces.default_range_minutes` (15
minutes out of the box), and refresh uses
`interfaces.refresh_interval_ms` (two seconds out of the box). Trace results
default to 100; log results default to 200. Selection remains stable across
refresh when the record still exists and moves predictably when it does not.

## Browser Workspace

The React/Vite interface provides:

- traces and logs as primary tabs;
- multi-Service filtering with namespace/name/environment identity;
- text, status, severity, duration, trace/span ID, and scalar-attribute filters;
- bounded trace waterfalls plus complete selected span and log detail;
- a collapsible, zoomable, virtualized waterfall for large traces;
- span Attributes, Events, Links, Resource, and Scope tabs;
- trace-to-log, span-to-log, and log-to-trace navigation;
- pause, manual refresh, responsive layouts, and keyboard shortcuts;
- URL serialization for filters, range, sort, selection, and pause state.

Only visible waterfall/list windows plus overscan are rendered. Trace detail is
also capped by the configured query-result ceiling (at most 500 spans) and shows
an explicit truncation warning rather than creating an unbounded response.

## Data and error states

Loading, empty, stale/reconnecting, invalid-filter, and unavailable-store states
are explicit. Health distinguishes liveness, migration readiness, writer
readiness, and read availability. Structural trace defects are warnings in the
waterfall, not reasons to hide telemetry.

The web workflows are covered in Playwright at desktop and narrow viewport
sizes.
