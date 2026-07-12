import { assert, describe, it } from "@effect/vitest";
import { Schema } from "effect";

import {
	canonicalSpanId,
	canonicalTraceId,
	type EncodedOtlpAnyValue,
	NanosecondsSchema,
	OtlpAnyValueSchema,
	SpanDetailSchema,
	TraceIdSchema,
} from "./model.js";

describe("telemetry schemas", () => {
	it("shares canonical identity validation with boundary adapters", () => {
		assert.strictEqual(canonicalTraceId("4bf92f3577b34da6a3ce929d0e0e4736"), "4bf92f3577b34da6a3ce929d0e0e4736");
		assert.strictEqual(canonicalTraceId("0".repeat(32)), undefined);
		assert.strictEqual(canonicalSpanId("00f067aa0ba902b7"), "00f067aa0ba902b7");
		assert.strictEqual(canonicalSpanId("BAD"), undefined);
	});

	it("decodes exact nanoseconds to bigint and encodes them as JSON-safe strings", () => {
		const timestamp = Schema.decodeUnknownSync(NanosecondsSchema)("1781420000000000001");

		assert.strictEqual(timestamp, 1781420000000000001n);
		assert.strictEqual(Schema.encodeSync(NanosecondsSchema)(timestamp), "1781420000000000001");
	});

	it("accepts only canonical lowercase non-zero trace identities", () => {
		assert.strictEqual(
			Schema.decodeUnknownSync(TraceIdSchema)("4bf92f3577b34da6a3ce929d0e0e4736"),
			"4bf92f3577b34da6a3ce929d0e0e4736",
		);

		assert.throws(() => Schema.decodeUnknownSync(TraceIdSchema)("4BF92F3577B34DA6A3CE929D0E0E4736"));
		assert.throws(() => Schema.decodeUnknownSync(TraceIdSchema)("00000000000000000000000000000000"));
	});

	it("round-trips recursive typed attribute values without flattening bytes or integers", () => {
		const encoded = {
			type: "key-value-list",
			value: {
				attempt: { type: "integer", value: "9223372036854775807" },
				payload: { type: "bytes", value: "AAH/" },
				items: {
					type: "array",
					value: [{ type: "boolean", value: true }],
				},
			},
		} satisfies EncodedOtlpAnyValue;

		const decoded = Schema.decodeUnknownSync(OtlpAnyValueSchema)(encoded);

		assert.strictEqual(decoded.type, "key-value-list");
		if (decoded.type !== "key-value-list") return;
		assert.deepStrictEqual(decoded.value.attempt, { type: "integer", value: 9223372036854775807n });
		assert.deepStrictEqual(decoded.value.payload, { type: "bytes", value: Uint8Array.of(0, 1, 255) });
		assert.deepStrictEqual(Schema.encodeSync(OtlpAnyValueSchema)(decoded), encoded);
	});

	it("validates complete span details at the public telemetry seam", () => {
		const decoded = Schema.decodeUnknownSync(SpanDetailSchema)({
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
			name: "GET /cart",
			kind: 2,
			startTimeNs: "1781420000000000001",
			service: { namespace: "shop", name: "cart", environment: "development" },
			status: { code: 0 },
			attributes: {},
			events: [],
			links: [],
			resource: { attributes: {} },
			scope: { name: "http" },
			logCount: 0,
			warnings: ["running-span"],
		});

		assert.strictEqual(decoded.startTimeNs, 1781420000000000001n);
		assert.strictEqual(decoded.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
	});
});
