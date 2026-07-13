import type { ServiceSummary } from "@belfry/query-api";
import type { LogDetail, LogSummary, ServiceIdentity, TraceDetail, TraceSummary } from "@belfry/telemetry";
import {
	advanceWorkspaceTimeRange,
	initialWorkspaceState,
	presentWorkspaceError,
	transitionWorkspace,
	type WorkspaceAction,
	type WorkspaceState,
	workspaceFromUrl,
	workspaceToUrl,
} from "@belfry/workspace";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { connectWebWorkspace, type WebWorkspaceDataSource } from "./data-source.js";
import { LogDetailView, TraceDetailView } from "./details.js";
import { PulseIcon } from "./icons.js";
import { EmptyResults, LogList, TraceList } from "./lists.js";
import { useSplitPane } from "./split-pane.js";
import { type WorkbenchPhase, WorkspaceToolbar } from "./toolbar.js";

export type TelemetryWorkbenchProps = {
	readonly endpoint: string;
	readonly dataSource?: WebWorkspaceDataSource;
	readonly refreshIntervalMs?: number;
	readonly defaultRangeMinutes?: number;
	readonly queryMaxResults?: number;
	readonly queryMaxLookbackMinutes?: number;
};

export function TelemetryWorkbench({
	endpoint,
	dataSource: providedDataSource,
	refreshIntervalMs = 2_000,
	defaultRangeMinutes = 15,
	queryMaxResults = 500,
	queryMaxLookbackMinutes = 10_080,
}: TelemetryWorkbenchProps) {
	const restoreFallback = useMemo(
		() => initialWorkspaceState(undefined, defaultRangeMinutes, queryMaxResults),
		[defaultRangeMinutes, queryMaxResults],
	);
	const [workspace, setWorkspace] = useState<WorkspaceState>(() =>
		workspaceFromUrl(new URL(window.location.href), restoreFallback, {
			maxLookbackNs: BigInt(queryMaxLookbackMinutes) * 60_000_000_000n,
		}),
	);
	const workspaceRef = useRef(workspace);
	const [dataSource, setDataSource] = useState(providedDataSource);
	const [traces, setTraces] = useState<ReadonlyArray<TraceSummary>>([]);
	const [logs, setLogs] = useState<ReadonlyArray<LogSummary>>([]);
	const tracesRef = useRef<ReadonlyArray<TraceSummary>>([]);
	const logsRef = useRef<ReadonlyArray<LogSummary>>([]);
	const refreshGenerationRef = useRef(0);
	const [services, setServices] = useState<ReadonlyArray<ServiceSummary>>([]);
	const servicesCacheRef = useRef({ rangeKey: "", fetchedAt: 0 });
	const [traceDetail, setTraceDetail] = useState<TraceDetail>();
	const [traceLogs, setTraceLogs] = useState<ReadonlyArray<LogSummary>>([]);
	const [logDetail, setLogDetail] = useState<LogDetail>();
	const [phase, setPhase] = useState<WorkbenchPhase>("loading");
	const [notice, setNotice] = useState("");
	const split = useSplitPane();

	const commitState = useCallback((next: WorkspaceState, mode: "push" | "replace" = "push") => {
		const current = workspaceRef.current;
		if (next.signal !== current.signal) {
			setPhase("reconnecting");
			if (next.signal === "traces") {
				tracesRef.current = [];
				setTraces([]);
			} else {
				logsRef.current = [];
				setLogs([]);
			}
		}
		workspaceRef.current = next;
		setWorkspace(next);
		window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", workspaceToUrl(next));
	}, []);

	const dispatchWorkspaceAction = useCallback(
		(action: WorkspaceAction) => {
			commitState(transitionWorkspace(workspaceRef.current, action));
		},
		[commitState],
	);

	useEffect(() => {
		window.history.replaceState({}, "", workspaceToUrl(workspaceRef.current));
		const restore = () => {
			const restored = workspaceFromUrl(new URL(window.location.href), restoreFallback, {
				maxLookbackNs: BigInt(queryMaxLookbackMinutes) * 60_000_000_000n,
			});
			workspaceRef.current = restored;
			setWorkspace(restored);
		};
		window.addEventListener("popstate", restore);
		return () => window.removeEventListener("popstate", restore);
	}, [queryMaxLookbackMinutes, restoreFallback]);

	useEffect(() => {
		const installDataSource = (connected: WebWorkspaceDataSource) => {
			servicesCacheRef.current = { rangeKey: "", fetchedAt: 0 };
			setServices([]);
			setDataSource(connected);
		};
		if (providedDataSource !== undefined) {
			installDataSource(providedDataSource);
			return;
		}
		let cancelled = false;
		void connectWebWorkspace(endpoint, queryMaxResults)
			.then((connected) => {
				if (!cancelled) installDataSource(connected);
			})
			.catch(() => {
				if (cancelled) return;
				setPhase("unavailable");
			});
		return () => {
			cancelled = true;
		};
	}, [endpoint, providedDataSource, queryMaxResults]);

	const traceDetailGenerationRef = useRef(0);
	const traceDetailAbortRef = useRef<AbortController | null>(null);
	const traceDetailRefreshedAtRef = useRef(0);
	const loadTraceDetail = useCallback(
		async (traceId: string, mode: "initial" | "refresh"): Promise<void> => {
			if (dataSource === undefined) return;
			const generation = traceDetailGenerationRef.current + 1;
			traceDetailGenerationRef.current = generation;
			traceDetailAbortRef.current?.abort();
			const controller = new AbortController();
			traceDetailAbortRef.current = controller;
			try {
				const [detail, correlatedLogs] = await Promise.all([
					dataSource.getTrace(traceId, { signal: controller.signal }),
					dataSource.listCorrelatedLogs(traceId, undefined, { signal: controller.signal }),
				]);
				if (generation !== traceDetailGenerationRef.current || workspaceRef.current.selectedTraceId !== traceId)
					return;
				traceDetailRefreshedAtRef.current = Date.now();
				setTraceDetail(detail);
				setTraceLogs(correlatedLogs.items);
				const latest = workspaceRef.current;
				const reconciled = transitionWorkspace(latest, {
					type: "trace-detail-loaded",
					traceId: detail.traceId,
					spanIds: detail.spans.map((span) => span.spanId),
				});
				if (reconciled !== latest) commitState(reconciled, "replace");
			} catch (error) {
				if (controller.signal.aborted) return;
				// Background refreshes fail quietly; the loaded detail stays useful.
				if (mode === "initial" && workspaceRef.current.selectedTraceId === traceId)
					setNotice(presentWorkspaceError(error).message);
			} finally {
				if (traceDetailAbortRef.current === controller) traceDetailAbortRef.current = null;
			}
		},
		[commitState, dataSource],
	);

	const refreshAbortRef = useRef<AbortController | null>(null);
	const refresh = useCallback(async () => {
		if (dataSource === undefined) return;
		refreshAbortRef.current?.abort();
		const controller = new AbortController();
		refreshAbortRef.current = controller;
		const generation = refreshGenerationRef.current + 1;
		refreshGenerationRef.current = generation;
		setPhase((current) => (current === "ready" || current === "stale" ? current : "reconnecting"));
		const current = workspaceRef.current;
		const revision = workspaceQueryRevision(current);
		const query = current.signal === "traces" ? current.traceQuery : current.logQuery;
		const rangeKey = current.refreshPaused
			? `${query.fromNs.toString()}:${query.toNs.toString()}`
			: (query.toNs - query.fromNs).toString();
		const servicesCache = servicesCacheRef.current;
		const shouldRefreshServices =
			servicesCache.rangeKey !== rangeKey || Date.now() - servicesCache.fetchedAt >= 10_000;
		try {
			const [servicePage, resultPage] = await Promise.all([
				shouldRefreshServices
					? dataSource.listServices(query.fromNs, query.toNs, { signal: controller.signal })
					: Promise.resolve(undefined),
				current.signal === "traces"
					? dataSource.searchTraces(current.traceQuery, { signal: controller.signal })
					: current.logCorrelation === undefined
						? dataSource.searchLogs(current.logQuery, { signal: controller.signal })
						: dataSource.listCorrelatedLogs(current.logCorrelation.traceId, current.logCorrelation.spanId, {
								signal: controller.signal,
							}),
			]);
			if (
				generation !== refreshGenerationRef.current ||
				workspaceQueryRevision(workspaceRef.current) !== revision
			)
				return;
			if (servicePage !== undefined) {
				setServices(servicePage.items);
				servicesCacheRef.current = { rangeKey, fetchedAt: Date.now() };
			}
			if (current.signal === "traces") {
				const previousTraces = tracesRef.current;
				const nextTraces = resultPage.items as ReadonlyArray<TraceSummary>;
				tracesRef.current = nextTraces;
				setTraces(nextTraces);
				const selectedTraceId = workspaceRef.current.selectedTraceId;
				if (
					selectedTraceId !== undefined &&
					traceDetailAbortRef.current === null &&
					(traceSummaryRevision(previousTraces, selectedTraceId) !==
						traceSummaryRevision(nextTraces, selectedTraceId) ||
						Date.now() - traceDetailRefreshedAtRef.current >= 10_000)
				) {
					void loadTraceDetail(selectedTraceId, "refresh");
				}
			} else {
				const nextLogs = resultPage.items as ReadonlyArray<LogSummary>;
				logsRef.current = nextLogs;
				setLogs(nextLogs);
			}
			const latest = workspaceRef.current;
			const refreshed = transitionWorkspace(latest, {
				type: "results-refreshed",
				signal: current.signal,
				ids: resultPage.items.map((item) => ("traceId" in item && !("id" in item) ? item.traceId : item.id)),
				truncated: resultPage.truncated,
			});
			if (refreshed !== latest) commitState(refreshed, "replace");
			setPhase("ready");
		} catch (error) {
			if (controller.signal.aborted) return;
			if (
				generation !== refreshGenerationRef.current ||
				workspaceQueryRevision(workspaceRef.current) !== revision
			)
				return;
			const hasData = current.signal === "traces" ? tracesRef.current.length > 0 : logsRef.current.length > 0;
			const presentation = presentWorkspaceError(error);
			setPhase(presentation.kind === "invalid-query" ? "invalid" : hasData ? "stale" : "unavailable");
		}
	}, [commitState, dataSource, loadTraceDetail]);

	const queryRevision = workspaceQueryRevision(workspace);
	useEffect(() => {
		if (queryRevision.length > 0) void refresh();
	}, [refresh, queryRevision]);

	const refreshNow = useCallback(() => {
		const current = workspaceRef.current;
		const next = advanceWorkspaceTimeRange(current, BigInt(Date.now()) * 1_000_000n);
		if (next === current) void refresh();
		else commitState(next, "replace");
	}, [commitState, refresh]);

	useEffect(() => {
		if (workspace.refreshPaused) return;
		const tick = () => {
			if (document.visibilityState === "visible") refreshNow();
		};
		const timer = window.setInterval(tick, Math.max(750, refreshIntervalMs));
		document.addEventListener("visibilitychange", tick);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", tick);
		};
	}, [refreshIntervalMs, refreshNow, workspace.refreshPaused]);

	useEffect(() => {
		const traceId = workspace.selectedTraceId;
		if (traceId === undefined || dataSource === undefined) {
			traceDetailAbortRef.current?.abort();
			setTraceDetail(undefined);
			setTraceLogs([]);
			return;
		}
		setTraceDetail((current) => (current?.traceId === traceId ? current : undefined));
		traceDetailRefreshedAtRef.current = 0;
		void loadTraceDetail(traceId, "initial");
	}, [dataSource, loadTraceDetail, workspace.selectedTraceId]);

	const logDetailAbortRef = useRef<AbortController | null>(null);
	useEffect(() => {
		const logId = workspace.selectedLogId;
		if (logId === undefined || dataSource === undefined) {
			logDetailAbortRef.current?.abort();
			setLogDetail(undefined);
			return;
		}
		logDetailAbortRef.current?.abort();
		const controller = new AbortController();
		logDetailAbortRef.current = controller;
		setLogDetail((current) => (current?.id === logId ? current : undefined));
		void dataSource
			.getLog(logId, { signal: controller.signal })
			.then((detail) => {
				if (!controller.signal.aborted) setLogDetail(detail);
			})
			.catch((error) => {
				if (!controller.signal.aborted) setNotice(presentWorkspaceError(error).message);
			});
		return () => {
			controller.abort();
		};
	}, [dataSource, workspace.selectedLogId]);

	useEffect(
		() => () => {
			refreshAbortRef.current?.abort();
			traceDetailAbortRef.current?.abort();
			logDetailAbortRef.current?.abort();
		},
		[],
	);

	useEffect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			const target = event.target;
			if (
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				target instanceof HTMLInputElement ||
				target instanceof HTMLSelectElement ||
				target instanceof HTMLTextAreaElement ||
				(target instanceof HTMLElement && target.isContentEditable)
			)
				return;
			if (event.key === "/") {
				event.preventDefault();
				document.getElementById("telemetry-search")?.focus();
			} else if (event.key === "r") {
				refreshNow();
			} else if (event.key === "p") {
				dispatchWorkspaceAction({ type: "refresh-pause-toggled" });
			} else if (event.key === "Escape") {
				const current = workspaceRef.current;
				if (current.selectedLogId !== undefined) {
					dispatchWorkspaceAction({ type: "detail-closed", detail: "log" });
				} else if (current.selectedTraceId !== undefined) {
					dispatchWorkspaceAction({ type: "detail-closed", detail: "trace" });
				}
			}
		};
		window.addEventListener("keydown", handleShortcut);
		return () => window.removeEventListener("keydown", handleShortcut);
	}, [dispatchWorkspaceAction, refreshNow]);

	// Reveal the log inspector when it opens beneath an open trace detail.
	const logDetailId = logDetail?.id;
	useEffect(() => {
		if (logDetailId === undefined) return;
		document.getElementById("log-detail")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [logDetailId]);

	const clearFilters = () => dispatchWorkspaceAction({ type: "filters-cleared" });
	const changeRange = (minutes: number) => {
		const toNs = BigInt(Date.now()) * 1_000_000n;
		dispatchWorkspaceAction({
			type: "live-range-changed",
			toNs,
			durationNs: BigInt(minutes) * 60_000_000_000n,
		});
	};
	const changeSort = (value: string) => {
		const current = workspaceRef.current;
		if (current.signal === "traces" && (value === "newest" || value === "oldest" || value === "slowest")) {
			dispatchWorkspaceAction({ type: "trace-query-changed", query: { sort: value } });
		} else if (current.signal === "logs" && (value === "newest" || value === "oldest")) {
			dispatchWorkspaceAction({ type: "log-query-changed", query: { sort: value } });
		}
	};
	const changeSearch = (value: string | undefined) => {
		dispatchWorkspaceAction(
			workspaceRef.current.signal === "traces"
				? { type: "trace-query-changed", query: { text: value } }
				: { type: "log-query-changed", query: { text: value } },
		);
	};
	const closeLog = () => dispatchWorkspaceAction({ type: "detail-closed", detail: "log" });
	const closeTrace = () => dispatchWorkspaceAction({ type: "detail-closed", detail: "trace" });
	const selectLog = (log: LogSummary) => dispatchWorkspaceAction({ type: "log-selected", log });

	const showingTraceDetail = workspace.signal === "traces" && workspace.selectedTraceId !== undefined;
	const showingDetail = showingTraceDetail || workspace.selectedLogId !== undefined;
	const activeItems = workspace.signal === "traces" ? traces : logs;

	return (
		<div className="app-shell">
			<WorkspaceToolbar
				workspace={workspace}
				services={services}
				phase={phase}
				maxRangeMinutes={queryMaxLookbackMinutes}
				onSignal={(signal) => dispatchWorkspaceAction({ type: "signal-changed", signal })}
				onSearch={changeSearch}
				onSort={changeSort}
				onTraceQuery={(query) => dispatchWorkspaceAction({ type: "trace-query-changed", query })}
				onLogQuery={(query) => dispatchWorkspaceAction({ type: "log-query-changed", query })}
				onServices={(selected: ReadonlyArray<ServiceIdentity>) =>
					dispatchWorkspaceAction({ type: "service-filter-changed", services: selected })
				}
				onRange={changeRange}
				onPause={() => dispatchWorkspaceAction({ type: "refresh-pause-toggled" })}
				onRefresh={refreshNow}
				onClear={clearFilters}
			/>

			<main
				ref={split.containerRef}
				className={`workbench-body${showingDetail ? " has-detail" : ""}${split.dragging ? " dragging" : ""}`}
				style={{ "--list-fraction": `${(split.fraction * 100).toFixed(2)}%` } as CSSProperties}
			>
				<section className="list-pane" aria-label="Results">
					{activeItems.length === 0 && phase !== "loading" && phase !== "reconnecting" ? (
						<EmptyResults
							signal={workspace.signal}
							endpoint={endpoint}
							fromNs={
								workspace.signal === "traces" ? workspace.traceQuery.fromNs : workspace.logQuery.fromNs
							}
							toNs={workspace.signal === "traces" ? workspace.traceQuery.toNs : workspace.logQuery.toNs}
							onClear={clearFilters}
						/>
					) : null}
					{workspace.signal === "traces" && traces.length > 0 ? (
						<TraceList
							items={traces}
							selectedTraceId={workspace.selectedTraceId}
							onSelect={(trace) =>
								dispatchWorkspaceAction({ type: "trace-selected", traceId: trace.traceId })
							}
						/>
					) : null}
					{workspace.signal === "logs" && logs.length > 0 ? (
						<LogList items={logs} selectedLogId={workspace.selectedLogId} onSelect={selectLog} />
					) : null}
					{(phase === "loading" || phase === "reconnecting") && activeItems.length === 0 ? (
						<LoadingPanel label="Loading telemetry…" />
					) : null}
				</section>

				<div className={split.dragging ? "pane-divider dragging" : "pane-divider"} {...split.separatorProps} />

				<section className="detail-pane" aria-label="Detail">
					{showingTraceDetail ? (
						traceDetail === undefined ? (
							<LoadingPanel label="Loading trace…" />
						) : (
							<TraceDetailView
								trace={traceDetail}
								logs={traceLogs}
								workspace={workspace}
								onAction={dispatchWorkspaceAction}
								onOpenLog={selectLog}
								onClose={closeTrace}
								onNotice={setNotice}
							/>
						)
					) : null}
					{logDetail !== undefined ? (
						<LogDetailView
							log={logDetail}
							onAction={dispatchWorkspaceAction}
							onClose={closeLog}
							onOpenTrace={() =>
								dispatchWorkspaceAction({ type: "correlated-trace-opened", log: logDetail })
							}
							onNotice={setNotice}
						/>
					) : null}
					{!showingDetail ? (
						<div className="detail-placeholder-pane">
							<span aria-hidden="true">
								<PulseIcon size={22} />
							</span>
							<p>Select a {workspace.signal === "traces" ? "trace" : "log"} to inspect it.</p>
						</div>
					) : null}
				</section>
			</main>

			<footer className="status-bar">
				<span className="shortcut-hints">
					<kbd>/</kbd> search · <kbd>r</kbd> refresh · <kbd>p</kbd> pause · <kbd>Esc</kbd> close detail
				</span>
				<span className="endpoint" title={endpoint}>
					OTLP {endpoint}
				</span>
				<a href="/openapi.json">OpenAPI</a>
			</footer>
			<div className="notice" aria-live="polite" aria-atomic="true">
				{notice}
			</div>
		</div>
	);
}

const LoadingPanel = ({ label }: { readonly label: string }) => (
	<div className="loading-panel" role="status">
		<span className="spinner" aria-hidden="true" />
		{label}
	</div>
);

const workspaceQueryRevision = (workspace: WorkspaceState): string =>
	JSON.stringify(
		{
			signal: workspace.signal,
			query: workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery,
			logCorrelation: workspace.logCorrelation,
		},
		(_key, value) => (typeof value === "bigint" ? value.toString() : value),
	);

const traceSummaryRevision = (items: ReadonlyArray<TraceSummary>, traceId: string): string => {
	const trace = items.find((item) => item.traceId === traceId);
	return trace === undefined
		? "missing"
		: JSON.stringify(trace, (_key, value) => (typeof value === "bigint" ? value.toString() : value));
};
