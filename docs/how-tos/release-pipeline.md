# Release Pipeline

Use this runbook to release the Belfry CLI package to npm.

## What Gets Released

- npm package: `@belfry/cli`
- CLI executable: `belfry`
- Version source: `apps/cli/package.json`
- Release tag: `belfry-cli-vX.Y.Z`
- Protected GitHub environment: `npm-production`

Internal workspace packages are private implementation details. Do not publish
them separately.

## Normal Release

## First Belfry Release From This Repository

The first automated release from this repository is `0.0.1`, and the versioned
files are already part of the migration PR:

- `apps/cli/package.json`
- `apps/cli/CHANGELOG.md`
- `apps/cli/src/version.generated.ts`

For this first release, merge the migration PR directly after required checks
pass. The `Stage npm Release` workflow should stage `@belfry/cli@0.0.1`
after `npm-production` environment approval. Do not wait for a separate
Changesets release PR unless a later change adds new changesets on `main`.

After `0.0.1` is released, use the normal Changesets flow below for future
versions.

### 1. Open the change PR

Create a pull request into `main`.

If the change should produce a new npm version, add a Changesets entry:

```sh
bun run changeset
```

Select the semver bump for `@belfry/cli`. Changesets ignores the private
workspace packages listed in `.changeset/config.json`.

Before the PR is ready, run:

```sh
bun run format
bun run check-types
bun run lint
bun run test
```

Commit any formatting changes. CI checks formatting with `bun run format:check`.

### 2. Merge the change PR

Merge only after the required checks pass:

- `Quality Gate`
- `Analyze`

After the merge, `main` triggers both release workflows:

- `Release PR`
- `Stage npm Release`

If the merged package version already exists on npm, staging skips successfully.
If the merged package version is new, staging waits for the `npm-production`
environment approval and then stages the package.

### 3. Review the release PR

The `Release PR` workflow creates or updates:

- Branch: `changeset-release/main`
- Pull request title: `Version Packages`

Review only the generated release changes:

- `apps/cli/package.json` has the expected version
- `apps/cli/CHANGELOG.md` has the expected entry
- `apps/cli/src/version.generated.ts` has updated Release Metadata
- No unrelated source changes are present

If the branch exists but no PR was created, GitHub blocked the workflow token
from creating pull requests. Open a PR manually from `changeset-release/main` to
`main`, or configure `RELEASE_PR_TOKEN` / workflow PR creation permissions.

### 4. Merge the release PR

Merge the release PR after `Quality Gate` and `Analyze` pass.

This `main` push is the one that should stage the new npm version. The
`Stage npm Release` workflow waits at the `npm-production` environment before
running release steps.

### 5. Approve npm staging

In GitHub Actions, open the waiting `Stage npm Release` run and approve the
`npm-production` deployment.

Approve only when all of these are true:

- The run is from `main`
- The version is expected
- Required PR checks passed
- The release PR did not contain unexpected files

The environment is restricted to branch `main`, requires reviewer `endalk200`,
and does not allow admin bypass.

### 6. Let the staging workflow finish

After approval, the workflow runs the release audit, format check, type check,
lint, tests, build, npm package verification, packed-package smoke test, and npm
version existence check.

If the version already exists on npm, the workflow exits successfully without
staging.

If the version is new, it runs:

```sh
npm stage publish --access public --tag latest --provenance
```

Successful staging also creates the `belfry-cli-vX.Y.Z` tag and a draft GitHub
Release titled `Belfry CLI vX.Y.Z`.

### 7. Approve the package in npm

Use the maintainer npm account and 2FA to approve the staged package.

Before approving, verify:

- Package name is `@belfry/cli`
- Version matches the release PR
- Provenance is present
- Commit matches the merged release PR commit
- Package contents are expected: `dist/bin.js`, `LICENSE`, `package.json`,
  `README.md`

After npm approval, the package is public on the configured dist-tag, currently
`latest`.

### 8. Publish the GitHub Release

Publish the draft GitHub Release only after npm approval succeeds.

The expected tag is `belfry-cli-vX.Y.Z`. Tags matching `belfry-cli-v*` are
protected from deletion and non-fast-forward updates.

## Manual Recovery

Use manual dispatch only to recover or re-run existing automation.

Run `Release PR` manually when a changeset exists on `main` but the release PR
was not created or needs to be regenerated. Expected result: the
`Version Packages` PR is updated, the `changeset-release/main` branch is pushed,
or the workflow reports that no changes are needed.

Run `Stage npm Release` manually when the versioned release PR already landed on
`main`, the previous staging workflow failed for an environmental reason, and
the npm version does not already exist. Expected result: the workflow waits for
`npm-production` approval, runs release checks, stages the package if needed,
and skips successfully if the version already exists.

Do not use manual dispatch to stage an arbitrary branch. The release workflow is
designed around the version currently on `main`.
