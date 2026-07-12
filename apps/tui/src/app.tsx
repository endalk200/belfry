/** @jsxImportSource @opentui/react */

import type { ServiceSummary } from "@belfry/query-api";
import type {
	LogDetail,
	LogSummary,
	OtlpAnyValue,
	TelemetryAttributes,
	TraceDetail,
	TraceSummary,
} from "@belfry/telemetry";
import {
	advanceWorkspaceTimeRange,
	buildTraceWaterfall,
	emptyWorkspaceMessage,
	initialWorkspaceState,
	presentWorkspaceError,
	reconcileSelection,
	transitionWorkspace,
	type WorkspaceState,
	workspaceToUrl,
} from "@belfry/workspace";
import type { KeyEvent } from "@opentui/core";
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { commandForKey, type TuiCommandRuntime } from "./commands.js";
import { serviceFilterLabel, type WorkspaceDataSource } from "./data-source.js";
import {
	applyFilterInput,
	type FilterEditorState,
	transitionFilterMenu,
	updateFilterDraft,
	workspaceFilterLabel,
} from "./filters.js";
import { waterfallView } from "./layout.js";
import { type NavigationLevel, navigationForWorkspace } from "./navigation.js";
import { FilterPane, HelpPane, WorkspaceContent } from "./panes.js";

export type TelemetryWorkspaceViewProps = {
	readonly endpoint: string;
	readonly dataSource: WorkspaceDataSource;
	readonly onQuit: () => void;
	readonly onOpenBrowser?: ((url: string) => Promise<void>) | undefined;
	readonly onReconnect?: (() => Promise<void>) | undefined;
	readonly startupMessage?: string | undefined;
	readonly refreshIntervalMs?: number | undefined;
	readonly defaultRangeMinutes?: number | undefined;
	readonly queryMaxResults?: number | undefined;
	readonly queryMaxLookbackMinutes?: number | undefined;
	readonly nowNs?: bigint | undefined;
	readonly initialState?: WorkspaceState | undefined;
	readonly onWorkspaceChange?: ((state: WorkspaceState) => void) | undefined;
};

type ViewPhase = "invalid" | "loading" | "ready" | "stale" | "reconnecting" | "unavailable";

export function TelemetryWorkspaceView({
	endpoint,
	dataSource,
	onQuit,
	onOpenBrowser,
	onReconnect,
	startupMessage,
	refreshIntervalMs = 2_000,
	defaultRangeMinutes = 15,
	queryMaxResults = 500,
	queryMaxLookbackMinutes = 10_080,
	nowNs,
	initialState,
	onWorkspaceChange,
}: TelemetryWorkspaceViewProps) {
	const renderer = useRenderer();
	const dimensions = useTerminalDimensions();
	const [workspace, setWorkspace] = useState<WorkspaceState>(
		() => initialState ?? initialWorkspaceState(nowNs, defaultRangeMinutes, queryMaxResults),
	);
	const [traces, setTraces] = useState<ReadonlyArray<TraceSummary>>([]);
	const [logs, setLogs] = useState<ReadonlyArray<LogSummary>>([]);
	const [services, setServices] = useState<ReadonlyArray<ServiceSummary>>([]);
	const [traceDetail, setTraceDetail] = useState<TraceDetail>();
	const [logDetail, setLogDetail] = useState<LogDetail>();
	const [phase, setPhase] = useState<ViewPhase>(startupMessage === undefined ? "loading" : "unavailable");
	const [message, setMessage] = useState(startupMessage ?? "Connecting to the Belfry Daemon…");
	const [recoveryPending, setRecoveryPending] = useState(startupMessage !== undefined);
	const [listSelection, setListSelection] = useState<{ readonly id?: string; readonly anchorIndex: number }>({
		anchorIndex: 0,
	});
	const [offset, setOffset] = useState(0);
	const [searching, setSearching] = useState(false);
	const [searchDraft, setSearchDraft] = useState("");
	const [helpVisible, setHelpVisible] = useState(false);
	const [filterEditor, setFilterEditor] = useState<FilterEditorState>();
	const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("list");
	const [spanIndex, setSpanIndex] = useState(0);
	const [waterfallScale, setWaterfallScale] = useState(1);
	const refreshGeneration = useRef(0);
	const workspaceRef = useRef(workspace);
	const tracesRef = useRef(traces);
	const logsRef = useRef(logs);
	workspaceRef.current = workspace;
	tracesRef.current = traces;
	logsRef.current = logs;

	const wide = dimensions.width >= 110;
	const detailPaneWidth = wide ? Math.floor(dimensions.width * 0.55) - 4 : dimensions.width - 4;
	const waterfallBarWidth = Math.max(12, Math.min(36, Math.floor(detailPaneWidth * 0.32)));
	const listHeight = Math.max(3, dimensions.height - 9);
	const activeRows = workspace.signal === "traces" ? traces : logs;
	const activeIds = activeRows.map((row) =>
		"traceId" in row && !("id" in row) ? row.traceId : (row as LogSummary).id,
	);
	const selected = reconcileSelection(activeIds, listSelection.id, listSelection.anchorIndex);
	const visibleRows = activeRows.slice(offset, offset + listHeight);
	const waterfallRows = useMemo(
		() => buildTraceWaterfall(traceDetail?.spans ?? [], workspace.collapsedSpanIds),
		[traceDetail?.spans, workspace.collapsedSpanIds],
	);
	const waterfallWindow = useMemo(
		() =>
			waterfallView(
				waterfallRows,
				spanIndex,
				Math.max(4, Math.floor((dimensions.height - 12) / 2)),
				traceDetail?.durationNs,
				waterfallScale,
				waterfallBarWidth,
			),
		[dimensions.height, spanIndex, traceDetail?.durationNs, waterfallBarWidth, waterfallRows, waterfallScale],
	);

	useEffect(() => onWorkspaceChange?.(workspace), [onWorkspaceChange, workspace]);

	const refresh = useCallback(async () => {
		const snapshot = workspaceRef.current;
		const revision = workspaceQueryRevision(snapshot);
		const generation = ++refreshGeneration.current;
		const hadRows = snapshot.signal === "traces" ? tracesRef.current.length > 0 : logsRef.current.length > 0;
		setPhase((current) => (current === "loading" || current === "unavailable" ? "reconnecting" : current));
		try {
			const activeQuery = snapshot.signal === "traces" ? snapshot.traceQuery : snapshot.logQuery;
			const [servicePage, page] = await Promise.all([
				dataSource.listServices(activeQuery.fromNs, activeQuery.toNs),
				snapshot.signal === "traces"
					? dataSource.searchTraces(snapshot.traceQuery)
					: snapshot.logCorrelation === undefined
						? dataSource.searchLogs(snapshot.logQuery)
						: dataSource.listCorrelatedLogs(
								snapshot.logCorrelation.traceId,
								snapshot.logCorrelation.spanId,
							),
			]);
			if (generation !== refreshGeneration.current || workspaceQueryRevision(workspaceRef.current) !== revision)
				return;
			setServices(servicePage.items);
			const ids =
				snapshot.signal === "traces"
					? (page.items as ReadonlyArray<TraceSummary>).map((trace) => trace.traceId)
					: (page.items as ReadonlyArray<LogSummary>).map((log) => log.id);
			if (snapshot.signal === "traces") setTraces(page.items as ReadonlyArray<TraceSummary>);
			else setLogs(page.items as ReadonlyArray<LogSummary>);
			const currentWorkspace = workspaceRef.current;
			const invalidatedId =
				!page.truncated &&
				(snapshot.signal === "traces"
					? currentWorkspace.selectedTraceId !== undefined && !ids.includes(currentWorkspace.selectedTraceId)
					: currentWorkspace.selectedLogId !== undefined && !ids.includes(currentWorkspace.selectedLogId));
			if (invalidatedId) {
				setNavigationLevel("list");
				if (snapshot.signal === "traces") setTraceDetail(undefined);
				else setLogDetail(undefined);
			}
			setWorkspace((current) =>
				workspaceQueryRevision(current) === revision
					? transitionWorkspace(current, {
							type: "results-refreshed",
							signal: snapshot.signal,
							ids,
							truncated: page.truncated,
						})
					: current,
			);
			setPhase("ready");
			setMessage(
				page.items.length === 0 ? `${emptyWorkspaceMessage(snapshot.signal)} Press d for diagnostics.` : "Live",
			);
		} catch (error) {
			if (generation !== refreshGeneration.current || workspaceQueryRevision(workspaceRef.current) !== revision)
				return;
			const presentation = presentWorkspaceError(error);
			setPhase(presentation.kind === "invalid-query" ? "invalid" : hadRows ? "stale" : "unavailable");
			setMessage(
				`${presentation.message} · press r to retry${onOpenBrowser === undefined ? "" : " · d for diagnostics"}`,
			);
		}
	}, [dataSource, onOpenBrowser]);
	const recover = useCallback(async () => {
		if (onReconnect === undefined) {
			await refresh();
			return;
		}
		setPhase("reconnecting");
		setMessage("Retrying Daemon startup…");
		try {
			await onReconnect();
			setRecoveryPending(false);
			await refresh();
		} catch (error) {
			const presentation = presentWorkspaceError(error);
			setPhase("unavailable");
			setMessage(`Daemon startup unavailable: ${presentation.message} · press r to retry`);
		}
	}, [onReconnect, refresh]);

	const refreshNow = useCallback(() => {
		if (recoveryPending) {
			void recover();
			return;
		}
		const next = advanceWorkspaceTimeRange(workspace, BigInt(Date.now()) * 1_000_000n);
		if (next === workspace) void refresh();
		else {
			refreshGeneration.current += 1;
			setWorkspace(next);
		}
	}, [recover, recoveryPending, refresh, workspace]);

	const queryRevision = workspaceQueryRevision(workspace);
	useEffect(() => {
		if (queryRevision.length > 0 && !recoveryPending) void refresh();
	}, [queryRevision, recoveryPending, refresh]);

	useEffect(() => {
		if (workspace.refreshPaused || recoveryPending) return;
		const timer = setInterval(refreshNow, Math.max(500, refreshIntervalMs));
		return () => clearInterval(timer);
	}, [recoveryPending, refreshIntervalMs, refreshNow, workspace.refreshPaused]);

	useEffect(() => {
		if (workspace.selectedTraceId === undefined) {
			setTraceDetail(undefined);
			return;
		}
		let cancelled = false;
		void dataSource
			.getTrace(workspace.selectedTraceId)
			.then((detail) => {
				if (!cancelled) {
					setTraceDetail(detail);
					setWorkspace((current) =>
						transitionWorkspace(current, {
							type: "trace-detail-loaded",
							traceId: detail.traceId,
							spanIds: detail.spans.map((span) => span.spanId),
						}),
					);
				}
			})
			.catch((error) => {
				if (!cancelled) setMessage(presentWorkspaceError(error).message);
			});
		return () => {
			cancelled = true;
		};
	}, [dataSource, workspace.selectedTraceId]);

	useEffect(() => {
		if (workspace.selectedLogId === undefined) {
			setLogDetail(undefined);
			return;
		}
		let cancelled = false;
		void dataSource
			.getLog(workspace.selectedLogId)
			.then((detail) => {
				if (!cancelled) setLogDetail(detail);
			})
			.catch((error) => {
				if (!cancelled) setMessage(presentWorkspaceError(error).message);
			});
		return () => {
			cancelled = true;
		};
	}, [dataSource, workspace.selectedLogId]);

	useEffect(() => {
		if (workspace.selectedSpanId === undefined || waterfallRows.length === 0) return;
		const nextIndex = waterfallRows.findIndex((row) => row.span.spanId === workspace.selectedSpanId);
		if (nextIndex >= 0 && nextIndex !== spanIndex) setSpanIndex(nextIndex);
	}, [spanIndex, waterfallRows, workspace.selectedSpanId]);

	useEffect(() => {
		if (selected.selectedIndex < 0) {
			if (offset !== 0) setOffset(0);
			return;
		}
		if (selected.selectedIndex < offset) setOffset(Math.max(0, selected.selectedIndex));
		else if (selected.selectedIndex >= offset + listHeight) setOffset(selected.selectedIndex - listHeight + 1);
	}, [listHeight, offset, selected.selectedIndex]);

	const selectIndex = useCallback(
		(nextIndex: number) => {
			if (activeRows.length === 0) return;
			const bounded = Math.max(0, Math.min(activeRows.length - 1, nextIndex));
			setListSelection({ id: activeIds[bounded], anchorIndex: bounded });
		},
		[activeIds, activeRows.length],
	);

	const openRecordAtIndex = useCallback(
		(nextIndex: number) => {
			const bounded = Math.max(0, Math.min(activeRows.length - 1, nextIndex));
			const row = activeRows[bounded];
			if (row === undefined) return;
			setListSelection({ id: activeIds[bounded], anchorIndex: bounded });
			if (workspace.signal === "traces") {
				const trace = row as TraceSummary;
				setSpanIndex(0);
				setNavigationLevel("waterfall");
				setWorkspace((state) =>
					transitionWorkspace(state, {
						type: "trace-selected",
						traceId: trace.traceId,
						spanId: trace.rootSpanId,
					}),
				);
			} else {
				setNavigationLevel("detail");
				setWorkspace((state) => transitionWorkspace(state, { type: "log-selected", log: row as LogSummary }));
			}
		},
		[activeIds, activeRows, workspace.signal],
	);

	const openSelected = useCallback(
		() => openRecordAtIndex(Math.max(0, selected.selectedIndex)),
		[openRecordAtIndex, selected.selectedIndex],
	);

	const selectSpan = useCallback(
		(nextIndex: number) => {
			if (traceDetail === undefined || waterfallRows.length === 0) return;
			const bounded = Math.max(0, Math.min(waterfallRows.length - 1, nextIndex));
			const row = waterfallRows[bounded];
			if (row === undefined) return;
			setSpanIndex(bounded);
			setWorkspace((state) =>
				transitionWorkspace(state, {
					type: "span-selected",
					traceId: traceDetail.traceId,
					spanId: row.span.spanId,
				}),
			);
		},
		[traceDetail, waterfallRows],
	);

	const submitFilterInput = () => {
		const result = applyFilterInput(workspace, filterEditor);
		setWorkspace(result.workspace);
		setFilterEditor(result.editor);
		if (result.message !== undefined) setMessage(result.message);
	};

	const selectedStableId =
		navigationLevel === "list"
			? activeIds[selected.selectedIndex]
			: workspace.signal === "traces"
				? (workspace.selectedSpanId ?? workspace.selectedTraceId)
				: workspace.selectedLogId;
	const promoteDetailAttribute = useCallback(() => {
		const detail =
			workspace.signal === "traces"
				? traceDetail?.spans.find((span) => span.spanId === workspace.selectedSpanId)
				: logDetail;
		const filterableKeys = new Set(detail?.filterableAttributeKeys ?? []);
		const candidates = Object.entries((detail?.attributes as TelemetryAttributes | undefined) ?? {}).flatMap(
			([key, value]) => {
				if (!filterableKeys.has(key)) return [];
				const scalar = scalarAttributeValue(value);
				return scalar === undefined ? [] : [{ key, value: scalar }];
			},
		);
		const active = workspace.signal === "traces" ? workspace.traceQuery.attributes : workspace.logQuery.attributes;
		const next =
			candidates.find(
				(candidate) =>
					!active.some(
						(filter) =>
							filter.key === candidate.key &&
							filter.operator === "equals" &&
							filter.value === candidate.value,
					),
			) ?? candidates[0];
		if (next === undefined) {
			setMessage("The selected detail has no scalar attributes to promote.");
			return;
		}
		setWorkspace((state) =>
			transitionWorkspace(state, {
				type: "attribute-filter-promoted",
				signal: state.signal,
				key: next.key,
				value: next.value,
			}),
		);
		setMessage(`Promoted ${next.key} = ${next.value} to an exact ${workspace.signal} filter.`);
	}, [logDetail, traceDetail?.spans, workspace]);

	const resetList = () => {
		setListSelection({ anchorIndex: 0 });
		setOffset(0);
		setNavigationLevel("list");
	};
	const openExternal = useCallback(
		(url: string) => {
			if (onOpenBrowser === undefined) return;
			void onOpenBrowser(url).catch((error) => setMessage(presentWorkspaceError(error).message));
		},
		[onOpenBrowser],
	);
	const commandRuntime: TuiCommandRuntime = {
		workspace,
		navigationLevel,
		hasRows: activeRows.length > 0,
		hasWaterfallRows: waterfallRows.length > 0,
		selectedStableId,
		selectedLogTraceId: logDetail?.traceId,
		canOpenBrowser: onOpenBrowser !== undefined,
		nowNs: BigInt(Date.now()) * 1_000_000n,
		queryMaxLookbackMinutes,
		updateWorkspace: (transition) => setWorkspace((current) => transition(current)),
		move: (delta) => {
			if (navigationLevel === "waterfall" && workspace.signal === "traces") selectSpan(spanIndex + delta);
			else if (navigationLevel === "detail") openRecordAtIndex(selected.selectedIndex + delta);
			else selectIndex(selected.selectedIndex + delta);
		},
		open: () => {
			if (navigationLevel === "waterfall") setNavigationLevel("detail");
			else if (navigationLevel === "list") openSelected();
		},
		back: () => {
			if (navigationLevel === "detail" && workspace.signal === "traces") {
				setNavigationLevel("waterfall");
				return;
			}
			const next = transitionWorkspace(workspace, { type: "back" });
			setWorkspace(next);
			setNavigationLevel(navigationForWorkspace(next));
		},
		switchSignal: () => {
			const next = transitionWorkspace(workspace, {
				type: "signal-changed",
				signal: workspace.signal === "traces" ? "logs" : "traces",
			});
			resetList();
			setWorkspace(next);
		},
		beginSearch: () => {
			setSearchDraft(
				workspace.signal === "traces" ? (workspace.traceQuery.text ?? "") : (workspace.logQuery.text ?? ""),
			);
			setSearching(true);
		},
		cycleService: () => {
			const selectedKeys = new Set(workspace.serviceFilter.map((service) => JSON.stringify(service)));
			const nextService = services.find((summary) => !selectedKeys.has(JSON.stringify(summary.service)))?.service;
			setWorkspace((current) =>
				transitionWorkspace(current, {
					type: "service-filter-changed",
					services: nextService === undefined ? [] : [...current.serviceFilter, nextService],
				}),
			);
		},
		openFilters: () => {
			setHelpVisible(false);
			setFilterEditor({ kind: "menu" });
		},
		promoteAttribute: promoteDetailAttribute,
		refresh: refreshNow,
		resetList,
		openTraceLogs: () => {
			const next = transitionWorkspace(workspace, { type: "trace-logs-opened" });
			resetList();
			setWorkspace(next);
		},
		openSpanLogs: () => {
			const next = transitionWorkspace(workspace, { type: "span-logs-opened" });
			resetList();
			setWorkspace(next);
		},
		openCorrelatedTrace: () => {
			const next = transitionWorkspace(workspace, {
				type: "correlated-trace-opened",
				log: logDetail,
			});
			setWorkspace(next);
			setNavigationLevel("waterfall");
		},
		copyId: () => {
			if (selectedStableId === undefined) return;
			renderer.copyToClipboardOSC52(selectedStableId);
			setMessage(`Copied ${selectedStableId}`);
		},
		openBrowser: () => openExternal(`${endpoint}${workspaceToUrl(workspace)}`),
		openDiagnostics: () => {
			if (onOpenBrowser === undefined) return;
			const query = workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery;
			const diagnostics = new URL("/api/ingestion/diagnostics", endpoint);
			diagnostics.searchParams.set("fromNs", query.fromNs.toString());
			diagnostics.searchParams.set("toNs", query.toNs.toString());
			diagnostics.searchParams.set("limit", String(Math.min(100, queryMaxResults)));
			openExternal(diagnostics.toString());
		},
		toggleHelp: () => setHelpVisible((visible) => !visible),
		zoom: () => setWaterfallScale((scale) => (scale >= 8 ? 1 : scale * 2)),
		quit: onQuit,
	};

	useKeyboard((key: KeyEvent) => {
		if (filterEditor !== undefined) {
			if (key.name === "escape" || (filterEditor.kind === "menu" && key.name === "backspace")) {
				setFilterEditor(undefined);
				return;
			}
			if (filterEditor.kind === "input") return;
			key.preventDefault();
			key.stopPropagation();
			const result = transitionFilterMenu(workspace, key.name);
			if (result !== undefined) {
				setWorkspace(result.workspace);
				setFilterEditor(result.editor);
			}
			return;
		}
		if (searching) {
			if (key.name === "escape") setSearching(false);
			return;
		}
		const command = commandForKey(key.name, commandRuntime);
		if (command === undefined) return;
		key.preventDefault();
		key.stopPropagation();
		command.transition(commandRuntime);
	});

	const content =
		filterEditor !== undefined ? (
			<FilterPane
				workspace={workspace}
				editor={filterEditor}
				onDraft={(draft) => setFilterEditor((current) => updateFilterDraft(current, draft))}
				onSubmit={submitFilterInput}
				onCancel={() => setFilterEditor(undefined)}
			/>
		) : helpVisible ? (
			<HelpPane context={commandRuntime} />
		) : searching ? (
			<box flexDirection="column" border borderColor="#d7af5f" padding={1}>
				<text>Search {workspace.signal}</text>
				<input
					focused
					placeholder="text contains…"
					value={searchDraft}
					onInput={setSearchDraft}
					onKeyDown={(event) => {
						if (event.name !== "escape") return;
						event.preventDefault();
						event.stopPropagation();
						setSearching(false);
					}}
					onSubmit={() => {
						setWorkspace((state) =>
							state.signal === "traces"
								? transitionWorkspace(state, {
										type: "trace-query-changed",
										query: { text: searchDraft === "" ? undefined : searchDraft },
									})
								: transitionWorkspace(state, {
										type: "log-query-changed",
										query: { text: searchDraft === "" ? undefined : searchDraft },
									}),
						);
						setSearching(false);
					}}
				/>
				<text fg="#888888">Enter applies · Esc cancels</text>
			</box>
		) : (
			<WorkspaceContent
				wide={wide}
				workspace={workspace}
				navigationLevel={navigationLevel}
				visibleRows={visibleRows}
				visibleOffset={offset}
				selectedIndex={selected.selectedIndex}
				traceDetail={traceDetail}
				logDetail={logDetail}
				waterfallRows={waterfallWindow.items}
				waterfallOffset={waterfallWindow.offset}
				selectedSpanIndex={spanIndex}
				waterfallScale={waterfallScale}
			/>
		);

	return (
		<box flexDirection="column" width="100%" height="100%" backgroundColor="#101216">
			<box height={1} backgroundColor="#242932" paddingLeft={1} paddingRight={1}>
				<text fg={phase === "ready" ? "#8abeb7" : phase === "stale" ? "#f0c674" : "#cc6666"}>
					{headerLine(dimensions.width, workspace.signal, phase, workspace.refreshPaused)}
				</text>
			</box>
			<box height={3} flexDirection="column" paddingLeft={1}>
				<text>
					Service: {serviceFilterLabel(workspace.serviceFilter)} · Range: {workspaceRangeLabel(workspace)} ·
					Sort: {workspace.signal === "traces" ? workspace.traceQuery.sort : workspace.logQuery.sort}
				</text>
				<text>Filters: {workspaceFilterLabel(workspace)}</text>
				<text fg="#888888">
					{message} · {endpoint}
				</text>
			</box>
			<box flexGrow={1}>{content}</box>
			<box height={1} backgroundColor="#242932" paddingLeft={1}>
				<text fg="#b5bd68">
					↑↓ move · Enter drill · Esc back · o sort · g range · v trace logs · l span logs · d diagnostics · ?
					help
				</text>
			</box>
		</box>
	);
}

const headerLine = (width: number, signal: WorkspaceState["signal"], phase: ViewPhase, paused: boolean): string => {
	const left = `BELFRY · ${signal.toUpperCase()}`;
	const right = `${phase.toUpperCase()}${paused ? " · PAUSED" : ""}`;
	const available = Math.max(1, width - 2);
	if (left.length + right.length + 1 > available)
		return `${left.slice(0, Math.max(1, available - right.length - 1))} ${right}`.slice(0, available);
	return `${left}${" ".repeat(available - left.length - right.length)}${right}`;
};

const scalarAttributeValue = (value: OtlpAnyValue): string | undefined => {
	switch (value.type) {
		case "string":
		case "boolean":
		case "integer":
		case "double":
			return String(value.value);
		default:
			return undefined;
	}
};

const workspaceRangeLabel = (workspace: WorkspaceState): string => {
	const durationNs = workspace.liveRangeDurationNs ?? workspace.traceQuery.toNs - workspace.traceQuery.fromNs;
	const minutes = Number(durationNs / 60_000_000_000n);
	return minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60}h` : `${minutes}m`;
};

const workspaceQueryRevision = (workspace: WorkspaceState): string =>
	JSON.stringify(
		{
			signal: workspace.signal,
			query: workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery,
			logCorrelation: workspace.logCorrelation,
		},
		(_key, value) => (typeof value === "bigint" ? value.toString() : value),
	);
