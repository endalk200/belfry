# Belfry Local Observability Workbench Acceptance

Date: 2026-07-12

Result: **pass**. This run exercised the final packed product through its public
executable, real OpenTelemetry SDKs, real OTLP/HTTP and Query API listeners, a
real pseudo-terminal, real Chrome, and the installed `belfry-debug` Skill.

## Accepted artifact

- Package: `@belfry/cli@0.0.1`
- Runtime: Bun `1.3.14` on macOS arm64
- Tarball: `belfry-cli-0.0.1.tgz`
- Tarball SHA-256:
  `58f4a9eaa2b19d96a0549bbafc5b1c8ded3668af54fe20cd224728ad32472ece`
- Installed executable:
  `/private/tmp/belfry-public-acceptance-final.FIuJGv/project/node_modules/.bin/belfry`
- Isolated state:
  `/private/tmp/belfry-public-acceptance-final.FIuJGv/runtime`
- Loopback endpoint: `http://127.0.0.1:14332`

The artifact was produced and checked with:

```sh
bun run format
bun run check-types
bun run lint
bun run test
bun run build
bun run release:verify
bun run release:smoke
npm pack --json --pack-destination <isolated-root> ./apps/cli
bun add <isolated-root>/belfry-cli-0.0.1.tgz
```

The package verifier accepted only the declared files plus hashed web CSS/JS
assets. The clean-install smoke exercised the installed version, configuration
path, and database path commands.

## Public lifecycle and real SDK ingestion

The installed executable ran `daemon serve` in the foreground with the isolated
state and port above. `bun run acceptance:fixture http://127.0.0.1:14332` then
exported through the official JavaScript OpenTelemetry trace/log SDKs and OTLP
HTTP exporters.

Durable fixture evidence:

- Trace: `11111111111111111111111111111111`
- Root span: `2222222222222222`
- Child span: `3333333333333333`
- Correlated log: `5e27dc09-fc4e-4289-b499-7ccd1486b584`
- Trace/log timestamp: `1783834681459000000`
- Services: `belfry-acceptance/frontend/test` and
  `belfry-acceptance/inventory/test`
- OpenAPI title: `Belfry Query API`
- Documentation index entries: 5

The bounded Query API check verified health, multi-Service discovery, a
participating-Service trace filter, complete two-span hierarchy, exact trace
and log details, cursor-paged trace/span log correlation, docs, and generated
OpenAPI. The running Store reported 2 accepted spans, 1 accepted log, an empty
queue, non-zero durable write latency, and no fixture rejections.

Protocol integration coverage additionally passed protobuf/JSON, gzip,
content-type parameters, canonical hexadecimal IDs, malformed `400`, compressed
and decompressed `413`, unsupported `415`, saturation `429`, unavailable `503`,
standard OTLP responses, and CORS on success, failure, and preflight paths.

## Installed Debugging Skill

The installed file at
`dist/content/belfry-debug/SKILL.md` had SHA-256
`ff92dc5d7ebefb353e32688177911a97173d0c70bd6f0e4255205da41d176225`.
The acceptance runner followed the Skill itself rather than merely fetching its
text:

1. ran the installed `belfry daemon status --json`;
2. checked `GET /api/health`;
3. paged `GET /api/services` with a 30-minute bound and limit 100;
4. selected `belfry-acceptance/frontend/test`;
5. searched recent error traces with the bounded JSON Query API;
6. inspected trace `11111111111111111111111111111111`;
7. paged correlated trace logs and reported log
   `5e27dc09-fc4e-4289-b499-7ccd1486b584` with its timestamp.

No MCP, direct SQLite query, private route, or unbounded dump was used.

## Real terminal interface

`/usr/bin/expect` drove the installed default `belfry` command through a real
PTY. It observed the alternate-screen enter/leave sequences, adopted the
existing Daemon, opened the trace waterfall, selected the inventory child span,
opened span logs with `l`, opened the complete log, returned to the focused
trace with `t`, opened command help generated from the registry, and quit with
`q`. The recorded process exited successfully and the shell screen was restored.

Transcript: [tui-session.typescript](tui-session.typescript)

After the TUI and browser closed, `belfry daemon start --json` returned
`"adopted": true` for the same PID `62053`, proving interface exit did not stop
the Daemon.

## Real browser interface

Headless Chrome loaded the production web assets served by the installed
Daemon. The installed `belfry web --no-open` command first adopted that same
Daemon and reported `http://127.0.0.1:14332/traces`. Chrome then opened the
exact trace route, selected the root span, rendered the
waterfall and complete span metadata, followed the exact cursor-paged correlated
trace-log mode, opened the complete typed log body, paused refresh, reloaded the
URL without losing the log selection, and followed the log back to trace
`11111111111111111111111111111111` focused on span
`3333333333333333`.

The restored log URL retained range, sort, trace, log, pause, and live-range
state plus exact correlation mode; the correlated trace URL retained the same
Workspace context and focused span. Automated production-browser coverage also
paged and virtualized 150 correlated logs while rendering fewer than 50 rows.

Screenshots:

- [span detail](browser-span-detail.png)
- [log detail](browser-log-detail.png)
- [focused cross-Service trace](browser-wide-trace.png)

## Persistence and maintenance

The public lifecycle command stopped initial PID `62053`. With the Daemon
stopped, the installed executable successfully ran:

```sh
belfry database stats --json
belfry database checkpoint --json
belfry database vacuum --json
```

The report showed SQLite WAL mode, separate read-write/read-only roles, schema
version 1, and the same durable ingestion counters. A second foreground start
used PID `73702`; the Query API then returned the identical trace, spans, log ID,
Services, docs, and OpenAPI. A final public `daemon stop --json` succeeded, and
`daemon status --json` reported `state: stopped`.

## Performance

`bun run benchmark:workbench` passed every guardrail against the built CLI using
real PTYs, OTLP/HTTP, SQLite/WAL, isolated query and writer workers, the Query
API, and Chrome. The current schema output is versioned at
[2026-07-12-apple-m2.json](../../../docs/benchmarks/2026-07-12-apple-m2.json).

Key Apple M2 results:

- cold Daemon plus first TUI frame: 595.16 ms median (limit 750 ms)
- warm adoption: 217.72 ms median (limit 250 ms)
- 6,400-span ingest: 590.86 ms median (limit 2,000 ms)
- 8,000-log ingest: 424.04 ms median (limit 500 ms)
- worst recent/indexed query: 35.34 ms median, 36.17 ms p95
- 1,000-span trace query: 75.77 ms median
- 1,000-span interactive detail: 302.93 ms
- query/health responsiveness under ingest: 45.77 ms maximum
- repeated-ingest Daemon RSS growth: 7.61 MB (limit 64 MB)
- idle Daemon RSS: 176.91 MB
- idle TUI process-tree RSS: 141.17 MB
- idle web heap: 4.11 MB
- repeated-refresh web heap growth: 0.57 MB (limit 20 MB)
- process count: 1 before and after repeated ingest
- listener count: 1 before and after repeated ingest
- repeated-ingest database growth: 114,688 bytes
- final admission queue depth/bytes: 0/0

All benchmark thresholds passed.
