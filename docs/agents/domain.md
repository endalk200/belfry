# Domain Docs

This is a single-context repository. Engineering skills use the repository-wide domain documentation described here when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`docs/adr/`** - read ADRs that touch the area you're about to work in.

If either location does not exist, **proceed silently**. Do not flag its absence or suggest creating it upfront. The `domain-modeling` skill creates domain documentation lazily when terms or decisions are resolved.

## File structure

```text
/
|-- CONTEXT.md
|-- docs/adr/
`-- src/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If a needed concept is absent, reconsider whether the language belongs to the project or note a genuine gap for `domain-modeling`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
