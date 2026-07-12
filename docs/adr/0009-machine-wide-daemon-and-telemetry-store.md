# Machine-Wide Daemon and Telemetry Store

Status: Amended by [0011 Web Workspace as the Shipped Interactive Interface](./0011-web-workspace-as-shipped-interface.md)

Belfry runs one managed Daemon and one SQLite Telemetry Store per developer
machine. Invoking `belfry` or `belfry web` starts or adopts that Daemon before
opening a disposable terminal or browser client; closing an interface does not
stop ingestion or retention. Explicit start, stop, restart, status, and
foreground serve workflows remain available. Projects share the Store and are
distinguished through Service Filters rather than separate processes or
databases. Multiple profiles and per-project stores are deferred.
