# Belfry

Belfry is a lightweight, local OpenTelemetry workbench for traces and logs. One
loopback-only Bun Daemon receives OTLP/HTTP, persists complete records in
SQLite, and serves both a keyboard-first terminal Workspace and an
URL-addressable browser Workspace.

## Install and run

```sh
bun add --global @belfry/cli
belfry
```

`belfry` starts or adopts the machine-wide Daemon and opens the TUI. Closing the
TUI does not stop ingestion. Use `belfry web` for the browser Workspace.

```sh
belfry daemon status --json
belfry daemon stop
belfry database stats
```

The default Daemon endpoint is `http://127.0.0.1:4318`. It serves OTLP/HTTP,
the web Workspace, the bounded Query API, packaged documentation, and OpenAPI
from the same loopback listener.

## Send telemetry

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_RESOURCE_ATTRIBUTES='service.namespace=shop,deployment.environment.name=development'
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
```

Trace exporters post to `/v1/traces`; log exporters post to `/v1/logs`. Belfry
accepts OTLP protobuf and JSON, including gzip, and acknowledges success only
after the batch is durably stored.

## Develop

This repository and the published CLI require Bun.

```sh
bun install
bun run build
bun run test
bun run benchmark:workbench
```

Start with the [documentation index](docs/00-index.md), the
[operations guide](docs/11-operations-security.md), or the versioned
[reference benchmark](docs/benchmarks/README.md). Runtime help is also available
from `/api/docs`, `/docs/getting-started`, and `/openapi.json` while the Daemon
is running.

Telemetry can contain secrets and personal data. Belfry stays on loopback and
does not upload records, but instrumentation is still responsible for safe
source-side redaction.
