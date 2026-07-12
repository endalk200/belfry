# Troubleshoot ingestion

1. Run `belfry daemon status --json` and confirm the reported identity is healthy.
2. Request `/api/health`; distinguish liveness, migration readiness, writer readiness, and read availability.
3. Request `/api/ingestion/diagnostics` with a bounded time range and follow
   `nextCursor` while `truncated` is true. A `retention_failed` or runtime writer
   failure leaves health live but `writerReady: false`; preserve the diagnostic
   and restart only after checking Store access and disk capacity.
4. Confirm the exporter uses `/v1/traces` or `/v1/logs`, a supported content type, and the displayed loopback port.

Responses are deliberate: `400` malformed data, `413` request/decompression
limit, `415` media type or encoding, `429` bounded queue saturation, and `503`
writer or storage unavailability. Retry `429` and transient `503` responses with
backoff; fix payload and configuration errors before retrying other statuses.
