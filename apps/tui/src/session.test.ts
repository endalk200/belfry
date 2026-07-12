import { initialWorkspaceState, transitionWorkspace } from "@belfry/workspace";
import { assert, describe, it } from "@effect/vitest";

import { decodeWorkspaceSession, encodeWorkspaceSession } from "./session.js";

describe("TUI Workspace session adapter", () => {
	it("round-trips serializable Workspace navigation and rejects invalid sessions", () => {
		const fallback = initialWorkspaceState(2_000_000_000_000n, 15, 50);
		const selected = transitionWorkspace(fallback, {
			type: "trace-selected",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		});
		const collapsed = transitionWorkspace(selected, {
			type: "span-collapse-toggled",
			spanId: "00f067aa0ba902b7",
		});
		const restored = decodeWorkspaceSession(encodeWorkspaceSession(collapsed), fallback, {
			maxLookbackNs: 3_600_000_000_000n,
		});

		assert.strictEqual(restored.selectedTraceId, selected.selectedTraceId);
		assert.deepStrictEqual(restored.collapsedSpanIds, ["00f067aa0ba902b7"]);
		assert.strictEqual(decodeWorkspaceSession("not-json", fallback), fallback);
	});

	it("lets a restored correlated log navigate after its detail is loaded", () => {
		const fallback = initialWorkspaceState(2_000_000_000_000n, 15, 100);
		const log = {
			id: "log-1",
			traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
			spanId: "00f067aa0ba902b7",
		};
		const selected = transitionWorkspace({ ...fallback, signal: "logs" }, { type: "log-selected", log });
		const restored = decodeWorkspaceSession(encodeWorkspaceSession(selected), fallback);

		assert.strictEqual(restored.selectedLogId, log.id);
		assert.isUndefined(restored.selectedLogContext);
		const correlated = transitionWorkspace(restored, { type: "correlated-trace-opened", log });
		assert.strictEqual(correlated.signal, "traces");
		assert.strictEqual(correlated.selectedTraceId, log.traceId);
		assert.strictEqual(correlated.selectedSpanId, log.spanId);
	});
});
