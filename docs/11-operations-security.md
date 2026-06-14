# Operations And Security

## Local-First Security Model

Default bind:

- OTLP: `127.0.0.1`
- UI/API: `127.0.0.1`

Reason:

- Telemetry can include secrets, tokens, request bodies, stack traces, SQL, headers, environment values, and user data.
- A dev observability UI should not be exposed on the network accidentally.

If binding to `0.0.0.0`, require an explicit flag:

```sh
project-otel serve --host 0.0.0.0 --allow-remote
```

## Authentication

MVP:

- No auth when bound to localhost.
- Block remote bind unless explicit.

Later:

- Generate browser token on startup for remote bind.
- Support static token in env var.

## Sensitive Data

Do not promise automatic redaction. Instead:

- Provide obvious warnings.
- Add optional redaction rules.
- Avoid indexing obviously sensitive keys by default.

Default non-indexed key patterns:

```text
*password*
*secret*
*token*
*authorization*
*cookie*
*set-cookie*
*api_key*
*apikey*
```

Still store raw telemetry unless redaction is enabled. If redaction is enabled, redact before persistence and FTS indexing.

## Redaction Rules

Config example:

```yaml
redaction:
  enabled: true
  attribute_key_patterns:
    - "*password*"
    - "*authorization*"
  replacement: "[redacted]"
```

Apply redaction during normalization.

## Disk Controls

Defaults:

- 2 GB max DB size.
- 24 hours retention.

Expose:

```sh
project-otel db stats
project-otel db vacuum
project-otel db reset
```

UI should show DB size and retention status.

## Performance Controls

Config:

- Max request bytes.
- Max decompressed bytes.
- Max queue size.
- Max records per batch.
- Max FTS body size.
- Max indexed attributes per record.
- Query timeout.
- Query result limit.

Default query timeout:

- 5 seconds.

Default UI result limit:

- Logs: 500.
- Trace list: 100.
- Metric streams: 500.

## SQLite Maintenance

Run periodically:

```sql
PRAGMA wal_checkpoint(PASSIVE);
```

Run on manual maintenance:

```sql
VACUUM;
```

FTS maintenance:

```sql
INSERT INTO logs_fts(logs_fts) VALUES('optimize');
INSERT INTO spans_fts(spans_fts) VALUES('optimize');
```

Run optimize after large deletions or on explicit vacuum.

## Backups And Export

Support export:

```sh
project-otel export --from 24h --format ndjson --out telemetry.ndjson
```

Signals:

```sh
project-otel export logs
project-otel export traces
project-otel export metrics
```

This is useful for bug reports without requiring direct DB sharing.

## Compatibility

Support these OTel SDK paths:

- Global OTLP endpoint to `/v1/*`.
- Per-signal endpoint as-is.
- `http/protobuf`.
- `http/json`.
- gzip compression.

Later:

- OTLP/gRPC.
- Collector configs.
- Prometheus scrape bridge.

## Observability Of The Tool

Expose internal status:

```http
GET /api/ingestion/stats
GET /api/ingestion/errors
GET /internal/health
```

Health response:

```json
{
  "status": "ok",
  "db": "ok",
  "queueDepth": 42,
  "dbSizeBytes": 12345678
}
```

## Upgrade Strategy

On startup:

1. Open DB.
2. Acquire migration lock.
3. Run migrations.
4. Verify indexes.
5. Start ingestion.

If migration fails:

- Do not accept ingestion.
- Show UI/API error.
- Suggest backup/reset.

Because this is local dev, destructive reset is acceptable only when user explicitly invokes it.

## Threats

| Threat | Mitigation |
| --- | --- |
| Remote access to sensitive telemetry | localhost bind by default, explicit remote flag |
| Disk exhaustion | retention, max DB size, request limits |
| Query DoS | time range requirements, limits, timeouts |
| Ingestion flood | bounded queues, 429, drop policy |
| Secrets in FTS index | redaction rules, sensitive key non-indexing |
| SQL injection | parameterized queries, structured filters |
| Corrupt DB from crash | WAL, short transactions, backup/export |
