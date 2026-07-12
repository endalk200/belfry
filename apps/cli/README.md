# @belfry/cli

The Bun-powered local OpenTelemetry trace and log workbench.

```sh
bun add --global @belfry/cli
belfry
```

`belfry` starts or adopts one loopback-only Daemon and opens the browser
Workspace. Use `belfry web --no-open` to print its URL without launching a
browser and `belfry daemon status --json` for scripts. Belfry requires Bun and
does not support Node.js as its production runtime.
