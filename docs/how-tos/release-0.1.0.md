# Belfry 0.1.0 release checklist

## Version decision

The currently published package version is `0.0.1`, so the next minor release is
`0.1.0`. The pending Changeset is intentionally `minor`; the automated Release
PR will update `apps/cli/package.json`, the bundled version constant, and the
changelog. `0.2.0` should be reserved for the following minor release.

## Release story

This is the first complete local observability workbench release. The headline
changes are:

- a local-only Bun Daemon and browser Workspace replacing the early
  configuration-only Node.js CLI;
- OTLP/HTTP protobuf and JSON ingestion for traces and logs, with SQLite
  persistence, search, filters, correlation, diagnostics, and bounded retention;
- verified machine-wide lifecycle and safe database maintenance commands;
- bounded/cancellable workers and queries, strict configuration, loopback
  Host/Origin enforcement, private local state, and explicit durability limits;
- a bundled, dependency-free npm package with MIT licensing, third-party
  notices, license texts, provenance, and a CycloneDX SBOM.

## Before merging the implementation PR

Run from a clean checkout with Bun 1.3 or newer:

```sh
bun install --frozen-lockfile
bun run format:check
bun run check-types
bun run lint
bun run test
bun run build
bun run release:audit
bun run release:verify
bun run release:smoke
```

Also perform these local checks:

1. Export one real trace and log batch from an OpenTelemetry SDK.
2. Confirm the browser can search both signals and follow trace/log correlation.
3. Restart the Daemon and confirm retained telemetry remains queryable.
4. Confirm a remote `Host` and remote browser `Origin` receive `403`.
5. Stop the Daemon, run `belfry database reset --yes`, and confirm file space is
   reclaimed.

## Automated release sequence

1. Merge this implementation and its minor Changeset to `main`.
2. Review and merge the generated `Version Packages` PR. It should select
   `@belfry/cli@0.1.0` and contain the release notes above.
3. Approve the `npm-production` GitHub environment when the staging workflow
   reaches it.
4. Inspect npm provenance, the packed file allowlist, third-party licenses, and
   `dist/SBOM.cdx.json` before approving the staged package with 2FA.
5. Publish the draft `belfry-cli-v0.1.0` GitHub Release only after npm approval.

Do not run `changeset version` manually on the implementation branch; the
Release PR workflow owns version-file and changelog updates.
