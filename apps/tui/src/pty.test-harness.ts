import { workspaceScenario } from "@belfry/workspace/test-support";
import { Effect } from "effect";

import type { WorkspaceDataSource } from "./data-source.js";
import { runTui } from "./index.js";

const bounds = {
	fromNs: workspaceScenario.startNs - 60_000_000_000n,
	toNs: workspaceScenario.endNs + 60_000_000_000n,
	limit: 100,
};
const source: WorkspaceDataSource = {
	searchTraces: async () => ({ items: [workspaceScenario.traceSummary], bounds, truncated: false }),
	searchLogs: async () => ({ items: workspaceScenario.makeLogSummaries(3), bounds, truncated: false }),
	getTrace: async () => workspaceScenario.traceDetail,
	getLog: async () => workspaceScenario.logDetail,
	listCorrelatedLogs: async () => ({
		items: workspaceScenario.makeLogSummaries(3),
		bounds,
		truncated: false,
	}),
	listServices: async () => ({ items: [workspaceScenario.serviceSummary], bounds, truncated: false }),
};

await Effect.runPromise(
	runTui({
		endpoint: "http://127.0.0.1:4318",
		dataSource: source,
		refreshIntervalMs: 60_000,
		defaultRangeMinutes: 30,
		queryMaxResults: 100,
		queryMaxLookbackMinutes: 1_440,
	}),
);
process.stdout.write("BELFRY_PTY_COMPLETE\n");
