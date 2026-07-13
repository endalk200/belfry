---
"@belfry/cli": patch
---

Recover automatically when upgrading from older Belfry Daemon identity formats.

- Verify and replace legacy machine-wide Daemons without requiring manual lock cleanup.
- Version the Daemon registry format while retaining strict readers for previously released identities and health responses.
- Load workspace development sources consistently when running the repository CLI.
