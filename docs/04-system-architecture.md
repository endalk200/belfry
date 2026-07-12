# System Architecture

## Runtime topology

One verified Daemon owns the machine-wide Telemetry Store. Terminal and browser
interfaces are disposable clients; quitting either leaves ingestion and
retention running.

```text
OpenTelemetry SDKs
        |
        | OTLP/HTTP protobuf or JSON
        v
loopback Bun Daemon (default 127.0.0.1:4318)
  |-- admission: compressed bytes + bounded queue accounting
  |-- writer worker: decompress, decode, normalize, transact
  |-- Query API: bounded read-only searches and details
  |-- static web Workspace, packaged docs, OpenAPI
  v
SQLite Telemetry Store (WAL)
  ^
  |
TUI / Web / scripts / coding agents
```

The request-facing Daemon does not perform SQLite writes or heavy OTLP decode on
its event loop. A bounded admission service reserves request-count and byte
capacity before the HTTP route consumes a body, then transfers accepted work to
the one writer worker. Separate read-only SQLite access keeps health and bounded
queries responsive while writes are in progress.

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `@belfry/config` | Validated TOML/environment configuration and platform paths |
| `@belfry/telemetry` | Canonical trace/log schemas and Service identity |
| `@belfry/otlp-proto` | Generated protocol message definitions |
| `@belfry/ingestion` | Admission, decode, response encoding, worker protocol |
| `@belfry/storage` | Deep Store service over focused migration, writer, record-codec, query/facet, SQL, and retention modules |
| `@belfry/query-api` | Effect HttpApi schemas, errors, cursors, typed client |
| `@belfry/workspace` | Renderer-independent state transitions, shared typed client adapter, URL state, waterfall |
| `@belfry/daemon` | Listener, routes, query handlers, graceful lifecycle |
| `@belfry/docs` | Packaged operator docs and debugging skill |
| `@belfry/tui` | OpenTUI renderer and command registry |
| `@belfry/web` | React/Vite renderer and virtualized waterfall |
| `@belfry/cli` | Public command surface and Daemon/database orchestration |

## Lifecycle ownership

`belfry`, `belfry web`, and `belfry daemon start` all call the same Daemon
manager. It uses an exclusive lock plus a registry containing PID, process start
identity, endpoint, and ownership token. Adoption verifies identity and health;
stop signals only the verified process. Stale registries are recovered without
killing unrelated reused PIDs.

The Daemon attempts writer/migration and read-only Store startup before binding.
If either Store role is unavailable, it still serves health, documentation, and
any safely available read role while refusing unsafe ingestion or queries with
stable errors. Graceful shutdown stops admission, drains already accepted
requests within the configured deadline, closes the listener, and releases
registry ownership.

## Network and persistence boundary

The configured host must be loopback (`127.0.0.1`, `localhost`, or `::1`). The
single listener serves OTLP, the Query API, browser assets, docs, and OpenAPI.
There is no remote-bind escape hatch in this delivery.

The Store location follows platform state conventions and can be inspected with
`belfry database path`. Projects share it and remain distinguishable through
the cross-service identity `(namespace, name, environment)`.
