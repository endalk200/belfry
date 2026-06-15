# Belfry Documentation Index

Project name: `Belfry`.

Purpose: a lightweight local development observability backend that receives OpenTelemetry logs, traces, and metrics from many applications, stores them in SQLite, and provides a browser UI for service-centric debugging, filtering, searching, and correlation.

## Recommended Reading Order

1. [Product brief](01-product-brief.md)
2. [Research and prior art](02-research-prior-art.md)
3. [OpenTelemetry protocol notes](03-opentelemetry-protocol.md)
4. [System architecture](04-system-architecture.md)
5. [SQLite storage design](05-sqlite-storage-design.md)
6. [Ingestion pipeline](06-ingestion-pipeline.md)
7. [Query, search, and correlation](07-query-search-correlation.md)
8. [UI and UX design](08-ui-ux-design.md)
9. [Effect TS implementation plan](09-effect-ts-implementation.md)
10. [API design](10-api-design.md)
11. [Operations and security](11-operations-security.md)
12. [Testing and roadmap](12-testing-roadmap.md)

## Core Decision

Build a purpose-built local OTel backend, not a miniature production observability stack.

The product should prioritize:

- Fast startup.
- Single local binary/process during normal development.
- Persistent local SQLite storage.
- OTLP compatibility.
- Strong trace/log/metric correlation.
- Useful defaults with low configuration.
- Explicit limits so accidental high-cardinality telemetry cannot destroy the dev machine.

## MVP Boundary

The first version should support:

- OTLP/HTTP ingestion on port `4318`.
- Endpoints `/v1/traces`, `/v1/logs`, `/v1/metrics`.
- Protobuf payloads first; JSON payloads second.
- SQLite persistence with WAL mode.
- Service inventory from resource attributes.
- Trace explorer, span waterfall, log explorer, metric explorer, and service detail pages.
- Search/filter by service, time range, severity, trace id, span id, metric name, span name, status, and selected attributes.
- Correlation from trace to logs and from logs to trace by `trace_id` and `span_id`.
- Metric exemplar correlation when exemplars include trace/span ids.

Defer:

- OTLP/gRPC ingestion.
- Prometheus scrape compatibility.
- Multi-user auth.
- Remote agents.
- Long-term production retention.
- Distributed storage.
- Alerting.
- Tail sampling.
- Kubernetes auto-discovery.

## Source References

- OpenTelemetry OTLP specification: https://opentelemetry.io/docs/specs/otlp/
- OpenTelemetry protocol exporter configuration: https://opentelemetry.io/docs/specs/otel/protocol/exporter/
- OpenTelemetry logs data model: https://opentelemetry.io/docs/specs/otel/logs/data-model/
- OpenTelemetry metrics data model: https://opentelemetry.io/docs/specs/otel/metrics/data-model/
- OpenTelemetry tracing API/data concepts: https://opentelemetry.io/docs/specs/otel/trace/api/
- OpenTelemetry resource semantic conventions: https://opentelemetry.io/docs/specs/semconv/resource/
- OpenTelemetry SDK environment variables: https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
- SQLite WAL: https://www.sqlite.org/wal.html
- SQLite FTS5: https://www.sqlite.org/fts5.html
- SQLite JSON functions: https://www.sqlite.org/json1.html
- Effect docs: https://effect.website/docs/
- Effect Platform: https://effect.website/docs/platform/introduction/
- Effect SQL: https://github.com/Effect-TS/effect/tree/main/packages/sql
- Jaeger all-in-one: https://www.jaegertracing.io/docs/latest/getting-started/
- Zipkin quickstart: https://zipkin.io/pages/quickstart
- Grafana OTEL LGTM: https://github.com/grafana/docker-otel-lgtm
- Aspire dashboard standalone: https://aspire.dev/dashboard/standalone/
