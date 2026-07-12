# PRD acceptance-criterion audit

Date: 2026-07-12

Legend: every row is **Pass**. `Public acceptance` refers to
[REPORT.md](REPORT.md), which records the packed-executable, real PTY, real
Chrome, real SDK, persistence, maintenance, Debugging Skill, and benchmark run.

## Product and lifecycle

| # | Result | Evidence |
|---:|:---:|---|
| 1 | Pass | Default-command startup/adoption is covered by [`root.ts`](../../../apps/cli/src/cli/root.ts), lifecycle integration tests, and the public TUI run. |
| 2 | Pass | Public acceptance closed both interfaces, then adopted the same recorded Daemon PID; lifecycle ownership is independent of clients. |
| 3 | Pass | [`web.cmd.ts`](../../../apps/cli/src/cli/commands/web.cmd.ts) and public acceptance verify `belfry web --no-open` adoption and production assets. |
| 4 | Pass | Daemon command modules and [`lifecycle.test.ts`](../../../packages/daemon/src/lifecycle.test.ts) cover start, stop, restart, status, serve, and JSON states. |
| 5 | Pass | The lifecycle integration test launches two simultaneous starts and asserts one created Daemon and one same-PID adoption. |
| 6 | Pass | Registry/port-conflict tests plus the TUI reconnect state and command exercise actionable CLI/TUI recovery. |
| 7 | Pass | [`registry.ts`](../../../packages/daemon/src/registry.ts) records PID, nonce, endpoint, version, and process start identity; lifecycle tests reject stale/unrelated owners. |
| 8 | Pass | [`config`](../../../packages/config/src/index.ts) resolves a platform state directory independent of CWD; CLI/config tests cover overrides. |
| 9 | Pass | Package metadata, shebang, build, smoke test, and documentation specify Bun only and do not claim Node runtime support. |
| 10 | Pass | The packed product ran locally with Bun, SQLite, loopback listeners, and no Docker, collector, login, cloud, or external service. |

## OTLP ingestion

| # | Result | Evidence |
|---:|:---:|---|
| 11 | Pass | Daemon routes and protocol integration tests accept `POST /v1/traces` and `/v1/logs`; the real SDK fixture exercised both. |
| 12 | Pass | Ingestion protocol tests cover protobuf, JSON, and parameterized content types. |
| 13 | Pass | Body handling tests cover gzip plus distinct compressed and decompressed `413` limits. |
| 14 | Pass | [`packages/otlp-proto`](../../../packages/otlp-proto) contains generated OTel definitions used by the decoder. |
| 15 | Pass | Telemetry schemas, decoder/storage tests, and detail views preserve empty, scalar, array, key-value-list, and bytes `AnyValue` variants. |
| 16 | Pass | Canonical ID helpers and ingestion tests validate widths and expose lowercase trace/span hex. |
| 17 | Pass | Telemetry/query schemas use bigint nanoseconds; the SDK acceptance trace retained its exact `1783834681459000000` timestamp. |
| 18 | Pass | Storage schema normalizes/deduplicates resources and scopes separately and returns both in details. |
| 19 | Pass | Service identity schemas use namespace/name/environment; unknown-service handling and guidance are covered by storage/workspace tests. |
| 20 | Pass | Admission awaits the writer-worker durable acknowledgement before producing an OTLP success response. |
| 21 | Pass | Protocol tests verify `400`, `413`, `415`, `429`, and `503` outcomes. |
| 22 | Pass | Protocol tests verify standard JSON/protobuf export response bodies matching the request encoding. |
| 23 | Pass | [`admission.ts`](../../../packages/ingestion/src/admission.ts) enforces request and byte capacity and exports live queue diagnostics. |
| 24 | Pass | [`writer-worker.ts`](../../../packages/ingestion/src/writer-worker.ts) owns writes/retention; responsiveness-under-ingest benchmark passed. |
| 25 | Pass | Scoped Daemon shutdown closes admission, drains with a timeout, checkpoints, stops workers, and is exercised by lifecycle/server tests. |
| 26 | Pass | Ingestion statistics expose accepted/rejected/decode/queue/write/truncation/size/retention fields; storage and public acceptance assert them. |

## Storage, retention, and correctness

| # | Result | Evidence |
|---:|:---:|---|
| 27 | Pass | Storage layers use SQLite WAL, scoped connections, bound SQL parameters, transactions, and forward migration 1; tests assert WAL/schema state. |
| 28 | Pass | [`roles.ts`](../../../packages/storage/src/roles.ts) exposes narrow writer and reader runtimes; the query worker opens read-only and never bootstraps schema. |
| 29 | Pass | Trace-summary materialization and tests cover root operation, timing/duration/running state, counts, errors, and all participating Services. |
| 30 | Pass | Re-ingest tests assert replacement of a same-identity span plus stale attribute/FTS/index/summary cleanup. |
| 31 | Pass | Trace assembly marks missing roots/parents, cycles, incomplete/running structure, and retains inspectable spans. |
| 32 | Pass | Exact detail records preserve events, links, resource/scope context, typed attributes, and typed log bodies beyond indexed projections. |
| 33 | Pass | Batched span/log FTS maintenance is covered by storage tests and the indexed-search benchmark. |
| 34 | Pass | Exact scalar projections use configured key/value/cardinality limits; non-projected attributes remain available and cannot be promoted as exact filters. |
| 35 | Pass | Retention defaults are seven days and one GiB, with validated configuration overrides. |
| 36 | Pass | Retention tests exercise oldest-first time/size deletion, dependent row/FTS cleanup, checkpointing, and incremental vacuum. |
| 37 | Pass | Database CLI modules provide path, stats, maintenance status, checkpoint, vacuum, and explicitly confirmed reset. |
| 38 | Pass | Typed storage/health paths and tests cover migration, corruption/operation, lock, retention, and unavailable-writer degradation without raw crashes. |
| 39 | Pass | Lifecycle/public acceptance restarted the Daemon and retrieved identical telemetry; repeated migration is idempotent. |

## Query API and correlation

| # | Result | Evidence |
|---:|:---:|---|
| 40 | Pass | TUI, web, acceptance scripts, and Debugging Skill all use [`@belfry/query-api`](../../../packages/query-api); only storage workers access SQLite. |
| 41 | Pass | Query schemas/tests distinguish compact list summaries from complete trace/log detail records. |
| 42 | Pass | Query validation enforces time/limit/order, signed opaque cursors, and cursor/query consistency; paging tests cover all lists. |
| 43 | Pass | Shared Workspace/query schemas represent zero-or-many explicit Service identities, defaulting to all Services. |
| 44 | Pass | Participating-Service SQL/test and the two-Service SDK fixture return the full cross-Service trace after filtering on one Service. |
| 45 | Pass | Log Service filtering uses its resource identity and is covered by query tests. |
| 46 | Pass | Trace search tests cover time, Service, operation, status, duration, ID, exact attributes, text attributes, sorting, and pagination. |
| 47 | Pass | Log search tests cover time, Service, severity, trace/span IDs, body, exact/text attributes, sorting, and pagination. |
| 48 | Pass | Bounded, counted Service/operation/severity/attribute-key/attribute-value facets are exposed and tested with limits/cursors. |
| 49 | Pass | Trace detail assembly/tests provide deterministic parent-before-child order, depth, timing, status, warnings, events, links, and Services. |
| 50 | Pass | Trace/span log queries use indexed correlation and deterministic timestamp/ID ordering rather than client scans. |
| 51 | Pass | Shared transitions plus real TUI/Chrome acceptance verify trace→logs, span→logs, and log→focused complete trace. |
| 52 | Pass | Health/diagnostics routes are outside normal query readiness and report liveness, migration, writer, queue, and degraded state. |
| 53 | Pass | [`contract.ts`](../../../packages/query-api/src/contract.ts) derives handlers/client/OpenAPI from shared Effect Schemas; public acceptance fetched it. |
| 54 | Pass | Query failures are schema-tagged stable codes with actionable messages; server tests ensure SQLite/defect details are not exposed. |
| 55 | Pass | Route/contract audit exposes bounded domain queries only—no SQL, dump, agent-only, or MCP surface. |

## Telemetry Workspace behavior

| # | Result | Evidence |
|---:|:---:|---|
| 56 | Pass | [`packages/workspace`](../../../packages/workspace) owns signal, filters, sort, selection/history, pause, and correlation state/transitions. |
| 57 | Pass | Both adapters import the shared Workspace model/transitions/view helpers; parity tests exercise shared scenarios. |
| 58 | Pass | Component/renderer/Playwright tests and real interface acceptance cover the required filters, searches, details, correlation, pause/refresh, and copy paths. |
| 59 | Pass | Adaptive web panels and terminal drill-ins differ in layout while sharing URLs/transitions and behavioral tests. |
| 60 | Pass | Scrollable/paged detail panes expose full body, typed attributes, events, links, warnings, contexts, and correlations; real UI acceptance inspects them. |
| 61 | Pass | Web virtualizers and bounded TUI windows key selection by stable ID and reconcile refreshed result sets; stress tests cover preservation. |
| 62 | Pass | Shared waterfall plus both adapters cover hierarchy collapse, timing/duration, status, Service, log count, scale/zoom, and focused span. |
| 63 | Pass | Visible structured filter controls support composition/clear; detail promotion only offers safe filterable scalar projections. |
| 64 | Pass | Both adapters implement bounded cadence and pause; web suppresses refresh while hidden; timer/Workspace tests cover transitions. |
| 65 | Pass | Shared empty-state copy includes exporter endpoint/filter guidance, clear-filter paths, and diagnostics access. |
| 66 | Pass | TUI/web render distinct loading, stale, partial/degraded, reconnecting, and unavailable states while retaining loaded rows. |

## Terminal interface

| # | Result | Evidence |
|---:|:---:|---|
| 67 | Pass | OpenTUI runs on Bun in alternate-screen mode; real PTY acceptance observed enter/leave and restored shell state. |
| 68 | Pass | [`commands.ts`](../../../apps/tui/src/commands.ts) is the single documented keyboard registry and dispatches every required command. |
| 69 | Pass | Renderer/session tests and public PTY acceptance traverse list→waterfall→detail, hierarchy/collapse, adjacent records, and correlated logs. |
| 70 | Pass | The bounded log list opens complete log detail and transitions directly to its trace/span; restored-session behavior is tested. |
| 71 | Pass | Responsive layout tests cover narrow drill-in and wide split-pane rendering with shared command/selection semantics. |
| 72 | Pass | Renderer/layout/command tests exercise resize, rapid input, filtering, sorting, refresh, collapse, and clamped selections/geometry. |
| 73 | Pass | Root startup passes actionable failure state and reconnect action into the TUI; renderer tests exercise in-place retry. |

## Web interface

| # | Result | Evidence |
|---:|:---:|---|
| 74 | Pass | Web routes provide trace/log workspaces and trace waterfall, selected span, and trace logs; production Chrome acceptance exercised them. |
| 75 | Pass | The labelled searchable multi-select maintains shared Service state between signal routes and is covered by component/E2E tests. |
| 76 | Pass | [`url.ts`](../../../packages/workspace/src/url.ts) serializes range/filter/sort/tab/span/log/pause/live state; Chrome reload/history acceptance verifies restoration. |
| 77 | Pass | Full-width/bottom span detail exposes overview, attributes, events, links, and accessible correlated-log controls. |
| 78 | Pass | Expanded log detail renders complete context/attributes and labelled trace/span actions independent of row clicks. |
| 79 | Pass | Semantic controls, labels, focus-visible styles, text/icon status, and keyboard Playwright coverage satisfy essential accessibility paths. |
| 80 | Pass | Virtualized table/waterfall component and E2E tests retain grid geometry, sticky headers, stable selection, and accessible details. |

## Agent debugging support and documentation

| # | Result | Evidence |
|---:|:---:|---|
| 81 | Pass | The packed distribution includes [`belfry-debug/SKILL.md`](../../../packages/docs/src/content/belfry-debug/SKILL.md) with an evidence-first workflow. |
| 82 | Pass | The installed Skill explicitly sequences discovery/start, health, Services, narrowing, errors, trace, logs, and ID/timestamp reporting. |
| 83 | Pass | Skill commands use lifecycle discovery and bounded JSON HTTP only; the acceptance runner followed them without SQLite/MCP/private routes. |
| 84 | Pass | Docs exist in-repo, are packaged, indexed, and retrievable from `/api/docs`; verifier and public acceptance assert the installed artifact. |
| 85 | Pass | README/docs include copyable exporter variables, endpoints/encodings, privacy warning, troubleshooting, and ingestion diagnostics. |
| 86 | Pass | Architecture docs cover lifecycle/module seams, queue/writer, storage, safe query API, Workspace parity, and performance guardrails. |
| 87 | Pass | Documentation/metadata audit is traces-and-logs-only and Bun-only; no delivered metrics or Node-runtime claim remains. |

## Performance and quality guardrails

| # | Result | Evidence |
|---:|:---:|---|
| 88 | Pass | [`benchmark-workbench.ts`](../../../scripts/benchmark-workbench.ts) measured 595.16 ms cold and 217.72 ms warm medians against 750/250 ms limits. |
| 89 | Pass | The same reproducible benchmark persisted 6,400 spans in 590.86 ms and 8,000 logs in 424.04 ms median. |
| 90 | Pass | Worst recent/indexed search measured 35.34 ms median and 36.17 ms p95 against 100/250 ms limits. |
| 91 | Pass | The 1,000-span trace query measured 75.77 ms median and interactive detail 302.93 ms against 250/500 ms limits. |
| 92 | Pass | Concurrent ingest benchmark kept health/bounded query response at or below 45.77 ms, isolated from writer work. |
| 93 | Pass | Versioned results record idle Daemon/TUI/web memory, 7.61 MB repeated-ingest RSS growth, 0.57 MB web refresh growth, stable 1→1 process/listener counts, 114,688-byte database growth, and an empty final queue. |
| 94 | Pass | [`2026-07-12-apple-m2.json`](../../../docs/benchmarks/2026-07-12-apple-m2.json) records environment, dataset, samples, thresholds, and passing regression decisions. |

## Local-only safety

| # | Result | Evidence |
|---:|:---:|---|
| 95 | Pass | Config validation and server construction restrict OTLP/query/web listeners to loopback; docs expose no remote/hosted mode. |
| 96 | Pass | Loopback has no authentication; README, Skill, and operations/security docs warn about secrets, PII, prompts, SQL, and headers. |
| 97 | Pass | Documentation assigns redaction to instrumentation; sensitive-key policy blocks automatic projection/indexing while retaining detail data. |
| 98 | Pass | Central config/schema validation exposes request, decompression, queue, projection/value, result, lookback, and query-timeout limits in diagnostics. |
| 99 | Pass | Public acceptance used the final packed executable with real SDK OTLP, Query API, real PTY/OpenTUI, production Chrome, persistence/maintenance, and installed Skill. |
