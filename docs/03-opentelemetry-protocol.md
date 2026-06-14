# OpenTelemetry Protocol Notes

## Protocols To Support

OpenTelemetry Protocol has two common transports:

- OTLP/gRPC: default port `4317`.
- OTLP/HTTP: default port `4318`.

OTLP/HTTP can carry:

- `http/protobuf`
- `http/json`

The first implementation should support OTLP/HTTP with protobuf payloads. Add OTLP/HTTP JSON after the protobuf path is stable. Add OTLP/gRPC later.

Sources:

- https://opentelemetry.io/docs/specs/otlp/
- https://opentelemetry.io/docs/specs/otel/protocol/exporter/

## Required HTTP Endpoints

When `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` is used, SDKs construct signal-specific paths:

- `POST /v1/traces`
- `POST /v1/metrics`
- `POST /v1/logs`

Per-signal env vars may send directly to custom paths:

- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`
- `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`

The server should support the standard paths and return clear `404` or `415` responses for unsupported routes/content types.

## Content Types

Accept:

- `application/x-protobuf`
- `application/json`

Also tolerate SDK variants:

- `application/x-protobuf; charset=utf-8`
- `application/json; charset=utf-8`

Support gzip request bodies because OTLP exporters can configure gzip compression.

## Response Semantics

For MVP:

- Return success after the request has been durably queued or written.
- Return `200` with the standard export response message for protobuf.
- Return `400` for bad payloads.
- Return `413` when request body exceeds configured max bytes.
- Return `429` when ingestion queue is full.
- Return `503` for transient storage failures so clients may retry.

Later:

- Implement partial success responses when some records are dropped.
- Expose drop counts and reasons.

## Trace Model Essentials

Traces are composed of spans. A span includes:

- `trace_id`
- `span_id`
- `parent_span_id`
- name
- kind
- start/end timestamps
- attributes
- events
- links
- status
- resource attributes
- instrumentation scope

Trace IDs are 16 bytes and are commonly shown as 32 lowercase hex characters. Span IDs are 8 bytes and shown as 16 lowercase hex characters.

Source: https://opentelemetry.io/docs/specs/otel/trace/api/

## Log Model Essentials

Log records include:

- timestamp
- observed timestamp
- severity number/text
- body
- attributes
- trace context fields
- resource attributes
- instrumentation scope

Trace correlation is native in the log model. `TraceId`, `SpanId`, and `TraceFlags` are optional but should be stored as first-class columns when present.

Source: https://opentelemetry.io/docs/specs/otel/logs/data-model/

## Metric Model Essentials

OTel metrics are organized around metric streams and data points.

Identifying dimensions include:

- resource attributes
- instrumentation scope
- metric name
- point attributes
- unit
- point type
- aggregation temporality where applicable
- monotonic flag where applicable

Point types:

- Gauge
- Sum
- Histogram
- ExponentialHistogram
- Summary

For MVP, support ingestion and storage for all point types, but prioritize UI rendering for:

- gauge line charts
- sum/counter line charts
- histogram count/sum/min/max/p95 approximations where possible

Source: https://opentelemetry.io/docs/specs/otel/metrics/data-model/

## Resource And Service Identity

Services should be discovered primarily from resource attributes.

Important fields:

- `service.name`
- `service.namespace`
- `service.instance.id`
- `service.version`
- `deployment.environment.name` or older `deployment.environment`
- `host.name`
- `process.pid`
- `telemetry.sdk.language`
- `telemetry.sdk.name`
- `telemetry.sdk.version`

`OTEL_SERVICE_NAME` sets `service.name` and takes precedence over `service.name` in `OTEL_RESOURCE_ATTRIBUTES`.

Sources:

- https://opentelemetry.io/docs/specs/semconv/resource/
- https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/

## Recommended Client Configuration

Generic:

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
```

For faster local feedback:

```sh
export OTEL_BSP_SCHEDULE_DELAY=1000
export OTEL_BLRP_SCHEDULE_DELAY=500
export OTEL_METRIC_EXPORT_INTERVAL=5000
```

## Implementation Note

Do not implement the entire Collector. Implement a narrow OTLP receiver:

- Decode protobuf/JSON.
- Normalize core fields.
- Persist raw payload fragments for forward compatibility.
- Return standards-compatible responses.
- Expose observability about ingestion drops/errors.
