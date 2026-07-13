# OTLP/HTTP Compatibility

## Supported transport

Belfry receives OTLP/HTTP on the Daemon listener:

- `POST /v1/traces`
- `POST /v1/logs`

Supported media types are `application/x-protobuf` and `application/json`, with
parameters tolerated. `Content-Encoding: gzip` is supported. OTLP/gRPC and
other signal endpoints are not part of this release.

The default endpoint is `http://127.0.0.1:4318`. An SDK configured with the
global `OTEL_EXPORTER_OTLP_ENDPOINT` appends the signal-specific path.

## Wire fidelity

- Protobuf is decoded from the generated OpenTelemetry protocol definitions.
- OTLP JSON trace and span IDs are hexadecimal strings, normalized to bytes
  before protobuf message conversion, then stored as canonical lowercase hex.
- Nanosecond timestamps and integer attribute values remain exact `bigint`
  values through decoding, storage, API encoding, and reload.
- Complete resources, scopes, typed attributes, events, links, status, log
  bodies, dropped counts, and correlation fields are retained in detail JSON.
- Missing `service.name` is accepted as a visible `unknown_service` identity.

## Acknowledgement and errors

A success response is encoded in the same OTLP representation as the request
and is sent only after the writer worker commits the batch. Belfry returns:

| Status | Meaning |
| --- | --- |
| `200` | The local SQLite transaction committed |
| `400` | Malformed or invalid payload |
| `413` | Compressed or decompressed size limit exceeded |
| `415` | Unsupported content type or content encoding |
| `429` | Bounded ingestion capacity is full |
| `503` | Writer, migration, or storage is unavailable |

Rejected requests are counted and persisted as bounded ingestion diagnostics
when the store is available.

The Store uses SQLite WAL with `synchronous=NORMAL`. A committed transaction is
recoverable after an ordinary process crash, but the newest transaction may be
lost after an operating-system crash or power loss. That tradeoff is deliberate
for a local development tool and is not a production durability guarantee.

## Recommended SDK configuration

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_RESOURCE_ATTRIBUTES='service.namespace=shop,deployment.environment.name=dev'
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_TRACES_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
```

The repository's `bun run acceptance:fixture` command uses the real JavaScript
OpenTelemetry SDK and exporters to verify this contract.
