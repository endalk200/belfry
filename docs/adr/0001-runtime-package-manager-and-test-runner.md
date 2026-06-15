# Runtime, Package Manager, and Test Runner

Status: Accepted

Belfry targets Node.js for production runtime behavior. The minimum supported
Node.js version is `>=22.12.0`, as declared by the root package and the public
CLI package.

Bun is the only supported package manager for this repository. It installs
dependencies, runs workspace scripts, and may execute TypeScript entry points
during local development. Production releases still build a bundled JavaScript
CLI for Node.js.

Tests run with Vitest. Packages that use Effect test helpers import them from
`@effect/vitest`, which is versioned with the installed Effect packages. We use
Vitest instead of `bun test` so those helpers and Effect's own testing patterns
remain available while Bun continues to handle dependency and script execution.

Consequences:

- CI and release checks must preserve Node.js compatibility.
- Local and CI commands should use `bun run ...` for repository scripts.
- Tests should be written for Vitest and may use `@effect/vitest` helpers where
  Effect code is under test.
