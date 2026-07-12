## References

Check [./CONTEXT.md](./CONTEXT.md) for terminology questions.

When modifying, debugging, or explaining code that uses `effect`, `@effect/platform-node`, `ai`, or `@ai-sdk/devtools`, always use the `source-context` skill first to inspect version-matched dependency source. This is specially true for effect v4 APIs.

For AI SDK feature work, use both `source-context` and `ai-sdk`.

## Workflow

Whenever you make changes to the codebase run:

- `bun run format`
- `bun run check-types`
- `bun run lint`
- `bun run test`

## Agent skills

### Issue tracker

Issues are tracked as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage and Wayfinder labels

Canonical triage and Wayfinder role names are used unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain layout. See `docs/agents/domain.md`.
