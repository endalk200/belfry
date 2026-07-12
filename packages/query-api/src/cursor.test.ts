import { assert, describe, it } from "@effect/vitest";
import { Schema } from "effect";
import { decodeCursor, encodeCursor } from "./cursor.js";
import { InvalidQuery, TraceSearchRequestSchema } from "./index.js";

const secret = new TextEncoder().encode("test-only cursor secret with enough entropy");

describe("opaque query cursors", () => {
	it("round-trips a versioned position tied to the exact query", async () => {
		const query = makeQuery();
		const position = { sort: "newest" as const, timeNs: 1781420000000000001n, id: "trace-17" };

		const cursor = await encodeCursor(position, query, secret);
		const decoded = await decodeCursor(cursor, query, secret);

		assert.deepStrictEqual(decoded, position);
		assert.notInclude(cursor, "trace-17");
	});

	it("rejects tampering and reuse with incompatible filters", async () => {
		const query = makeQuery();
		const cursor = await encodeCursor(
			{ sort: "newest", timeNs: 1781420000000000001n, id: "trace-17" },
			query,
			secret,
		);
		const tampered = `${cursor.slice(0, -1)}${cursor.endsWith("a") ? "b" : "a"}`;

		const tamperError = await captureRejection(() => decodeCursor(tampered, query, secret));
		assert.instanceOf(tamperError, InvalidQuery);
		assert.strictEqual((tamperError as InvalidQuery).code, "invalid_cursor");

		const changedQuery = { ...query, text: "different" };
		const mismatchError = await captureRejection(() => decodeCursor(cursor, changedQuery, secret));
		assert.instanceOf(mismatchError, InvalidQuery);
		assert.strictEqual((mismatchError as InvalidQuery).code, "invalid_cursor");
	});
});

const makeQuery = () =>
	Schema.decodeUnknownSync(TraceSearchRequestSchema)({
		fromNs: "1781420000000000000",
		toNs: "1781430000000000000",
		services: [{ namespace: "shop", name: "checkout", environment: "development" }],
		attributes: [],
		sort: "newest",
		limit: 100,
	});

const captureRejection = async (operation: () => Promise<unknown>): Promise<unknown> => {
	try {
		await operation();
	} catch (error) {
		return error;
	}
	throw new Error("Expected operation to reject.");
};
