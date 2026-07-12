# SQLite Storage Design

## Store roles

Belfry opens one read-write SQLite client in the writer worker and a separate
read-only client for queries. Foreign keys are enabled, journal mode is WAL,
and synchronous mode is `NORMAL`. Migrations finish before readiness.

## Canonical records and indexes

The schema stores:

- deduplicated resources and instrumentation scopes;
- cross-service identities with first/last observation bounds;
- materialized trace summaries and trace-to-service membership;
- complete spans keyed by `(trace_id, span_id)`;
- complete logs with optional trace/span correlation;
- bounded scalar attribute projections for spans and logs;
- FTS5 text projections for span names/events/attributes and log bodies;
- persisted ingestion diagnostics and counters;
- retention state.

Dedicated integer columns preserve nanoseconds as SQLite integers and are read
with safe-integer mode as JavaScript `bigint`. Complete detail records are
schema-encoded JSON, so fields not selected for indexing remain inspectable.

## Write path

A writer transaction prepares unique resources, scopes, Services, traces,
spans, logs, scalar projections, and FTS rows. Inserts are emitted as bounded
multi-row statements rather than one statement per record. Duplicate spans in
one batch use last-write-wins semantics; upserting a span replaces its stale
attribute and FTS projections before rematerializing its trace.

Trace materialization derives root selection, time bounds, duration, active
state, span/error counts, participating Services, and structural warnings.
Missing parents, orphan spans, multiple roots, cycles, and running spans remain
visible rather than causing record loss.

## Query plans

Recent searches use time/service indexes and deterministic keyset ordering.
Full-text searches begin with the FTS match set and then join to structured
records; they do not run a correlated FTS scan for each candidate row. Scalar
attribute equality and contains filters use bounded projections.

Indexing defaults are 64 scalar attributes per record, 512 UTF-8 bytes per
projected value, 256 distinct keys, and 1,024 distinct scalar values per key.
Arrays, maps, byte values, credential-like keys, and identifier-like
high-cardinality keys remain available in details but are not automatically
projected. Attribute FTS text is derived only from the admitted scalar
projection, so excluded or oversized values cannot bypass those limits.

## Retention and maintenance

The default live-data limits are seven days and one GiB. Retention deletes the
globally oldest traces/logs in bounded batches, cleans projections, reclaims
incremental pages, and exposes progress in ingestion statistics.

Direct maintenance requires the verified Daemon to be stopped:

```sh
belfry database checkpoint
belfry database vacuum
belfry database reset --yes
```

`reset` is deliberately confirmation-gated. `stats` can query a running Daemon
without directly opening its write role.
