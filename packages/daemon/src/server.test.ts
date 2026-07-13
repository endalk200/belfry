import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";

import { runRetentionUntilCurrent } from "./retention-schedule.js";

describe("Belfry Daemon HTTP stack", () => {
	it("drains every bounded retention batch in one maintenance cycle", async () => {
		let batches = 0;
		const result = await Effect.runPromise(
			runRetentionUntilCurrent(
				Effect.sync(() => {
					batches += 1;
					return { deletedRecords: 1, databaseSizeBytes: 1n, needsMore: batches < 3 };
				}),
			),
		);

		assert.strictEqual(batches, 3);
		assert.strictEqual(result.needsMore, false);
	});

	it("serves health, committed OTLP, bounded queries, and OpenAPI on loopback", () => {
		const result = runHarness();

		assert.strictEqual(result.host, "127.0.0.1");
		assert.strictEqual(result.cursorSecretBytes, 32);
		assert.strictEqual(result.webStatus, 200);
		assert.strictEqual(result.webHasWorkbench, true);
		assert.strictEqual(result.webHasInterfacePreferences, true);
		assert.strictEqual(result.webDeepLinkStatus, 200);
		assert.strictEqual(result.webAssetStatus, 200);
		assert.strictEqual(result.webAssetImmutable, true);
		assert.strictEqual(result.missingAssetStatus, 404);
		assert.strictEqual(result.healthStatus, 200);
		assert.strictEqual(result.healthLive, true);
		assert.strictEqual(result.otlpStatus, 200);
		assert.strictEqual(result.otlpCorsOrigin, "http://127.0.0.1:3000");
		assert.strictEqual(result.otlpPreflightStatus, 204);
		assert.strictEqual(result.otlpPreflightOrigin, "http://127.0.0.1:3000");
		assert.match(String(result.otlpPreflightMethods), /POST/u);
		assert.match(String(result.otlpPreflightHeaders), /content-encoding/u);
		assert.strictEqual(result.foreignOriginStatus, 403);
		assert.strictEqual(result.foreignOriginCors, null);
		assert.strictEqual(result.foreignHostStatus, 403);
		assert.strictEqual(result.logOtlpStatus, 200);
		assert.strictEqual(result.otlpBody, "{}");
		assert.strictEqual(result.traceCount, 1);
		assert.strictEqual(result.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
		assert.strictEqual(result.servicesFirstCount, 1);
		assert.strictEqual(result.servicesFirstTruncated, true);
		assert.strictEqual(result.servicesHasCursor, true);
		assert.strictEqual(result.servicesSecondCount, 1);
		assert.strictEqual(result.servicesSecondTruncated, false);
		assert.strictEqual(result.invalidServiceLimitStatus, 400);
		assert.strictEqual(result.invalidServiceLimitCode, "invalid_query");
		assert.match(String(result.invalidServiceLimitMessage), /Query API schema/u);
		assert.strictEqual(result.traceLogsFirstCount, 1);
		assert.strictEqual(result.traceLogsFirstTruncated, true);
		assert.strictEqual(result.traceLogsHasCursor, true);
		assert.strictEqual(result.traceLogsSecondCount, 1);
		assert.strictEqual(result.traceLogsSecondTruncated, false);
		assert.strictEqual(result.otherSpanTraceLogCount, 0);
		assert.strictEqual(result.configuredLimitStatus, 400);
		assert.strictEqual(result.configuredLookbackStatus, 400);
		assert.strictEqual(result.oversizedQueryStatus, 413);
		assert.strictEqual(result.chunkedOversizedQueryStatus, 413);
		assert.strictEqual(result.invertedServicesRangeStatus, 400);
		assert.strictEqual(result.malformedStatus, 400);
		assert.strictEqual(result.malformedCorsOrigin, null);
		assert.strictEqual(result.unsupportedStatus, 415);
		assert.strictEqual(result.unsupportedCorsOrigin, null);
		assert.strictEqual(result.oversizedStatus, 413);
		assert.strictEqual(result.oversizedCorsOrigin, null);
		assert.strictEqual(result.chunkedOversizedStatus, 413);
		assert.strictEqual(result.rejectedRequests, "4");
		assert.strictEqual(result.decodeErrors, "1");
		assert.strictEqual(result.droppedDiagnostics, "0");
		assert.isAbove(Number(result.writeLatencyP95Ms), 0);
		assert.deepStrictEqual(result.diagnosticCodes, [
			"compressed_payload_too_large",
			"compressed_payload_too_large",
			"malformed_payload",
			"unsupported_content_type",
		]);
		assert.strictEqual(result.diagnosticsFirstCount, 1);
		assert.strictEqual(result.diagnosticsFirstTruncated, true);
		assert.strictEqual(result.diagnosticsHasCursor, true);
		assert.strictEqual(result.diagnosticsSecondCount, 1);
		assert.strictEqual(result.openapiHasTraceSearch, true);
		assert.strictEqual(result.removedDocsStatus, 404);
		assert.strictEqual(result.removedDocsApiStatus, 404);
		assert.strictEqual(result.degradedHealthStatus, 200);
		assert.strictEqual(result.degradedStatus, "degraded");
		assert.strictEqual(result.degradedWriterReady, false);
		assert.strictEqual(result.degradedReadsAvailable, false);
		assert.strictEqual(result.degradedQueryStatus, 503);
		assert.strictEqual(result.degradedQueryCode, "store_unavailable");
		assert.strictEqual(result.degradedStatsStatus, 503);
		assert.strictEqual(result.degradedStatsCode, "store_unavailable");
		assert.strictEqual(
			result.degradedQueryMessage,
			"The Telemetry Store cannot complete this query. Check /api/health and ingestion diagnostics, then retry.",
		);
		assert.strictEqual(result.degradedOtlpStatus, 503);
		assert.strictEqual(result.failedWriterOtlpStatus, 503);
		assert.strictEqual(result.failedWriterHealthStatus, "degraded");
		assert.strictEqual(result.failedWriterReady, false);
		assert.match(String(result.failedWriterMessage), /writer became unavailable/u);
		assert.strictEqual(result.slowQueryStatus, 503);
		assert.strictEqual(result.slowQueryCode, "query_timeout");
		assert.isBelow(Number(result.slowQueryDurationMs), 750);
		assert.strictEqual(result.responsiveHealthStatus, 200);
		assert.isBelow(Number(result.responsiveHealthDurationMs), 250);
		assert.strictEqual(result.restartedQueryStatus, 200);
		assert.strictEqual(result.restartedQueryCount, 0);
	}, 30_000);
});

const runHarness = (): Record<string, unknown> => {
	const harness = fileURLToPath(new URL("./server.test-harness.ts", import.meta.url));
	const child = spawnSync("bun", ["--conditions=development", "run", harness], {
		cwd: process.cwd(),
		encoding: "utf8",
		env: { ...process.env, NO_COLOR: "1" },
	});
	if (child.status !== 0) {
		throw new Error(`Daemon harness failed (${child.status ?? "signal"}).\n${child.stdout}\n${child.stderr}`);
	}
	const line = child.stdout
		.split("\n")
		.reverse()
		.find((candidate: string) => candidate.startsWith("BELFRY_TEST_RESULT="));
	if (line === undefined) throw new Error(`Daemon harness returned no result.\n${child.stdout}`);
	return JSON.parse(line.slice("BELFRY_TEST_RESULT=".length)) as Record<string, unknown>;
};
