# Belfry Reference Benchmarks

The checked-in result records the accepted public-entry benchmark for the local
trace/log workbench. Reproduce it from the repository root on macOS:

```sh
bun run build
bun run benchmark:workbench
```

The harness uses the bundled `apps/cli/dist/bin.js`, fresh machine-wide-style
state directories, real Daemon/web Workspace startup, OTLP/HTTP, SQLite/WAL,
the Query API, and Chrome through Playwright. It exits non-zero when any
threshold fails and prints raw samples in JSON. Schema version 3 replaces the
historical terminal first-frame measurements with cold and warm Daemon-ready
Workspace URL latency; browser interactivity is measured separately in Chrome.

The benchmark is intentionally environment-qualified. A result from different
hardware or under material system load is useful evidence but does not replace
the documented Apple M2 reference without an explicit baseline decision.

- [Accepted web Workspace Apple M2 result, 2026-07-12](2026-07-12-apple-m2-web.json)
- [Historical terminal Workspace Apple M2 result, 2026-07-12](2026-07-12-apple-m2.json)
- [Historical terminal Workspace Apple M2 result, 2026-07-11](2026-07-11-apple-m2.json)
