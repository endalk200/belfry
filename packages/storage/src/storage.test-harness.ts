import { mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { type SpanDetail, serviceIdentityKey } from "@belfry/telemetry";
import { Effect, Fiber } from "effect";

import { openTelemetryStorage } from "./index.js";
import type { LogWriteRecord } from "./types.js";

const traceId = "0123456789abcdef0123456789abcdef";
const spanId = "0123456789abcdef";
const service = { namespace: "shop", name: "checkout", environment: "test" } as const;

const spanUpsert = Effect.gen(function* () {
	const databasePath = isolatedDatabase();
	const initial = yield* Effect.scoped(
		Effect.gen(function* () {
			const storage = yield* openTelemetryStorage({ databasePath });
			const information = yield* storage.information;
			yield* storage.write({ signal: "traces", spans: [makeSpan()] });
			const first = yield* storage.searchTraces({
				fromNs: 999n,
				toNs: 2_000n,
				services: [service],
				attributes: [{ key: "http.route", operator: "equals", value: "/old" }],
				sort: "newest",
				limit: 100,
			});
			yield* storage.write({
				signal: "traces",
				spans: [
					makeSpan({
						endTimeNs: 1_800n,
						attributes: { "http.route": { type: "string", value: "/new" } },
					}),
				],
			});
			const stale = yield* storage.searchTraces({
				fromNs: 999n,
				toNs: 2_000n,
				services: [],
				attributes: [{ key: "http.route", operator: "equals", value: "/old" }],
				sort: "newest",
				limit: 100,
			});
			const detail = yield* storage.getTrace(traceId);
			const route = detail.spans[0]?.attributes["http.route"];
			return {
				journalMode: information.journalMode,
				writerRole: information.writerRole,
				readerRole: information.readerRole,
				firstMatchCount: first.items.length,
				staleMatchCount: stale.items.length,
				spanCount: detail.spanCount,
				durationNs: detail.durationNs?.toString(),
				route: route?.type === "string" ? route.value : undefined,
			};
		}),
	);
	const persistedTraceId = yield* Effect.scoped(
		Effect.gen(function* () {
			const storage = yield* openTelemetryStorage({ databasePath });
			return (yield* storage.getTrace(traceId)).traceId;
		}),
	);
	return { ...initial, persistedTraceId };
});

const logCorrelation = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		yield* storage.write({ signal: "traces", spans: [makeSpan()] });
		const result = yield* storage.write({
			signal: "logs",
			logs: [
				{
					timestampNs: 1_250n,
					observedTimeNs: 1_260n,
					service,
					severityNumber: 17,
					severityText: "ERROR",
					traceId,
					spanId,
					traceFlags: 1,
					body: { type: "string", value: "payment authorization failed" },
					attributes: { retryable: { type: "boolean", value: true } },
					resource: { attributes: {} },
					scope: { name: "test" },
				},
			],
		});
		const logs = yield* storage.searchLogs({
			fromNs: 999n,
			toNs: 2_000n,
			services: [],
			traceId,
			spanId,
			text: "authorization",
			attributes: [{ key: "retryable", operator: "equals", value: "true" }],
			sort: "oldest",
			limit: 100,
		});
		const log = yield* storage.getLog(result.logIds[0] ?? "");
		const traceLogs = yield* storage.listTraceLogs(traceId, 100);
		const correlatedSpan = yield* storage.getSpan(traceId, spanId);
		const operationFacets = yield* storage.facets({
			fromNs: 999n,
			toNs: 2_000n,
			signal: "traces",
			kind: "operation",
			services: [service],
			prefix: "POST",
			limit: 10,
		});
		const severityFacets = yield* storage.facets({
			fromNs: 999n,
			toNs: 2_000n,
			signal: "logs",
			kind: "severity",
			services: [service],
			limit: 10,
		});
		const attributeKeyFacets = yield* storage.facets({
			fromNs: 999n,
			toNs: 2_000n,
			signal: "traces",
			kind: "attribute-key",
			services: [service],
			prefix: "http",
			limit: 10,
		});
		const attributeValueFacets = yield* storage.facets({
			fromNs: 999n,
			toNs: 2_000n,
			signal: "logs",
			kind: "attribute-value",
			services: [service],
			key: "retryable",
			prefix: "t",
			limit: 10,
		});
		return {
			records: result.records,
			logIdCount: result.logIds.length,
			searchMatchCount: logs.items.length,
			body: log.body.type === "string" ? log.body.value : undefined,
			spanLogCount: correlatedSpan.logCount,
			traceLogCount: traceLogs.items.length,
			operationFacets: operationFacets.items,
			severityFacets: severityFacets.items,
			attributeKeyFacets: attributeKeyFacets.items,
			attributeValueFacets: attributeValueFacets.items,
		};
	}),
);

const nonFiniteValues = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		const values = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan({
					attributes: Object.fromEntries(
						values.map((value, index) => [`value.${index}`, { type: "double" as const, value }]),
					),
				}),
			],
		});
		const written = yield* storage.write({
			signal: "logs",
			logs: values.map((value, index) =>
				makeLog({
					traceId: undefined,
					spanId: undefined,
					timestampNs: 2_000n + BigInt(index),
					observedTimeNs: 2_000n + BigInt(index),
					body: { type: "double", value },
				}),
			),
		});
		const trace = yield* storage.getTrace(traceId);
		const logs = yield* Effect.all(written.logIds.map((id) => storage.getLog(id)));
		const render = (value: number | undefined) =>
			value === undefined ? "missing" : Number.isNaN(value) ? "NaN" : String(value);
		return {
			spanValues: values.map((_, index) => {
				const attribute = trace.spans[0]?.attributes[`value.${index}`];
				return render(attribute?.type === "double" ? attribute.value : undefined);
			}),
			logValues: logs.map((log) => render(log.body.type === "double" ? log.body.value : undefined)),
		};
	}),
);

const boundedTraceDetail = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({
			databasePath: isolatedDatabase(),
			maxTraceDetailSpans: 2,
		});
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan({ spanId: id16(1), parentSpanId: undefined, startTimeNs: 1_000n }),
				makeSpan({ spanId: id16(2), parentSpanId: id16(1), startTimeNs: 1_001n }),
				makeSpan({ spanId: id16(3), parentSpanId: id16(2), startTimeNs: 1_002n }),
			],
		});
		const trace = yield* storage.getTrace(traceId);
		const directSpan = yield* storage.getSpan(traceId, id16(3));
		return {
			spanCount: trace.spanCount,
			returnedSpanCount: trace.spans.length,
			spansTruncated: trace.spansTruncated,
			directSpanId: directSpan.spanId,
			directSpanDepth: directSpan.depth,
		};
	}),
);

const retentionCleanup = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		const recentTraceId = "fedcba9876543210fedcba9876543210";
		const recentSpanId = "fedcba9876543210";
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan(),
				makeSpan({
					traceId: recentTraceId,
					spanId: recentSpanId,
					startTimeNs: 9_000n,
					endTimeNs: 9_500n,
					attributes: { "http.route": { type: "string", value: "/recent" } },
				}),
			],
		});
		yield* storage.write({
			signal: "logs",
			logs: [
				makeLog({ body: { type: "string", value: "old retention sentinel" } }),
				makeLog({
					traceId: recentTraceId,
					spanId: recentSpanId,
					timestampNs: 9_200n,
					observedTimeNs: 9_210n,
					body: { type: "string", value: "recent retained sentinel" },
				}),
				makeLog({
					timestampNs: 9_300n,
					observedTimeNs: 9_310n,
					body: { type: "string", value: "newer correlated sentinel" },
				}),
			],
		});
		const retained = yield* storage.retain({
			nowNs: 10_000n,
			maxAgeNs: 2_000n,
			maxBytes: 9_223_372_036_854_775_807n,
			batchSize: 10,
		});
		const traces = yield* storage.searchTraces({
			fromNs: 0n,
			toNs: 10_000n,
			services: [],
			attributes: [],
			sort: "oldest",
			limit: 100,
		});
		const oldLogs = yield* storage.searchLogs({
			fromNs: 0n,
			toNs: 10_000n,
			services: [],
			text: "sentinel",
			attributes: [],
			sort: "oldest",
			limit: 100,
		});
		return {
			deletedRecords: retained.deletedRecords,
			needsMore: retained.needsMore,
			traceIds: traces.items.map((trace) => trace.traceId),
			logBodies: oldLogs.items.map((log) => log.bodyPreview),
		};
	}),
);

const sizeRetentionOrdering = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		yield* storage.write({
			signal: "traces",
			spans: [makeSpan({ startTimeNs: 5_000n, endTimeNs: 5_500n })],
		});
		yield* storage.write({
			signal: "logs",
			logs: [makeLog({ traceId: undefined, spanId: undefined })],
		});
		const first = yield* storage.retain({
			nowNs: 10_000n,
			maxAgeNs: 20_000n,
			maxBytes: 1n,
			batchSize: 1,
		});
		const afterFirst = yield* storage.searchTraces({
			fromNs: 0n,
			toNs: 10_000n,
			services: [],
			attributes: [],
			sort: "oldest",
			limit: 100,
		});
		const second = yield* storage.retain({
			nowNs: 10_000n,
			maxAgeNs: 20_000n,
			maxBytes: 1n,
			batchSize: 1,
		});
		return {
			firstDeletedRecords: first.deletedRecords,
			firstNeedsMore: first.needsMore,
			traceCountAfterFirst: afterFirst.items.length,
			secondDeletedRecords: second.deletedRecords,
			secondNeedsMore: second.needsMore,
		};
	}),
);

const timestampFallback = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		const fromNs = BigInt(Date.now() - 1_000) * 1_000_000n;
		const written = yield* storage.write({
			signal: "logs",
			logs: [
				makeLog({
					timestampNs: undefined,
					observedTimeNs: undefined,
					traceId: undefined,
					spanId: undefined,
					body: { type: "string", value: "timestamp fallback sentinel" },
				}),
			],
		});
		const toNs = BigInt(Date.now() + 1_000) * 1_000_000n;
		const page = yield* storage.searchLogs({
			fromNs,
			toNs,
			services: [],
			text: "timestamp fallback sentinel",
			attributes: [],
			sort: "newest",
			limit: 100,
		});
		const detail = yield* storage.getLog(written.logIds[0] ?? "");
		return {
			searchCount: page.items.length,
			observedTimeNs: detail.observedTimeNs?.toString(),
		};
	}),
);

const retentionFailure = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		const nowNs = BigInt(Date.now()) * 1_000_000n;
		const retained = yield* Effect.result(
			storage.retain({
				nowNs,
				maxAgeNs: 1_000_000_000n,
				maxBytes: 1_073_741_824n,
				batchSize: Number.NaN,
			}),
		);
		const health = yield* storage.health;
		const diagnostics = yield* storage.listDiagnostics(
			{ fromNs: nowNs - 60_000_000_000n, toNs: nowNs + 60_000_000_000n },
			100,
		);
		return {
			failed: retained._tag === "Failure",
			healthStatus: health.status,
			writerReady: health.writerReady,
			healthMessage: health.message,
			diagnosticCodes: diagnostics.items.map((diagnostic) => diagnostic.code),
		};
	}),
);

const retentionProgress = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		yield* storage.write({
			signal: "logs",
			logs: Array.from({ length: 250 }, (_, index) =>
				makeLog({
					traceId: undefined,
					spanId: undefined,
					timestampNs: BigInt(index + 1),
					observedTimeNs: BigInt(index + 1),
					body: { type: "string", value: `retention progress ${index}` },
				}),
			),
		});
		const fiber = yield* storage
			.retain({
				nowNs: 1_000n,
				maxAgeNs: 1n,
				maxBytes: 9_223_372_036_854_775_807n,
				batchSize: 250,
			})
			.pipe(Effect.forkChild({ startImmediately: true }));
		let observedRunning = false;
		for (let attempt = 0; attempt < 100 && !observedRunning; attempt += 1) {
			observedRunning = (yield* storage.ingestionStats).retentionRunning;
			if (!observedRunning) yield* Effect.sleep(1);
		}
		const retained = yield* Fiber.join(fiber);
		const after = yield* storage.ingestionStats;
		return {
			observedRunning,
			observedStopped: !after.retentionRunning,
			deletedRecords: retained.deletedRecords,
		};
	}),
);

const cyclicTraceStructure = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		const firstSpanId = "1111111111111111";
		const secondSpanId = "2222222222222222";
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan({ spanId: firstSpanId, parentSpanId: secondSpanId, startTimeNs: 1_000n }),
				makeSpan({ spanId: secondSpanId, parentSpanId: firstSpanId, startTimeNs: 1_100n }),
			],
		});
		const trace = yield* storage.getTrace(traceId);
		return {
			traceWarnings: trace.warnings,
			spans: trace.spans.map((span) => ({
				spanId: span.spanId,
				depth: span.depth,
				warnings: span.warnings,
			})),
		};
	}),
);

const paginationContracts = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({ databasePath: isolatedDatabase() });
		const alpha = { namespace: "shop", name: "alpha", environment: "prod" } as const;
		const beta = { namespace: "shop", name: "beta", environment: "test" } as const;
		const gamma = { namespace: "shop", name: "gamma", environment: "dev" } as const;
		const spans = [
			makeSpan({ traceId: id32(1), spanId: id16(1), service: alpha, startTimeNs: 100n, endTimeNs: 110n }),
			makeSpan({ traceId: id32(2), spanId: id16(2), service: alpha, startTimeNs: 101n, endTimeNs: 111n }),
			makeSpan({ traceId: id32(3), spanId: id16(3), service: alpha, startTimeNs: 10_000n, endTimeNs: 10_010n }),
			makeSpan({ traceId: id32(4), spanId: id16(4), service: beta, startTimeNs: 200n, endTimeNs: 210n }),
			makeSpan({ traceId: id32(5), spanId: id16(5), service: beta, startTimeNs: 201n, endTimeNs: 211n }),
			makeSpan({ traceId: id32(6), spanId: id16(6), service: gamma, startTimeNs: 50n, endTimeNs: 60n }),
		];
		yield* storage.write({ signal: "traces", spans });

		const facetRequest = {
			fromNs: 0n,
			toNs: 1_000n,
			signal: "traces" as const,
			kind: "service" as const,
			services: [],
			limit: 2,
		};
		const firstFacets = yield* storage.facets(facetRequest);
		const facetCursorItem = firstFacets.items.at(-1);
		const secondFacets =
			facetCursorItem?.service === undefined
				? { items: [], truncated: false }
				: yield* storage.facets(facetRequest, {
						sort: "slowest",
						timeNs: BigInt(facetCursorItem.count),
						id: serviceIdentityKey(facetCursorItem.service),
					});
		const environmentFacet = yield* storage.facets({ ...facetRequest, prefix: "prod", limit: 10 });

		const firstServices = yield* storage.listServices({ fromNs: 0n, toNs: 1_000n }, 1);
		const serviceCursorItem = firstServices.items.at(-1);
		const secondServices =
			serviceCursorItem === undefined
				? { items: [], truncated: false }
				: yield* storage.listServices({ fromNs: 0n, toNs: 1_000n }, 1, {
						sort: "newest",
						timeNs: serviceCursorItem.lastSeenNs,
						id: serviceIdentityKey(serviceCursorItem.service),
					});

		const correlationTraceId = id32(7);
		const correlationSpanId = id16(7);
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan({
					traceId: correlationTraceId,
					spanId: correlationSpanId,
					startTimeNs: 300n,
					endTimeNs: 400n,
				}),
			],
		});
		yield* storage.write({
			signal: "logs",
			logs: [300n, 301n, 302n].map((timestampNs) =>
				makeLog({
					traceId: correlationTraceId,
					spanId: correlationSpanId,
					timestampNs,
					observedTimeNs: timestampNs,
					body: { type: "string", value: `trace log ${timestampNs}` },
				}),
			),
		});
		const firstLogs = yield* storage.listTraceLogs(correlationTraceId, 2);
		const logCursorItem = firstLogs.items.at(-1);
		const secondLogs =
			logCursorItem === undefined
				? { items: [], truncated: false }
				: yield* storage.listTraceLogs(correlationTraceId, 2, {
						sort: "oldest",
						timeNs: logCursorItem.timestampNs ?? logCursorItem.observedTimeNs ?? 0n,
						id: logCursorItem.id,
					});

		return {
			firstFacets: firstFacets.items.map((item) => ({ name: item.service?.name, count: item.count })),
			firstFacetsTruncated: firstFacets.truncated,
			secondFacets: secondFacets.items.map((item) => ({ name: item.service?.name, count: item.count })),
			environmentFacets: environmentFacet.items.map((item) => item.service?.name),
			firstServices: firstServices.items.map((item) => ({
				name: item.service.name,
				lastSeenNs: String(item.lastSeenNs),
			})),
			secondServices: secondServices.items.map((item) => ({
				name: item.service.name,
				lastSeenNs: String(item.lastSeenNs),
			})),
			firstLogs: firstLogs.items.map((item) => String(item.timestampNs ?? item.observedTimeNs)),
			firstLogsTruncated: firstLogs.truncated,
			secondLogs: secondLogs.items.map((item) => String(item.timestampNs ?? item.observedTimeNs)),
			secondLogsTruncated: secondLogs.truncated,
		};
	}),
);

const ingestionObservability = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({
			databasePath: isolatedDatabase(),
			maxIndexedAttributesPerRecord: 1,
			maxIndexedValueBytes: 4,
		});
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan({
					attributes: {
						first: { type: "string", value: "ok" },
						second: { type: "string", value: "extra" },
					},
					droppedAttributesCount: 2,
					droppedEventsCount: 3,
					droppedLinksCount: 4,
					resource: { attributes: {}, droppedAttributesCount: 5 },
					scope: { name: "test", droppedAttributesCount: 6 },
					events: [
						{
							name: "dropped event attributes",
							timeNs: 1_100n,
							attributes: {},
							droppedAttributesCount: 7,
						},
					],
					links: [
						{
							traceId: "11111111111111111111111111111111",
							spanId: "2222222222222222",
							attributes: {},
							droppedAttributesCount: 8,
						},
					],
				}),
			],
		});
		const written = yield* storage.write({
			signal: "logs",
			logs: [
				makeLog({
					body: { type: "string", value: "x".repeat(300) },
					attributes: {
						first: { type: "string", value: "ok" },
						second: { type: "string", value: "extra" },
					},
					droppedAttributesCount: 9,
					resource: { attributes: {}, droppedAttributesCount: 10 },
					scope: { name: "test", droppedAttributesCount: 11 },
				}),
			],
		});
		const stats = yield* storage.ingestionStats;
		const trace = yield* storage.getTrace(traceId);
		const log = yield* storage.getLog(written.logIds[0] ?? "");
		return {
			droppedRecords: stats.droppedRecords.toString(),
			truncatedValues: stats.truncatedValues.toString(),
			spanFilterableKeys: trace.spans[0]?.filterableAttributeKeys,
			logFilterableKeys: log.filterableAttributeKeys,
		};
	}),
);

const boundedProjectionPolicy = Effect.scoped(
	Effect.gen(function* () {
		const storage = yield* openTelemetryStorage({
			databasePath: isolatedDatabase(),
			maxIndexedAttributesPerRecord: 10,
			maxIndexedValueBytes: 4,
			maxIndexedAttributeKeys: 2,
			maxIndexedValuesPerKey: 1,
		});
		yield* storage.write({
			signal: "traces",
			spans: [
				makeSpan({
					spanId: id16(1),
					attributes: {
						safe: { type: "string", value: "one" },
						stable: { type: "string", value: "yes" },
						customer_id: { type: "string", value: "id-1" },
						oversized: { type: "string", value: "needle" },
					},
				}),
				makeSpan({
					spanId: id16(2),
					startTimeNs: 1_001n,
					attributes: {
						safe: { type: "string", value: "two" },
						stable: { type: "string", value: "yes" },
					},
				}),
			],
		});
		const query = (text: string) =>
			storage.searchTraces({
				fromNs: 0n,
				toNs: 10_000n,
				services: [],
				text,
				attributes: [],
				sort: "newest",
				limit: 100,
			});
		const [allowed, highCardinality, oversized, cappedValue] = yield* Effect.all([
			query("one"),
			query("id-1"),
			query("needle"),
			query("two"),
		]);
		const detail = yield* storage.getTrace(traceId);
		const stats = yield* storage.ingestionStats;
		return {
			allowed: allowed.items.length,
			highCardinality: highCardinality.items.length,
			oversized: oversized.items.length,
			cappedValue: cappedValue.items.length,
			filterableKeys: detail.spans.map((span) => span.filterableAttributeKeys),
			retainedHighCardinality:
				detail.spans[0]?.attributes.customer_id?.type === "string"
					? detail.spans[0].attributes.customer_id.value
					: undefined,
			truncatedValues: stats.truncatedValues.toString(),
		};
	}),
);

const failureCode = Effect.gen(function* () {
	const directory = mkdtempSync(join(tmpdir(), "belfry-storage-failure-"));
	const blocker = join(directory, "not-a-directory");
	writeFileSync(blocker, "block");
	const opened = yield* Effect.result(
		Effect.scoped(openTelemetryStorage({ databasePath: join(blocker, "telemetry.db") })),
	);
	return { code: opened._tag === "Failure" ? opened.failure.code : "unexpected_success" };
});

const maintenanceReset = Effect.scoped(
	Effect.gen(function* () {
		const databasePath = isolatedDatabase();
		const storage = yield* openTelemetryStorage({ databasePath });
		for (let batch = 0; batch < 5; batch += 1) {
			yield* storage.write({
				signal: "logs",
				logs: Array.from({ length: 100 }, (_, index) =>
					makeLog({
						timestampNs: BigInt(10_000 + batch * 100 + index),
						body: { type: "string", value: `${batch}:${index}:${"x".repeat(4_096)}` },
					}),
				),
			});
		}
		yield* storage.checkpoint;
		const before = yield* storage.information;
		yield* storage.reset;
		const after = yield* storage.information;
		const logs = yield* storage.searchLogs({
			fromNs: 0n,
			toNs: 100_000n,
			services: [],
			attributes: [],
			sort: "newest",
			limit: 100,
		});
		const stats = yield* storage.ingestionStats;
		return {
			beforeStorageSizeBytes: before.storageSizeBytes.toString(),
			afterStorageSizeBytes: after.storageSizeBytes.toString(),
			beforeLiveDataSizeBytes: before.databaseSizeBytes.toString(),
			afterLiveDataSizeBytes: after.databaseSizeBytes.toString(),
			afterLogCount: logs.items.length,
			acceptedLogRecords: stats.acceptedLogRecords.toString(),
			databaseMode: (statSync(databasePath).mode & 0o777).toString(8),
			directoryMode: (statSync(dirname(databasePath)).mode & 0o777).toString(8),
		};
	}),
);

const scenario = process.argv[2];
const result =
	scenario === "span-upsert"
		? await Effect.runPromise(spanUpsert)
		: scenario === "log-correlation"
			? await Effect.runPromise(logCorrelation)
			: scenario === "non-finite-values"
				? await Effect.runPromise(nonFiniteValues)
				: scenario === "bounded-trace-detail"
					? await Effect.runPromise(boundedTraceDetail)
					: scenario === "maintenance-reset"
						? await Effect.runPromise(maintenanceReset)
						: scenario === "retention-cleanup"
							? await Effect.runPromise(retentionCleanup)
							: scenario === "size-retention-ordering"
								? await Effect.runPromise(sizeRetentionOrdering)
								: scenario === "timestamp-fallback"
									? await Effect.runPromise(timestampFallback)
									: scenario === "retention-failure"
										? await Effect.runPromise(retentionFailure)
										: scenario === "retention-progress"
											? await Effect.runPromise(retentionProgress)
											: scenario === "cyclic-trace-structure"
												? await Effect.runPromise(cyclicTraceStructure)
												: scenario === "pagination-contracts"
													? await Effect.runPromise(paginationContracts)
													: scenario === "ingestion-observability"
														? await Effect.runPromise(ingestionObservability)
														: scenario === "bounded-projection-policy"
															? await Effect.runPromise(boundedProjectionPolicy)
															: scenario === "failure-code"
																? await Effect.runPromise(failureCode)
																: (() => {
																		throw new Error(
																			`Unknown storage test scenario: ${scenario}`,
																		);
																	})();
console.log(`BELFRY_TEST_RESULT=${JSON.stringify(result)}`);

function isolatedDatabase() {
	return join(mkdtempSync(join(tmpdir(), "belfry-storage-")), "telemetry.db");
}

function makeLog(overrides: Partial<LogWriteRecord> = {}): LogWriteRecord {
	return {
		timestampNs: 1_250n,
		observedTimeNs: 1_260n,
		service,
		severityNumber: 9,
		severityText: "INFO",
		traceId,
		spanId,
		traceFlags: 1,
		body: { type: "string", value: "retention sentinel" } as const,
		attributes: {},
		resource: { attributes: {} },
		scope: { name: "test" },
		...overrides,
	};
}

function makeSpan(overrides: Partial<SpanDetail> = {}): SpanDetail {
	return {
		traceId,
		spanId,
		name: "POST /checkout",
		kind: 2,
		startTimeNs: 1_000n,
		endTimeNs: 1_500n,
		service,
		status: { code: 2, message: "failed" },
		attributes: { "http.route": { type: "string", value: "/old" } },
		events: [],
		links: [],
		resource: { attributes: {} },
		scope: { name: "test" },
		logCount: 0,
		warnings: [],
		...overrides,
	};
}

function id32(value: number): string {
	return value.toString(16).padStart(32, "0");
}

function id16(value: number): string {
	return value.toString(16).padStart(16, "0");
}
