import { opentelemetry } from "@belfry/otlp-proto";
import { assert, describe, it } from "@effect/vitest";
import { decodeOtlpLogs, decodeOtlpTraces, OtlpDecodeError, UnsupportedOtlpContentType } from "./decoder.js";

const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
const spanId = "00f067aa0ba902b7";

describe("generated OTLP decoder", () => {
	it("decodes protobuf traces without flattening typed values", () => {
		const request = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.fromObject({
			resourceSpans: [
				{
					resource: {
						attributes: resourceAttributes,
					},
					scopeSpans: [
						{
							scope: {
								name: "@opentelemetry/instrumentation-http",
								version: "1.2.3",
								attributes: [{ key: "scope.flag", value: { boolValue: true } }],
							},
							spans: [
								{
									traceId: Buffer.from(traceId, "hex"),
									spanId: Buffer.from(spanId, "hex"),
									name: "POST /checkout",
									kind: 2,
									startTimeUnixNano: "1781420000000000001",
									endTimeUnixNano: "1781420000253000001",
									attributes: [
										{ key: "attempt", value: { intValue: "9223372036854775807" } },
										{
											key: "typed",
											value: {
												arrayValue: {
													values: [
														{ stringValue: "one" },
														{ bytesValue: Buffer.from([0, 1, 255]) },
													],
												},
											},
										},
									],
									status: { code: 2, message: "failed" },
								},
							],
						},
					],
				},
			],
		});
		const bytes = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.encode(request).finish();

		const batch = decodeOtlpTraces(bytes, "application/x-protobuf; charset=binary");
		const decoded = batch.spans[0];

		assert.strictEqual(decoded?.traceId, traceId);
		assert.strictEqual(decoded?.spanId, spanId);
		assert.strictEqual(decoded?.startTimeNs, 1781420000000000001n);
		assert.strictEqual(decoded?.endTimeNs, 1781420000253000001n);
		assert.deepStrictEqual(decoded?.service, {
			namespace: "shop",
			name: "checkout",
			environment: "development",
		});
		assert.deepStrictEqual(decoded?.attributes.attempt, {
			type: "integer",
			value: 9223372036854775807n,
		});
		assert.deepStrictEqual(decoded?.attributes.typed, {
			type: "array",
			value: [
				{ type: "string", value: "one" },
				{ type: "bytes", value: Uint8Array.of(0, 1, 255) },
			],
		});
		assert.strictEqual(decoded?.scope.name, "@opentelemetry/instrumentation-http");
		assert.deepStrictEqual(decoded?.scope.attributes?.["scope.flag"], { type: "boolean", value: true });
	});

	it("decodes OTLP/JSON logs and preserves complete trace context", () => {
		const json = JSON.stringify({
			resourceLogs: [
				{
					resource: { attributes: resourceAttributesForJson },
					scopeLogs: [
						{
							scope: { name: "pino", version: "9.0.0" },
							logRecords: [
								{
									timeUnixNano: "1781420000000000009",
									observedTimeUnixNano: "1781420000000000011",
									severityNumber: 17,
									severityText: "ERROR",
									body: {
										kvlistValue: {
											values: [
												{ key: "message", value: { stringValue: "payment timed out" } },
												{ key: "retryable", value: { boolValue: true } },
											],
										},
									},
									traceId,
									spanId,
									flags: 1,
								},
							],
						},
					],
				},
			],
		});

		const batch = decodeOtlpLogs(new TextEncoder().encode(json), "application/json; charset=utf-8");
		const decoded = batch.logs[0];

		assert.strictEqual(decoded?.timestampNs, 1781420000000000009n);
		assert.strictEqual(decoded?.observedTimeNs, 1781420000000000011n);
		assert.strictEqual(decoded?.traceId, traceId);
		assert.strictEqual(decoded?.spanId, spanId);
		assert.deepStrictEqual(decoded?.body, {
			type: "key-value-list",
			value: {
				message: { type: "string", value: "payment timed out" },
				retryable: { type: "boolean", value: true },
			},
		});
	});

	it("decodes the hexadecimal identities emitted by OTLP/JSON SDK exporters", () => {
		const parentSpanId = "1111111111111111";
		const linkedTraceId = "22222222222222222222222222222222";
		const linkedSpanId = "3333333333333333";
		const json = JSON.stringify({
			resourceSpans: [
				{
					scopeSpans: [
						{
							spans: [
								{
									traceId,
									spanId,
									parentSpanId,
									name: "SDK JSON span",
									startTimeUnixNano: "1781420000000000001",
									endTimeUnixNano: "1781420000000000002",
									links: [{ traceId: linkedTraceId, spanId: linkedSpanId }],
								},
							],
						},
					],
				},
			],
		});

		const decoded = decodeOtlpTraces(new TextEncoder().encode(json), "application/json").spans[0];

		assert.strictEqual(decoded?.traceId, traceId);
		assert.strictEqual(decoded?.spanId, spanId);
		assert.strictEqual(decoded?.parentSpanId, parentSpanId);
		assert.strictEqual(decoded?.links[0]?.traceId, linkedTraceId);
		assert.strictEqual(decoded?.links[0]?.spanId, linkedSpanId);
	});

	it("preserves running spans, orphan parent identities, events, and dropped counts from a fixed OTLP/JSON case", () => {
		const orphanSpanId = "4444444444444444";
		const missingParentSpanId = "5555555555555555";
		const json = JSON.stringify({
			resourceSpans: [
				{
					resource: { attributes: resourceAttributesForJson, droppedAttributesCount: 2 },
					scopeSpans: [
						{
							scope: { name: "golden", droppedAttributesCount: 3 },
							spans: [
								{
									traceId,
									spanId,
									name: "running checkout",
									startTimeUnixNano: "1781420000000000001",
									droppedAttributesCount: 4,
									droppedEventsCount: 5,
									droppedLinksCount: 6,
									events: [
										{
											name: "checkout.started",
											timeUnixNano: "1781420000000000002",
											droppedAttributesCount: 7,
											attributes: [{ key: "cart.items", value: { intValue: "2" } }],
										},
									],
								},
								{
									traceId,
									spanId: orphanSpanId,
									parentSpanId: missingParentSpanId,
									name: "orphan payment",
									startTimeUnixNano: "1781420000000000003",
									endTimeUnixNano: "1781420000000000004",
								},
							],
						},
					],
				},
			],
		});

		const batch = decodeOtlpTraces(new TextEncoder().encode(json), "application/json");
		const running = batch.spans[0];
		const orphan = batch.spans[1];

		assert.strictEqual(running?.endTimeNs, undefined);
		assert.strictEqual(running?.droppedAttributesCount, 4);
		assert.strictEqual(running?.droppedEventsCount, 5);
		assert.strictEqual(running?.droppedLinksCount, 6);
		assert.strictEqual(running?.events[0]?.name, "checkout.started");
		assert.strictEqual(running?.events[0]?.droppedAttributesCount, 7);
		assert.deepStrictEqual(running?.events[0]?.attributes["cart.items"], { type: "integer", value: 2n });
		assert.strictEqual(running?.resource.droppedAttributesCount, 2);
		assert.strictEqual(running?.scope.droppedAttributesCount, 3);
		assert.strictEqual(orphan?.parentSpanId, missingParentSpanId);
	});

	it("preserves uncorrelated logs across every OpenTelemetry severity range", () => {
		const severities = [
			[1, "TRACE"],
			[5, "DEBUG"],
			[9, "INFO"],
			[13, "WARN"],
			[17, "ERROR"],
			[21, "FATAL"],
			[24, "FATAL4"],
		] as const;
		const json = JSON.stringify({
			resourceLogs: [
				{
					resource: { attributes: resourceAttributesForJson },
					scopeLogs: [
						{
							logRecords: severities.map(([severityNumber, severityText], index) => ({
								timeUnixNano: String(1_781_420_000_000_000_100n + BigInt(index)),
								severityNumber,
								severityText,
								body: { stringValue: `uncorrelated ${severityText}` },
							})),
						},
					],
				},
			],
		});

		const logs = decodeOtlpLogs(new TextEncoder().encode(json), "application/json").logs;

		assert.deepStrictEqual(
			logs.map((log) => [log.severityNumber, log.severityText]),
			severities.map(([severityNumber, severityText]) => [severityNumber, severityText]),
		);
		assert.strictEqual(
			logs.every((log) => log.traceId === undefined && log.spanId === undefined),
			true,
		);
	});

	it("marks a missing service name as unknown with setup guidance", () => {
		const json = JSON.stringify({
			resourceLogs: [
				{ resource: { attributes: [] }, scopeLogs: [{ logRecords: [{ body: { stringValue: "hi" } }] }] },
			],
		});

		const batch = decodeOtlpLogs(new TextEncoder().encode(json), "application/json");

		assert.strictEqual(batch.logs[0]?.service.name, "unknown_service");
		assert.strictEqual(batch.diagnostics[0]?.code, "unknown_service");
		assert.include(batch.diagnostics[0]?.message ?? "", "OTEL_SERVICE_NAME");
	});

	it("rejects malformed identities and unsupported media types with typed errors", () => {
		const invalid = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.fromObject({
			resourceSpans: [{ scopeSpans: [{ spans: [{ traceId: Buffer.alloc(15), spanId: Buffer.alloc(8) }] }] }],
		});
		const invalidBytes = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.encode(invalid).finish();

		const invalidId = captureThrown(() => decodeOtlpTraces(invalidBytes, "application/x-protobuf"));
		assert.instanceOf(invalidId, OtlpDecodeError);
		assert.strictEqual((invalidId as OtlpDecodeError).code, "invalid_trace_id");

		const unsupported = captureThrown(() => decodeOtlpLogs(new Uint8Array(), "text/plain"));
		assert.instanceOf(unsupported, UnsupportedOtlpContentType);
		assert.strictEqual((unsupported as UnsupportedOtlpContentType).contentType, "text/plain");
	});

	it("rejects malformed protobuf instead of accepting an ad hoc shape", () => {
		const malformed = captureThrown(() =>
			decodeOtlpTraces(Uint8Array.of(0xff, 0xff, 0xff), "application/x-protobuf"),
		);
		assert.instanceOf(malformed, OtlpDecodeError);
		assert.strictEqual((malformed as OtlpDecodeError).code, "malformed_payload");
	});
});

const resourceAttributes = [
	{ key: "service.namespace", value: { stringValue: "shop" } },
	{ key: "service.name", value: { stringValue: "checkout" } },
	{ key: "deployment.environment.name", value: { stringValue: "development" } },
];

const resourceAttributesForJson = resourceAttributes.map(({ key, value }) => ({ key, value }));

const captureThrown = (operation: () => unknown): unknown => {
	try {
		operation();
	} catch (error) {
		return error;
	}
	throw new Error("Expected operation to throw.");
};
