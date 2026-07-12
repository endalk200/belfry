import { assert, describe, it } from "@effect/vitest";
import { Schema } from "effect";
import { OpenApi } from "effect/unstable/httpapi";

import {
	BelfryApi,
	FacetRequestSchema,
	LogSearchRequestSchema,
	PagedTimeRangeQuerySchema,
	TraceSearchRequestSchema,
} from "./index.js";

describe("Belfry Query API contract", () => {
	it("validates bounded trace and log search requests", () => {
		const trace = Schema.decodeUnknownSync(TraceSearchRequestSchema)({
			fromNs: "1781420000000000000",
			toNs: "1781430000000000000",
			services: [],
			attributes: [],
			sort: "newest",
			limit: 100,
		});
		const logs = Schema.decodeUnknownSync(LogSearchRequestSchema)({
			fromNs: "1781420000000000000",
			toNs: "1781430000000000000",
			services: [],
			attributes: [],
			sort: "oldest",
			limit: 200,
		});

		assert.strictEqual(trace.fromNs, 1781420000000000000n);
		assert.strictEqual(logs.toNs, 1781430000000000000n);
		assert.throws(() =>
			Schema.decodeUnknownSync(TraceSearchRequestSchema)({
				fromNs: "20",
				toNs: "10",
				services: [],
				attributes: [],
				sort: "newest",
				limit: 100,
			}),
		);
		assert.throws(() =>
			Schema.decodeUnknownSync(LogSearchRequestSchema)({
				fromNs: "10",
				toNs: "20",
				services: [],
				attributes: [],
				sort: "newest",
				limit: 0,
			}),
		);
		assert.deepStrictEqual(
			Schema.decodeUnknownSync(PagedTimeRangeQuerySchema)({
				fromNs: "10",
				toNs: "20",
				limit: 1,
				cursor: "opaque",
			}),
			{ fromNs: 10n, toNs: 20n, limit: 1, cursor: "opaque" },
		);
		assert.throws(() =>
			Schema.decodeUnknownSync(PagedTimeRangeQuerySchema)({ fromNs: "10", toNs: "20", limit: 0 }),
		);
	});

	it("validates facet pagination and signal-specific facet kinds", () => {
		const serviceFacet = Schema.decodeUnknownSync(FacetRequestSchema)({
			fromNs: "10",
			toNs: "20",
			signal: "traces",
			kind: "service",
			services: [],
			prefix: "prod",
			limit: 10,
			cursor: "opaque",
		});

		assert.strictEqual(serviceFacet.cursor, "opaque");
		assert.throws(() =>
			Schema.decodeUnknownSync(FacetRequestSchema)({
				fromNs: "10",
				toNs: "20",
				signal: "logs",
				kind: "operation",
				services: [],
				limit: 10,
			}),
		);
		assert.throws(() =>
			Schema.decodeUnknownSync(FacetRequestSchema)({
				fromNs: "10",
				toNs: "20",
				signal: "traces",
				kind: "severity",
				services: [],
				limit: 10,
			}),
		);
	});

	it("generates the documented bounded human-and-agent API from the declarations", () => {
		const document = OpenApi.fromApi(BelfryApi);
		const paths = Object.keys(document.paths).sort();

		assert.include(paths, "/api/health");
		assert.include(paths, "/api/services");
		assert.include(paths, "/api/traces/search");
		assert.include(paths, "/api/traces/{traceId}");
		assert.include(paths, "/api/traces/{traceId}/logs");
		assert.include(paths, "/api/logs/search");
		assert.include(paths, "/api/logs/{logId}");
		assert.include(paths, "/api/facets");
		assert.include(paths, "/api/ingestion/stats");
		assert.include(paths, "/api/ingestion/diagnostics");
		assert.include(paths, "/api/docs");
		assert.notInclude(paths, "/api/sql");
		assert.notInclude(paths, "/api/metrics");
		assert.strictEqual(document.info.title, "Belfry Query API");
	});
});
