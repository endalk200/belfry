# Belfry

Belfry is a local observability workbench for inspecting telemetry emitted by
software under development.

## Language

**Service**:
An instrumented application component identified by its namespace, name, and
deployment environment. A trace may involve multiple Services.
_Avoid_: Application, project, root service

**Service Filter**:
A selection of zero or more Services used to narrow telemetry. A trace matches
when any participating span belongs to a selected Service, while its detail
always retains the complete cross-Service trace.
_Avoid_: Root-service filter, service switcher

**Telemetry Workspace**:
The interactive context in which a developer filters telemetry, selects traces,
spans, and logs, and follows correlations between them. Belfry presents the same
Workspace behavior through its browser interface.
_Avoid_: Dashboard, screen, page

**Daemon**:
The single machine-wide Belfry process that receives telemetry and serves every
Telemetry Workspace. It continues running independently of any open interface.
_Avoid_: Project server, web process

**Telemetry Store**:
The machine-wide retained history of telemetry received by the Daemon. Projects
share one Store and distinguish their telemetry through Service Filters.
_Avoid_: Project database, workspace database

**Query API**:
The bounded, typed interface through which web, script, and agent
clients inspect the Telemetry Store. All clients observe the same query and
correlation semantics.
_Avoid_: UI API, agent API, raw SQL API

**Debugging Skill**:
Repository-owned instructions under `skills/` that teach coding agents to
set up Belfry, export and verify local telemetry, and debug software using
correlated evidence from the Query API.
_Avoid_: MCP server, AI telemetry integration
