# SQLite Storage Design

## Why SQLite Fits

SQLite is a strong fit for local development observability:

- Single file.
- No server process.
- Fast enough for local traces/logs/metrics with batching.
- Supports WAL for read/write concurrency.
- Supports JSON functions.
- Supports FTS5 full-text search.
- Easy backup/reset.

Relevant sources:

- WAL: https://www.sqlite.org/wal.html
- FTS5: https://www.sqlite.org/fts5.html
- JSON functions: https://www.sqlite.org/json1.html
- Limits: https://www.sqlite.org/limits.html

## Required Pragmas

Recommended on startup:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;
PRAGMA busy_timeout = 5000;
PRAGMA wal_autocheckpoint = 1000;
```

Notes:

- WAL improves concurrency because readers do not block the writer and the writer does not block readers in common cases.
- `synchronous=NORMAL` is acceptable for local dev. Provide a `--durability=strict` mode that uses `FULL`.
- Keep transactions short to avoid UI stalls.

## ID Types

Use text hex IDs:

- `trace_id TEXT` length 32.
- `span_id TEXT` length 16.
- `parent_span_id TEXT` length 16 nullable.

Reason:

- UI/API wants hex.
- Indexing text IDs is simple.
- Avoid BLOB rendering friction.

## Time Types

Store timestamps as integer nanoseconds since Unix epoch:

- `timestamp_ns INTEGER`
- `start_time_ns INTEGER`
- `end_time_ns INTEGER`
- `observed_time_ns INTEGER`

Also derive milliseconds in the API layer for charts.

## Schema Overview

```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  service_name TEXT,
  service_namespace TEXT,
  service_instance_id TEXT,
  service_version TEXT,
  deployment_environment TEXT,
  attributes_json TEXT NOT NULL,
  first_seen_ns INTEGER NOT NULL,
  last_seen_ns INTEGER NOT NULL
);

CREATE TABLE scopes (
  id INTEGER PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  name TEXT,
  version TEXT,
  attributes_json TEXT NOT NULL
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  namespace TEXT,
  environment TEXT,
  first_seen_ns INTEGER NOT NULL,
  last_seen_ns INTEGER NOT NULL,
  UNIQUE(name, namespace, environment)
);
```

## Trace Tables

```sql
CREATE TABLE spans (
  id INTEGER PRIMARY KEY,
  trace_id TEXT NOT NULL,
  span_id TEXT NOT NULL,
  parent_span_id TEXT,
  resource_id INTEGER NOT NULL REFERENCES resources(id),
  scope_id INTEGER REFERENCES scopes(id),
  service_name TEXT,
  name TEXT NOT NULL,
  kind INTEGER,
  start_time_ns INTEGER NOT NULL,
  end_time_ns INTEGER NOT NULL,
  duration_ns INTEGER NOT NULL,
  status_code INTEGER,
  status_message TEXT,
  attributes_json TEXT NOT NULL,
  dropped_attributes_count INTEGER DEFAULT 0,
  events_json TEXT NOT NULL,
  links_json TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  UNIQUE(trace_id, span_id)
);

CREATE INDEX idx_spans_trace ON spans(trace_id, start_time_ns);
CREATE INDEX idx_spans_service_time ON spans(service_name, start_time_ns DESC);
CREATE INDEX idx_spans_name_time ON spans(name, start_time_ns DESC);
CREATE INDEX idx_spans_status_time ON spans(status_code, start_time_ns DESC);

CREATE VIRTUAL TABLE spans_fts USING fts5(
  name,
  service_name,
  attributes_text,
  content='',
  tokenize='unicode61'
);
```

Use contentless FTS to reduce duplication. Store `rowid` equal to `spans.id`.

## Log Tables

```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY,
  timestamp_ns INTEGER,
  observed_time_ns INTEGER,
  trace_id TEXT,
  span_id TEXT,
  trace_flags INTEGER,
  resource_id INTEGER NOT NULL REFERENCES resources(id),
  scope_id INTEGER REFERENCES scopes(id),
  service_name TEXT,
  severity_number INTEGER,
  severity_text TEXT,
  body_text TEXT,
  body_json TEXT,
  attributes_json TEXT NOT NULL,
  raw_json TEXT NOT NULL
);

CREATE INDEX idx_logs_time ON logs(timestamp_ns DESC);
CREATE INDEX idx_logs_service_time ON logs(service_name, timestamp_ns DESC);
CREATE INDEX idx_logs_trace ON logs(trace_id, timestamp_ns);
CREATE INDEX idx_logs_span ON logs(trace_id, span_id, timestamp_ns);
CREATE INDEX idx_logs_severity_time ON logs(severity_number, timestamp_ns DESC);

CREATE VIRTUAL TABLE logs_fts USING fts5(
  body,
  service_name,
  severity_text,
  attributes_text,
  content='',
  tokenize='unicode61'
);
```

## Metric Tables

```sql
CREATE TABLE metric_streams (
  id INTEGER PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  resource_id INTEGER NOT NULL REFERENCES resources(id),
  scope_id INTEGER REFERENCES scopes(id),
  service_name TEXT,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  type TEXT NOT NULL,
  aggregation_temporality INTEGER,
  is_monotonic INTEGER,
  attributes_json TEXT NOT NULL,
  first_seen_ns INTEGER NOT NULL,
  last_seen_ns INTEGER NOT NULL
);

CREATE TABLE metric_points (
  id INTEGER PRIMARY KEY,
  stream_id INTEGER NOT NULL REFERENCES metric_streams(id),
  start_time_ns INTEGER,
  time_ns INTEGER NOT NULL,
  value_num REAL,
  value_int INTEGER,
  count INTEGER,
  sum REAL,
  min REAL,
  max REAL,
  bucket_counts_json TEXT,
  explicit_bounds_json TEXT,
  exemplars_json TEXT,
  raw_json TEXT NOT NULL
);

CREATE INDEX idx_metric_stream_name ON metric_streams(name, service_name);
CREATE INDEX idx_metric_points_stream_time ON metric_points(stream_id, time_ns);
CREATE INDEX idx_metric_points_time ON metric_points(time_ns DESC);
```

## Attribute Indexing

Store all attributes as JSON, but do not create columns for everything.

Create a side table for selected attributes:

```sql
CREATE TABLE attributes_index (
  id INTEGER PRIMARY KEY,
  signal TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value_text TEXT NOT NULL,
  value_type TEXT NOT NULL
);

CREATE INDEX idx_attr_lookup ON attributes_index(signal, key, value_text);
CREATE INDEX idx_attr_record ON attributes_index(signal, record_id);
```

Index only:

- Resource keys used for service/environment identity.
- Common HTTP/RPC/DB/message attributes.
- User-pinned keys.
- Low-cardinality keys observed under a threshold.

Never automatically index high-cardinality values like full URLs, user IDs, request bodies, SQL text, or stack traces.

## Retention Tables

```sql
CREATE TABLE retention_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE ingest_errors (
  id INTEGER PRIMARY KEY,
  time_ns INTEGER NOT NULL,
  signal TEXT,
  error_kind TEXT NOT NULL,
  message TEXT NOT NULL,
  details_json TEXT
);
```

## Retention Policy

Support:

- Time retention: delete older than N hours/days.
- Size retention: delete oldest data until DB under max size.
- Per-signal caps.
- Manual reset.

Default:

- 24 hours.
- 2 GB max DB size.

Deletion order:

1. Old metric points.
2. Old logs.
3. Old spans.
4. Unreferenced metric streams, resources, scopes.
5. FTS optimize/checkpoint.

## Query Safety

Every query endpoint should require or default a time range.

Default time range:

- Last 15 minutes for live views.
- Last 1 hour for explorers.

Hard default limit:

- 500 rows for logs/spans.
- 100 traces.
- 1,000 chart points.

## Migration Strategy

Use forward-only SQL migrations.

Store:

```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at_ns INTEGER NOT NULL
);
```

Because this is a local dev DB, support:

```sh
project-otel db reset
project-otel db vacuum
project-otel db export --format ndjson
```
