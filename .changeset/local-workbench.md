---
"@belfry/cli": minor
---

Launch Belfry's local-only observability workbench for application development.

- Replace the early Node.js configuration CLI with a Bun-powered local daemon and browser Workspace.
- Receive OTLP/HTTP traces and logs, persist them in a local SQLite store, and correlate logs with traces and spans.
- Add daemon lifecycle, database inspection and reset commands, bounded retention, search, filters, and diagnostics.
- Make bare `belfry` start the local daemon and open the browser Workspace.

This release changes the required runtime from Node.js to Bun. Stop any running Belfry process from an earlier installation and reinstall the CLI with Bun before upgrading.
