# Query API

The Daemon exposes one read-only, bounded API for the TUI, browser, scripts, and
coding agents. Effect HttpApi and Effect Schema define validation, response
encoding, tagged errors, the typed client, and generated OpenAPI.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness, readiness, queue, and store size |
| `GET` | `/api/services` | Bounded Service inventory for a range |
| `POST` | `/api/traces/search` | Filtered, paginated trace summaries |
| `GET` | `/api/traces/:traceId` | Complete trace and correlated log summaries |
| `GET` | `/api/traces/:traceId/logs` | Logs correlated to a trace |
| `GET` | `/api/traces/:traceId/spans/:spanId` | Complete span |
| `POST` | `/api/logs/search` | Filtered, paginated log summaries |
| `GET` | `/api/logs/:logId` | Complete log |
| `POST` | `/api/facets` | Bounded filter values/counts |
| `GET` | `/api/ingestion/stats` | Accepted/rejected counts, latency, queue, retention |
| `GET` | `/api/ingestion/diagnostics` | Persisted bounded diagnostics |
| `GET` | `/api/docs` | Packaged documentation index and debugging skill |

Generated OpenAPI is served at `/openapi.json`. Human-readable packaged content
is served at `/docs/:slug`.

## Validation and errors

- Time ranges are ordered and no longer than the configured maximum lookback (seven days by default).
- Search limits are integers from 1 through the configured maximum (500 by default and never above the schema ceiling).
- Facet limits are integers from 1 through 100.
- Text, cursor, Service, and attribute-filter collections are bounded.
- Trace/span IDs are canonical non-zero lowercase hexadecimal values.
- Duration and severity bounds must be internally consistent.

Errors use stable codes and HTTP status:

- `400`: `invalid_query`, `invalid_cursor`, `range_too_large`, `limit_exceeded`
- `404`: `not_found`
- `503`: `store_unavailable`, `migration_unavailable`, `query_timeout`

There is no arbitrary SQL endpoint, mutation API, or separate agent-only API.

## Pagination

List/search responses include applied bounds, truncation state, and an optional
next cursor. Cursors are opaque, versioned, signed with a local secret, tied to
the endpoint and query fingerprint, and based on deterministic time/ID keyset
positions. Changing endpoint, filters, or sort order invalidates a previous
cursor by design. Service inventory and ingestion diagnostics use the same
contract rather than returning an unpageable array.
Trace-correlated log responses use the same envelope and oldest-first signed
cursor pagination rather than silently truncating an in-memory list.
