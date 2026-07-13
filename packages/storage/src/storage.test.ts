import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

describe("Telemetry Storage", () => {
	it("migrates a WAL store, materializes traces, and replaces stale span projections", () => {
		const result = runHarness("span-upsert");

		assert.strictEqual(result.journalMode, "wal");
		assert.strictEqual(result.writerRole, "read-write");
		assert.strictEqual(result.readerRole, "read-only");
		assert.strictEqual(result.firstMatchCount, 1);
		assert.strictEqual(result.staleMatchCount, 0);
		assert.strictEqual(result.spanCount, 1);
		assert.strictEqual(result.durationNs, "800");
		assert.strictEqual(result.route, "/new");
		assert.strictEqual(result.persistedTraceId, "0123456789abcdef0123456789abcdef");
	});

	it("stores typed logs and follows trace and span correlation", () => {
		const result = runHarness("log-correlation");

		assert.strictEqual(result.records, 1);
		assert.strictEqual(result.logIdCount, 1);
		assert.strictEqual(result.searchMatchCount, 1);
		assert.strictEqual(result.body, "payment authorization failed");
		assert.strictEqual(result.spanLogCount, 1);
		assert.strictEqual(result.traceLogCount, 1);
		assert.deepStrictEqual(result.operationFacets, [{ value: "POST /checkout", count: 1 }]);
		assert.deepStrictEqual(result.severityFacets, [{ value: "17", count: 1 }]);
		assert.deepStrictEqual(result.attributeKeyFacets, [{ value: "http.route", count: 1 }]);
		assert.deepStrictEqual(result.attributeValueFacets, [{ value: "true", count: 1 }]);
	});

	it("round-trips non-finite OTLP doubles without corrupting stored details", () => {
		const result = runHarness("non-finite-values");

		assert.deepStrictEqual(result.spanValues, ["NaN", "Infinity", "-Infinity"]);
		assert.deepStrictEqual(result.logValues, ["NaN", "Infinity", "-Infinity"]);
	});

	it("bounds trace details while keeping direct span lookup available", () => {
		const result = runHarness("bounded-trace-detail");

		assert.strictEqual(result.spanCount, 3);
		assert.strictEqual(result.returnedSpanCount, 2);
		assert.strictEqual(result.spansTruncated, true);
		assert.strictEqual(result.directSpanId, "0000000000000003");
		assert.strictEqual(result.directSpanDepth, 2);
	});

	it("resets telemetry, reclaims file space, and keeps local state private", () => {
		const result = runHarness("maintenance-reset");

		assert.isAbove(Number(result.beforeStorageSizeBytes), Number(result.afterStorageSizeBytes));
		assert.isAbove(Number(result.beforeLiveDataSizeBytes), Number(result.afterLiveDataSizeBytes));
		assert.strictEqual(result.afterLogCount, 0);
		assert.strictEqual(result.acceptedLogRecords, "0");
		assert.strictEqual(result.databaseMode, "600");
		assert.strictEqual(result.directoryMode, "700");
	});

	it("deletes oldest telemetry and its search projections in bounded retention", () => {
		const result = runHarness("retention-cleanup");

		assert.strictEqual(result.deletedRecords, 2);
		assert.strictEqual(result.needsMore, false);
		assert.deepStrictEqual(result.traceIds, ["fedcba9876543210fedcba9876543210"]);
		assert.deepStrictEqual(result.logBodies, ["recent retained sentinel", "newer correlated sentinel"]);
	});

	it("applies size retention in global oldest-first order and terminates when empty", () => {
		const result = runHarness("size-retention-ordering");

		assert.strictEqual(result.firstDeletedRecords, 1);
		assert.strictEqual(result.firstNeedsMore, true);
		assert.strictEqual(result.traceCountAfterFirst, 1);
		assert.strictEqual(result.secondDeletedRecords, 1);
		assert.strictEqual(result.secondNeedsMore, false);
	});

	it("assigns an observable timestamp to accepted logs that omit both OTLP time fields", () => {
		const result = runHarness("timestamp-fallback");

		assert.strictEqual(result.searchCount, 1);
		assert.match(String(result.observedTimeNs), /^\d+$/u);
	});

	it("persists retention failures in degraded health and diagnostics", () => {
		const result = runHarness("retention-failure");

		assert.strictEqual(result.failed, true);
		assert.strictEqual(result.healthStatus, "degraded");
		assert.strictEqual(result.writerReady, false);
		assert.match(String(result.healthMessage), /retention failed/u);
		assert.include(result.diagnosticCodes as Array<string>, "retention_failed");
	});

	it("publishes retention progress outside the deletion transaction", () => {
		const result = runHarness("retention-progress");

		assert.strictEqual(result.observedRunning, true);
		assert.strictEqual(result.observedStopped, true);
		assert.strictEqual(result.deletedRecords, 250);
	});

	it("returns explicit depth and cycle warnings for multi-span parent cycles", () => {
		const result = runHarness("cyclic-trace-structure");

		assert.include(result.traceWarnings as Array<string>, "cycle");
		assert.deepStrictEqual(
			(result.spans as Array<{ depth: number; warnings: Array<string> }>).map((span) => span.depth),
			[0, 1],
		);
		for (const span of result.spans as Array<{ warnings: Array<string> }>) {
			assert.include(span.warnings, "cycle");
		}
	});

	it("paginates facets, bounded-range Services, and trace logs without duplicates or omissions", () => {
		const result = runHarness("pagination-contracts");

		assert.deepStrictEqual(result.firstFacets, [
			{ name: "alpha", count: 2 },
			{ name: "beta", count: 2 },
		]);
		assert.strictEqual(result.firstFacetsTruncated, true);
		assert.deepStrictEqual(result.secondFacets, [{ name: "gamma", count: 1 }]);
		assert.deepStrictEqual(result.environmentFacets, ["alpha"]);
		assert.deepStrictEqual(result.firstServices, [{ name: "beta", lastSeenNs: "201" }]);
		assert.deepStrictEqual(result.secondServices, [{ name: "alpha", lastSeenNs: "101" }]);
		assert.deepStrictEqual(result.firstLogs, ["300", "301"]);
		assert.strictEqual(result.firstLogsTruncated, true);
		assert.deepStrictEqual(result.secondLogs, ["302"]);
		assert.strictEqual(result.secondLogsTruncated, false);
	});

	it("counts OTLP-declared drops and bounded projection truncation", () => {
		const result = runHarness("ingestion-observability");

		assert.strictEqual(result.droppedRecords, "65");
		assert.strictEqual(result.truncatedValues, "3");
		assert.deepStrictEqual(result.spanFilterableKeys, ["first"]);
		assert.deepStrictEqual(result.logFilterableKeys, ["first"]);
	});

	it("keeps high-cardinality, oversized, and excess distinct values out of scalar and FTS indexes", () => {
		const result = runHarness("bounded-projection-policy");

		assert.strictEqual(result.allowed, 1);
		assert.strictEqual(result.highCardinality, 0);
		assert.strictEqual(result.oversized, 0);
		assert.strictEqual(result.cappedValue, 0);
		assert.deepStrictEqual(result.filterableKeys, [["safe", "stable"], ["stable"]]);
		assert.strictEqual(result.retainedHighCardinality, "id-1");
		assert.strictEqual(result.truncatedValues, "3");
	});

	it("preserves the stable open failure code", () => {
		const result = runHarness("failure-code");

		assert.strictEqual(result.code, "open_failed");
	});
});

const runHarness = (scenario: string): Record<string, unknown> => {
	const harness = fileURLToPath(new URL("./storage.test-harness.ts", import.meta.url));
	const child = spawnSync("bun", ["--conditions=development", "run", harness, scenario], {
		cwd: process.cwd(),
		encoding: "utf8",
		env: { ...process.env, NO_COLOR: "1" },
	});
	if (child.status !== 0) {
		throw new Error(`Storage harness failed (${child.status ?? "signal"}).\n${child.stdout}\n${child.stderr}`);
	}
	const line = child.stdout
		.split("\n")
		.reverse()
		.find((candidate: string) => candidate.startsWith("BELFRY_TEST_RESULT="));
	if (line === undefined) throw new Error(`Storage harness returned no result.\n${child.stdout}`);
	return JSON.parse(line.slice("BELFRY_TEST_RESULT=".length)) as Record<string, unknown>;
};
