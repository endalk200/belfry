import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

describe("Ingestion Admission", () => {
	it("writes JSON and gzip OTLP through the typed Bun writer worker before acknowledging", () => {
		const result = runHarness();

		assert.strictEqual(result.reservedBeforeBody, true);
		assert.strictEqual(result.traceRecords, 1);
		assert.strictEqual(result.logRecords, 1);
		assert.strictEqual(result.nonFiniteTraceRecords, 1);
		assert.strictEqual(result.nonFiniteLogRecords, 3);
		assert.strictEqual(result.afterNonFiniteRecords, 1);
		assert.deepStrictEqual(result.nonFiniteTraceValues, ["NaN", "Infinity", "-Infinity"]);
		assert.deepStrictEqual(result.nonFiniteLogValues, ["NaN", "Infinity", "-Infinity"]);
		assert.strictEqual(result.traceCount, 3);
		assert.strictEqual(result.logCount, 4);
		assert.strictEqual(result.originalTracePresent, true);
		assert.strictEqual(result.malformedCode, "malformed_payload");
		assert.strictEqual(result.oversizedStage, "compressed");
		assert.strictEqual(result.decompressedLimit, 65_536);
		assert.isAbove(Number(result.decompressedActual), 65_536);
		assert.strictEqual(result.rejectedRequests, "3");
		assert.strictEqual(result.decodeErrors, "1");
		assert.strictEqual(result.queueDepth, 0);
		assert.strictEqual(result.unpersistedRejectedRequests, "0");
		assert.strictEqual(result.droppedDiagnostics, "0");
		assert.isAbove(Number(result.writeLatencyP95Ms), 0);
		assert.isBelow(Number(result.rejectionLatencyMs), 150);
		assert.strictEqual(result.writerFailure, undefined);
		assert.deepStrictEqual(result.failedWorker, {
			submitFailed: true,
			accepting: false,
			writerFailure:
				"The telemetry writer became unavailable; restart the Belfry Daemon after checking storage and retention diagnostics.",
			unpersistedRejectedRequests: "1",
			droppedDiagnostics: "1",
		});
	});
});

const runHarness = (): Record<string, unknown> => {
	const harness = fileURLToPath(new URL("./admission.test-harness.ts", import.meta.url));
	const child = spawnSync("bun", ["--conditions=development", "run", harness], {
		cwd: process.cwd(),
		encoding: "utf8",
		env: { ...process.env, NO_COLOR: "1" },
	});
	if (child.status !== 0) {
		throw new Error(`Ingestion harness failed (${child.status ?? "signal"}).\n${child.stdout}\n${child.stderr}`);
	}
	const line = child.stdout
		.split("\n")
		.reverse()
		.find((candidate: string) => candidate.startsWith("BELFRY_TEST_RESULT="));
	if (line === undefined) throw new Error(`Ingestion harness returned no result.\n${child.stdout}`);
	return JSON.parse(line.slice("BELFRY_TEST_RESULT=".length)) as Record<string, unknown>;
};
