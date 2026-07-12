import { assert, describe, it } from "@effect/vitest";

import { initialWorkspaceState, transitionWorkspace, workspaceFromUrl, workspaceToUrl } from "./index.js";

describe("Workspace URL adapter", () => {
	it("restores route, filters, selection, sort, and pause while degrading invalid identities", () => {
		const state = transitionWorkspace(initialWorkspaceState(1_800_000_000_000_000_000n), {
			type: "service-filter-changed",
			services: [{ namespace: "shop", name: "checkout", environment: "test" }],
		});
		const selected = transitionWorkspace(state, {
			type: "span-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		});
		const paused = transitionWorkspace(selected, { type: "refresh-pause-toggled" });
		const url = workspaceToUrl(paused);
		const restored = workspaceFromUrl(new URL(url, "http://127.0.0.1"), initialWorkspaceState());

		assert.strictEqual(restored.selectedTraceId, selected.selectedTraceId);
		assert.strictEqual(restored.selectedSpanId, selected.selectedSpanId);
		assert.deepStrictEqual(restored.serviceFilter, state.serviceFilter);
		assert.strictEqual(restored.refreshPaused, true);

		const invalid = workspaceFromUrl(new URL("http://127.0.0.1/traces/not-an-id?span=bad"));
		assert.strictEqual(invalid.selectedTraceId, undefined);
		assert.strictEqual(invalid.selectedSpanId, undefined);
	});

	it("round-trips bounded log correlation, severity, and attribute filters", () => {
		const initial = initialWorkspaceState(1_800_000_000_000_000_000n);
		const state = transitionWorkspace(transitionWorkspace(initial, { type: "signal-changed", signal: "logs" }), {
			type: "log-query-changed",
			query: {
				traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
				spanId: "00f067aa0ba902b7",
				minimumSeverity: 13,
				attributes: [{ key: "http.method", operator: "equals", value: "GET" }],
			},
		});
		const restored = workspaceFromUrl(new URL(workspaceToUrl(state), "http://127.0.0.1"), initial);

		assert.strictEqual(restored.signal, "logs");
		assert.strictEqual(restored.logQuery.traceId, state.logQuery.traceId);
		assert.strictEqual(restored.logQuery.spanId, state.logQuery.spanId);
		assert.strictEqual(restored.logQuery.minimumSeverity, 13);
		assert.deepStrictEqual(restored.logQuery.attributes, state.logQuery.attributes);
	});

	it("round-trips exact correlated-log mode independently of ordinary log filters", () => {
		const initial = initialWorkspaceState(1_800_000_000_000_000_000n);
		const selected = transitionWorkspace(initial, {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		});
		const correlated = transitionWorkspace(selected, { type: "span-logs-opened" });
		const restored = workspaceFromUrl(new URL(workspaceToUrl(correlated), "http://127.0.0.1"), initial);

		assert.deepStrictEqual(restored.logCorrelation, correlated.logCorrelation);
		assert.strictEqual(restored.logQuery.sort, "oldest");
	});

	it("degrades inverted, oversized, and internally inconsistent URL filters to valid fallback bounds", () => {
		const fallback = initialWorkspaceState(100_000_000_000n, 1);
		const restored = workspaceFromUrl(
			new URL(
				"http://127.0.0.1/traces?from=9000&to=1000&live=1&minimumDuration=20&maximumDuration=10&minimumSeverity=20&maximumSeverity=10",
			),
			fallback,
			{ maxLookbackNs: 60_000_000_000n },
		);

		assert.strictEqual(restored.traceQuery.fromNs, fallback.traceQuery.fromNs);
		assert.strictEqual(restored.traceQuery.toNs, fallback.traceQuery.toNs);
		assert.strictEqual(restored.liveRangeDurationNs, fallback.liveRangeDurationNs);
		assert.strictEqual(restored.traceQuery.minimumDurationNs, fallback.traceQuery.minimumDurationNs);
		assert.strictEqual(restored.traceQuery.maximumDurationNs, fallback.traceQuery.maximumDurationNs);
		assert.strictEqual(restored.logQuery.minimumSeverity, fallback.logQuery.minimumSeverity);
		assert.strictEqual(restored.logQuery.maximumSeverity, fallback.logQuery.maximumSeverity);
	});

	it("clamps crafted URL collections and text to Query API schema limits", () => {
		const fallback = initialWorkspaceState(1_800_000_000_000_000_000n);
		const oversized = {
			...fallback,
			signal: "logs" as const,
			serviceFilter: Array.from({ length: 105 }, (_, index) => ({ name: `service-${index}` })),
			logQuery: {
				...fallback.logQuery,
				services: Array.from({ length: 105 }, (_, index) => ({ name: `service-${index}` })),
				text: "x".repeat(5_000),
				attributes: Array.from({ length: 40 }, (_, index) => ({
					key: `attribute-${index}`,
					operator: "equals" as const,
					value: "value",
				})),
			},
		};
		const restored = workspaceFromUrl(new URL(workspaceToUrl(oversized), "http://127.0.0.1"), fallback);

		assert.strictEqual(restored.serviceFilter.length, 100);
		assert.strictEqual(restored.logQuery.services.length, 100);
		assert.strictEqual(restored.logQuery.attributes.length, 32);
		assert.strictEqual(restored.logQuery.text?.length, 4_096);
	});
});
