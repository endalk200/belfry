# Runtime, Package Manager, and Test Runner

Status: Superseded by [0006 Bun Runtime for OpenTUI](./0006-bun-runtime-for-opentui.md)

This ADR originally selected a different production runtime. ADR 0006 replaces
that decision in full: Belfry now uses Bun for package management, repository
scripts, the published CLI runtime, OpenTUI, workers, SQLite, and bundling.

The retained part of this decision is the test runner. Packages use Vitest and
may use version-matched `@effect/vitest` helpers; Playwright covers browser
workflows. Current runtime consequences are documented only in ADR 0006 so this
superseded record does not create a conflicting compatibility promise.
