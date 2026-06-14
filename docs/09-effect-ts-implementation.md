# Effect TS Implementation Plan

## Why Effect TS

Effect is a good fit because this project has:

- Concurrent ingestion.
- Bounded queues.
- Resource lifecycle.
- Configuration.
- Structured errors.
- Retrying and backoff.
- Testable services.
- Long-running server processes.

Effect's Layer model is useful for composing config, logging, database, decoder, ingestion, query, and server services without leaking dependencies through every function.

Sources:

- Effect docs: https://effect.website/docs/
- Layers: https://effect.website/docs/requirements-management/layers/
- Platform: https://effect.website/docs/platform/introduction/
- SQL: https://github.com/Effect-TS/effect/tree/main/packages/sql

## Package Layout

```text
packages/
  backend/
    src/
      main.ts
      Config.ts
      OtlpHttpServer.ts
      OtlpDecoder.ts
      Normalizer.ts
      IngestQueue.ts
      Sqlite.ts
      Writer.ts
      Retention.ts
      QueryApi.ts
      HealthApi.ts
      model/
      migrations/
  ui/
    src/
  shared/
    src/
      api-schemas.ts
      telemetry-types.ts
```

For a smaller initial repo, keep `backend`, `ui`, and `shared` as top-level folders and convert to packages later.

## Core Services

```ts
class AppConfig extends Effect.Service<AppConfig>()("AppConfig", {
  effect: loadConfig
}) {}

class OtlpDecoder extends Effect.Service<OtlpDecoder>()("OtlpDecoder", {
  effect: makeOtlpDecoder
}) {}

class TelemetryStore extends Effect.Service<TelemetryStore>()("TelemetryStore", {
  effect: makeTelemetryStore
}) {}

class IngestService extends Effect.Service<IngestService>()("IngestService", {
  effect: makeIngestService
}) {}

class QueryService extends Effect.Service<QueryService>()("QueryService", {
  effect: makeQueryService
}) {}
```

Keep service methods returning `Effect<Success, Error, never>` so implementation dependencies do not leak.

## Layers

```text
ConfigLive
  -> SqliteLive
  -> MigratorLive
  -> StoreLive
  -> DecoderLive
  -> IngestLive
  -> QueryLive
  -> HttpServerLive
```

Use `Layer.mergeAll` for independent services and `Layer.provide` for dependencies.

## HTTP Server

Use `@effect/platform` HTTP APIs where stable enough for the project. The platform docs describe HTTP API modules as unstable, but still useful for declarative endpoints and typed clients.

Pragmatic approach:

- Use Effect Platform for server lifecycle and request handling if it fits.
- If the API surface causes friction, use a small Node HTTP/Fastify adapter wrapped in Effect services.
- Keep route handlers as Effect programs.

Important:

- Avoid making the core ingestion/query logic depend directly on a framework.

## SQLite Driver

Options:

- `@effect/sql` plus `@effect/sql-sqlite-node`.
- `better-sqlite3` wrapped in Effect if the Effect SQLite package lacks a needed feature.

Preferred first pass:

- Try `@effect/sql-sqlite-node`.
- Fall back to a thin `better-sqlite3` service only if needed for WAL pragmas, prepared statements, FTS, or transaction control.

Use Effect SQL's safe interpolation for query building. Avoid raw string concatenation.

## Error Model

Define typed errors:

```ts
class DecodeError extends Data.TaggedError("DecodeError")<{
  signal: Signal
  message: string
}> {}

class StorageError extends Data.TaggedError("StorageError")<{
  operation: string
  cause: unknown
}> {}

class QueryRejected extends Data.TaggedError("QueryRejected")<{
  reason: string
}> {}
```

HTTP mapping:

- `DecodeError` -> `400`.
- `UnsupportedContentType` -> `415`.
- `PayloadTooLarge` -> `413`.
- `QueueFull` -> `429`.
- `StorageError` transient -> `503`.

## Concurrency Model

Use Effect queues:

- `Queue.bounded<NormalizedBatch>(maxBatches)`.
- Writer fibers drain queues.
- Use `Schedule` for retries on SQLite busy.
- Use `Scope` finalizers for shutdown flush.

Writer loop:

```ts
while true:
  take first batch
  drain up to max batch count
  write transaction
  update stats
```

## Config

Environment variables:

```text
PROJECT_OTEL_UI_HOST=127.0.0.1
PROJECT_OTEL_UI_PORT=4319
PROJECT_OTEL_OTLP_HOST=127.0.0.1
PROJECT_OTEL_OTLP_HTTP_PORT=4318
PROJECT_OTEL_DB=~/.local/share/project-otel/project-otel.db
PROJECT_OTEL_RETENTION_HOURS=24
PROJECT_OTEL_MAX_DB_MB=2048
PROJECT_OTEL_MAX_BODY_MB=10
PROJECT_OTEL_LOG_LEVEL=info
```

Use Effect Config so CLI flags and env vars can share the same config model.

## CLI

Commands:

```sh
project-otel serve
project-otel db path
project-otel db reset
project-otel db vacuum
project-otel db stats
project-otel export --from 1h --format ndjson
```

## Build Targets

Start with:

- Node.js runtime.
- NPM package.

Later:

- Single executable using Node SEA, Bun compile, or pkg-like tooling.
- Docker image.

## Internal Observability

Because this is an observability backend, dogfood OTel:

- Instrument HTTP handlers.
- Instrument decode time.
- Instrument queue time.
- Instrument DB write latency.
- Emit internal logs.

But prevent infinite telemetry loops:

- Internal telemetry should default to console or internal stats only.
- If exporting internal OTel is enabled, require an explicit endpoint.
