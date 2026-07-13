# @belfry/cli

## 0.1.0

### Minor Changes

- 95f9060: Launch Belfry's local-only observability workbench for application development.

  - Replace the early Node.js configuration CLI with a Bun-powered local daemon and browser Workspace.
  - Receive OTLP/HTTP traces and logs, persist them in a local SQLite store, and correlate logs with traces and spans.
  - Add daemon lifecycle, database inspection and reset commands, bounded retention, search, filters, and diagnostics.
  - Make bare `belfry` start the local daemon and open the browser Workspace.

  This release changes the required runtime from Node.js to Bun. Stop any running Belfry process from an earlier installation and reinstall the CLI with Bun before upgrading.

## 0.0.1

### Initial Release

- Rename the published package to `@belfry/cli` and expose the `belfry` executable.
- Rename the default config path to `~/.belfry/config.toml`.
- Rename Belfry environment variables to `BELFRY_CONFIG_PATH`, `BELFRY_TELEMETRY`, and `BELFRY_OTLP_ENDPOINT`.
- Keep the Belfry CLI package bundled without runtime npm dependencies.
