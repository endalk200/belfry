/** @jsxImportSource @opentui/react */

import { workspaceScenario } from "@belfry/workspace/test-support";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";

import { TelemetryWorkspaceView } from "./app.js";
import type { WorkspaceDataSource } from "./data-source.js";

const nowNs = workspaceScenario.endNs + 1n;
const traceId = workspaceScenario.traceId;
const trace = workspaceScenario.traceDetail;
const log = workspaceScenario.logDetail;
const service = workspaceScenario.service;

let lastTraceStatus: string | undefined;
let lastTraceAttributes: ReadonlyArray<{ readonly key: string; readonly value: string }> = [];
let lastLogTraceId: string | undefined;
let lastLogSpanId: string | undefined;
const source: WorkspaceDataSource = {
	searchTraces: async (query) => {
		lastTraceStatus = query.status;
		lastTraceAttributes = query.attributes;
		return { items: [trace], bounds: { ...query, limit: query.limit }, truncated: false };
	},
	searchLogs: async (query) => {
		lastLogTraceId = query.traceId;
		lastLogSpanId = query.spanId;
		return { items: [log], bounds: { ...query, limit: query.limit }, truncated: false };
	},
	getTrace: async () => trace,
	getLog: async () => log,
	listCorrelatedLogs: async (correlatedTraceId, correlatedSpanId) => {
		lastLogTraceId = correlatedTraceId;
		lastLogSpanId = correlatedSpanId;
		return {
			items: correlatedSpanId === undefined || log.spanId === correlatedSpanId ? [log] : [],
			bounds: { fromNs: nowNs - 60_000_000_000n, toNs: nowNs, limit: 100 },
			truncated: false,
		};
	},
	listServices: async (fromNs, toNs) => ({
		items: [
			{
				service,
				firstSeenNs: fromNs,
				lastSeenNs: toNs,
				spanCount: 1,
				logCount: 1,
				errorCount: 1,
				unknownService: false,
			},
		],
		bounds: { fromNs, toNs, limit: 100 },
		truncated: false,
	}),
};

let quit = false;
let reconnectCalls = 0;
const setup = await testRender(
	<TelemetryWorkspaceView
		endpoint="http://127.0.0.1:4318"
		dataSource={source}
		onQuit={() => {
			quit = true;
		}}
		onReconnect={async () => {
			reconnectCalls += 1;
		}}
		onOpenBrowser={async () => {
			throw new Error("Browser unavailable. Open the URL manually.");
		}}
		startupMessage="Port conflict prevented Daemon startup · press r to retry"
		refreshIntervalMs={60_000}
		defaultRangeMinutes={30}
		nowNs={nowNs}
	/>,
	{ width: 80, height: 36 },
);
try {
	await setup.waitForFrame((frame) => frame.includes("UNAVAILABLE") && frame.includes("retry"));
	await act(async () => {
		setup.mockInput.pressKey("r");
		await setup.flush();
	});
	const first = await setup.waitForFrame(
		(frame) => frame.includes("GET /checkout") && frame.includes("all Services"),
	);
	await act(async () => {
		setup.mockInput.pressKey("b");
		await setup.flush();
	});
	const browserFailure = await setup.waitForFrame((frame) =>
		frame.includes("Browser unavailable. Open the URL manually."),
	);
	await act(async () => {
		setup.mockInput.pressKey("f");
		await setup.flush();
	});
	await setup.waitForFrame((frame) => frame.includes("STRUCTURED FILTERS"));
	await act(async () => {
		setup.mockInput.pressKey("1");
		await setup.flush();
	});
	const filtered = await setup.waitForFrame((frame) => frame.includes("status=error") && lastTraceStatus === "error");
	const structuredFilters = filtered.includes("status=error") && lastTraceStatus === "error";
	await act(async () => {
		setup.mockInput.pressKey("c");
		await setup.flush();
	});
	await act(async () => {
		setup.mockInput.pressKey("f");
		await setup.flush();
	});
	await act(async () => {
		setup.mockInput.pressKey("2");
		await setup.flush();
	});
	await act(async () => {
		await setup.mockInput.typeText("GETX");
		setup.mockInput.pressBackspace();
		await setup.flush();
	});
	const editableBackspace = await setup.waitForFrame(
		(frame) => frame.includes("Operation contains") && frame.includes("Enter applies"),
	);
	await act(async () => {
		setup.mockInput.pressEnter();
		await setup.flush();
	});
	await setup.waitForFrame((frame) => frame.includes("operation=GET"));
	await act(async () => {
		setup.mockInput.pressEnter();
		await setup.flush();
	});
	const detail = await setup.waitForFrame(
		(frame) => frame.includes("WATERFALL") && frame.includes("http.route = /checkout"),
	);
	await act(async () => {
		setup.mockInput.pressKey("a");
		await setup.flush();
	});
	const promotedAttribute = await setup.waitForFrame(
		(frame) =>
			frame.includes("1 attribute") &&
			lastTraceAttributes.some((attribute) => attribute.key === "http.route" && attribute.value === "/checkout"),
	);
	await act(async () => {
		setup.mockInput.pressKey("o");
		await setup.flush();
	});
	const sorted = await setup.waitForFrame((frame) => frame.includes("Sort: oldest"));
	await act(async () => {
		setup.mockInput.pressKey("g");
		await setup.flush();
	});
	const ranged = await setup.waitForFrame((frame) => frame.includes("Range: 1h"));
	await act(async () => {
		setup.mockInput.pressKey("z");
		await setup.flush();
	});
	const zoomed = await setup.waitForFrame((frame) => frame.includes("scale ×2"));
	await act(async () => {
		setup.mockInput.pressKey("v");
		await setup.flush();
	});
	const traceLogs = await setup.waitForFrame(
		(frame) =>
			frame.includes("LOGS") &&
			frame.includes("payment declined") &&
			lastLogTraceId === traceId &&
			lastLogSpanId === undefined,
	);
	await act(async () => {
		setup.mockInput.pressArrow("left");
		await setup.flush();
	});
	await setup.waitForFrame((frame) => frame.includes("TRACES") && frame.includes("WATERFALL"));
	await act(async () => {
		setup.mockInput.pressKey("l");
		await setup.flush();
	});
	const logs = await setup.waitForFrame(
		(frame) =>
			frame.includes("LOGS") && frame.includes("payment declined") && lastLogSpanId === workspaceScenario.spanId,
	);
	await act(async () => {
		setup.mockInput.pressEnter();
		await setup.flush();
	});
	await act(async () => {
		setup.mockInput.pressKey("t");
		await setup.flush();
	});
	const correlatedTrace = await setup.waitForFrame(
		(frame) => frame.includes("TRACES") && frame.includes("SELECTED SPAN"),
	);
	await setup.mockInput.typeText("?");
	const help = await setup.waitForFrame((frame) => frame.includes("COMMANDS") && frame.includes("Service Filter"));
	setup.resize(130, 32);
	await setup.flush();
	setup.mockInput.pressKey("q");
	console.log(
		`BELFRY_TEST_RESULT=${JSON.stringify({
			recovered: reconnectCalls === 1,
			structuredFilters,
			editableBackspace: editableBackspace.includes("Operation contains"),
			initial: first.includes("all Services") && first.includes("30m"),
			browserFailure: browserFailure.includes("Open the URL manually"),
			waterfall: detail.includes("WATERFALL"),
			spanDetail: detail.includes("SELECTED SPAN") && detail.includes("http.route = /checkout"),
			promotedAttribute: promotedAttribute.includes("1 attribute"),
			sort: sorted.includes("Sort: oldest"),
			range: ranged.includes("Range: 1h"),
			zoom: zoomed.includes("scale ×2"),
			traceLogs: traceLogs.includes("payment declined"),
			logs: logs.includes("payment declined"),
			correlatedTrace: correlatedTrace.includes("00f067aa0ba902b7"),
			help: help.includes("Service Filter"),
			quit,
		})}`,
	);
} finally {
	setup.renderer.destroy();
}
