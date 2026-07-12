# Shared Query API and Agent Debugging Skill

Status: Accepted

Belfry exposes one bounded, typed Query API for its terminal interface, web
interface, scripts, and coding agents, with generated OpenAPI documentation.
The repository includes a `skills/belfry-debug` Debugging Skill that teaches
Daemon discovery, service inspection, trace and log search, correlation, and
evidence-driven debugging. The skill uses Belfry CLI commands for lifecycle and
discovery and JSON HTTP requests for queries. It is repository tooling rather
than runtime-served content. Belfry does not include an MCP server or a separate
agent-only API, and agent support does not introduce AI-specific telemetry
semantics.
