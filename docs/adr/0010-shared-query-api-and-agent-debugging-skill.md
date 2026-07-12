# Shared Query API and Agent Debugging Skill

Status: Accepted

Belfry exposes one bounded, typed Query API for its terminal interface, web
interface, scripts, and coding agents, with generated OpenAPI documentation.
The distribution includes a `belfry-debug` Debugging Skill and agent-oriented
documentation that teach Daemon discovery, service inspection, trace and log
search, correlation, and evidence-driven debugging. The skill uses Belfry CLI
commands for lifecycle and discovery and JSON HTTP requests for queries. Belfry
does not include an MCP server or a separate agent-only API, and agent support
does not introduce AI-specific telemetry semantics.
