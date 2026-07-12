# @belfry/cli

The Bun-powered local OpenTelemetry trace and log workbench.

```sh
bun add --global @belfry/cli
belfry
```

`belfry` starts or adopts one loopback-only Daemon and opens the terminal
Workspace. Use `belfry web` for the browser Workspace and `belfry daemon
status --json` for scripts. Belfry requires Bun and does not support Node.js as
its production runtime.
