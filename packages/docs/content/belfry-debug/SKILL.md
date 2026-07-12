---
name: belfry-debug
description: Investigate a local Service with Belfry traces and correlated logs using bounded, documented evidence.
---

# Belfry Debugging Skill

Use this skill when a local failure should be investigated from traces and logs.
Stay evidence-first: report what Belfry shows, preserve identifiers and exact
nanosecond timestamps, and distinguish observations from hypotheses.

## Workflow

1. Discover the Daemon with `belfry daemon status --json`. If it is stopped,
   run `belfry daemon start --json`; do not guess a port or inspect the registry
   file directly.
2. Request `GET /api/health`. Continue normal queries only when reads are
   available; report migration or writer degradation explicitly.
3. List Services with `GET /api/services?fromNs=...&toNs=...&limit=100`.
   Follow `nextCursor` while `truncated` is true, then choose the
   namespace/name/environment tuple that matches the failing Service.
4. Search a narrow recent window with `POST /api/traces/search`. Start with the
   Service Filter and error status, then add operation, duration, identity, text,
   or bounded attribute filters only when the evidence calls for them.
5. Open the exact trace through `GET /api/traces/{traceId}`. Record the root
   operation, participating Services, errors, active/running state, structural
   warnings, and the failing span ID.
6. Inspect `GET /api/traces/{traceId}/logs` or search `POST /api/logs/search`
   with the trace and span IDs. Preserve severity, log ID, and timestamp.
7. If starting from a log, use its trace ID and optional span ID to open the
   complete trace; never infer a partial trace from only the selected Service.
8. Report evidence with the Daemon endpoint, query bounds, Service identity,
   trace ID, span ID, log IDs, timestamps, and the smallest supported conclusion.

Use only lifecycle/discovery commands and the documented bounded JSON Query API.
Do not query SQLite, invent raw SQL, use MCP, request unbounded dumps, or rely on
undocumented endpoints. The OpenAPI document is available at `/openapi.json`.
