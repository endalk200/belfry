# Product Brief

## Problem

Developers already emit OpenTelemetry while debugging local services, CLIs,
tests, and workers. Existing choices are often transient, trace-only, or a
multi-component production stack. Belfry provides a persistent local workbench
without requiring containers or a separate collector.

## User and job

The primary user is a developer investigating behavior across several local
processes. They need to answer, quickly:

- Which Services emitted telemetry recently?
- Which operation failed or is still running?
- What happened inside a trace, including malformed or incomplete structure?
- Which complete log records belong to a trace or span?
- Can a script or coding agent retrieve the same bounded evidence as the UI?

## Product shape

Running `belfry` starts or adopts one machine-wide Daemon and opens the browser
Workspace. The browser, scripts, and coding agents use the same Query API and
the same SQLite Telemetry Store.

Services use standard OTLP configuration:

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
```

## Goals

- Be useful within one command and one local process boundary.
- Preserve complete trace and log records across restarts.
- Acknowledge OTLP only after durable storage.
- Make Service filtering and trace/log correlation consistent everywhere.
- Remain responsive under bounded representative ingestion.
- Give operators clear lifecycle, health, diagnostics, and database controls.
- Give scripts and agents a typed, documented, bounded read surface.

## Non-goals

Belfry is not a production observability backend, tenant security boundary,
collector replacement, alerting system, high-availability service, or remote
team dashboard. This release intentionally supports traces and logs only.

## Acceptance statement

The shipped public CLI has been exercised with real OpenTelemetry SDK exports,
real Daemon persistence and restart, and a real browser. Automated suites cover
protocol errors, storage projections and retention, lifecycle ownership,
Workspace behavior, responsive browser workflows, packaging, and the
performance thresholds in the PRD.
