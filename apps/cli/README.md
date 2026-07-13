# @belfry/cli

The Bun-powered, local-only OpenTelemetry trace and log workbench.

```sh
bun add --global @belfry/cli
belfry
```

Belfry starts one loopback-only Daemon, receives OTLP/HTTP at
`http://127.0.0.1:4318`, persists telemetry in a local SQLite store, and opens
the browser Workspace. It is designed for local application development only;
it is not a deployable observability server.

Use `belfry web --no-open` to print the Workspace URL, `belfry daemon status
--json` for scripts, and `belfry database stats` to inspect local storage.

Belfry requires Bun 1.3 or newer and does not support Node.js as its runtime.
The package includes its MIT license, third-party notices and license texts, and
a CycloneDX SBOM under `dist/SBOM.cdx.json`.

Full documentation: <https://github.com/endalk200/belfry>
