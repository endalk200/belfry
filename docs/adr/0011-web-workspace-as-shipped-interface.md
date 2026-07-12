# Web Workspace as the Shipped Interactive Interface

Status: Accepted

Belfry ships one interactive interface: the Daemon-served React/Vite browser
Workspace. The OpenTUI renderer and its session, command, layout, and recovery
adapters are removed. Bare `belfry` starts or adopts the machine-wide Daemon and
opens the browser Workspace, honoring `interfaces.web_open_browser`; `belfry
web --no-open` remains the headless way to start it and print its URL.

The renderer-independent `@belfry/workspace` module remains the owner of state
transitions, query adaptation, URL state, formatting, correlation, and
waterfall construction. The Daemon, Telemetry Store, ingestion path, Query API,
OpenAPI, scripts, and Debugging Skill are unaffected. A future terminal design
may consume these seams, but Belfry retains no dormant terminal adapter.

Bun remains Belfry's package manager and production runtime for SQLite,
workers, platform services, and bundling. Removing OpenTUI removes its native
runtime dependency tree; it does not imply Node.js production-runtime support.
Historical terminal benchmark results and superseded ADRs remain as evidence,
while current benchmarks measure cold and warm Daemon-ready Workspace URL
latency and browser interactivity separately.
