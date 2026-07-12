# Bun Runtime for OpenTUI

Status: Accepted

Belfry uses Bun as its package manager and production runtime, superseding the
earlier Node.js production-runtime decision. A single Bun runtime lets Belfry
use OpenTUI's Bun FFI-backed renderer for a polished, high-performance terminal
interface without shipping separate Node.js and Bun execution paths. Belfry may
still publish an npm package, but running the package requires a supported Bun
installation unless a future release provides a self-contained executable.

Vitest remains the test runner, including `@effect/vitest` for Effect-aware
tests. Runtime adapters and lifecycle services should target Effect's Bun
platform implementation while domain, ingestion, storage, query, and shared UI
models remain independent of Bun-specific APIs.
