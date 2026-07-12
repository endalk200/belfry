# Belfry Documentation Index

Belfry is a Bun-powered, local-only OpenTelemetry trace and log workbench. The
current delivery is implemented and acceptance-tested; these documents describe
the shipped system rather than an aspirational all-signal platform.

## Reading order

1. [Product brief](01-product-brief.md)
2. [Research and prior art](02-research-prior-art.md)
3. [OTLP/HTTP compatibility](03-opentelemetry-protocol.md)
4. [System architecture](04-system-architecture.md)
5. [SQLite storage](05-sqlite-storage-design.md)
6. [Ingestion pipeline](06-ingestion-pipeline.md)
7. [Query, search, and correlation](07-query-search-correlation.md)
8. [Browser Workspace UX](08-ui-ux-design.md)
9. [Effect and Bun implementation](09-effect-ts-implementation.md)
10. [Query API](10-api-design.md)
11. [Operations, privacy, and security](11-operations-security.md)
12. [Testing and benchmark evidence](12-testing-roadmap.md)

Architecture decisions live under [ADR](adr/). Agent workflows live under
`skills/`. Accepted benchmark results live under [benchmarks](benchmarks/).

## Shipped boundary

- OTLP/HTTP traces and logs over protobuf or JSON, with optional gzip.
- One verified, machine-wide, loopback-only Daemon on port `4318` by default.
- Durable SQLite/WAL storage with bounded retention and exact nanosecond values.
- Service discovery, trace waterfall, log detail, full-text search, facets,
  indexed scalar attributes, and trace/log/span correlation.
- A React/Vite Workspace over renderer-independent state and query modules.
- Bounded typed Query API, generated OpenAPI, and a repository debugging skill
  for coding agents.
- Bun runtime, Effect `4.0.0-beta.97`, Vitest, Playwright, and reproducible
  lifecycle/ingest/query/interface benchmarks.

## Explicitly deferred

Other telemetry signals, OTLP/gRPC, remote binding, authentication, alerting,
distributed storage, arbitrary SQL, export, an MCP server, and production-scale
operation are outside this delivery.

## Primary references

- [OTLP specification](https://opentelemetry.io/docs/specs/otlp/)
- [OTLP exporter configuration](https://opentelemetry.io/docs/specs/otel/protocol/exporter/)
- [OpenTelemetry logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- [OpenTelemetry resource semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/)
- [SQLite WAL](https://www.sqlite.org/wal.html)
- [SQLite FTS5](https://www.sqlite.org/fts5.html)
- [Effect](https://effect.website/docs/)
