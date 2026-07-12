# Install and run Belfry

Belfry is a Bun-only, local traces-and-logs workbench. Install the package with
`bun add --global @belfry/cli`, then run `belfry`. The command starts or adopts
the machine-wide Daemon and opens the terminal Workspace. `belfry web` opens the
same data in the browser.

Useful lifecycle commands are `belfry daemon status`, `belfry daemon start`,
`belfry daemon stop`, `belfry daemon restart`, and `belfry daemon serve`.

The Daemon binds to loopback and exposes OTLP/HTTP and the bounded Query API on
the address shown by `belfry daemon status --json`.
