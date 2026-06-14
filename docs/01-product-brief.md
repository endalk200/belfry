# Product Brief

## Problem

During development, applications already emit OpenTelemetry, but the common ways to inspect it are too heavy:

- Full Grafana/Loki/Tempo/Prometheus stacks require containers, multiple services, and configuration.
- Jaeger and Zipkin are good trace viewers but do not solve logs + metrics + correlation as a single local product.
- Aspire Dashboard is a strong dev-oriented reference, but its standalone mode stores telemetry in memory and loses data on restart.
- Production observability backends are overbuilt for local iteration.

The desired tool should be a small local backend that every project can export to with standard OTel configuration.

## Users

Primary user:

- A developer running multiple local services, CLIs, jobs, web apps, and APIs.

Secondary users:

- A developer debugging test suites, background workers, queues, RPC calls, and local distributed systems.
- An agent or script that needs an API to query recent telemetry.

## Goals

- Receive logs, traces, and metrics through OpenTelemetry Protocol.
- Persist telemetry locally in SQLite.
- Run cheaply as one process.
- Provide a useful browser UI.
- Make services discoverable without manual registration.
- Support search and filtering across all three signals.
- Support deep correlation:
  - Trace to spans.
  - Trace to logs.
  - Log to trace/span.
  - Metric exemplar to trace/span.
  - Service to all related telemetry.
- Make setup simple through standard env vars.

## Non-Goals

- Replace production observability backends.
- Guarantee production-grade ingestion throughput.
- Provide high availability.
- Provide long-term metric rollup storage at cloud scale.
- Implement every OTel Collector processor.
- Support arbitrary SQL query exposure in the UI.
- Become a security boundary for untrusted tenants.

## Product Shape

The tool should start as:

```sh
project-otel serve
```

Default endpoints:

- UI/API: `http://localhost:16686` or `http://localhost:4319`
- OTLP/HTTP: `http://localhost:4318`
- OTLP/gRPC later: `http://localhost:4317`
- SQLite database: `~/.local/share/project-otel/project-otel.db`

Application config:

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
```

## MVP Acceptance Criteria

- A Node, Python, Java, or Go app using standard OTLP/HTTP can export traces, logs, and metrics.
- The UI lists services within seconds of first telemetry.
- Selecting a service shows recent traces, logs, and metrics.
- Opening a trace shows a span waterfall.
- Opening a log with `trace_id` opens the related trace.
- Full-text search finds log bodies and span names.
- Attribute filters work for common resource, span, log, and metric attributes.
- The database survives process restart.
- Storage limits prevent runaway disk growth.

## Opinionated Constraints

- Single-node local-first storage.
- SQLite only for MVP.
- No external collector required.
- OTLP/HTTP first because it is easier to implement and generally recommended as the default fallback transport.
- Use Effect TS for backend composition, concurrency, error handling, config, HTTP APIs, and resource lifecycle.
- Keep the UI dense and operational, not a marketing-style dashboard.

## Success Metric

The tool is successful if a developer can run it in the background every day and point any local OTel-enabled project at it without thinking about infrastructure.
