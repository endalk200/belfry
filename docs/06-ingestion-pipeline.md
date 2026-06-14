# Ingestion Pipeline

## Pipeline Stages

```text
HTTP receive
  -> limit body
  -> decompress
  -> content-type dispatch
  -> decode OTLP
  -> normalize
  -> enqueue
  -> batch write
  -> retention tick
```

## OTLP/HTTP First

Implement these routes first:

- `POST /v1/traces`
- `POST /v1/logs`
- `POST /v1/metrics`

Reasons:

- Simpler than gRPC.
- Works with every major SDK.
- Uses standard port `4318`.
- Default path behavior is well specified.

OTLP/gRPC can be added later on `4317`.

## Decoding

Use generated protobuf types from OpenTelemetry proto definitions instead of ad hoc parsing.

Recommended package options to evaluate during implementation:

- `@bufbuild/protobuf` with generated TS from OTel proto files.
- Existing generated OTel proto npm packages if maintained and compatible.
- `protobufjs` as a fallback.

Keep decoding behind an interface:

```ts
interface OtlpDecoder {
  decodeTraces(bytes: Uint8Array, contentType: ContentType): Effect<TraceBatch, DecodeError>
  decodeLogs(bytes: Uint8Array, contentType: ContentType): Effect<LogBatch, DecodeError>
  decodeMetrics(bytes: Uint8Array, contentType: ContentType): Effect<MetricBatch, DecodeError>
}
```

## Normalization

Normalize resource-level batches into flat insert records.

For each signal:

1. Extract resource attributes.
2. Compute resource fingerprint.
3. Extract instrumentation scope.
4. Compute scope fingerprint.
5. Extract record-level fields.
6. Convert IDs to hex.
7. Convert AnyValue to JSON-safe representation.
8. Extract selected indexed attributes.
9. Preserve raw record JSON.

## Resource Fingerprint

Fingerprint should be stable and derived from resource attributes.

Recommended:

- Canonical JSON with sorted keys.
- Hash using SHA-256.
- Store hash as hex.

Do not include timestamps or record counts.

## Service Upsert

On every batch:

- Upsert `resources`.
- Upsert `services`.
- Update `last_seen_ns`.

Service identity:

```text
service.namespace + service.name + deployment.environment.name
```

If `service.name` is missing:

- Use `unknown_service`.
- Preserve SDK-provided fallback names if present.
- Show a UI warning suggesting `OTEL_SERVICE_NAME`.

## Queue Design

Use bounded queues per signal or a shared priority queue.

MVP recommendation:

- One queue per signal.
- One writer fiber per signal feeding a shared DB writer semaphore.
- Backpressure when queue is full.

Policies:

- Default: return `429` when queue full.
- Optional: drop oldest logs first, never silently drop spans by default.

## Batching

Flush triggers:

- 1,000 records.
- 250 ms.
- Shutdown.

Batch writes:

- One transaction per flush.
- Prepared statements.
- Upsert resources/scopes first.
- Insert records.
- Insert FTS rows.
- Insert attribute index rows.

## Partial Success

MVP may fail the whole request on decode/validation errors.

Later, implement partial success:

- Accept valid records.
- Drop invalid records.
- Return partial success response with rejected count and message.

## Internal Telemetry

The tool should instrument itself.

Expose internal metrics at:

- `/internal/health`
- `/internal/stats`

Track:

- Accepted requests by signal.
- Decode failures.
- Queue depth.
- Write batch size.
- Write latency.
- SQLite busy retries.
- Dropped records by reason.
- Retention deletes.
- DB file size.

## Shutdown

On SIGINT/SIGTERM:

1. Stop accepting new ingestion.
2. Continue query API briefly or mark shutting down.
3. Flush queues.
4. Run passive WAL checkpoint.
5. Close DB.

Hard timeout default: 5 seconds.

## Ingestion Limits

Defaults:

- Max body size: 10 MB.
- Max decompressed body: 50 MB.
- Max records per request: 25,000.
- Max attribute value stored inline: 16 KB.
- Max log body stored inline: 256 KB.
- Max indexed attributes per record: 32.

For oversized values:

- Store truncated preview.
- Store `truncated=true` metadata.
- Count dropped/truncated bytes.

## Why Not Use The Collector Internally?

Using the OTel Collector would add a large, separate runtime and configuration model. The project should receive OTLP directly for the default workflow.

Optional later integration:

- Provide an example Collector config that exports to this tool.
- Provide compatibility with Collector's OTLP exporter.
