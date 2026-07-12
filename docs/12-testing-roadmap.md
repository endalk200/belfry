# Testing and Benchmark Evidence

## Test layers

- Telemetry schemas cover canonical IDs, exact nanoseconds, typed values, and
  Service identity.
- Workspace tests cover filters, history, selection stability, correlation,
  URL round-trips, and malformed trace waterfalls.
- Query API/Daemon tests cover schema bounds, endpoint-specific signed cursors,
  multi-page Service/diagnostic results, tampering, query fingerprints, and
  OpenAPI paths.
- Storage tests use temporary real SQLite databases for WAL, persistence,
  last-write-wins projections, FTS, correlation, facets, timestamp fallback,
  bounded retention, and persisted retention-failure health/diagnostics.
- Ingestion tests use real workers for queue bounds, bounded rejection
  diagnostics, content/encoding errors, gzip, protobuf/JSON decode, durable
  acknowledgement, write latency, and post-start worker-crash readiness.
- Daemon tests bind real loopback listeners for lifecycle ownership, graceful
  drain, routes, web assets, docs, and OpenAPI.
- TUI tests use component and real-PTY harnesses; web workflows use Playwright
  at desktop and narrow viewports.
- Release tests pack the public npm artifact, audit its allowlist, install it in
  a clean project, and exercise the installed executable.

## Real SDK acceptance

`bun run acceptance:fixture` uses official JavaScript OpenTelemetry trace and
log SDKs with the OTLP HTTP exporters. The fixture creates a distributed trace
with parent/child spans and a correlated complete log, then the public Query API
verifies canonical identities, Services, and correlation.

## Reference benchmark

`bun run benchmark:workbench` exercises the built public CLI, real `/usr/bin/expect`
PTYs, a foreground Daemon, SQLite, HTTP, and headless Chrome. It visibly fails
with a non-zero exit when a threshold regresses.

The dataset contains 100 traces / 6,400 spans, 8,000 logs, and a separate
1,000-span trace. It measures three cold first frames, five warm adoptions,
three fresh ingest trials, warmed recent/FTS queries, concurrent health/query
traffic during ingest, API/detail interaction, virtualized row count, repeated
ingest RSS, repeated web refresh heap, queue drain, and live database size.

Accepted thresholds are:

| Guardrail | Threshold |
| --- | ---: |
| Fresh Daemon + first TUI frame, median | `< 750 ms` |
| Warm Daemon adoption, median | `< 250 ms` |
| 6,400 spans, median | `< 2,000 ms` |
| 8,000 logs, median | `< 500 ms` |
| Recent/indexed query median / p95 | `< 100 / 250 ms` |
| 1,000-span Query API / first interactive detail | `< 250 / 500 ms` |
| Health/query maximum during ingest | `< 250 ms` |
| Repeated-ingest Daemon RSS growth | `< 64 MB` |
| Repeated-refresh browser heap growth | `< 20 MB` |

The accepted environment and measurements are versioned under
[benchmarks](benchmarks/). These are local-development quality guardrails, not
production SLOs.

## Scope of future work

Other telemetry signals, OTLP/gRPC, remote access, export, and an MCP server can
be considered only through a new product decision. They are not partially
implemented or implied by the current APIs and docs.
