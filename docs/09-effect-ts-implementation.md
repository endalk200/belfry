# Effect and Bun Implementation

## Runtime baseline

Belfry uses Bun for dependency management, development scripts, the published
CLI runtime, OpenTUI, SQLite, workers, and bundling. The Effect family is pinned
atomically to `4.0.0-beta.97`, including platform, SQL, and test integrations.
Beta API usage was implemented against version-matched dependency source.

Vitest remains the package test runner and Playwright drives the real browser.
The published npm package contains a Bun-targeted bundled CLI, writer worker,
web assets, packaged docs, license, and generated debugging skill.

## Effect service seams

Deep services expose small public contracts for:

- validated Belfry Configuration;
- Daemon lifecycle ownership;
- OTLP decoding, admission, and writer-worker transport;
- Telemetry Store writing, querying, retention, and maintenance;
- Query API handlers and typed client access;
- packaged documentation.

Expected failures use tagged schema errors at boundaries. Scopes own SQLite
clients, listeners, workers, lock files, process signals, and graceful cleanup.
The request handler waits on worker completion without doing synchronous writer
work itself.

Production startup composes these `Context.Service` contracts through Layers.
The Daemon builds admission, read-only query, isolated query-worker, and
documentation Layers in child scopes; failed construction closes the child
scope immediately. The writer worker builds only the narrow writer, retention,
diagnostics, and OTLP-decoder roles over its scoped Store Layer, so its protocol
handler never receives the broad Store implementation.

The Store service is implemented through focused modules for forward-only
migrations, batched writer projections, canonical record encoding, trace
structure, facets, bounded retention, and low-level parameterized SQL. The TUI
separates interaction/recovery state from renderer panes, while both renderers
consume the same Workspace data-source contract.

## Pure domain seams

Telemetry schemas, Service identity, Workspace transitions, URL encoding,
cursor signing/fingerprinting, trace structure analysis, and virtual-window
calculation are independently testable. Renderer and transport adapters depend
on those seams rather than duplicating behavior.

## Repository workflow

```sh
bun run format
bun run check-types
bun run lint
bun run test
bun run build
```

`turbo` coordinates package scripts. The root also supplies:

```sh
bun run acceptance:fixture
bun run benchmark:workbench
bun run release:verify
bun run release:smoke
```

The implementation follows red-green-refactor at the highest useful seam:
schema/unit tests for pure behavior, temp-SQLite and real-worker integration
tests for infrastructure, process harnesses for lifecycle, Playwright for web
workflows, and public-package smoke tests for distribution behavior.
