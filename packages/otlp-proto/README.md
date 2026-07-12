# Generated OTLP receiver definitions

`generated/otlp.js` and `generated/otlp.d.ts` are generated from the official OpenTelemetry proto
repository at tag `v1.7.0` (commit
`8654ab7a5a43ca25fe8046e59dcd6935c3f76de0`). They contain only the trace and
log collector request/response graphs used by Belfry.

Regenerate from the repository root after cloning that tag to
`/tmp/belfry-opentelemetry-proto-v1.7.0`:

```sh
apps/cli/node_modules/.bin/pbjs -t static-module -w es6 \
  -p /tmp/belfry-opentelemetry-proto-v1.7.0 \
  /tmp/belfry-opentelemetry-proto-v1.7.0/opentelemetry/proto/collector/trace/v1/trace_service.proto \
  /tmp/belfry-opentelemetry-proto-v1.7.0/opentelemetry/proto/collector/logs/v1/logs_service.proto \
  -o packages/otlp-proto/generated/otlp.js

apps/cli/node_modules/.bin/pbts packages/otlp-proto/generated/otlp.js \
  -o packages/otlp-proto/generated/otlp.d.ts
```

The source definitions are Apache-2.0 licensed. See
<https://github.com/open-telemetry/opentelemetry-proto>.
