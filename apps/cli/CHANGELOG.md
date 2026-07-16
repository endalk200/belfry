# @belfry/cli

## 0.1.2

### Patch Changes

- 0a9a269: Simplify trace and log detail headings by consolidating trace context and removing redundant section labels.

## 0.1.1

### Patch Changes

- f970ef9: Recover automatically when upgrading from older Belfry Daemon identity formats.

  - Verify and replace legacy machine-wide Daemons without requiring manual lock cleanup.
  - Version the Daemon registry format while retaining strict readers for previously released identities and health responses.
  - Load workspace development sources consistently when running the repository CLI.

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
