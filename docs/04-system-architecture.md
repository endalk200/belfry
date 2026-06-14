# System Architecture

## High-Level Architecture

```text
OTel-enabled apps
  |
  | OTLP/HTTP protobuf or JSON
  v
Ingestion HTTP server
  |
  v
Decode + validate
  |
  v
Normalize resources, scopes, spans, logs, metrics
  |
  v
Bounded ingest queue
  |
  v
SQLite writer batches
  |
  v
SQLite database with WAL, indexes, FTS
  |
  +--> Query API
          |
          v
        Browser UI
```

## Runtime Components

### Ingestion Server

Responsibilities:

- Listen on OTLP/HTTP endpoint.
- Enforce body size limits.
- Handle gzip.
- Decode protobuf and JSON.
- Convert binary IDs to lowercase hex strings.
- Enqueue normalized write batches.
- Report ingestion health.

### Normalizer

Responsibilities:

- Flatten OTel nested batches into records.
- Upsert service/resource/scope identities.
- Preserve raw OTel attributes as JSON.
- Extract selected attributes into indexed columns.
- Compute span duration.
- Build metric stream fingerprints.
- Generate search text.

### SQLite Writer

Responsibilities:

- Batch writes into short transactions.
- Keep one writer lane to match SQLite's single-writer reality.
- Use WAL mode for read/write concurrency.
- Insert into base tables and FTS side tables.
- Apply retention policies.
- Record ingestion errors and drop counts.

### Query API

Responsibilities:

- Provide typed UI endpoints.
- Translate filter objects into parameterized SQL.
- Protect against unbounded scans.
- Return paginated/cursor results.
- Provide correlation endpoints.

### UI

Responsibilities:

- Service inventory.
- Logs explorer.
- Traces explorer.
- Metrics explorer.
- Service detail page.
- Trace detail waterfall.
- Search/filter controls.
- Correlation navigation.

## Process Model

MVP: one Node.js process.

Internal concurrency:

- HTTP handlers parse request bodies.
- Parsed records enter bounded queues.
- Writer fibers flush queues at batch size or time thresholds.
- Query requests run on separate SQLite connections where the driver supports it.

SQLite note:

- WAL allows readers and one writer to proceed concurrently.
- There is still only one writer at a time.
- Batching is more important than parallel writes.

## Storage Strategy

Use a single SQLite database file.

Store both:

- Normalized query-friendly tables.
- Raw structured JSON for fields not yet modeled.

Rationale:

- Normalized tables make common UI queries fast.
- Raw JSON protects against losing OTel fields as the spec evolves.
- SQLite JSON functions can query raw fields when necessary.

## Data Ownership

The tool owns:

- Local telemetry database.
- Retention settings.
- UI/API schema.
- Derived service inventory.

The user's applications own:

- Instrumentation.
- Resource attributes.
- Sampling choices.
- Metric export interval.

## Deployment Modes

### Local CLI

```sh
project-otel serve
```

Best default.

### NPM Package

```sh
npx project-otel serve
```

Good for first-use trials.

### Docker

```sh
docker run --rm \
  -p 4318:4318 \
  -p 4319:4319 \
  -v project-otel-data:/data \
  project-otel:latest
```

Useful for teams that standardize on containers.

### Embedded Dev Dependency

Later, provide a library or script that can start the server as part of a monorepo dev command.

## Defaults

- OTLP/HTTP listen: `127.0.0.1:4318`.
- UI/API listen: `127.0.0.1:4319`.
- DB path: platform data dir, overridable with `PROJECT_OTEL_DB`.
- Retention: 24 hours or 2 GB, whichever is hit first.
- Max request size: 10 MB.
- Max queue size: 50,000 normalized records.
- Writer flush: 1,000 records or 250 ms.
- FTS enabled for logs and spans.

## Failure Modes

| Failure | Desired behavior |
| --- | --- |
| Bad OTLP payload | Return `400`, store ingest error counter |
| Unsupported content type | Return `415` |
| Queue full | Return `429` or drop depending configured policy |
| SQLite busy | Retry with bounded backoff |
| Disk full | Stop accepting ingestion, show UI banner |
| Huge cardinality | Store raw data but cap indexed attributes |
| Long query | Enforce timeout and suggest narrower filter |

## Design Principle

Keep ingestion tolerant and querying opinionated.

Ingestion should accept valid OTel data even if the UI cannot render every detail yet. Query APIs should expose curated, bounded, predictable shapes.
