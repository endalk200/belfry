import type { LogSearchQuery, TraceSearchQuery } from "@belfry/query-api";
import type { LogSummary, ServiceIdentity, SpanDetail, SpanStructuralWarning } from "@belfry/telemetry";

export type WorkspaceSignal = "traces" | "logs";

export type WorkspaceLocation = {
	readonly signal: WorkspaceSignal;
	readonly selectedTraceId?: string;
	readonly selectedSpanId?: string;
	readonly selectedLogId?: string;
};

export type WorkspaceHistoryEntry = WorkspaceLocation & {
	readonly serviceFilter: ReadonlyArray<ServiceIdentity>;
	readonly traceQuery: TraceSearchQuery;
	readonly logQuery: LogSearchQuery;
	readonly selectedLogContext?: Pick<LogSummary, "id" | "traceId" | "spanId"> | undefined;
	readonly collapsedSpanIds: ReadonlyArray<string>;
	readonly logCorrelation?: LogCorrelation | undefined;
};

export type LogCorrelation = {
	readonly traceId: string;
	readonly spanId?: string | undefined;
};

export type WorkspaceState = WorkspaceLocation & {
	readonly serviceFilter: ReadonlyArray<ServiceIdentity>;
	readonly traceQuery: TraceSearchQuery;
	readonly logQuery: LogSearchQuery;
	readonly selectedLogContext?: Pick<LogSummary, "id" | "traceId" | "spanId">;
	readonly history: ReadonlyArray<WorkspaceHistoryEntry>;
	readonly refreshPaused: boolean;
	readonly collapsedSpanIds: ReadonlyArray<string>;
	readonly liveRangeDurationNs?: bigint;
	readonly logCorrelation?: LogCorrelation;
};

export type WorkspaceAction =
	| { readonly type: "signal-changed"; readonly signal: WorkspaceSignal }
	| { readonly type: "service-filter-changed"; readonly services: ReadonlyArray<ServiceIdentity> }
	| { readonly type: "filters-cleared" }
	| { readonly type: "live-range-changed"; readonly toNs: bigint; readonly durationNs: bigint }
	| { readonly type: "trace-selected"; readonly traceId: string; readonly spanId?: string }
	| { readonly type: "span-selected"; readonly traceId: string; readonly spanId: string }
	| { readonly type: "log-selected"; readonly log: Pick<LogSummary, "id" | "traceId" | "spanId"> }
	| { readonly type: "detail-closed"; readonly detail: "trace" | "log" }
	| {
			readonly type: "correlated-trace-opened";
			readonly log?: Pick<LogSummary, "id" | "traceId" | "spanId"> | undefined;
	  }
	| { readonly type: "trace-logs-opened" }
	| { readonly type: "span-logs-opened" }
	| {
			readonly type: "trace-detail-loaded";
			readonly traceId: string;
			readonly spanIds: ReadonlyArray<string>;
	  }
	| { readonly type: "back" }
	| { readonly type: "refresh-pause-toggled" }
	| {
			readonly type: "results-refreshed";
			readonly signal: WorkspaceSignal;
			readonly ids: ReadonlyArray<string>;
			readonly truncated: boolean;
	  }
	| { readonly type: "span-collapse-toggled"; readonly spanId: string }
	| {
			readonly type: "attribute-filter-promoted";
			readonly signal: WorkspaceSignal;
			readonly key: string;
			readonly value: string;
	  }
	| { readonly type: "trace-query-changed"; readonly query: Partial<TraceSearchQuery> }
	| { readonly type: "log-query-changed"; readonly query: Partial<LogSearchQuery> };

const minuteNs = 60_000_000_000n;

export const initialWorkspaceState = (
	nowNs = BigInt(Date.now()) * 1_000_000n,
	defaultRangeMinutes = 15,
	maxResults = 500,
): WorkspaceState => {
	const rangeDurationNs = BigInt(Math.max(1, Math.trunc(defaultRangeMinutes))) * minuteNs;
	const boundedMaxResults = Math.max(1, Math.min(500, Math.trunc(maxResults)));
	const range = {
		fromNs: nowNs - rangeDurationNs,
		toNs: nowNs,
	};

	return {
		signal: "traces",
		serviceFilter: [],
		traceQuery: {
			...range,
			services: [],
			attributes: [],
			sort: "newest",
			limit: Math.min(100, boundedMaxResults),
		},
		logQuery: {
			...range,
			services: [],
			attributes: [],
			sort: "newest",
			limit: Math.min(200, boundedMaxResults),
		},
		history: [],
		refreshPaused: false,
		collapsedSpanIds: [],
		liveRangeDurationNs: rangeDurationNs,
	};
};

export const advanceWorkspaceTimeRange = (state: WorkspaceState, nowNs: bigint): WorkspaceState => {
	const durationNs = state.liveRangeDurationNs;
	if (durationNs === undefined || state.refreshPaused) return state;
	const range = { fromNs: nowNs - durationNs, toNs: nowNs, cursor: undefined };
	return {
		...state,
		traceQuery: { ...state.traceQuery, ...range },
		logQuery: { ...state.logQuery, ...range },
	};
};

const locationOf = (state: WorkspaceState): WorkspaceHistoryEntry => ({
	signal: state.signal,
	selectedTraceId: state.selectedTraceId,
	selectedSpanId: state.selectedSpanId,
	selectedLogId: state.selectedLogId,
	serviceFilter: state.serviceFilter,
	traceQuery: state.traceQuery,
	logQuery: state.logQuery,
	selectedLogContext: state.selectedLogContext,
	collapsedSpanIds: state.collapsedSpanIds,
	logCorrelation: state.logCorrelation,
});

const withHistory = (state: WorkspaceState, next: Partial<WorkspaceState>): WorkspaceState => ({
	...state,
	...next,
	history: [...state.history, locationOf(state)],
});

export const transitionWorkspace = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
	switch (action.type) {
		case "signal-changed":
			return withHistory(state, { signal: action.signal, logCorrelation: undefined });
		case "service-filter-changed":
			return {
				...state,
				serviceFilter: [...action.services],
				traceQuery: { ...state.traceQuery, services: [...action.services], cursor: undefined },
				logQuery: { ...state.logQuery, services: [...action.services], cursor: undefined },
				logCorrelation: undefined,
			};
		case "filters-cleared":
			return {
				...state,
				serviceFilter: [],
				traceQuery: {
					...state.traceQuery,
					services: [],
					operation: undefined,
					status: undefined,
					minimumDurationNs: undefined,
					maximumDurationNs: undefined,
					traceId: undefined,
					text: undefined,
					attributes: [],
					cursor: undefined,
				},
				logQuery: {
					...state.logQuery,
					services: [],
					minimumSeverity: undefined,
					maximumSeverity: undefined,
					traceId: undefined,
					spanId: undefined,
					text: undefined,
					attributes: [],
					cursor: undefined,
				},
				logCorrelation: undefined,
			};
		case "live-range-changed": {
			if (action.durationNs <= 0n) return state;
			const range = {
				fromNs: action.toNs - action.durationNs,
				toNs: action.toNs,
				cursor: undefined,
			};
			return {
				...state,
				traceQuery: { ...state.traceQuery, ...range },
				logQuery: { ...state.logQuery, ...range },
				liveRangeDurationNs: action.durationNs,
				logCorrelation: undefined,
			};
		}
		case "trace-selected":
			return withHistory(state, {
				signal: "traces",
				selectedTraceId: action.traceId,
				selectedSpanId: action.spanId,
				selectedLogId: undefined,
				selectedLogContext: undefined,
				collapsedSpanIds: state.selectedTraceId === action.traceId ? state.collapsedSpanIds : [],
			});
		case "span-selected":
			return {
				...state,
				signal: "traces",
				selectedTraceId: action.traceId,
				selectedSpanId: action.spanId,
			};
		case "log-selected":
			return withHistory(state, {
				selectedLogId: action.log.id,
				selectedLogContext: action.log,
			});
		case "detail-closed":
			return action.detail === "log"
				? { ...state, selectedLogId: undefined, selectedLogContext: undefined }
				: {
						...state,
						selectedTraceId: undefined,
						selectedSpanId: undefined,
						selectedLogId: undefined,
						selectedLogContext: undefined,
					};
		case "correlated-trace-opened": {
			const log = action.log ?? state.selectedLogContext;
			if (log?.traceId === undefined) {
				return state;
			}
			return withHistory(state, {
				signal: "traces",
				serviceFilter: [],
				traceQuery: { ...state.traceQuery, services: [], cursor: undefined },
				selectedTraceId: log.traceId,
				selectedSpanId: log.spanId,
				selectedLogId: undefined,
				selectedLogContext: undefined,
				collapsedSpanIds: state.selectedTraceId === log.traceId ? state.collapsedSpanIds : [],
				logCorrelation: undefined,
			});
		}
		case "trace-logs-opened":
			if (state.selectedTraceId === undefined) {
				return state;
			}
			return withHistory(state, {
				signal: "logs",
				selectedLogId: undefined,
				selectedLogContext: undefined,
				serviceFilter: [],
				logQuery: {
					...state.logQuery,
					services: [],
					minimumSeverity: undefined,
					maximumSeverity: undefined,
					traceId: state.selectedTraceId,
					spanId: undefined,
					text: undefined,
					attributes: [],
					sort: "oldest",
					cursor: undefined,
				},
				logCorrelation: { traceId: state.selectedTraceId },
			});
		case "span-logs-opened":
			if (state.selectedTraceId === undefined || state.selectedSpanId === undefined) {
				return state;
			}
			return withHistory(state, {
				signal: "logs",
				selectedLogId: undefined,
				selectedLogContext: undefined,
				serviceFilter: [],
				logQuery: {
					...state.logQuery,
					services: [],
					minimumSeverity: undefined,
					maximumSeverity: undefined,
					traceId: state.selectedTraceId,
					spanId: state.selectedSpanId,
					text: undefined,
					attributes: [],
					sort: "oldest",
					cursor: undefined,
				},
				logCorrelation: { traceId: state.selectedTraceId, spanId: state.selectedSpanId },
			});
		case "trace-detail-loaded": {
			if (
				state.selectedTraceId !== action.traceId ||
				state.selectedSpanId === undefined ||
				action.spanIds.includes(state.selectedSpanId)
			) {
				return state;
			}
			return { ...state, selectedSpanId: action.spanIds[0] };
		}
		case "back": {
			const previous = state.history.at(-1);
			if (previous === undefined) {
				return state;
			}
			return {
				...state,
				...previous,
				history: state.history.slice(0, -1),
			};
		}
		case "refresh-pause-toggled":
			return { ...state, refreshPaused: !state.refreshPaused };
		case "results-refreshed": {
			if (action.signal !== state.signal) return state;
			const ids = new Set(action.ids);
			if (
				!action.truncated &&
				action.signal === "traces" &&
				state.selectedTraceId !== undefined &&
				!ids.has(state.selectedTraceId)
			) {
				return { ...state, selectedTraceId: undefined, selectedSpanId: undefined };
			}
			if (
				!action.truncated &&
				action.signal === "logs" &&
				state.selectedLogId !== undefined &&
				!ids.has(state.selectedLogId)
			) {
				return { ...state, selectedLogId: undefined, selectedLogContext: undefined };
			}
			return state;
		}
		case "span-collapse-toggled": {
			const collapsed = new Set(state.collapsedSpanIds);
			if (collapsed.has(action.spanId)) {
				collapsed.delete(action.spanId);
			} else {
				collapsed.add(action.spanId);
			}
			return { ...state, collapsedSpanIds: [...collapsed] };
		}
		case "attribute-filter-promoted": {
			const current = action.signal === "traces" ? state.traceQuery : state.logQuery;
			const attributes = [
				...current.attributes.filter((filter) => filter.key !== action.key).slice(-31),
				{ key: action.key, operator: "equals" as const, value: action.value },
			];
			const next =
				action.signal === "traces"
					? { signal: action.signal, traceQuery: { ...state.traceQuery, attributes, cursor: undefined } }
					: { signal: action.signal, logQuery: { ...state.logQuery, attributes, cursor: undefined } };
			const correlation = action.signal === "logs" ? { logCorrelation: undefined } : {};
			return action.signal === state.signal
				? { ...state, ...next, ...correlation }
				: withHistory(state, { ...next, ...correlation });
		}
		case "trace-query-changed":
			return { ...state, traceQuery: { ...state.traceQuery, ...action.query, cursor: undefined } };
		case "log-query-changed":
			return {
				...state,
				logQuery: { ...state.logQuery, ...action.query, cursor: undefined },
				logCorrelation: undefined,
			};
	}
};

export type TraceWaterfallRow = {
	readonly span: SpanDetail;
	readonly depth: number;
	readonly relativeStartNs: string;
	readonly durationNs?: string;
	readonly warnings: ReadonlyArray<SpanStructuralWarning>;
	readonly hasChildren: boolean;
	readonly collapsed: boolean;
	readonly hiddenDescendantCount: number;
};

type SpanNode = {
	readonly span: SpanDetail;
	readonly children: Array<SpanNode>;
	readonly warnings: Set<SpanStructuralWarning>;
};

const compareSpans = (left: SpanNode, right: SpanNode): number => {
	const timeOrder = left.span.startTimeNs - right.span.startTimeNs;
	if (timeOrder < 0n) return -1;
	if (timeOrder > 0n) return 1;
	return left.span.spanId.localeCompare(right.span.spanId);
};

const descendantCount = (node: SpanNode): number =>
	node.children.reduce((count, child) => count + 1 + descendantCount(child), 0);

export const buildTraceWaterfall = (
	spans: ReadonlyArray<SpanDetail>,
	collapsedSpanIds: ReadonlySet<string> | ReadonlyArray<string>,
): ReadonlyArray<TraceWaterfallRow> => {
	if (spans.length === 0) return [];

	const collapsedIds = new Set(collapsedSpanIds);
	const nodes = new Map<string, SpanNode>();
	for (const span of spans) {
		const warnings = new Set(span.warnings);
		if (span.endTimeNs === undefined) warnings.add("running-span");
		nodes.set(span.spanId, { span, children: [], warnings });
	}

	const roots: Array<SpanNode> = [];
	for (const node of nodes.values()) {
		const parentId = node.span.parentSpanId;
		const parent = parentId === undefined ? undefined : nodes.get(parentId);
		if (parentId === undefined) {
			roots.push(node);
		} else if (parent === undefined || parent === node) {
			node.warnings.add(parent === node ? "cycle" : "missing-parent");
			node.warnings.add("orphan-span");
			roots.push(node);
		} else {
			parent.children.push(node);
		}
	}

	for (const node of nodes.values()) node.children.sort(compareSpans);
	roots.sort(compareSpans);
	if (roots.length > 1) {
		for (const root of roots) root.warnings.add("multiple-roots");
	}

	const traceStartNs = spans.reduce(
		(earliest, span) => (span.startTimeNs < earliest ? span.startTimeNs : earliest),
		spans[0]?.startTimeNs ?? 0n,
	);
	const rows: Array<TraceWaterfallRow> = [];
	const visited = new Set<string>();
	const markHiddenDescendants = (node: SpanNode) => {
		for (const child of node.children) {
			if (visited.has(child.span.spanId)) continue;
			visited.add(child.span.spanId);
			markHiddenDescendants(child);
		}
	};

	const visit = (node: SpanNode, depth: number, ancestors: ReadonlySet<string>) => {
		if (ancestors.has(node.span.spanId)) {
			node.warnings.add("cycle");
			return;
		}
		visited.add(node.span.spanId);
		const collapsed = collapsedIds.has(node.span.spanId);
		rows.push({
			span: node.span,
			depth,
			relativeStartNs: (node.span.startTimeNs - traceStartNs).toString(),
			durationNs:
				node.span.endTimeNs === undefined
					? undefined
					: (node.span.endTimeNs - node.span.startTimeNs).toString(),
			warnings: [...node.warnings],
			hasChildren: node.children.length > 0,
			collapsed,
			hiddenDescendantCount: collapsed ? descendantCount(node) : 0,
		});
		if (collapsed) {
			markHiddenDescendants(node);
			return;
		}
		const nextAncestors = new Set(ancestors).add(node.span.spanId);
		for (const child of node.children) visit(child, depth + 1, nextAncestors);
	};

	for (const root of roots) visit(root, 0, new Set());
	for (const node of [...nodes.values()].sort(compareSpans)) {
		if (!visited.has(node.span.spanId)) {
			node.warnings.add("cycle");
			visit(node, 0, new Set());
		}
	}

	return rows;
};

export type ReconciledSelection = {
	readonly selectedId?: string;
	readonly selectedIndex: number;
	readonly anchorIndex: number;
};

export const reconcileSelection = (
	ids: ReadonlyArray<string>,
	selectedId: string | undefined,
	previousIndex: number,
): ReconciledSelection => {
	if (ids.length === 0) {
		return { selectedId: undefined, selectedIndex: -1, anchorIndex: 0 };
	}
	const stableIndex = selectedId === undefined ? -1 : ids.indexOf(selectedId);
	const selectedIndex = stableIndex >= 0 ? stableIndex : Math.min(Math.max(previousIndex, 0), ids.length - 1);
	return {
		selectedId: ids[selectedIndex],
		selectedIndex,
		anchorIndex: selectedIndex,
	};
};
