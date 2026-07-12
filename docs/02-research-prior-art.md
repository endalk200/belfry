# Research and Prior Art

## Useful references

Jaeger and Zipkin demonstrate that a local trace viewer can be easy to start and
that a waterfall should make parent/child timing obvious. Aspire Dashboard
demonstrates a strong developer-first local console, while its standalone data
is transient. Grafana's local stack demonstrates cross-signal navigation but
also the operational weight Belfry avoids.

Motel, the direct implementation reference for this PRD, contributed several
important lessons: treat OTLP IDs according to the wire format, separate a
shared interaction model from renderers, batch storage projections, begin text
query plans from the FTS match set, and protect performance with public-entry
benchmarks rather than isolated microbenchmarks.

## Choices Belfry borrows

- A dense trace list and expandable waterfall.
- Standard OTLP rather than a custom agent protocol.
- Service-oriented filtering derived from resource attributes.
- Direct navigation between logs, spans, and traces.
- A single command for the normal local workflow.

## Choices Belfry changes

- SQLite/WAL persistence instead of an in-memory local history.
- One Bun Daemon shared by local projects instead of one backend per project.
- A terminal Workspace and browser Workspace with shared behavior.
- A bounded Query API for interfaces, scripts, and coding agents.
- Explicit request, decompression, queue, query, indexing, and retention limits.

## Positioning

Belfry is a local OpenTelemetry workbench for development. That positioning
justifies loopback-only networking, one writer, bounded retention, no arbitrary
SQL, and a traces-and-logs-only delivery that can remain small and predictable.
