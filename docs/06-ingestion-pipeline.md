# Ingestion Pipeline

## Durable request flow

```text
HTTP route
  -> validate path, media type, encoding, compressed length
  -> reserve request-count and byte capacity
  -> stream and cap the compressed body
  -> transfer compressed bytes to writer worker
  -> stream gzip decode when requested under a separate cap
  -> decode OTLP protobuf or JSON
  -> normalize canonical trace/log records
  -> commit one SQLite transaction
  -> encode matching OTLP success response
```

Capacity is released after the worker completes, including all error paths. An
HTTP success therefore means durable commit, not acceptance into volatile
memory.

## Bounds

Default limits are:

| Limit | Default |
| --- | ---: |
| Compressed request | 8 MiB |
| Decompressed request | 32 MiB |
| Queued requests | 64 |
| Queued compressed bytes | 64 MiB |
| Shutdown drain | 10 seconds |

The queue reserves both request count and one full compressed-request allowance
before the HTTP route reads a body, so the configured byte capacity must hold at
least one maximum compressed request. The reservation is intentionally
conservative for chunked or misleading length metadata and is released after
the worker handles the queued request.
Saturation produces `429`; shutdown or unavailable storage produces `503`.
Oversize, unsupported, and malformed requests produce the protocol statuses
documented in [OTLP compatibility](03-opentelemetry-protocol.md).

Rejection accounting uses a separate dropping queue capped at the configured
request capacity. It waits for already-admitted telemetry before sending a
diagnostic command to the worker, so an unsupported-request flood cannot grow
the worker RPC map without bound or starve durable ingest.

## Decode and normalization

Both supported media types converge on the same generated protocol model.
Normalization extracts Service identity from resource attributes, canonicalizes
IDs, retains typed values, resources, scopes, events, links, dropped counts,
status, and log correlation, and records unknown Services without rejecting
otherwise valid telemetry.

The implementation does not retain raw request blobs after normalization. It
stores complete normalized records plus bounded indexes.

## Diagnostics and observability

Admission, decompression, decode, and writer failures increment counters and
persist a code/message diagnostic when possible. Operators can inspect:

```text
GET /api/health
GET /api/ingestion/stats
GET /api/ingestion/diagnostics?fromNs=...&toNs=...&limit=...
```

Worker, write, checkpoint, and retention failures atomically stop new
admission. Health remains live, reports `writerReady: false`, and keeps safe
read-only queries available. Retention failures also persist `last_error` plus
a `retention_failed` diagnostic when SQLite can still record them. Write
latency percentiles are transferred with worker acknowledgements, so Daemon
statistics describe the actual writer rather than the read-only connection.

Representative ingestion is benchmarked through the built public CLI. Health
and query requests are issued concurrently with the 8,000-log workload to
verify the Daemon event loop is not queued behind writer work.
