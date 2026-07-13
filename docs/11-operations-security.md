# Operations, Privacy, and Security

## Local security boundary

Belfry accepts only loopback hosts and has no remote-binding mode. The default
listener is `127.0.0.1:4318`; authentication is intentionally omitted inside
that local boundary. The Daemon additionally requires a loopback HTTP `Host`
and rejects browser `Origin` values that are not loopback HTTP(S) origins. The
Daemon does not upload telemetry and is not intended to sit behind a proxy or be
deployed.

Local telemetry is still sensitive. It may contain credentials, cookies,
personal data, source, SQL, prompts, and request bodies. Belfry does not promise
automatic redaction: instrumentation must remove unsafe data before export.
Keys resembling authorization, cookie, password, secret, token, API keys, or
high-cardinality identifiers are excluded from automatic scalar and FTS
attribute projection. Distinct projected keys and values per key are also
capped, while complete records remain available until retention/reset.

## Lifecycle

```sh
belfry daemon start
belfry daemon status --json
belfry daemon restart
belfry daemon stop
belfry daemon serve
```

Lifecycle commands verify the registered PID, process start identity, endpoint,
and ownership nonce. Interfaces adopt the same healthy Daemon and do not own its
lifetime. Foreground `serve` is intended for debugging and supervisors.

## State and configuration

Default state directories are platform-native:

- macOS: `~/Library/Application Support/belfry`
- Linux: `$XDG_STATE_HOME/belfry` or `~/.local/state/belfry`
- Windows: `%LOCALAPPDATA%/belfry`

The default config file is `~/.belfry/config.toml`. Configuration precedence is
environment, TOML, then built-in defaults. Important environment overrides are:

- `BELFRY_DAEMON_HOST`, `BELFRY_DAEMON_PORT`
- `BELFRY_STATE_DIRECTORY`, `BELFRY_DATABASE_PATH`
- `BELFRY_RETENTION_DAYS`, `BELFRY_RETENTION_MAX_BYTES`

Use `belfry config init`, `belfry config validate`, and `belfry config path` to
manage the file. The `BELFRY_TELEMETRY` settings control Belfry's opt-in export
of its own internal telemetry; they do not control the local receiver.
The `[interfaces]` settings are authoritative for `refresh_interval_ms`,
`default_range_minutes`, and `web_open_browser`; the browser Workspace uses the
configured range/cadence, while `belfry web --no-open` remains an explicit
one-run override.

Unknown TOML sections and keys are rejected, with a nearest-key suggestion when
available. State directories are forced to mode `0700` and the database,
registry, lock, and cursor-secret files to `0600` on POSIX systems.

All operational safety limits are regular TOML keys and are checked by
`belfry config validate` before the Daemon starts:

| Section | Keys | Valid range / invariant |
| --- | --- | --- |
| `daemon` | `startup_timeout_ms`, `shutdown_timeout_ms` | whole milliseconds, 1–3,600,000 |
| `storage` | `retention_days`, `retention_max_bytes` | positive |
| `storage` | `retention_batch_size` | 1–10,000 records |
| `storage` | `indexed_attribute_limit` | 1–1,024 per record |
| `storage` | `indexed_value_max_bytes` | 1–1,048,576 bytes |
| `storage` | `indexed_key_limit` | 1–65,536 distinct keys |
| `storage` | `indexed_values_per_key_limit` | 1–1,000,000 distinct scalar values per key |
| `ingestion` | `max_compressed_bytes`, `max_decompressed_bytes` | positive safe integers; decompressed ≥ compressed |
| `ingestion` | `queue_request_capacity` | 1–65,536 requests |
| `ingestion` | `queue_byte_capacity` | at least one maximum compressed request |
| `ingestion` | `writer_timeout_ms` | whole milliseconds, 100–3,600,000 |
| `ingestion` | `drain_timeout_ms` | whole milliseconds, 1–3,600,000 |
| `query` | `max_lookback_days` | positive |
| `query` | `max_results` | 100–500; the lower bound keeps the documented UI and Debugging Skill page sizes valid |
| `query` | `timeout_ms` | whole milliseconds, 1–3,600,000 |
| `interfaces` | `refresh_interval_ms` | whole milliseconds, 750–3,600,000 |
| `interfaces` | `default_range_minutes` | whole minutes within the configured lookback |

`belfry config init` writes every key above with the built-in defaults, so the
effective limits are discoverable without consulting source code.

## Database operations

```sh
belfry database path
belfry database stats --json
belfry database checkpoint
belfry database vacuum
belfry database reset --yes
```

Checkpoint, vacuum, and reset require the verified Daemon to be stopped. Reset
requires `--yes`, uses secure deletion, checkpoints, and vacuums to reclaim
space. Default retention is seven days or one GiB of live SQLite pages, applied
in bounded oldest-first batches.

## Health and troubleshooting

`/api/health` reports `live`, `migrationReady`, `writerReady`,
`readsAvailable`, queue depth/bytes, live database size, total Store-file size,
WAL size, and Daemon identity.
`/api/ingestion/stats` reports committed counts, write latency, retention, and
drops. `/api/ingestion/diagnostics` records actionable rejection and retention
codes. A runtime writer/retention failure pauses new ingest and changes health
to degraded without disabling safe read-only inspection; restart retries a
previously failed retention check before enabling the writer.

On shutdown, Belfry stops accepting work and drains already accepted requests
for up to ten seconds. A forced termination can leave WAL content, which SQLite
recovers on the next verified startup.

SQLite uses WAL with `synchronous=NORMAL`. Committed writes survive an ordinary
process crash, but the latest transaction can be lost after an operating-system
crash or power loss. This is an explicit responsiveness tradeoff for local
debugging, not a production durability promise.

## Threat controls

| Threat | Control |
| --- | --- |
| Network exposure / DNS rebinding | Loopback bind plus validated `Host` and browser `Origin` |
| Wrong-process termination | Lock, registry, PID start identity, nonce, health verification |
| Disk exhaustion | Age/size retention, bounded requests, explicit reset/vacuum |
| Memory exhaustion | Request-count and byte queue capacity, decompression limit |
| Query abuse | Required bounded range/limit, typed filters, timeout, no raw SQL |
| Secret discovery through indexes | Sensitive-key projection deny pattern |
| Process crash corruption | WAL, one writer, short transactions, committed acknowledgement |
