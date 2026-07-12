# Send traces and logs

Point an OpenTelemetry SDK at the loopback Daemon:

```sh
export OTEL_SERVICE_NAME=my-service
export OTEL_RESOURCE_ATTRIBUTES='service.namespace=shop,deployment.environment.name=development'
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
```

Trace exports use `POST /v1/traces`; log exports use `POST /v1/logs`. Belfry
accepts `application/x-protobuf` and OTLP `application/json`, with optional gzip
content encoding. A 2xx response means the batch has been durably written.

Missing `service.name` remains inspectable as `unknown_service`, but setting
`OTEL_SERVICE_NAME` gives filters and trace membership a useful identity.
