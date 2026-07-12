import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

describe("Ingestion Admission", () => {
	it("writes JSON and gzip OTLP through the typed Bun writer worker before acknowledging", () => {
		const result = runHarness();

		assert.strictEqual(result.reservedBeforeBody, true);
		assert.strictEqual(result.traceRecords, 1);
		assert.strictEqual(result.logRecords, 1);
		assert.strictEqual(result.traceCount, 1);
		assert.strictEqual(result.logCount, 1);
		assert.strictEqual(result.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
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
