import { mkdirSync, mkdtempSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type BelfryConfiguration, defaultBelfryConfiguration } from "@belfry/config";
import { failingWriterWorkerUrl } from "@belfry/ingestion/test-support";
import { Effect } from "effect";

import { startDaemonServer } from "./server.js";

const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
const spanId = "00f067aa0ba902b7";
const stateDirectory = mkdtempSync(join(tmpdir(), "belfry-daemon-"));
const port = await availablePort();
const configuration: BelfryConfiguration = {
	...defaultBelfryConfiguration,
	daemon: {
		...defaultBelfryConfiguration.daemon,
		host: "127.0.0.1",
		port,
		stateDirectory,
		registryPath: join(stateDirectory, "daemon.json"),
		lockPath: join(stateDirectory, "daemon.lock"),
	},
	storage: {
		...defaultBelfryConfiguration.storage,
		databasePath: join(stateDirectory, "telemetry.db"),
	},
	query: {
		...defaultBelfryConfiguration.query,
		cursorSecretPath: join(stateDirectory, "cursor.key"),
		maxLookbackNs: 3_600_000_000_000n,
		maxResults: 100,
	},
	ingestion: {
		...defaultBelfryConfiguration.ingestion,
		maxCompressedBytes: 8_192,
		maxDecompressedBytes: 32_768,
	},
};
const degradedStateDirectory = mkdtempSync(join(tmpdir(), "belfry-daemon-degraded-"));
const degradedDatabasePath = join(degradedStateDirectory, "telemetry.db");
mkdirSync(degradedDatabasePath);
const degradedPort = await availablePort();
const degradedConfiguration: BelfryConfiguration = {
	...defaultBelfryConfiguration,
	daemon: {
		...defaultBelfryConfiguration.daemon,
		host: "127.0.0.1",
		port: degradedPort,
		stateDirectory: degradedStateDirectory,
		registryPath: join(degradedStateDirectory, "daemon.json"),
		lockPath: join(degradedStateDirectory, "daemon.lock"),
	},
	storage: { ...defaultBelfryConfiguration.storage, databasePath: degradedDatabasePath },
	query: {
		...defaultBelfryConfiguration.query,
		cursorSecretPath: join(degradedStateDirectory, "cursor.key"),
	},
};
const failedWriterStateDirectory = mkdtempSync(join(tmpdir(), "belfry-daemon-failed-writer-"));
const failedWriterPort = await availablePort();
const failedWriterConfiguration: BelfryConfiguration = {
	...defaultBelfryConfiguration,
	daemon: {
		...defaultBelfryConfiguration.daemon,
		host: "127.0.0.1",
		port: failedWriterPort,
		stateDirectory: failedWriterStateDirectory,
		registryPath: join(failedWriterStateDirectory, "daemon.json"),
		lockPath: join(failedWriterStateDirectory, "daemon.lock"),
	},
	storage: {
		...defaultBelfryConfiguration.storage,
		databasePath: join(failedWriterStateDirectory, "telemetry.db"),
	},
	ingestion: { ...defaultBelfryConfiguration.ingestion, drainTimeoutMs: 100 },
	query: {
		...defaultBelfryConfiguration.query,
		cursorSecretPath: join(failedWriterStateDirectory, "cursor.key"),
	},
};
const slowQueryStateDirectory = mkdtempSync(join(tmpdir(), "belfry-daemon-slow-query-"));
const slowQueryPort = await availablePort();
const slowQueryConfiguration: BelfryConfiguration = {
	...defaultBelfryConfiguration,
	daemon: {
		...defaultBelfryConfiguration.daemon,
		host: "127.0.0.1",
		port: slowQueryPort,
		stateDirectory: slowQueryStateDirectory,
		registryPath: join(slowQueryStateDirectory, "daemon.json"),
		lockPath: join(slowQueryStateDirectory, "daemon.lock"),
	},
	storage: {
		...defaultBelfryConfiguration.storage,
		databasePath: join(slowQueryStateDirectory, "telemetry.db"),
	},
	query: {
		...defaultBelfryConfiguration.query,
		timeoutMs: 75,
		cursorSecretPath: join(slowQueryStateDirectory, "cursor.key"),
	},
};

const result = await Effect.runPromise(
	Effect.scoped(
		Effect.gen(function* () {
			const daemon = yield* startDaemonServer({ configuration });
			const webRoot = yield* Effect.promise(() => fetch(`${daemon.endpoint}/traces`));
			const webRootBody = yield* Effect.promise(() => webRoot.text());
			const webDeepLink = yield* Effect.promise(() => fetch(`${daemon.endpoint}/traces/${traceId}`));
			const assetName = webRootBody.match(/\/assets\/([^"']+\.js)/u)?.[1];
			const webAsset = yield* Effect.promise(() =>
				assetName === undefined ? Promise.resolve(undefined) : fetch(`${daemon.endpoint}/assets/${assetName}`),
			);
			const missingAsset = yield* Effect.promise(() => fetch(`${daemon.endpoint}/assets/not-present.js`));
			const healthResponse = yield* Effect.promise(() => fetch(`${daemon.endpoint}/api/health`));
			const health = (yield* Effect.promise(() => healthResponse.json())) as { live: boolean };
			const otlpResponse = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/traces`, {
					method: "POST",
					headers: { "content-type": "application/json; charset=utf-8" },
					body: JSON.stringify(tracePayload()),
				}),
			);
			const otlpBody = yield* Effect.promise(() => otlpResponse.text());
			const otlpPreflight = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/traces`, {
					method: "OPTIONS",
					headers: {
						origin: "http://127.0.0.1:3000",
						"access-control-request-method": "POST",
						"access-control-request-headers": "content-type,content-encoding",
					},
				}),
			);
			const logOtlpResponse = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/logs`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(logPayload()),
				}),
			);
			const traceResponse = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/traces/search`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						fromNs: "1781419000000000000",
						toNs: "1781421000000000000",
						services: [],
						attributes: [],
						sort: "newest",
						limit: 100,
					}),
				}),
			);
			const tracePage = (yield* Effect.promise(() => traceResponse.json())) as {
				items: ReadonlyArray<{ traceId: string }>;
			};
			const servicesFirst = (yield* Effect.promise(() =>
				fetch(
					`${daemon.endpoint}/api/services?fromNs=1781419000000000000&toNs=1781421000000000000&limit=1`,
				).then((response) => response.json()),
			)) as { items: ReadonlyArray<unknown>; nextCursor?: string; truncated: boolean };
			const servicesSecond = (yield* Effect.promise(() =>
				fetch(
					`${daemon.endpoint}/api/services?fromNs=1781419000000000000&toNs=1781421000000000000&limit=1&cursor=${encodeURIComponent(servicesFirst.nextCursor ?? "")}`,
				).then((response) => response.json()),
			)) as { items: ReadonlyArray<unknown>; truncated: boolean };
			const invalidServiceLimit = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/services?fromNs=1781419000000000000&toNs=1781421000000000000&limit=0`),
			);
			const invalidServiceLimitBody = (yield* Effect.promise(() => invalidServiceLimit.json())) as {
				code: string;
				message: string;
			};
			const traceLogsFirst = (yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/traces/${traceId}/logs?limit=1`).then((response) => response.json()),
			)) as { items: ReadonlyArray<{ id: string }>; nextCursor?: string; truncated: boolean };
			const traceLogsSecond = (yield* Effect.promise(() =>
				fetch(
					`${daemon.endpoint}/api/traces/${traceId}/logs?limit=1&cursor=${encodeURIComponent(traceLogsFirst.nextCursor ?? "")}`,
				).then((response) => response.json()),
			)) as { items: ReadonlyArray<{ id: string }>; truncated: boolean };
			const otherSpanTraceLogs = (yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/traces/${traceId}/logs?limit=100&spanId=ffffffffffffffff`).then(
					(response) => response.json(),
				),
			)) as { items: ReadonlyArray<{ id: string }> };
			const configuredLimit = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/traces/search`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						fromNs: "1781419000000000000",
						toNs: "1781421000000000000",
						services: [],
						attributes: [],
						sort: "newest",
						limit: 101,
					}),
				}),
			);
			const configuredLookback = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/logs/search`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						fromNs: "1781410000000000000",
						toNs: "1781421000000000000",
						services: [],
						attributes: [],
						sort: "newest",
						limit: 100,
					}),
				}),
			);
			const invertedServicesRange = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/services?fromNs=20&toNs=10&limit=100`),
			);
			const malformed = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/traces`, {
					method: "POST",
					headers: { "content-type": "application/x-protobuf" },
					body: Uint8Array.of(0xff, 0xff),
				}),
			);
			const unsupported = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/logs`, {
					method: "POST",
					headers: { "content-type": "text/plain" },
					body: "hello",
				}),
			);
			const oversized = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/logs`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: new Uint8Array(8_193),
				}),
			);
			const chunkedOversized = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/v1/logs`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: new ReadableStream<Uint8Array>({
						start(controller) {
							controller.enqueue(new Uint8Array(4_097));
							controller.enqueue(new Uint8Array(4_096));
							controller.close();
						},
					}),
				}),
			);
			const ingestionStats = (yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/api/ingestion/stats`).then((response) => response.json()),
			)) as {
				rejectedRequests: string;
				decodeErrors: string;
				droppedDiagnostics: string;
				writeLatencyP95Ms: number;
			};
			const diagnosticToNs = BigInt(Date.now()) * 1_000_000n;
			const diagnosticFromNs = diagnosticToNs - 60_000_000_000n;
			const diagnostics = (yield* Effect.promise(() =>
				fetch(
					`${daemon.endpoint}/api/ingestion/diagnostics?fromNs=${diagnosticFromNs}&toNs=${diagnosticToNs}&limit=100`,
				).then((response) => response.json()),
			)) as { items: ReadonlyArray<{ code: string }> };
			const diagnosticsFirst = (yield* Effect.promise(() =>
				fetch(
					`${daemon.endpoint}/api/ingestion/diagnostics?fromNs=${diagnosticFromNs}&toNs=${diagnosticToNs}&limit=1`,
				).then((response) => response.json()),
			)) as { items: ReadonlyArray<unknown>; nextCursor?: string; truncated: boolean };
			const diagnosticsSecond = (yield* Effect.promise(() =>
				fetch(
					`${daemon.endpoint}/api/ingestion/diagnostics?fromNs=${diagnosticFromNs}&toNs=${diagnosticToNs}&limit=1&cursor=${encodeURIComponent(diagnosticsFirst.nextCursor ?? "")}`,
				).then((response) => response.json()),
			)) as { items: ReadonlyArray<unknown>; truncated: boolean };
			const openapi = (yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/openapi.json`).then((r) => r.json()),
			)) as {
				paths: Record<string, unknown>;
			};
			const docs = yield* Effect.promise(() =>
				fetch(`${daemon.endpoint}/docs/belfry-debug`).then((r) => r.text()),
			);
			const degradedDaemon = yield* startDaemonServer({ configuration: degradedConfiguration });
			const degradedHealthResponse = yield* Effect.promise(() => fetch(`${degradedDaemon.endpoint}/api/health`));
			const degradedHealth = (yield* Effect.promise(() => degradedHealthResponse.json())) as {
				status: string;
				writerReady: boolean;
				readsAvailable: boolean;
			};
			const degradedDocs = yield* Effect.promise(() => fetch(`${degradedDaemon.endpoint}/docs/troubleshooting`));
			const degradedQuery = yield* Effect.promise(() =>
				fetch(`${degradedDaemon.endpoint}/api/traces/search`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						fromNs: "1781419000000000000",
						toNs: "1781421000000000000",
						services: [],
						attributes: [],
						sort: "newest",
						limit: 100,
					}),
				}),
			);
			const degradedQueryBody = (yield* Effect.promise(() => degradedQuery.json())) as {
				code: string;
				message: string;
			};
			const degradedStats = yield* Effect.promise(() => fetch(`${degradedDaemon.endpoint}/api/ingestion/stats`));
			const degradedStatsBody = (yield* Effect.promise(() => degradedStats.json())) as { code: string };
			const degradedOtlp = yield* Effect.promise(() =>
				fetch(`${degradedDaemon.endpoint}/v1/traces`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(tracePayload()),
				}),
			);
			const failedWriterDaemon = yield* startDaemonServer({
				configuration: failedWriterConfiguration,
				ingestionWorkerUrl: failingWriterWorkerUrl,
			});
			const failedWriterOtlp = yield* Effect.promise(() =>
				fetch(`${failedWriterDaemon.endpoint}/v1/traces`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(tracePayload()),
				}),
			);
			const failedWriterHealth = (yield* Effect.promise(() =>
				fetch(`${failedWriterDaemon.endpoint}/api/health`).then((response) => response.json()),
			)) as { status: string; writerReady: boolean; message?: string };
			const slowQueryDaemon = yield* startDaemonServer({
				configuration: slowQueryConfiguration,
				queryWorkerUrl: new URL("./test-support/slow-query-worker.ts", import.meta.url),
			});
			const slowQueryStartedAt = performance.now();
			const slowQueryPromise = fetch(`${slowQueryDaemon.endpoint}/api/traces/search`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					fromNs: "1",
					toNs: "2",
					services: [],
					attributes: [],
					sort: "newest",
					limit: 1,
				}),
			});
			yield* Effect.sleep(10);
			const responsiveHealthStartedAt = performance.now();
			const responsiveHealth = yield* Effect.promise(() => fetch(`${slowQueryDaemon.endpoint}/api/health`));
			const responsiveHealthDurationMs = performance.now() - responsiveHealthStartedAt;
			const slowQuery = yield* Effect.promise(() => slowQueryPromise);
			const slowQueryDurationMs = performance.now() - slowQueryStartedAt;
			const slowQueryBody = (yield* Effect.promise(() => slowQuery.json())) as { code: string };
			const restartedQuery = yield* Effect.promise(() =>
				fetch(`${slowQueryDaemon.endpoint}/api/logs/search`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						fromNs: "1",
						toNs: "2",
						services: [],
						attributes: [],
						sort: "newest",
						limit: 1,
					}),
				}),
			);
			const restartedQueryBody = (yield* Effect.promise(() => restartedQuery.json())) as { code: string };

			return {
				host: daemon.host,
				webStatus: webRoot.status,
				webHasWorkbench: webRootBody.includes("Belfry · Local observability"),
				webHasInterfacePreferences:
					webRootBody.includes("data-refresh-interval-ms=") &&
					webRootBody.includes("data-default-range-minutes="),
				webDeepLinkStatus: webDeepLink.status,
				webAssetStatus: webAsset?.status,
				webAssetImmutable: webAsset?.headers.get("cache-control")?.includes("immutable"),
				missingAssetStatus: missingAsset.status,
				healthStatus: healthResponse.status,
				healthLive: health.live,
				otlpStatus: otlpResponse.status,
				otlpCorsOrigin: otlpResponse.headers.get("access-control-allow-origin"),
				otlpPreflightStatus: otlpPreflight.status,
				otlpPreflightMethods: otlpPreflight.headers.get("access-control-allow-methods"),
				otlpPreflightHeaders: otlpPreflight.headers.get("access-control-allow-headers"),
				logOtlpStatus: logOtlpResponse.status,
				otlpBody,
				traceCount: tracePage.items.length,
				traceId: tracePage.items[0]?.traceId,
				servicesFirstCount: servicesFirst.items.length,
				servicesFirstTruncated: servicesFirst.truncated,
				servicesHasCursor: typeof servicesFirst.nextCursor === "string",
				servicesSecondCount: servicesSecond.items.length,
				servicesSecondTruncated: servicesSecond.truncated,
				invalidServiceLimitStatus: invalidServiceLimit.status,
				invalidServiceLimitCode: invalidServiceLimitBody.code,
				invalidServiceLimitMessage: invalidServiceLimitBody.message,
				traceLogsFirstCount: traceLogsFirst.items.length,
				traceLogsFirstTruncated: traceLogsFirst.truncated,
				traceLogsHasCursor: typeof traceLogsFirst.nextCursor === "string",
				traceLogsSecondCount: traceLogsSecond.items.length,
				traceLogsSecondTruncated: traceLogsSecond.truncated,
				otherSpanTraceLogCount: otherSpanTraceLogs.items.length,
				configuredLimitStatus: configuredLimit.status,
				configuredLookbackStatus: configuredLookback.status,
				invertedServicesRangeStatus: invertedServicesRange.status,
				malformedStatus: malformed.status,
				malformedCorsOrigin: malformed.headers.get("access-control-allow-origin"),
				unsupportedStatus: unsupported.status,
				unsupportedCorsOrigin: unsupported.headers.get("access-control-allow-origin"),
				oversizedStatus: oversized.status,
				oversizedCorsOrigin: oversized.headers.get("access-control-allow-origin"),
				chunkedOversizedStatus: chunkedOversized.status,
				rejectedRequests: ingestionStats.rejectedRequests,
				decodeErrors: ingestionStats.decodeErrors,
				droppedDiagnostics: ingestionStats.droppedDiagnostics,
				writeLatencyP95Ms: ingestionStats.writeLatencyP95Ms,
				diagnosticCodes: diagnostics.items.map((diagnostic) => diagnostic.code).sort(),
				diagnosticsFirstCount: diagnosticsFirst.items.length,
				diagnosticsFirstTruncated: diagnosticsFirst.truncated,
				diagnosticsHasCursor: typeof diagnosticsFirst.nextCursor === "string",
				diagnosticsSecondCount: diagnosticsSecond.items.length,
				openapiHasTraceSearch: Object.hasOwn(openapi.paths, "/api/traces/search"),
				docsHasEvidenceWorkflow: docs.includes("evidence-first"),
				degradedHealthStatus: degradedHealthResponse.status,
				degradedStatus: degradedHealth.status,
				degradedWriterReady: degradedHealth.writerReady,
				degradedReadsAvailable: degradedHealth.readsAvailable,
				degradedDocsStatus: degradedDocs.status,
				degradedQueryStatus: degradedQuery.status,
				degradedQueryCode: degradedQueryBody.code,
				degradedQueryMessage: degradedQueryBody.message,
				degradedStatsStatus: degradedStats.status,
				degradedStatsCode: degradedStatsBody.code,
				degradedOtlpStatus: degradedOtlp.status,
				failedWriterOtlpStatus: failedWriterOtlp.status,
				failedWriterHealthStatus: failedWriterHealth.status,
				failedWriterReady: failedWriterHealth.writerReady,
				failedWriterMessage: failedWriterHealth.message,
				slowQueryStatus: slowQuery.status,
				slowQueryCode: slowQueryBody.code,
				slowQueryDurationMs,
				responsiveHealthStatus: responsiveHealth.status,
				responsiveHealthDurationMs,
				restartedQueryStatus: restartedQuery.status,
				restartedQueryCode: restartedQueryBody.code,
			};
		}),
	),
);

console.log(`BELFRY_TEST_RESULT=${JSON.stringify(result)}`);

function tracePayload() {
	return {
		resourceSpans: [
			{
				resource: {
					attributes: [
						{ key: "service.namespace", value: { stringValue: "tests" } },
						{ key: "service.name", value: { stringValue: "daemon" } },
						{ key: "deployment.environment.name", value: { stringValue: "integration" } },
					],
				},
				scopeSpans: [
					{
						scope: { name: "integration" },
						spans: [
							{
								traceId,
								spanId,
								name: "GET /daemon",
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

function logPayload() {
	return {
		resourceLogs: [
			{
				resource: { attributes: [{ key: "service.name", value: { stringValue: "daemon" } }] },
				scopeLogs: [
					{
						scope: { name: "integration" },
						logRecords: [
							{
								timeUnixNano: "1781420000000500001",
								body: { stringValue: "first correlated log" },
								traceId,
								spanId,
							},
							{
								timeUnixNano: "1781420000000600001",
								body: { stringValue: "second correlated log" },
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

function availablePort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address === null || typeof address === "string") {
				server.close();
				reject(new Error("Could not allocate an integration test port."));
				return;
			}
			server.close((error) => (error === undefined ? resolve(address.port) : reject(error)));
		});
	});
}
