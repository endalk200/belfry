# Web and Terminal UX

## Shared Workspace behavior

The browser and terminal are separate renderers over `@belfry/workspace`.
Shared state owns the active signal, Service Filter, bounded trace/log queries,
selection, navigation history, refresh pause, collapsed spans, correlation, and
waterfall structure. This provides behavioral parity without forcing identical
layouts.

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
- complete trace, span, and log detail;
- a collapsible, zoomable, virtualized waterfall for large traces;
- span Attributes, Events, Links, Resource, and Scope tabs;
- trace-to-log, span-to-log, and log-to-trace navigation;
- pause, manual refresh, responsive layouts, and keyboard shortcuts;
- URL serialization for filters, range, sort, selection, and pause state.

Only visible waterfall/list windows plus overscan are rendered. A 1,000-span
trace therefore remains interactive without creating 1,000 DOM rows.

## Terminal Workspace

OpenTUI adapts panes to terminal dimensions and retains complete detail rather
than clipping to list previews. Its command registry is the source of truth:

| Keys | Action |
| --- | --- |
| `↑`/`k`, `↓`/`j` | Move selection |
| `Enter`, `Esc`/`Backspace` | Open and back |
| `Tab` | Switch traces/logs |
| `/`, `s`, `f` | Text search, cycle Service Filter, and edit visible structured filters |
| `a` | Promote the next scalar detail attribute to an exact filter |
| `o`, `g` | Cycle sort order and bounded time range |
| `r`, `p` | Refresh and pause/resume |
| `x`, `z` | Collapse/expand the selected span and change waterfall scale |
| `v`, `l`, `t` | Open all trace logs, selected-span logs, or a log's correlated trace |
| `y`, `b`, `d` | Copy the active ID, open the browser Workspace, or inspect ingestion diagnostics |
| `?`, `q` | Help or close TUI |

Quitting the TUI closes only that client. It does not stop the Daemon.
The structured-filter pane exposes trace operation, status, minimum and maximum
duration, trace/span identity, minimum and maximum log severity, and exact
scalar attributes. Its clear action also removes text and Service filters while
preserving range and sort. Active filters remain visible above results, and
`a` promotes a scalar span/log attribute from the current detail view.

## Data and error states

Loading, empty, stale/reconnecting, invalid-filter, and unavailable-store states
are explicit. Health distinguishes liveness, migration readiness, writer
readiness, and read availability. Structural trace defects are warnings in the
waterfall, not reasons to hide telemetry.

The web workflows are covered in Playwright at desktop and narrow viewport
sizes. The TUI command model and renderer are exercised through a real PTY
harness as well as component tests.
