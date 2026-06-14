# Research And Prior Art

## Existing Tools

### Jaeger All-In-One

Jaeger can run as a single container exposing UI and OTLP ports. Its current quickstart exposes `16686` for UI, `4317` for OTLP/gRPC, and `4318` for OTLP/HTTP. It combines collector and query components and uses transient in-memory storage in the easy all-in-one mode.

Strengths:

- Excellent trace UI.
- Mature trace model.
- Simple local container.
- Native OTLP ingestion.

Gaps for this project:

- Trace-focused, not a unified local logs + metrics + traces product.
- Local quickstart is transient unless configured with another storage backend.
- Not SQLite-centered.

Source: https://www.jaegertracing.io/docs/latest/getting-started/

### Zipkin

Zipkin is easy to run through Docker, Java, Homebrew, or source. It is primarily a distributed tracing system.

Strengths:

- Very simple local trace viewer.
- Stable ecosystem.
- Low operational complexity for tracing.

Gaps:

- Does not cover the full logs/metrics/traces workflow.
- Does not provide native OTel-style cross-signal correlation.

Source: https://zipkin.io/pages/quickstart

### Grafana OTEL LGTM

Grafana's `grafana/otel-lgtm` image bundles OpenTelemetry Collector, Prometheus, Tempo, Loki, Pyroscope, and Grafana into one container for development, demos, and testing.

Strengths:

- Full observability stack in one image.
- Uses established Grafana components.
- Good reference for local all-signal UX.

Gaps:

- Still a multi-component stack inside the container.
- Heavier than a single SQLite-backed process.
- Operational surface includes Grafana, Loki, Tempo, Prometheus, Pyroscope, and Collector.

Source: https://github.com/grafana/docker-otel-lgtm

### Aspire Dashboard Standalone

Aspire Dashboard can run standalone with a UI on `18888`, OTLP/gRPC on `4317`, and OTLP/HTTP on `4318`. It supports logs, traces, metrics, and environment/config views. It accepts telemetry from any OTel-enabled app. Its standalone telemetry storage is in-memory, with automatic removal when limits are exceeded and no persistence on restart.

Strengths:

- Very close to the desired developer experience.
- All three signals.
- Strong local-first workflow.
- Useful model for UI layout and dev defaults.

Gaps:

- In-memory telemetry only in standalone mode.
- .NET/Aspire ecosystem orientation.
- Not built in Effect TS.
- Not designed around SQLite persistence or long-lived local history.

Source: https://aspire.dev/dashboard/standalone/

## What To Learn From Prior Art

Borrow:

- Jaeger's trace waterfall and service dependency concepts.
- Aspire's dev-first all-signal dashboard and standalone OTLP defaults.
- Grafana's correlation habit: logs, traces, metrics visible from shared IDs and labels.
- Zipkin's simplicity and low-friction local startup.

Avoid:

- Requiring Docker for the normal path.
- Running many internal databases.
- Optimizing for production before the local workflow is excellent.
- Starting with custom agents or non-standard ingestion.

## Market Gap

There is room for a local, persistent, SQLite-backed OTel workbench:

- Lighter than LGTM.
- Broader than Jaeger/Zipkin.
- More persistent than Aspire standalone.
- Designed for dev search, correlation, and many local projects.

## Strategic Positioning

This should be framed as:

> A local OpenTelemetry workbench for development.

Not:

> A production observability platform.

That positioning keeps decisions sharp. It justifies SQLite, aggressive retention controls, a single-node design, and a UI focused on debugging rather than alerting or SLO management.

## Key Competitive Differentiators

- SQLite persistence by default.
- Single process.
- Effect TS implementation.
- OTel-native, no custom SDK.
- Correlation first, not bolted on.
- Service inventory built from resources.
- Dev-friendly "reset", "pause ingest", "bookmark query", and "copy env vars" flows.

## Risks From Prior Art

- OTel data model breadth is large.
- Metrics are harder than logs/traces because temporality, histograms, exemplars, and dimensions matter.
- SQLite can work well locally but needs careful batching, indexes, retention, and checkpointing.
- Full-text search on high-volume logs can dominate disk if not bounded.
- OTLP/gRPC adds HTTP/2 and protobuf service complexity; defer until OTLP/HTTP is solid.
