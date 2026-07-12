---
name: belfry-debug
description: Debug a local Service with Belfry when a failure needs evidence from traces, spans, or correlated logs.
---

# Belfry Debugging

Follow the evidence trail through Belfry's bounded public API.

1. Run `belfry daemon status --json`. Start it with `belfry daemon start --json` when stopped. Complete discovery when the verified Daemon endpoint is known.
2. Request `GET /api/health`. Continue queries when reads are available; otherwise report the health response as the investigation limit.
3. List Services with `GET /api/services?fromNs=...&toNs=...&limit=100`, following `nextCursor` while `truncated` is true. Complete selection when the namespace, name, and environment match the failing Service.
4. Search a narrow recent window with `POST /api/traces/search`. Begin with the Service Filter and error status, then add operation, duration, identity, text, or bounded attribute filters as evidence narrows the search. Complete the search when an exact candidate trace is selected or every bounded result page is exhausted and the absence is recorded.
5. Open the exact trace with `GET /api/traces/{traceId}`. Complete trace inspection when the root operation, participating Services, errors, active state, structural warnings, and failing span ID are each recorded, including their absence where applicable.
6. Inspect `GET /api/traces/{traceId}/logs`, or use `POST /api/logs/search` with trace and span IDs. When starting from a log, open its complete trace before concluding. Complete correlation when the matching logs are recorded or their absence is established across every bounded result page.
7. Report the Daemon endpoint, query bounds, Service identity, trace ID, span ID, log IDs, exact nanosecond timestamps, observations, and separately labelled hypotheses. Complete the investigation only when every conclusion is supported by the reported evidence or explicitly marked unresolved.

Use lifecycle commands for discovery and the bounded JSON Query API for telemetry so storage and pagination guarantees remain intact. Read `/openapi.json` for the current endpoint schemas.
