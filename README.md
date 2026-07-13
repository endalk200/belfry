# Belfry

Belfry is a local-only OpenTelemetry workbench for debugging software during
development. One Bun Daemon receives traces and logs over OTLP/HTTP, stores them
in SQLite, and serves an interactive browser Workspace.

> Belfry is intentionally not deployable. It has no remote bind mode,
> authentication, multi-user isolation, alerting, or high-availability design.
> Use a production observability backend outside local development.

## Requirements and installation

Belfry requires Bun 1.3 or newer. The published CLI is a bundled npm package
with no runtime npm dependencies and does not run under Node.js.

```sh
bun add --global @belfry/cli
belfry
```

Bare `belfry` starts or adopts the one machine-wide Daemon and opens
`http://127.0.0.1:4318/traces`. Closing the browser does not stop ingestion.
Use `belfry web --no-open` when you only want the URL.

## Send local telemetry

Configure an OpenTelemetry SDK to export to Belfry:

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_RESOURCE_ATTRIBUTES='service.namespace=shop,deployment.environment.name=development'
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_TRACES_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
```

Trace exporters use `/v1/traces`; log exporters use `/v1/logs`. Belfry accepts
OTLP protobuf and JSON, with optional gzip. A `200` response means the SQLite
transaction committed, not merely that the request entered an in-memory queue.

The browser Workspace provides:

- recent trace and log search with Service, status, duration, severity,
  full-text, and scalar-attribute filters;
- cross-Service trace waterfalls and structural warnings;
- complete span and log details with trace/span log correlation;
- URL-addressable Workspace state, bounded pagination, and live refresh;
- ingestion health, diagnostics, a typed Query API, and `/openapi.json`.

## Operate the local Daemon

```sh
belfry daemon status --json
belfry daemon restart
belfry daemon stop

belfry database path
belfry database stats --json
belfry database checkpoint
belfry database vacuum
belfry database reset --yes
```

Checkpoint, vacuum, and reset require the verified Daemon to be stopped. Reset
is confirmation-gated, securely deletes retained telemetry, and compacts the
database. Default retention is seven days or one GiB of live SQLite pages.

## Configure Belfry

```sh
belfry config init
belfry config validate
belfry config path
```

Configuration precedence is environment, `~/.belfry/config.toml`, then built-in
defaults. Unknown TOML sections and keys are rejected with typo suggestions.
The generated starter file documents every supported setting, including
request/queue limits, writer and shutdown timeouts, query bounds, retention,
and browser preferences.

The Daemon only binds to `127.0.0.1`, `localhost`, or `::1`. It also rejects
non-loopback HTTP `Host` values and non-loopback browser origins. Browser SDKs
running on a local development origin can export directly; requests from remote
websites are rejected.

## Data and durability

Telemetry often contains credentials, cookies, personal data, SQL, prompts,
and request bodies. Belfry never uploads records, keeps state files private to
the local user, and excludes credential-like keys from automatic search
indexes, but source instrumentation remains responsible for redaction.

SQLite runs in WAL mode with `synchronous=NORMAL`, chosen for a responsive local
debugging loop. Committed writes recover across normal process crashes; the most
recent transaction can be lost during an operating-system crash or power loss.
Belfry is therefore persistent local tooling, not a production durability
boundary. `database stats` reports both live database bytes and the total
database/WAL/shared-memory file footprint.

## Develop and release

```sh
bun install
bun run format
bun run check-types
bun run lint
bun run test
bun run build
bun run release:verify
bun run release:smoke
```

Start with the [documentation index](docs/00-index.md),
[operations and security guide](docs/11-operations-security.md), or
[release guide](docs/how-tos/release-pipeline.md). The package includes the MIT
license, third-party notices and license texts, and a CycloneDX SBOM.
