# Query, Search, and Correlation

## Bounded query model

Every list/search request has a validated nanosecond range and a bounded limit.
The default maximum lookback is seven days, the configured maximum result count
is 500, and query timeout is two seconds. Invalid ranges, limits, cursors, IDs,
and unsupported combinations return typed errors rather than reaching SQL.

## Trace search

Trace search supports participating Service identities, operation text, status,
duration bounds, trace ID, general FTS text, scalar attribute filters, and
`newest`, `oldest`, or `slowest` ordering. A trace matches a selected Service
when any span participates; opening it retains cross-Service identity even when
the bounded span detail is truncated.

Trace detail returns a materialized summary and up to the configured result
ceiling of structurally ordered spans. It marks truncation explicitly. Complete
individual span detail remains available as a dedicated endpoint, and
correlated logs use their own bounded cursor pagination.

## Log search

Log search supports resource Service identities, severity bounds, trace/span
IDs, general body/event/attribute FTS text, scalar attribute filters, and newest
or oldest ordering. Opening a log returns its complete typed body and
attributes, not only the table preview.

## Facets and cursors

The facets endpoint provides bounded autocomplete/count values for Services,
operations, severities, attribute keys, and attribute values. It respects the
active time range, signal, and Service selection.

Pagination uses versioned, HMAC-signed, opaque keyset cursors. A cursor encodes
the deterministic sort position and query fingerprint; tampering or reuse with
an incompatible query or endpoint is rejected. Trace/log search,
trace-correlated logs, Service inventory, and ingestion diagnostics all expose
applied bounds, truncation, and a next cursor when another page exists.

## Correlation

- Trace or span to logs applies the exact trace ID and optional span ID.
- Log to trace opens the bounded trace detail and focuses the correlated span when
  present.
- Trace membership includes every participating Service rather than only root
  ownership.
- Browser history and serialized Workspace URLs preserve navigable evidence.

## Example

```sh
curl -sS http://127.0.0.1:4318/api/traces/search \
  -H 'content-type: application/json' \
  --data '{
    "fromNs":"1781420000000000000",
    "toNs":"1781430000000000000",
    "services":[],
    "text":"checkout failed",
    "attributes":[],
    "sort":"newest",
    "limit":100
  }'
```

See `/openapi.json` for authoritative request and response schemas.
