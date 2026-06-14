# Testing And Roadmap

## Testing Strategy

Testing should focus on protocol compatibility, persistence correctness, query correctness, and UI workflows.

## Unit Tests

Decoder:

- Valid OTLP protobuf traces.
- Valid OTLP protobuf logs.
- Valid OTLP protobuf metrics.
- Invalid protobuf.
- JSON payloads.
- Gzip payloads.
- Unsupported content type.

Normalizer:

- Resource extraction.
- Service identity extraction.
- Trace/span ID hex conversion.
- Log body conversion.
- Metric stream fingerprint stability.
- Attribute indexing allow/deny rules.
- Redaction.

Query builder:

- Time range filters.
- Attribute filters.
- Full-text search.
- Cursor pagination.
- Limit enforcement.

## Integration Tests

Use real SQLite temp DB.

Scenarios:

- Insert traces, restart store, query traces.
- Insert logs with trace IDs, query trace logs.
- Insert metrics, query chart points.
- Retention deletes old records.
- FTS search returns expected rows.
- WAL mode enabled.
- Migration idempotency.

## Protocol Compatibility Tests

Use real SDKs where possible:

- Node.js OpenTelemetry SDK.
- Python OpenTelemetry SDK.
- Go OpenTelemetry SDK.
- Java OpenTelemetry SDK.

Each should export:

- One trace with child spans.
- One correlated log.
- One gauge.
- One counter.
- One histogram.

Run test app against local server and assert UI API sees all records.

## Golden Fixtures

Keep OTLP fixture files:

```text
fixtures/otlp/traces-basic.pb
fixtures/otlp/logs-correlated.pb
fixtures/otlp/metrics-basic.pb
fixtures/otlp/metrics-histogram.pb
fixtures/otlp/mixed-resource-attrs.json
```

Fixtures let decoder/storage tests run without external SDKs.

## UI Tests

Use Playwright:

- Services page shows service after ingest.
- Logs search works.
- Trace detail opens from log trace ID.
- Waterfall renders non-empty.
- Metrics chart renders after points.
- Settings reset clears data.

## Performance Tests

Local benchmark targets:

- Ingest 10,000 spans in under 5 seconds.
- Ingest 100,000 logs without process memory runaway.
- Query recent 500 logs under 250 ms after warmup.
- Open 1,000-span trace under 500 ms.
- Keep idle memory modest for a dev tool.

These are not production SLOs; they are guardrails.

## MVP Roadmap

### Phase 0: Skeleton

- Repo setup.
- Effect TS backend.
- SQLite migrations.
- Static UI shell.
- Health endpoint.

### Phase 1: OTLP/HTTP Traces

- Decode protobuf traces.
- Store resources/scopes/spans.
- Trace list and trace detail waterfall.
- Service discovery from spans.

### Phase 2: Logs

- Decode protobuf logs.
- Store logs.
- FTS search.
- Trace/log correlation.
- Logs explorer.

### Phase 3: Metrics

- Decode protobuf metrics.
- Store streams/points.
- Metric list and basic charts.
- Gauge, sum, histogram basics.

### Phase 4: Polish For Daily Use

- Retention.
- DB stats.
- Settings.
- Ingestion diagnostics.
- Client setup snippets.
- Export/reset/vacuum CLI.

### Phase 5: Compatibility

- OTLP/HTTP JSON.
- Gzip.
- SDK integration tests.
- Docker image.

### Phase 6: Advanced Correlation

- Metric exemplars table.
- Derived traces table.
- Service dependency graph from spans.
- Saved views.
- Attribute autocomplete.

### Phase 7: OTLP/gRPC

- Add gRPC server on `4317`.
- Match OTLP service definitions.
- Reuse decoder/normalizer/writer.

## Open Questions

- Should the UI/API port mimic Jaeger (`16686`) or use a distinct port (`4319`)?
- Should the product provide an optional Collector-compatible config generator?
- Should raw payloads be stored per record, per request, or both?
- How much of metric temporality conversion should happen at write time versus query time?
- Should the first UI be React, Solid, or another framework?
- Should there be an MCP server in v1 for agent access?

## Recommended Initial Decisions

- Use UI/API port `4319` to avoid clashing with Jaeger.
- Support `16686` as optional alias later.
- Store raw record JSON, not full raw request bytes by default.
- Convert metric temporality mostly at query time.
- Build UI with React + Vite for ecosystem leverage unless there is a strong preference otherwise.
- Add MCP after API stabilizes.
