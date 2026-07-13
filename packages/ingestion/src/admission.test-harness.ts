import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { opentelemetry } from "@belfry/otlp-proto";
import { openTelemetryReader } from "@belfry/storage";
import { Effect, Fiber } from "effect";

import { openIngestionAdmission } from "./admission.js";
import { failingWriterWorkerUrl } from "./test-support.js";

const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
const spanId = "00f067aa0ba902b7";
const stateDirectory = mkdtempSync(join(tmpdir(), "belfry-ingestion-"));
const databasePath = join(stateDirectory, "telemetry.db");
const encoder = new TextEncoder();

const program = Effect.scoped(
	Effect.gen(function* () {
		const admission = yield* openIngestionAdmission({
			storage: { databasePath },
			maxCompressedBytes: 16_384,
			maxDecompressedBytes: 65_536,
			queueRequestCapacity: 4,
			queueByteCapacity: 65_536,
			writerTimeoutMs: 5_000,
			drainTimeoutMs: 5_000,
			retentionMaxAgeNs: 604_800_000_000_000n,
			retentionMaxBytes: 1_073_741_824n,
			retentionBatchSize: 100,
		});
		const reservation = yield* admission.reserve(
			{ signal: "traces", contentType: "application/json", contentEncoding: "identity" },
			4_096,
		);
		const reservedSnapshot = yield* admission.snapshot;
		yield* reservation.release;
		const releasedSnapshot = yield* admission.snapshot;
		const traceResult = yield* admission.submit({
			signal: "traces",
			contentType: "application/json; charset=utf-8",
			body: encoder.encode(JSON.stringify(tracePayload())),
		});
		const logBytes = encoder.encode(JSON.stringify(logPayload()));
		const logResult = yield* admission.submit({
			signal: "logs",
			contentType: "application/json",
			contentEncoding: "gzip",
			body: new Uint8Array(Bun.gzipSync(logBytes)),
		});
		const nonFiniteTraceResult = yield* admission.submit({
			signal: "traces",
			contentType: "application/x-protobuf",
			body: nonFiniteTracePayload(),
		});
		const nonFiniteLogResult = yield* admission.submit({
			signal: "logs",
			contentType: "application/x-protobuf",
			body: nonFiniteLogPayload(),
		});
		const afterNonFiniteResult = yield* admission.submit({
			signal: "traces",
			contentType: "application/json",
			body: encoder.encode(JSON.stringify(tracePayload("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbb"))),
		});

		const malformed = yield* Effect.result(
			admission.submit({
				signal: "traces",
				contentType: "application/x-protobuf",
				body: Uint8Array.of(0xff, 0xff),
			}),
		);
		const oversized = yield* Effect.result(
			admission.submit({
				signal: "logs",
				contentType: "application/json",
				body: new Uint8Array(16_385),
			}),
		);
		const decompressedOversized = yield* Effect.result(
			admission.submit({
				signal: "logs",
				contentType: "application/json",
				contentEncoding: "gzip",
				body: new Uint8Array(
					Bun.gzipSync(encoder.encode(JSON.stringify({ resourceLogs: [], padding: "x".repeat(70_000) }))),
				),
			}),
		);
		const reader = yield* openTelemetryReader({ databasePath });
		const traces = yield* reader.searchTraces({
			fromNs: 1_781_419_000_000_000_000n,
			toNs: 1_781_421_000_000_000_000n,
			services: [],
			attributes: [],
			sort: "newest",
			limit: 100,
		});
		const logs = yield* reader.searchLogs({
			fromNs: 1_781_419_000_000_000_000n,
			toNs: 1_781_421_000_000_000_000n,
			services: [],
			attributes: [],
			sort: "newest",
			limit: 100,
		});
		const nonFiniteTrace = yield* reader.getTrace("11111111111111111111111111111111");
		const nonFiniteLogs = yield* Effect.all(nonFiniteLogResult.logIds.map((id) => reader.getLog(id)));
		const snapshot = yield* admission.snapshot;
		const stats = yield* reader.ingestionStats;
		return {
			reservedBeforeBody:
				reservedSnapshot.queueDepth === 1 &&
				reservedSnapshot.queueBytes === 4_096 &&
				releasedSnapshot.queueDepth === 0,
			traceRecords: traceResult.records,
			logRecords: logResult.records,
			nonFiniteTraceRecords: nonFiniteTraceResult.records,
			nonFiniteLogRecords: nonFiniteLogResult.records,
			afterNonFiniteRecords: afterNonFiniteResult.records,
			nonFiniteTraceValues: ["nan", "positive", "negative"].map((key) => {
				const value = nonFiniteTrace.spans[0]?.attributes[key];
				return displayNumber(value?.type === "double" ? value.value : undefined);
			}),
			nonFiniteLogValues: nonFiniteLogs.map((log) =>
				displayNumber(log.body.type === "double" ? log.body.value : undefined),
			),
			traceCount: traces.items.length,
			logCount: logs.items.length,
			originalTracePresent: traces.items.some((trace) => trace.traceId === traceId),
			malformedCode:
				malformed._tag === "Failure" && "code" in malformed.failure ? malformed.failure.code : undefined,
			oversizedStage:
				oversized._tag === "Failure" && "stage" in oversized.failure ? oversized.failure.stage : undefined,
			decompressedLimit:
				decompressedOversized._tag === "Failure" && "limitBytes" in decompressedOversized.failure
					? decompressedOversized.failure.limitBytes
					: undefined,
			decompressedActual:
				decompressedOversized._tag === "Failure" && "actualBytes" in decompressedOversized.failure
					? decompressedOversized.failure.actualBytes
					: undefined,
			rejectedRequests: stats.rejectedRequests.toString(),
			decodeErrors: stats.decodeErrors.toString(),
			queueDepth: snapshot.queueDepth,
			unpersistedRejectedRequests: snapshot.unpersistedRejectedRequests.toString(),
			droppedDiagnostics: snapshot.droppedDiagnostics.toString(),
			writeLatencyP95Ms: snapshot.writeLatencyP95Ms,
			writerFailure: snapshot.writerFailure,
		};
	}),
);

const result = await Effect.runPromise(program);
const failedWorker = await Effect.runPromise(
	Effect.scoped(
		Effect.gen(function* () {
			const admission = yield* openIngestionAdmission({
				storage: { databasePath: join(stateDirectory, "unused-failing-worker.db") },
				maxCompressedBytes: 16_384,
				maxDecompressedBytes: 65_536,
				queueRequestCapacity: 2,
				queueByteCapacity: 32_768,
				writerTimeoutMs: 100,
				drainTimeoutMs: 100,
				retentionMaxAgeNs: 604_800_000_000_000n,
				retentionMaxBytes: 1_073_741_824n,
				retentionBatchSize: 100,
				workerUrl: failingWriterWorkerUrl,
			});
			const submitted = yield* Effect.result(
				admission.submit({
					signal: "traces",
					contentType: "application/json",
					body: encoder.encode(JSON.stringify(tracePayload())),
				}),
			);
			const snapshot = yield* admission.snapshot;
			return {
				submitFailed: submitted._tag === "Failure",
				accepting: snapshot.accepting,
				writerFailure: snapshot.writerFailure,
				unpersistedRejectedRequests: snapshot.unpersistedRejectedRequests.toString(),
				droppedDiagnostics: snapshot.droppedDiagnostics.toString(),
			};
		}),
	),
);
const rejectionLatencyMs = await Effect.runPromise(
	Effect.scoped(
		Effect.gen(function* () {
			const admission = yield* openIngestionAdmission({
				storage: { databasePath: join(stateDirectory, "unused-slow-worker.db") },
				maxCompressedBytes: 16_384,
				maxDecompressedBytes: 65_536,
				queueRequestCapacity: 2,
				queueByteCapacity: 32_768,
				writerTimeoutMs: 2_000,
				drainTimeoutMs: 2_000,
				retentionMaxAgeNs: 604_800_000_000_000n,
				retentionMaxBytes: 1_073_741_824n,
				retentionBatchSize: 100,
				workerUrl: new URL("./test-support/slow-writer-worker.ts", import.meta.url),
			});
			const pending = yield* admission
				.submit({
					signal: "traces",
					contentType: "application/json",
					body: encoder.encode("{}"),
				})
				.pipe(Effect.forkChild({ startImmediately: true }));
			yield* Effect.sleep(25);
			const startedAt = performance.now();
			yield* Effect.result(admission.reserve({ signal: "logs", contentType: "text/plain" }, 5));
			const durationMs = performance.now() - startedAt;
			yield* Fiber.join(pending);
			return durationMs;
		}),
	),
);
console.log(`BELFRY_TEST_RESULT=${JSON.stringify({ ...result, failedWorker, rejectionLatencyMs })}`);

function tracePayload(nextTraceId = traceId, nextSpanId = spanId) {
	return {
		resourceSpans: [
			{
				resource: { attributes: resourceAttributes() },
				scopeSpans: [
					{
						scope: { name: "integration" },
						spans: [
							{
								traceId: nextTraceId,
								spanId: nextSpanId,
								name: "GET /ready",
								kind: 2,
								startTimeUnixNano: "1781420000000000001",
								endTimeUnixNano: "1781420000001000001",
								status: { code: 1 },
							},
						],
					},
				],
			},
		],
	};
}

function nonFiniteTracePayload(): Uint8Array {
	const request = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.fromObject({
		resourceSpans: [
			{
				resource: { attributes: resourceAttributes() },
				scopeSpans: [
					{
						spans: [
							{
								traceId: Buffer.from("11111111111111111111111111111111", "hex"),
								spanId: Buffer.from("2222222222222222", "hex"),
								name: "non-finite doubles",
								startTimeUnixNano: "1781420000002000001",
								endTimeUnixNano: "1781420000002000002",
								attributes: [
									{ key: "nan", value: { doubleValue: Number.NaN } },
									{ key: "positive", value: { doubleValue: Number.POSITIVE_INFINITY } },
									{ key: "negative", value: { doubleValue: Number.NEGATIVE_INFINITY } },
								],
							},
						],
					},
				],
			},
		],
	});
	return new Uint8Array(opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.encode(request).finish());
}

function nonFiniteLogPayload(): Uint8Array {
	const request = opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.fromObject({
		resourceLogs: [
			{
				resource: { attributes: resourceAttributes() },
				scopeLogs: [
					{
						logRecords: [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].map(
							(value, index) => ({
								timeUnixNano: String(1_781_420_000_003_000_001n + BigInt(index)),
								body: { doubleValue: value },
							}),
						),
					},
				],
			},
		],
	});
	return new Uint8Array(opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.encode(request).finish());
}

function displayNumber(value: number | undefined): string {
	return value === undefined ? "missing" : Number.isNaN(value) ? "NaN" : String(value);
}

function logPayload() {
	return {
		resourceLogs: [
			{
				resource: { attributes: resourceAttributes() },
				scopeLogs: [
					{
						scope: { name: "integration" },
						logRecords: [
							{
								timeUnixNano: "1781420000000500001",
								severityNumber: 9,
								severityText: "INFO",
								body: { stringValue: "ready" },
								traceId,
								spanId,
							},
						],
					},
				],
			},
		],
	};
}

function resourceAttributes() {
	return [
		{ key: "service.namespace", value: { stringValue: "tests" } },
		{ key: "service.name", value: { stringValue: "worker" } },
		{ key: "deployment.environment.name", value: { stringValue: "integration" } },
	];
}
