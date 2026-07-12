# Belfry Local Observability Workbench

Status: ready-for-agent

## Problem Statement

Belfry has a sound CLI, shared configuration package, release pipeline, and an
initial design dossier, but it does not yet provide the local observability
product developers need. Developers must still use heavier hosted or
containerized tools, or rely on Motel, to inspect the traces and logs emitted by
software running on their machine.

Motel demonstrates that a managed local Daemon, SQLite persistence, a terminal
interface, and a web interface can make OpenTelemetry useful during daily
development. Its implementation also exposes issues Belfry must not inherit:

- OTLP ingestion accepts ad hoc JSON shapes while documentation implies broader
  protocol support.
- Storage, schema bootstrap, migrations, ingestion, retention, search,
  aggregation, and specialized features are concentrated in one very large
  module.
- Several important boundaries use `Unknown` payloads and untyped `Error`
  failures.
- Heavy synchronous SQLite writes required a late worker-thread retrofit to
  keep query traffic responsive.
- Service identity is reduced to one string, and trace filtering is biased
  toward the root span's service.
- TUI and web behavior are implemented separately and have drifted. The TUI
  clips or summarizes information that the polished web detail views expose.
- TUI keyboard behavior is centralized in an oversized hook rather than a
  small interaction model.
- The web interface lacks meaningful automated workflow coverage.
- Performance improvements were found reactively through large-module
  profiling rather than protected by architectural boundaries from the start.

Belfry needs a clean, lightweight, local-only implementation inspired by the
successful parts of Motel while correcting these protocol, architecture,
performance, usability, testing, readability, and documentation problems.

## Solution

Build Belfry as a Bun-powered local OpenTelemetry workbench for traces and logs.
One machine-wide managed Daemon receives OTLP/HTTP, persists telemetry in a
machine-wide SQLite Telemetry Store, serves a bounded typed Query API and the
web application, and remains alive independently of the interfaces connected
to it.

The default `belfry` command starts or adopts the Daemon and opens a polished
OpenTUI terminal interface. `belfry web` starts or adopts the same Daemon and
opens the browser interface. Both interfaces implement the same Telemetry
Workspace behavior through a shared state machine and shared view models while
using layouts and controls appropriate to their medium.

The first product scope supports traces and logs only. It provides correct
OTLP/HTTP protobuf and JSON ingestion, gzip handling, durable SQLite storage,
cross-Service trace filtering, structured search, full-text search, cursor
pagination, trace/span/log correlation, actionable ingestion diagnostics,
retention controls, and complete trace and log detail experiences.

The Query API is also the supported automation boundary. Belfry ships generated
OpenAPI documentation, agent-oriented debugging documentation, and a packaged
`belfry-debug` Debugging Skill. Agents use CLI commands to discover and manage
the Daemon and use the same JSON Query API as the human interfaces. Belfry does
not include MCP or AI-specific telemetry features.

## User Stories

1. As a developer, I want one command to start Belfry and open its terminal
   interface, so that I can inspect local telemetry without operating an
   observability stack.
2. As a developer, I want standard OTLP/HTTP exporters to send traces and logs
   to Belfry, so that I do not need a Belfry-specific instrumentation SDK.
3. As a developer running several local Services, I want to filter by one or
   more Services, so that I can focus on relevant work without losing
   cross-Service trace context.
4. As a developer investigating latency or failure, I want to search and sort
   traces and inspect a complete span waterfall, so that I can locate the
   operation responsible.
5. As a developer investigating runtime behavior, I want to search logs and
   inspect their complete body, attributes, scope, and trace context, so that I
   can understand what happened without leaving Belfry.
6. As a developer, I want to move directly between a trace, its spans, and its
   correlated logs, so that correlation is a normal navigation path rather than
   a manual ID search.
7. As a developer, I want equivalent workflows in the terminal and browser, so
   that choosing an interface does not hide important telemetry.
8. As a developer, I want the Daemon and Telemetry Store to persist after I
   close the TUI or browser, so that telemetry history survives between
   debugging sessions.
9. As a developer, I want clear diagnostics when telemetry cannot be decoded,
   queued, or stored, so that I can fix instrumentation and local resource
   problems quickly.
10. As a developer, I want bounded retention and database maintenance controls,
    so that Belfry cannot silently consume unbounded disk space.
11. As a coding agent, I want documented, bounded trace and log queries, so that
    I can debug using runtime evidence without MCP or direct database access.
12. As a Belfry maintainer, I want small Effect services, explicit schemas,
    typed errors, forward-only migrations, and behavior-focused tests, so that
    the product remains understandable and safe to extend.
13. As a daily Belfry user, I want startup, refresh, search, scrolling, and
    navigation to remain responsive under realistic local telemetry volume, so
    that the observability tool never becomes the bottleneck in my development
    loop.

## Acceptance Criteria

### Product and lifecycle

1. [Story 1] Running `belfry` starts a healthy Daemon when none exists, adopts
   the existing healthy Daemon when one exists, and then opens the TUI.
2. [Stories 1, 8] Closing the TUI does not stop the Daemon, ingestion,
   retention, or the Telemetry Store.
3. [Story 7] Running `belfry web` starts or adopts the same Daemon and opens the
   locally served web interface.
4. [Story 8] Explicit start, stop, restart, status, and foreground serve
   workflows are available and report script-friendly success and failure
   states.
5. [Story 8] Concurrent attempts to start Belfry converge on one machine-wide
   Daemon and do not create duplicate writers or stale registry entries.
6. [Stories 1, 9] A port conflict or stale Daemon registration produces an
   actionable recovery path in both CLI output and the TUI startup experience.
7. [Stories 1, 8] Daemon identity includes enough information to reject an
   unrelated process that later occupies the configured port.
8. [Story 8] The Telemetry Store lives in the platform-appropriate machine-wide
   state directory by default and is independent of the caller's working
   directory.
9. [Stories 1, 12] Bun is the supported package manager and production runtime;
   the public package does not claim Node.js runtime compatibility.
10. [Story 1] The normal workflow requires no Docker container, external OTel
    Collector, cloud account, login, or network service.

### OTLP ingestion

11. [Story 2] The Daemon accepts trace exports at `POST /v1/traces` and log
    exports at `POST /v1/logs` over OTLP/HTTP.
12. [Story 2] Both `application/x-protobuf` and `application/json` payloads are
    accepted, including content-type parameters commonly emitted by SDKs.
13. [Story 2] Gzip-compressed request bodies are accepted and decompressed
    limits are enforced separately from compressed-body limits.
14. [Stories 2, 12] OTLP messages are decoded from generated OpenTelemetry
    protocol definitions rather than ad hoc TypeScript interfaces.
15. [Stories 2, 5] OpenTelemetry `AnyValue` data retains its scalar, array,
    key-value, and byte semantics; attributes are not globally flattened to
    strings.
16. [Stories 2, 4] Trace IDs and span IDs are validated and exposed as canonical
    lowercase hexadecimal strings.
17. [Stories 2, 12] Timestamps retain nanosecond precision in storage and API
    contracts while interfaces may derive human-readable dates and durations.
18. [Stories 2, 3] Resource and instrumentation-scope data are preserved and
    deduplicated independently of individual spans and log records.
19. [Story 3] A Service is identified by service namespace, service name, and
    deployment environment. Missing service names remain ingestible but are
    visibly identified as unknown and accompanied by setup guidance.
20. [Stories 2, 9] A successful OTLP response is returned only after the batch
    has been durably written, not merely accepted into volatile memory.
21. [Story 9] Malformed payloads return `400`, oversized payloads return `413`,
    unsupported content types return `415`, full ingestion capacity returns
    `429`, and transient storage unavailability returns `503`.
22. [Story 9] Protocol responses use the standard OTLP export response encoding
    appropriate to the request content type.
23. [Stories 9, 13] Ingestion is bounded by request count and byte capacity.
    Queue saturation is observable and never causes unbounded memory growth.
24. [Stories 9, 13] One writer worker owns write transactions and retention;
    heavy ingest does not block health checks or Query API requests on the
    Daemon event loop.
25. [Story 8] Graceful shutdown stops accepting new requests, drains accepted
    work within a bounded timeout, checkpoints WAL state, and closes resources.
26. [Story 9] Ingestion statistics expose accepted records, rejected requests,
    decode errors, queue depth and bytes, write latency, dropped or truncated
    data, database size, and retention activity.

### Storage, retention, and correctness

27. [Stories 8, 12] SQLite runs in WAL mode with scoped connections,
    parameterized statements, explicit transactions, and forward-only
    migrations.
28. [Stories 8, 13] The writer and Query API use separate write and read-only
    connection roles so query traffic does not run schema bootstrap or compete
    for writer ownership.
29. [Stories 3, 4] Trace summaries are materialized during ingest and contain
    root operation, start/end time, duration, active state, span count, error
    count, and every participating Service.
30. [Story 4] Re-ingesting a span with the same trace and span identity updates
    the stored span and its derived indexes without leaving stale attributes,
    search records, or summary counts.
31. [Stories 4, 6] Orphan spans, incomplete traces, running spans, and missing
    parents remain inspectable and carry explicit structural warnings.
32. [Stories 4, 5] Full record data needed for span events, span links, resource
    data, scope data, log bodies, and typed attributes is preserved even when a
    field does not have a dedicated indexed column.
33. [Stories 4, 5, 13] Full-text indexes cover log bodies and the general span
    and log text fields needed by the Workspace. Index maintenance is batched
    and benchmarked rather than performed one record at a time.
34. [Stories 3, 13] Exact-match attribute filtering uses indexed scalar
    projections with explicit cardinality and value-size limits. Arbitrary
    high-cardinality fields remain available in detail views without being
    automatically indexed.
35. [Story 10] Default retention removes the oldest telemetry when either seven
    days or one GiB of live database content is exceeded, whichever occurs
    first. Both limits are configurable.
36. [Story 10] Time and size retention remove dependent attributes and search
    entries consistently, reclaim space incrementally, and do not delete newer
    telemetry before older telemetry.
37. [Story 10] Database path, statistics, reset, vacuum, and maintenance status
    are available through explicit CLI workflows. Destructive reset requires an
    explicit user action.
38. [Stories 9, 10] Disk-full, migration, corruption, lock, and retention
    failures prevent unsafe ingestion and appear in health/diagnostic output
    without crashing read-only inspection when safe reads remain possible.
39. [Story 8] Telemetry persists across Daemon restarts and migrations are
    idempotent when the current schema is already installed.

### Query API and correlation

40. [Stories 3-7, 11] The Query API is the single typed read interface for TUI,
    web, scripts, and agents; none of those clients query SQLite directly.
41. [Stories 3-5] List/search responses are compact summaries while exact-ID
    detail responses contain complete records.
42. [Stories 3-5, 13] Every list/search query has a bounded time range, bounded
    result limit, deterministic ordering, and opaque cursor pagination. Exact
    trace, span, and log identity lookups are exempt from time-range filtering.
43. [Story 3] Service Filters default to all Services, allow multiple Services,
    and are represented explicitly in Query API requests.
44. [Story 3] A trace matches a Service Filter when any participating span
    belongs to any selected Service. Opening the trace returns all spans and
    Services, not a filtered partial tree.
45. [Story 3] A log matches a Service Filter using the Service on the log's
    resource.
46. [Stories 4, 5] Trace search supports time, participating Service, operation
    text, status, duration bounds, trace identity, and exact or textual
    attribute filters.
47. [Story 5] Log search supports time, Service, severity range, trace identity,
    span identity, body text, and exact or textual attribute filters.
48. [Stories 3-5] Facet endpoints expose bounded Service, operation, severity,
    attribute-key, and attribute-value suggestions with counts for building
    filters without unbounded scans.
49. [Story 4] A trace detail returns a deterministic parent-before-child span
    order together with depth, timing, status, warnings, events, links, and all
    participating Services.
50. [Story 6] Trace logs are available in timestamp order, and span-correlated
    logs are identifiable without a separate client-side full-data scan.
51. [Story 6] A log with trace context can open the complete trace and focus its
    span; a span can open all of its correlated logs; a trace can open all trace
    logs.
52. [Story 9] Health and ingestion-diagnostic endpoints are available before
    normal telemetry queries and distinguish liveness, migration readiness,
    writer readiness, and degraded read-only operation.
53. [Story 11] The API publishes an OpenAPI document generated from the same
    Effect Schemas used by server handlers and typed clients.
54. [Stories 11, 12] Query errors use typed, stable error codes and actionable
    messages rather than leaking raw SQLite or defect strings.
55. [Story 11] The Query API does not expose raw SQL, unbounded dumps, an
    agent-only endpoint family, or MCP transport.

### Telemetry Workspace behavior

56. [Story 7] A framework-independent Workspace state machine owns the active
    signal, Service Filters, search/filter state, sort, selected trace/span/log,
    navigation history, refresh pause state, and correlation transitions.
57. [Story 7] Web and TUI adapters consume the same Workspace transitions and
    view models; neither reimplements filtering or correlation semantics.
58. [Stories 3-7] Both interfaces provide Service filtering, trace search, log
    search, trace waterfall, span detail, log detail, trace-to-log navigation,
    log-to-trace navigation, refresh/pause, and identifier copying.
59. [Story 7] Behavioral parity does not require identical layout. Web may use
    mouse, browser history, and wider panels; TUI may use keyboard commands and
    terminal-responsive drill-in panes.
60. [Stories 4, 5] Selecting a span or log never hides data merely because it
    does not fit in the initial viewport. Detail regions scroll or paginate and
    expose complete bodies, typed attributes, events, links, warnings, resource
    context, scope context, and correlated logs.
61. [Story 13] Large trace, span, and log lists are virtualized. Refreshing data
    preserves selection by stable identity and preserves the selected row's
    visual position when possible.
62. [Stories 4, 13] A trace waterfall supports parent/child collapse and expand,
    relative timing, duration, status, Service distinction, log counts, zoom or
    scale inspection, and focus of a selected span.
63. [Stories 3-5] Filters are visible, composable, clearable, and do not depend
    on undocumented syntax. Attribute keys and scalar values can be promoted to
    filters from detail views.
64. [Story 13] Active interfaces refresh recent data automatically at a bounded
    cadence, pause when explicitly requested, and avoid unnecessary browser
    refresh while the tab is hidden.
65. [Story 9] Empty states explain how to configure exporters, show the active
    endpoint and filters, and provide direct paths to clear filters or inspect
    ingestion errors.
66. [Story 9] Loading, stale-data, partial failure, reconnecting, and Daemon
    unavailable states are visually distinct and do not discard already loaded
    data unnecessarily.

### Terminal interface

67. [Stories 1, 7] The TUI is implemented with OpenTUI on Bun and uses the
    terminal's alternate screen without corrupting shell output on exit or
    failure.
68. [Stories 3-7] The TUI is fully keyboard operable. A centralized command
    registry documents and dispatches navigation, search, Service Filter,
    refresh, pause, copy, browser-open, help, back, and quit commands.
69. [Stories 4, 6] Trace navigation supports list-to-waterfall-to-span-detail
    drill-in, parent/child traversal, collapse/expand, adjacent trace movement,
    and a complete correlated-log path.
70. [Story 5] Log navigation provides a virtualized list and a complete selected
    log detail, including a direct transition to correlated trace/span context.
71. [Story 7] Narrow terminals use full-width drill-in views; wider terminals
    may use split panes. Selection and command semantics remain the same across
    layouts.
72. [Story 13] Resize, rapid key input, filtering, sorting, auto-refresh, and
    collapse/expand do not create invalid selection indexes, visual drift,
    duplicated commands, or clipped pane geometry.
73. [Story 1] Startup failures and port conflicts are recoverable within the TUI
    without requiring the user to terminate a wedged process manually.

### Web interface

74. [Stories 3-7] The web interface provides dedicated trace and log Workspace
    routes plus trace detail with waterfall, selected span detail, and trace
    logs.
75. [Stories 3, 7] Service Filters use an accessible searchable multi-select and
    remain consistent when moving between trace and log views.
76. [Stories 4-7] Time range, filters, sort, active trace/log tab, selected span,
    and selected log are URL-addressable so reload, back/forward, and shared
    local links restore the same Workspace state.
77. [Stories 4, 6] Span detail follows the polished full-width/bottom-detail
    direction demonstrated by the audited Motel branch and exposes overview,
    attributes, events, links, and clickable correlated logs without a narrow
    side panel bottleneck.
78. [Stories 5, 6] Log rows expand into complete context and attributes and
    provide explicit accessible controls for opening their trace/span rather
    than relying only on row click behavior.
79. [Story 7] Essential web workflows are keyboard accessible, focus-visible,
    correctly labelled, and usable without color as the sole status indicator.
80. [Story 13] Virtualized table and waterfall rendering retain correct table
    geometry, sticky headers, selection, and accessible detail behavior.

### Agent debugging support and documentation

81. [Story 11] The distribution includes a `belfry-debug` Debugging Skill that
    teaches an evidence-first workflow rather than generic observability
    exposition.
82. [Story 11] The Debugging Skill teaches how to start or discover the Daemon,
    verify health, list Services, narrow a Service Filter, search recent errors,
    inspect a trace, inspect correlated logs, and report evidence with IDs and
    timestamps.
83. [Story 11] The Debugging Skill uses lifecycle/discovery CLI commands and the
    bounded JSON Query API; it does not use MCP, direct SQLite access, or
    undocumented routes.
84. [Story 11] Agent-oriented documentation is installed with the package,
    available in the repository, and retrievable from a documented local API
    endpoint or documentation index.
85. [Stories 2, 9, 11] Human and agent setup documentation includes copyable
    OTLP environment examples, signal endpoints, supported encodings, privacy
    warnings, troubleshooting, and ingestion diagnostics.
86. [Story 12] Architecture documentation explains module boundaries,
    lifecycle, queue and writer behavior, storage model, query safety,
    Workspace parity, and performance guardrails without requiring readers to
    reverse-engineer implementation modules.
87. [Story 12] Existing planning documents are reconciled with this traces-and-
    logs-only scope and do not continue to describe metrics or Node runtime as
    part of this delivery.

### Performance and quality guardrails

88. [Story 13] A reproducible cold-start benchmark measures Daemon readiness and
    first visible TUI frame. On the documented reference environment, warm
    adoption is under 250 ms median and a fresh Daemon plus first TUI frame is
    under 750 ms median.
89. [Story 13] A reproducible ingest benchmark persists 6,400 representative
    spans in under two seconds median and 8,000 representative logs in under
    500 ms median on the documented reference environment.
90. [Story 13] Recent trace/log queries and representative indexed searches
    return 100 results in under 100 ms median and 250 ms p95 after warmup on the
    documented benchmark dataset.
91. [Stories 4, 13] Loading a 1,000-span trace through the Query API completes in
    under 250 ms median and produces an interactive first detail view within
    500 ms on the documented reference environment.
92. [Stories 9, 13] Under the maximum supported ingest benchmark, health and
    bounded Query API requests remain responsive and are not queued behind
    synchronous writer work on the main event loop.
93. [Story 13] Idle Daemon, TUI, and web memory are measured and documented;
    repeated refresh and ingestion benchmarks show no unbounded heap, queue,
    worker, listener, or database growth.
94. [Story 13] Benchmark results are versioned with the code, include dataset
    shape and environment, and fail or visibly flag material regression against
    the accepted thresholds.

### Local-only safety

95. [Stories 1, 8] OTLP, Query API, and web listeners bind to loopback by
    default. This delivery does not expose a supported remote or hosted mode.
96. [Stories 1, 10] No authentication is required on loopback, and documentation
    clearly warns that telemetry may contain secrets, personal data, prompts,
    SQL, headers, and other sensitive development information.
97. [Stories 5, 10] Belfry does not imply automatic redaction. It avoids
    automatically indexing obviously sensitive attribute keys and documents
    that source instrumentation remains responsible for safe telemetry.
98. [Stories 9, 13] Request, decompression, queue, indexed-value, result,
    lookback, and query-duration limits are centrally enforced and visible in
    configuration and diagnostics.
99. [Stories 1-13] Before the implementation is declared complete, the built
    and packaged Belfry product passes an end-user acceptance run through its
    public executable, real terminal interface, real browser interface, OTLP
    endpoints, Query API, and packaged Debugging Skill. Passing unit,
    integration, component, or internal harness tests alone does not satisfy
    this criterion.

## Implementation Decisions

### Product and runtime

- Bun is Belfry's only package-manager and production-runtime target. The
  implementation will replace Node-specific runtime wiring, engine declarations,
  build assumptions, and release smoke tests while retaining Vitest and
  `@effect/vitest`.
- OpenTUI with its React renderer is the TUI foundation. Motel's interaction
  ideas and visual direction are references; its large React hooks and component
  structure are not the module design.
- The web interface uses React and Vite with a restrained, dense visual system
  derived from the polished Motel branch: compact tables, stable row geometry,
  high-information detail regions, responsive split/full-width layouts, and no
  decorative dashboard chrome.
- The Daemon, TUI, web application, shared Workspace model, telemetry model,
  Query API schemas, storage/ingestion implementation, and configuration are
  separate workspace modules with acyclic dependencies.
- The existing shared Belfry Configuration model remains the source of truth.
  It expands to cover Daemon address, Telemetry Store, retention, ingestion
  limits, query limits, and interface preferences while preserving environment
  override, TOML, and built-in-default precedence.
- The normal public distribution remains an npm package with a `belfry`
  executable that requires Bun. A self-contained compiled executable may be
  evaluated later but is not a prerequisite for this spec.

### Effect architecture

- Before feature implementation begins, upgrade `effect`,
  `@effect/platform-bun`, `@effect/sql-sqlite-bun`, `@effect/vitest`, and other
  directly coupled Effect packages to the mutually compatible
  `4.0.0-beta.97` release. Do not implement the migration against a mixture of
  beta.93 and beta.97 APIs. The upgrade is verified as its own TDD slice before
  new runtime behavior is introduced.
- Effect 4 APIs are implemented against the repository's installed version and
  verified from version-matched source before use. Public examples or memory are
  not authoritative for beta APIs.
- Deep services are defined for Daemon management, OTLP receiving/decoding,
  ingestion admission, writer-worker transport, telemetry writing, retention,
  telemetry querying, diagnostics, and documentation. Each service exposes a
  small behavior-oriented interface and hides its implementation dependencies.
- Services use `Context.Service`, scoped `Layer` construction, `Effect.fn`
  tracing, and typed tagged failures. Public service methods do not expose
  construction requirements or generic `Error`/`Unknown` failures.
- Bun HTTP lifecycle uses Effect's Bun platform server layer and scope-managed
  shutdown. Database connections, worker processes, queues, refresh fibers, and
  registry entries are scoped resources with finalizers.
- The ingest admission queue uses Effect's bounded queue semantics. Producer and
  consumer capabilities are narrowed to enqueue/dequeue interfaces where
  possible. Capacity failure maps deliberately to OTLP backpressure instead of
  silently dropping spans or logs.
- One typed writer worker handles decode, normalization, write transactions, and
  retention. Its protocol carries request bytes, signal, content encoding, and
  content type using explicit schemas; it does not use an unvalidated generic
  payload.
- Query services use read-only SQLite connection roles in the Daemon process.
  Writer ownership remains isolated even if query implementations change.
- Internal self-observability uses structured Effect logs, spans, and
  diagnostics without tracing OTLP ingest routes back into the same receiver.
  Exporting Belfry's own telemetry remains explicit opt-in under the existing
  configuration decision.

### Protocol and domain model

- Generated OpenTelemetry protobuf definitions are the decoding authority for
  traces and logs. JSON decoding follows the OTLP JSON mapping, including
  numeric string and byte-field rules.
- The normalization boundary produces domain batches independent of HTTP,
  protobuf libraries, SQLite rows, and UI response shapes.
- Signal, trace, span, log, resource, scope, event, link, status, severity,
  typed attribute value, and Service identity are modeled with Effect Schema.
- `service.namespace`, `service.name`, and the current or legacy deployment
  environment resource attribute form canonical Service identity. Display
  labels may omit absent components but never change identity semantics.
- Trace ownership is not assigned to one Service. Materialized trace membership
  records every participating Service and drives Service Filter queries.
- SQLite stores nanosecond timestamps as safe 64-bit integers. Application code
  uses `bigint`/safe-integer support, and JSON schemas encode exact values without
  converting them through unsafe JavaScript numbers.
- Typed attribute data is preserved canonically. Separate bounded text/scalar
  projections support search and facets without corrupting original values.
- Trace summary, hierarchy, duration, running state, errors, warnings, and
  Service membership are maintained as explicit projections during ingest.
  Query-time reconstruction is reserved for detail shapes, not every list row.

### Storage and queries

- `@effect/sql-sqlite-bun` is the primary SQLite integration. It provides the
  scoped client, WAL behavior, serialized connection access, safe tagged
  statements, transactions, and migrator integration.
- SQLite-specific pragmas, FTS operations, and optimized bulk statements that
  exceed the generic client surface are isolated behind the storage module;
  application/query services do not manipulate raw driver objects.
- Forward-only migrations create and evolve normalized resources, scopes,
  Services, traces, trace-Service membership, spans, span attributes, logs, log
  attributes, diagnostics, retention state, and search projections.
- Common filter SQL is built from typed filter values and parameterized
  fragments. The API never accepts SQL expressions, column names, sort
  fragments, or cursor internals directly from clients.
- Full-text query plans begin from the FTS match set and join into structured
  data. They do not use correlated FTS predicates that repeat a scan for every
  candidate row.
- Ingest uses prepared/batched writes for attributes and FTS maintenance, based
  on the dominant performance findings from Motel's benchmarks.
- Cursor values are opaque, versioned, validated, tied to a deterministic sort,
  and rejected when incompatible with a query rather than decoded with an
  unchecked cast.
- Retention operates in bounded batches, coordinates through the writer, uses
  incremental reclamation and checkpointing, and exposes progress/failure
  diagnostics.
- Belfry creates its own schema and Telemetry Store. It does not read, migrate,
  or share Motel's database.

### Query API and clients

- Effect HttpApi and Effect Schema declare the Query API, typed errors,
  generated OpenAPI, server handlers, and clients. Raw handlers are limited to
  protocol cases that truly require raw bytes or content negotiation.
- Query API list endpoints use a consistent envelope containing items, applied
  bounds, truncation state, and next cursor. Detail endpoints use stable exact
  identity contracts.
- The Workspace adapters use the generated typed client rather than local casts
  or handwritten duplicate response interfaces.
- Agent access is not a second protocol. The Debugging Skill and agent-oriented
  docs teach the same health, Services, trace, span, log, facet, and diagnostic
  contracts used by the interfaces.
- Documentation endpoints serve a curated index and packaged content; they do
  not expose arbitrary filesystem reads.

### Telemetry Workspace and interfaces

- The shared Workspace module defines serializable state, commands, reducer or
  transition functions, derived view models, query intents, and correlation
  navigation. It has no React, browser, OpenTUI, SQLite, or HTTP-server
  dependency.
- Web URL encoding and TUI session storage are adapters over Workspace state.
  Invalid or stale URL/session selections degrade to the nearest valid state.
- Keyboard commands are data in a centralized command registry with availability,
  key bindings, label, and transition. Help renders from the same registry.
- TUI layout math, navigation, filtering, and rendering are separate modules.
  Render components consume already-derived view models rather than calculating
  domain state during rendering.
- Web and TUI share formatting semantics for timestamps, durations, severities,
  status, Service labels, attribute values, and empty/error messages while using
  renderer-specific primitives.
- Refresh is identity-aware: incoming data does not reset drill-in state, and a
  record disappearing because of retention or filters triggers an explicit,
  predictable fallback transition.
- The web interface uses accessible native controls or correctly implemented
  composite widgets for filters, tabs, expandable rows, and keyboard focus.
- The recent Motel branch is a UX reference for full-width trace detail, URL
  selection state, clickable correlated logs, and expandable log context. The
  Belfry implementation generalizes these patterns through the shared Workspace
  contract.

### Documentation, provenance, and delivery

- Product documentation is answer-first and task-oriented: install/run,
  instrument an application, inspect traces, inspect logs, correlate, filter,
  troubleshoot ingestion, manage retention, and use the Debugging Skill.
- Reference documentation covers configuration, CLI, Query API/OpenAPI,
  supported OTLP formats, limits, schemas, and keyboard commands.
- Maintainer documentation covers deep module responsibilities, important
  invariants, migration discipline, TDD seams, performance datasets, and why
  Motel debt was not copied.
- Motel is MIT-licensed prior art. Any directly adapted code retains required
  attribution and license notices; architectural inspiration and independently
  rewritten modules are documented as such.
- Delivery proceeds in vertical tracer bullets: Daemon/health, one trace from
  OTLP to query and TUI, trace detail, one correlated log, log Workspace,
  Service Filters, web parity, agent documentation/skill, then retention and
  performance hardening. Each slice completes red-green-refactor before the
  next behavior is introduced.

## Testing Decisions

- Tests specify observable behavior through public interfaces. They do not
  assert private calls, SQL statement counts, React hook structure, worker
  implementation, or other details that may change without changing behavior.
- The primary Daemon seam starts the real CLI/HTTP stack with isolated runtime
  state and a real temporary SQLite database. Tests send real OTLP requests,
  query the Query API, restart the Daemon, and observe lifecycle, persistence,
  retention, backpressure, and error responses.
- The Workspace seam drives the public transition interface with API fixtures
  and observes derived state/query intents. It covers Service Filters,
  selection, sorting, refresh preservation, invalidation, and trace/log
  correlation without reaching inside reducer helpers.
- The interface seams use Playwright for browser workflows and the OpenTUI test
  renderer plus PTY tests for terminal workflows. The two suites share scenario
  fixtures and assert the parity contract while allowing adaptive layouts.
- A mandatory final end-user acceptance run installs or executes the built
  package in an isolated user/state environment rather than invoking source
  entry points or internal modules. The implementation agent must use the
  public `belfry` commands, interact with the real TUI through a PTY, and
  interact with the real web application through a browser.
- The acceptance run sends representative telemetry from a real sample
  application or OpenTelemetry SDK through the public OTLP endpoints. It must
  visibly verify Daemon startup/adoption, Service discovery, multi-Service
  filtering, trace search, waterfall and span detail, complete correlated logs,
  log detail, log-to-trace navigation, browser URL restoration, refresh/pause,
  client close with Daemon survival, Daemon restart with data persistence, and
  clean stop behavior.
- The acceptance run exercises the installed `belfry-debug` Debugging Skill as
  an agent would: discover the Daemon through documented CLI commands, query
  health and Services, locate a trace or error, follow correlation into logs,
  and report the evidence using only documented Query API contracts. Direct
  SQLite inspection or private module calls cannot be used to prove success.
- The implementation agent records acceptance evidence in a durable test or
  release artifact: exact package/runtime version, commands executed, sample
  telemetry identity, relevant terminal capture, browser screenshots, observed
  trace/log identifiers, and pass/fail notes. Any failed or skipped critical
  workflow blocks completion unless the spec is explicitly amended.
- System boundaries may be controlled: test clock, temporary filesystem/state
  directory, random available ports, browser, terminal, and SDK exporters.
  Belfry's own services are not mocked against one another.
- Golden OTLP protobuf and JSON fixtures cover basic and multi-Service traces,
  running spans, orphan spans, events, links, typed attributes, correlated and
  uncorrelated logs, every severity range, gzip, malformed input, oversized
  input, and missing Service data. Expected results are fixed examples rather
  than values recomputed with production logic.
- Protocol compatibility tests use real representative OpenTelemetry SDKs to
  export at least one trace with children and correlated logs. These tests
  supplement, not replace, deterministic fixtures.
- Query contract tests verify Effect Schema decoding, OpenAPI generation,
  filter bounds, cursor tampering/mismatch, stable error codes, cross-Service
  matching, complete details, FTS behavior, and correlation.
- Storage integration tests verify real migrations, WAL/read-write roles,
  span upsert projection consistency, restart persistence, retention cleanup,
  FTS cleanup, and failure mapping through public store/query services.
- Daemon tests build on Belfry's existing Effect CLI/config test style and
  Motel's useful registry/adoption scenarios, but verify through public CLI and
  health behavior.
- Workspace tests build on Motel's strongest pure navigation and filtering
  tests while consolidating web and TUI behavior into one public model.
- OpenTUI regression tests retain Motel's effective PTY reproduction pattern
  for resize, sort/selection stability, collapse/expand, and first-frame startup.
- Playwright fills Motel's missing web coverage with Service Filter, trace
  detail, log expansion, URL restoration, keyboard/focus, empty state, and
  correlation workflows.
- Performance tests preserve the useful Motel benchmark shapes for cold start,
  trace ingestion, log ingestion, and search; add query-under-ingest, large
  trace rendering, refresh stability, and memory/disk growth guardrails.
- Every implementation slice follows red-green-refactor: one failing behavior
  at the highest relevant seam, the smallest implementation that passes, then
  structure/readability improvement while the behavior remains green.
- Repository verification after every change is `bun run format`,
  `bun run check-types`, `bun run lint`, and `bun run test`.

## Out of Scope

- OpenTelemetry metrics ingestion, storage, Query API, charts, or metric
  exemplar correlation.
- AI-specific telemetry models, attribute allowlists, indexes, detection,
  markers, AI Calls pages, prompt/response views, token statistics, or other
  specialized behavior from Motel. Arbitrary attributes remain generic OTLP
  data.
- MCP servers or a separate agent-only API.
- Hosted, remote, multi-user, authenticated, or production observability use.
- Binding supported interfaces to non-loopback addresses.
- OTLP/gRPC, Prometheus scraping, custom agents, tail sampling, alerting, SLOs,
  long-term rollups, distributed storage, or high availability.
- Multiple Daemon profiles, per-project Daemons, or per-project Telemetry
  Stores.
- Docker as the normal or supported first-release execution path.
- Importing, sharing, or migrating a Motel database.
- Compatibility with Motel's API, TUI key map, schema, daemon registry, or
  specialized feature set as a product requirement.
- A self-contained native executable, embedded-library mode, remote collector
  management, or IDE extension.
- Automatic telemetry redaction or a claim that locally stored telemetry is
  safe to share.

## Further Notes

- The audited prior art is the Motel repository at
  `/Users/endalk200/src/projects/personal/motel`, on branch
  `feat-redesigned-trace-and-log-detail-view` at audited commit
  `bf426b54a019cf203eca04f46fb871a369c70fcd`. The audit incorporated its
  current web detail polish, Daemon recovery work, SQLite growth fixes,
  query/read separation, ingestion worker, tests, and performance reports.
- Particularly valuable Motel evidence included the reduction of 6,400-span
  ingestion from roughly 3.1 seconds to 1.4 seconds by batching FTS maintenance,
  the reduction of 8,000-log ingestion from roughly 276 ms to 192 ms by batching
  log FTS writes, and the reduction of representative span search from seconds
  to single-digit milliseconds by using read-only query connections and an
  FTS-first join. Belfry treats those lessons as initial design constraints.
- The Effect implementation authority is the beta.97 source tree at
  `/Users/endalk200/.opensrc/repos/github.com/Effect-TS/effect-smol/4.0.0-beta.97`.
  The primary Effect package is under `packages/effect`; the same tree contains
  the aligned Bun platform, SQLite Bun, and Vitest packages used by this spec.
  Relevant verified facilities include scoped Bun HTTP server lifecycle,
  class-style `Context.Service`, scoped Layers, bounded Queue enqueue/dequeue
  capabilities, `@effect/sql-sqlite-bun` WAL and serialized access, Effect SQL
  transactions/schema helpers, and the SQLite migrator.
- The earlier cache directory named `4.0.0-beta.93` is not a valid beta.93
  implementation authority: its package manifests report beta.97 and its
  relevant Effect sources differ from Belfry's installed beta.93 sources. It
  must not be used to explain or implement beta.93 behavior.
- Effect and related packages are beta APIs. Implementation must repeat the
  source-context check whenever dependency versions change rather than assuming
  these exact signatures remain stable.
- Existing broad design documents include metrics and a Node runtime. This PRD
  and the accepted ADRs define the current delivery boundary; those documents
  must be reconciled as part of implementation documentation work.
- The PRD intentionally describes one complete product migration. Ticketing may
  split it into tracer-bullet slices later, but no slice should create a second
  domain model, Query API, or Workspace behavior implementation.
