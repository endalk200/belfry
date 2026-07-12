import { transitionWorkspace, type WorkspaceState } from "@belfry/workspace";

import type { NavigationLevel } from "./navigation.js";

export type TuiCommandId =
	| "back"
	| "collapse"
	| "copy-id"
	| "cycle-range"
	| "cycle-sort"
	| "diagnostics"
	| "filter-service"
	| "filters"
	| "help"
	| "move-down"
	| "move-up"
	| "open"
	| "open-browser"
	| "open-span-logs"
	| "open-trace"
	| "open-trace-logs"
	| "pause"
	| "promote-attribute"
	| "quit"
	| "refresh"
	| "search"
	| "switch-signal"
	| "zoom";

export type TuiCommandContext = {
	readonly workspace: WorkspaceState;
	readonly navigationLevel: NavigationLevel;
	readonly hasRows: boolean;
	readonly hasWaterfallRows: boolean;
	readonly selectedStableId?: string;
	readonly selectedLogTraceId?: string;
	readonly canOpenBrowser: boolean;
	readonly nowNs: bigint;
	readonly queryMaxLookbackMinutes: number;
};

export type TuiCommandRuntime = TuiCommandContext & {
	readonly updateWorkspace: (transition: (workspace: WorkspaceState) => WorkspaceState) => void;
	readonly move: (delta: -1 | 1) => void;
	readonly open: () => void;
	readonly back: () => void;
	readonly switchSignal: () => void;
	readonly beginSearch: () => void;
	readonly cycleService: () => void;
	readonly openFilters: () => void;
	readonly promoteAttribute: () => void;
	readonly refresh: () => void;
	readonly resetList: () => void;
	readonly openTraceLogs: () => void;
	readonly openSpanLogs: () => void;
	readonly openCorrelatedTrace: () => void;
	readonly copyId: () => void;
	readonly openBrowser: () => void;
	readonly openDiagnostics: () => void;
	readonly toggleHelp: () => void;
	readonly zoom: () => void;
	readonly quit: () => void;
};

export type TuiCommand = {
	readonly id: TuiCommandId;
	readonly keys: ReadonlyArray<string>;
	readonly label: string;
	readonly description: string;
	readonly availability: (context: TuiCommandContext) => boolean;
	readonly transition: (runtime: TuiCommandRuntime) => void;
};

const always = () => true;
const hasSelection = (context: TuiCommandContext) => context.selectedStableId !== undefined;
const traceSelected = (context: TuiCommandContext) =>
	context.workspace.signal === "traces" && context.workspace.selectedTraceId !== undefined;
const spanSelected = (context: TuiCommandContext) =>
	traceSelected(context) && context.workspace.selectedSpanId !== undefined;
const correlatedLogSelected = (context: TuiCommandContext) =>
	context.workspace.signal === "logs" &&
	(context.workspace.selectedLogContext?.traceId !== undefined || context.selectedLogTraceId !== undefined);

const traceSorts = ["newest", "oldest", "slowest"] as const;
const logSorts = ["newest", "oldest"] as const;
const rangePresetsMinutes = [1, 5, 15, 30, 60, 360, 1_440, 10_080] as const;

const nextIn = <A>(values: ReadonlyArray<A>, current: A): A => {
	const index = values.indexOf(current);
	return values[(index + 1) % values.length] ?? current;
};

const cycleSort = (runtime: TuiCommandRuntime) => {
	runtime.updateWorkspace((workspace) =>
		workspace.signal === "traces"
			? transitionWorkspace(workspace, {
					type: "trace-query-changed",
					query: { sort: nextIn(traceSorts, workspace.traceQuery.sort) },
				})
			: transitionWorkspace(workspace, {
					type: "log-query-changed",
					query: { sort: nextIn(logSorts, workspace.logQuery.sort) },
				}),
	);
};

const cycleRange = (runtime: TuiCommandRuntime) => {
	const max = Math.max(1, Math.trunc(runtime.queryMaxLookbackMinutes));
	const available = rangePresetsMinutes.filter((minutes) => minutes <= max);
	const ranges = available.length === 0 ? [max] : available;
	const currentDuration = runtime.workspace.liveRangeDurationNs;
	const currentMinutes = currentDuration === undefined ? -1 : Number(currentDuration / 60_000_000_000n);
	const next = ranges.find((minutes) => minutes > currentMinutes) ?? ranges[0] ?? max;
	runtime.updateWorkspace((workspace) =>
		transitionWorkspace(workspace, {
			type: "live-range-changed",
			toNs: runtime.nowNs,
			durationNs: BigInt(next) * 60_000_000_000n,
		}),
	);
};

export const tuiCommands: ReadonlyArray<TuiCommand> = [
	{
		id: "move-up",
		keys: ["up", "k"],
		label: "Previous",
		description: "Move to the previous visible record or span",
		availability: (context) => context.hasRows || context.hasWaterfallRows,
		transition: (runtime) => runtime.move(-1),
	},
	{
		id: "move-down",
		keys: ["down", "j"],
		label: "Next",
		description: "Move to the next visible record or span",
		availability: (context) => context.hasRows || context.hasWaterfallRows,
		transition: (runtime) => runtime.move(1),
	},
	{
		id: "open",
		keys: ["return"],
		label: "Open",
		description: "Open the selected trace, span, or log",
		availability: (context) => context.hasRows || context.navigationLevel === "waterfall",
		transition: (runtime) => runtime.open(),
	},
	{
		id: "back",
		keys: ["escape", "backspace", "left", "h"],
		label: "Back",
		description: "Return to the previous Workspace location",
		availability: always,
		transition: (runtime) => runtime.back(),
	},
	{
		id: "switch-signal",
		keys: ["tab"],
		label: "Traces / logs",
		description: "Switch the active signal",
		availability: always,
		transition: (runtime) => runtime.switchSignal(),
	},
	{
		id: "search",
		keys: ["/"],
		label: "Search",
		description: "Edit the visible text filter",
		availability: always,
		transition: (runtime) => runtime.beginSearch(),
	},
	{
		id: "filter-service",
		keys: ["s"],
		label: "Service Filter",
		description: "Cycle the bounded Service filter",
		availability: always,
		transition: (runtime) => runtime.cycleService(),
	},
	{
		id: "filters",
		keys: ["f"],
		label: "Filters",
		description: "Open visible structured search filters",
		availability: always,
		transition: (runtime) => runtime.openFilters(),
	},
	{
		id: "promote-attribute",
		keys: ["a"],
		label: "Promote attribute",
		description: "Promote the next scalar detail attribute to an exact filter",
		availability: (context) => context.navigationLevel !== "list",
		transition: (runtime) => runtime.promoteAttribute(),
	},
	{
		id: "cycle-sort",
		keys: ["o"],
		label: "Sort",
		description: "Cycle the active signal's supported sort order",
		availability: always,
		transition: cycleSort,
	},
	{
		id: "cycle-range",
		keys: ["g"],
		label: "Time range",
		description: "Cycle configured bounded live-range presets",
		availability: always,
		transition: cycleRange,
	},
	{
		id: "refresh",
		keys: ["r"],
		label: "Refresh",
		description: "Refresh now or reconnect to the Daemon",
		availability: always,
		transition: (runtime) => runtime.refresh(),
	},
	{
		id: "pause",
		keys: ["p"],
		label: "Pause",
		description: "Pause or resume bounded auto-refresh",
		availability: always,
		transition: (runtime) =>
			runtime.updateWorkspace((workspace) => transitionWorkspace(workspace, { type: "refresh-pause-toggled" })),
	},
	{
		id: "collapse",
		keys: ["x"],
		label: "Collapse",
		description: "Collapse or expand the selected waterfall span",
		availability: spanSelected,
		transition: (runtime) =>
			runtime.updateWorkspace((workspace) =>
				workspace.selectedSpanId === undefined
					? workspace
					: transitionWorkspace(workspace, {
							type: "span-collapse-toggled",
							spanId: workspace.selectedSpanId,
						}),
			),
	},
	{
		id: "zoom",
		keys: ["z"],
		label: "Waterfall scale",
		description: "Cycle trace waterfall timing scale around the focused span",
		availability: traceSelected,
		transition: (runtime) => runtime.zoom(),
	},
	{
		id: "open-trace-logs",
		keys: ["v"],
		label: "Correlated trace logs",
		description: "Open complete logs for the selected trace across Services",
		availability: traceSelected,
		transition: (runtime) => runtime.openTraceLogs(),
	},
	{
		id: "open-span-logs",
		keys: ["l"],
		label: "Span logs",
		description: "Open complete logs for the selected span across Services",
		availability: spanSelected,
		transition: (runtime) => runtime.openSpanLogs(),
	},
	{
		id: "open-trace",
		keys: ["t"],
		label: "Correlated trace",
		description: "Open the selected log's complete trace and focused span",
		availability: correlatedLogSelected,
		transition: (runtime) => runtime.openCorrelatedTrace(),
	},
	{
		id: "copy-id",
		keys: ["y"],
		label: "Copy ID",
		description: "Copy the active row or focused detail identity with OSC 52",
		availability: hasSelection,
		transition: (runtime) => runtime.copyId(),
	},
	{
		id: "open-browser",
		keys: ["b"],
		label: "Browser",
		description: "Open this Workspace in the browser",
		availability: (context) => context.canOpenBrowser,
		transition: (runtime) => runtime.openBrowser(),
	},
	{
		id: "diagnostics",
		keys: ["d"],
		label: "Diagnostics",
		description: "Open bounded ingestion diagnostics for the active range",
		availability: (context) => context.canOpenBrowser,
		transition: (runtime) => runtime.openDiagnostics(),
	},
	{
		id: "help",
		keys: ["?"],
		label: "Help",
		description: "Show this command registry",
		availability: always,
		transition: (runtime) => runtime.toggleHelp(),
	},
	{
		id: "quit",
		keys: ["q"],
		label: "Quit",
		description: "Close the TUI without stopping the Daemon",
		availability: always,
		transition: (runtime) => runtime.quit(),
	},
];

export const commandForKey = (key: string, context: TuiCommandContext): TuiCommand | undefined =>
	tuiCommands.find((command) => command.keys.includes(key) && command.availability(context));
