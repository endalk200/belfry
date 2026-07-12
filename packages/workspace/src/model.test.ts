import type { LogSummary, ServiceIdentity, SpanDetail } from "@belfry/telemetry";
import { assert, describe, it } from "@effect/vitest";
import {
	advanceWorkspaceTimeRange,
	buildTraceWaterfall,
	initialWorkspaceState,
	reconcileSelection,
	transitionWorkspace,
} from "./model.js";

const checkoutService: ServiceIdentity = {
	namespace: "shop",
	name: "checkout",
	environment: "development",
};

const paymentService: ServiceIdentity = {
	namespace: "shop",
	name: "payment",
	environment: "development",
};

describe("Telemetry Workspace", () => {
	it("bypasses then restores Service Filters while moving through complete correlated logs", () => {
		const filtered = transitionWorkspace(initialWorkspaceState(), {
			type: "service-filter-changed",
			services: [checkoutService, paymentService],
		});
		const previouslyFiltered = transitionWorkspace(filtered, {
			type: "log-query-changed",
			query: {
				text: "old search",
				minimumSeverity: 17,
				attributes: [{ key: "http.route", operator: "equals", value: "/old" }],
			},
		});
		const selected = transitionWorkspace(previouslyFiltered, {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		});
		const logs = transitionWorkspace(selected, { type: "trace-logs-opened" });

		assert.deepStrictEqual(logs.serviceFilter, []);
		assert.deepStrictEqual(logs.logQuery.services, []);
		assert.strictEqual(logs.signal, "logs");
		assert.strictEqual(logs.logQuery.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
		assert.strictEqual(logs.logQuery.spanId, undefined);
		assert.strictEqual(logs.logQuery.text, undefined);
		assert.strictEqual(logs.logQuery.minimumSeverity, undefined);
		assert.deepStrictEqual(logs.logQuery.attributes, []);
		assert.strictEqual(logs.logQuery.sort, "oldest");
		assert.deepStrictEqual(logs.logCorrelation, {
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
		});
		assert.strictEqual(logs.selectedTraceId, "4bf92f3577b34da6a3ce929d0e0e4736");
		const restored = transitionWorkspace(logs, { type: "back" });
		assert.deepStrictEqual(restored.serviceFilter, [checkoutService, paymentService]);
		assert.deepStrictEqual(restored.logQuery.services, [checkoutService, paymentService]);
	});

	it("opens a correlated log's complete trace and focuses its span", () => {
		const log: Pick<LogSummary, "id" | "traceId" | "spanId"> = {
			id: "log-17",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		};
		const filtered = transitionWorkspace(initialWorkspaceState(), {
			type: "service-filter-changed",
			services: [checkoutService],
		});
		const selectedLog = transitionWorkspace(filtered, {
			type: "log-selected",
			log,
		});
		const trace = transitionWorkspace(selectedLog, { type: "correlated-trace-opened" });

		assert.strictEqual(trace.signal, "traces");
		assert.strictEqual(trace.selectedTraceId, log.traceId);
		assert.strictEqual(trace.selectedSpanId, log.spanId);
		assert.strictEqual(trace.selectedLogId, undefined);
		assert.deepStrictEqual(trace.serviceFilter, []);
		assert.deepStrictEqual(trace.traceQuery.services, []);
		const restored = transitionWorkspace(trace, { type: "back" });
		assert.deepStrictEqual(restored.serviceFilter, [checkoutService]);
		assert.strictEqual(restored.selectedLogId, log.id);
		assert.deepStrictEqual(restored.selectedLogContext, log);
	});

	it("falls back explicitly when a selected record disappears on refresh", () => {
		const selected = transitionWorkspace(initialWorkspaceState(), {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		});
		const retained = transitionWorkspace(selected, {
			type: "results-refreshed",
			signal: "traces",
			ids: [selected.selectedTraceId ?? ""],
			truncated: false,
		});
		const retainedBeyondPage = transitionWorkspace(retained, {
			type: "results-refreshed",
			signal: "traces",
			ids: [],
			truncated: true,
		});
		const removed = transitionWorkspace(retainedBeyondPage, {
			type: "results-refreshed",
			signal: "traces",
			ids: [],
			truncated: false,
		});

		assert.strictEqual(retained.selectedTraceId, selected.selectedTraceId);
		assert.strictEqual(retainedBeyondPage.selectedTraceId, selected.selectedTraceId);
		assert.strictEqual(removed.selectedTraceId, undefined);
		assert.strictEqual(removed.selectedSpanId, undefined);
	});

	it("reconciles a stale restored span to the loaded trace's first valid span", () => {
		const selected = transitionWorkspace(initialWorkspaceState(), {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "ffffffffffffffff",
		});
		const reconciled = transitionWorkspace(selected, {
			type: "trace-detail-loaded",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanIds: ["00f067aa0ba902b7", "00f067aa0ba902b8"],
		});

		assert.strictEqual(reconciled.selectedSpanId, "00f067aa0ba902b7");
	});

	it("promotes a scalar detail attribute into the active signal filter", () => {
		const filtered = transitionWorkspace(initialWorkspaceState(2_000_000_000_000n), {
			type: "attribute-filter-promoted",
			signal: "traces",
			key: "http.method",
			value: "GET",
		});

		assert.deepStrictEqual(filtered.traceQuery.attributes, [
			{ key: "http.method", operator: "equals", value: "GET" },
		]);
		assert.strictEqual(filtered.traceQuery.cursor, undefined);
	});

	it("advances a live recent range without changing its duration", () => {
		const initial = initialWorkspaceState(2_000_000_000_000n);
		const advanced = advanceWorkspaceTimeRange(initial, 2_060_000_000_000n);

		assert.strictEqual(advanced.traceQuery.toNs, 2_060_000_000_000n);
		assert.strictEqual(advanced.traceQuery.fromNs, 1_160_000_000_000n);
		assert.strictEqual(advanced.logQuery.toNs, 2_060_000_000_000n);
	});

	it("derives the initial live window from the configured interface range", () => {
		const initial = initialWorkspaceState(2_000_000_000_000n, 30);

		assert.strictEqual(initial.traceQuery.fromNs, 200_000_000_000n);
		assert.strictEqual(initial.liveRangeDurationNs, 1_800_000_000_000n);
	});

	it("owns filter clearing, live-range presets, and detail closing for every renderer", () => {
		const initial = initialWorkspaceState(2_000_000_000_000n);
		const filtered = transitionWorkspace(initial, {
			type: "trace-query-changed",
			query: { text: "checkout", status: "error", sort: "slowest" },
		});
		const cleared = transitionWorkspace(filtered, { type: "filters-cleared" });
		assert.strictEqual(cleared.traceQuery.text, undefined);
		assert.strictEqual(cleared.traceQuery.status, undefined);
		assert.strictEqual(cleared.traceQuery.sort, "slowest");
		assert.strictEqual(cleared.traceQuery.fromNs, initial.traceQuery.fromNs);

		const ranged = transitionWorkspace(cleared, {
			type: "live-range-changed",
			toNs: 3_000_000_000_000n,
			durationNs: 300_000_000_000n,
		});
		assert.strictEqual(ranged.traceQuery.fromNs, 2_700_000_000_000n);
		assert.strictEqual(ranged.logQuery.toNs, 3_000_000_000_000n);
		assert.strictEqual(ranged.liveRangeDurationNs, 300_000_000_000n);

		const selected = transitionWorkspace(ranged, {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		});
		const closed = transitionWorkspace(selected, { type: "detail-closed", detail: "trace" });
		assert.strictEqual(closed.selectedTraceId, undefined);
		assert.strictEqual(closed.selectedSpanId, undefined);
	});

	it("orders a waterfall parent-before-child and identifies structural warnings", () => {
		const spans = [
			span({ spanId: "bbbbbbbbbbbbbbbb", parentSpanId: "aaaaaaaaaaaaaaaa", startTimeNs: 120n, endTimeNs: 180n }),
			span({ spanId: "dddddddddddddddd", parentSpanId: "eeeeeeeeeeeeeeee", startTimeNs: 130n, endTimeNs: 150n }),
			span({ spanId: "aaaaaaaaaaaaaaaa", parentSpanId: undefined, startTimeNs: 100n, endTimeNs: 200n }),
			span({
				spanId: "cccccccccccccccc",
				parentSpanId: "aaaaaaaaaaaaaaaa",
				startTimeNs: 110n,
				endTimeNs: undefined,
			}),
		];

		const rows = buildTraceWaterfall(spans, new Set());

		assert.deepStrictEqual(
			rows.map((row) => [row.span.spanId, row.depth]),
			[
				["aaaaaaaaaaaaaaaa", 0],
				["cccccccccccccccc", 1],
				["bbbbbbbbbbbbbbbb", 1],
				["dddddddddddddddd", 0],
			],
		);
		assert.include(rows[1]?.warnings ?? [], "running-span");
		assert.include(rows[3]?.warnings ?? [], "missing-parent");
	});

	it("hides descendants of a collapsed span without losing their detail", () => {
		const spans = [
			span({ spanId: "aaaaaaaaaaaaaaaa", parentSpanId: undefined, startTimeNs: 100n, endTimeNs: 300n }),
			span({ spanId: "bbbbbbbbbbbbbbbb", parentSpanId: "aaaaaaaaaaaaaaaa", startTimeNs: 120n, endTimeNs: 200n }),
			span({ spanId: "cccccccccccccccc", parentSpanId: "bbbbbbbbbbbbbbbb", startTimeNs: 140n, endTimeNs: 180n }),
		];

		const rows = buildTraceWaterfall(spans, new Set(["aaaaaaaaaaaaaaaa"]));

		assert.deepStrictEqual(
			rows.map((row) => row.span.spanId),
			["aaaaaaaaaaaaaaaa"],
		);
		assert.strictEqual(rows[0]?.hiddenDescendantCount, 2);
	});

	it("scopes collapsed spans to the selected trace", () => {
		const first = transitionWorkspace(initialWorkspaceState(), {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "aaaaaaaaaaaaaaaa",
		});
		const collapsed = transitionWorkspace(first, { type: "span-collapse-toggled", spanId: "aaaaaaaaaaaaaaaa" });
		const sameTrace = transitionWorkspace(collapsed, {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
		});
		const nextTrace = transitionWorkspace(sameTrace, {
			type: "trace-selected",
			traceId: "11111111111111111111111111111111",
		});

		assert.deepStrictEqual(sameTrace.collapsedSpanIds, ["aaaaaaaaaaaaaaaa"]);
		assert.deepStrictEqual(nextTrace.collapsedSpanIds, []);
	});

	it("preserves selection by identity across refresh and safely falls back when it disappears", () => {
		assert.deepStrictEqual(reconcileSelection(["one", "two", "three"], "two", 1), {
			selectedId: "two",
			selectedIndex: 1,
			anchorIndex: 1,
		});
		assert.deepStrictEqual(reconcileSelection(["one", "three"], "two", 1), {
			selectedId: "three",
			selectedIndex: 1,
			anchorIndex: 1,
		});
		assert.deepStrictEqual(reconcileSelection([], "two", 1), {
			selectedId: undefined,
			selectedIndex: -1,
			anchorIndex: 0,
		});
	});
});

const span = (overrides: Pick<SpanDetail, "spanId" | "parentSpanId" | "startTimeNs" | "endTimeNs">): SpanDetail => ({
	traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
	name: overrides.spanId,
	service: checkoutService,
	kind: 2,
	status: { code: 0 },
	attributes: {},
	events: [],
	links: [],
	resource: { attributes: {} },
	scope: { name: "test" },
	logCount: 0,
	warnings: [],
	...overrides,
});
