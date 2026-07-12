import type { ServiceSummary } from "@belfry/query-api";
import type { LogDetail, LogSummary, ServiceIdentity, TraceDetail, TraceSummary } from "@belfry/telemetry";
import {
	advanceWorkspaceTimeRange,
	emptyWorkspaceMessage,
	initialWorkspaceState,
	presentWorkspaceError,
	transitionWorkspace,
	type WorkspaceAction,
	type WorkspaceState,
	workspaceFromUrl,
	workspaceToUrl,
} from "@belfry/workspace";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { connectWebWorkspace, type WebWorkspaceDataSource } from "./data-source.js";
import { LogDetailView, TraceDetailView } from "./details.js";
import { EmptyResults, LogList, TraceList } from "./lists.js";
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
	const [traceDetail, setTraceDetail] = useState<TraceDetail>();
	const [logDetail, setLogDetail] = useState<LogDetail>();
	const [phase, setPhase] = useState<WorkbenchPhase>("loading");
	const [message, setMessage] = useState("Connecting to the local Daemon…");
	const [notice, setNotice] = useState("");

	const commitState = useCallback((next: WorkspaceState, mode: "push" | "replace" = "push") => {
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
		if (providedDataSource !== undefined) {
			setDataSource(providedDataSource);
			return;
		}
		let cancelled = false;
		void connectWebWorkspace(endpoint, queryMaxResults)
			.then((connected) => {
				if (!cancelled) setDataSource(connected);
			})
			.catch((error) => {
				if (cancelled) return;
				setPhase("unavailable");
				setMessage(`Daemon unavailable: ${errorMessage(error)}`);
			});
		return () => {
			cancelled = true;
		};
	}, [endpoint, providedDataSource, queryMaxResults]);

	const refresh = useCallback(async () => {
		if (dataSource === undefined) return;
		const generation = refreshGenerationRef.current + 1;
		refreshGenerationRef.current = generation;
		setPhase((current) => (current === "ready" || current === "stale" ? current : "reconnecting"));
		const current = workspaceRef.current;
		const revision = workspaceQueryRevision(current);
		const query = current.signal === "traces" ? current.traceQuery : current.logQuery;
		try {
			const [servicePage, resultPage] = await Promise.all([
				dataSource.listServices(query.fromNs, query.toNs),
				current.signal === "traces"
					? dataSource.searchTraces(current.traceQuery)
					: current.logCorrelation === undefined
						? dataSource.searchLogs(current.logQuery)
						: dataSource.listCorrelatedLogs(current.logCorrelation.traceId, current.logCorrelation.spanId),
			]);
			if (
				generation !== refreshGenerationRef.current ||
				workspaceQueryRevision(workspaceRef.current) !== revision
			)
				return;
			setServices(servicePage.items);
			if (current.signal === "traces") {
				const nextTraces = resultPage.items as ReadonlyArray<TraceSummary>;
				tracesRef.current = nextTraces;
				setTraces(nextTraces);
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
			setMessage(
				resultPage.items.length === 0
					? emptyWorkspaceMessage(current.signal)
					: `${resultPage.items.length} ${current.signal} · bounded to ${resultPage.bounds.limit} results${resultPage.truncated ? " · more available" : ""}`,
			);
		} catch (error) {
			if (
				generation !== refreshGenerationRef.current ||
				workspaceQueryRevision(workspaceRef.current) !== revision
			)
				return;
			const hasData = current.signal === "traces" ? tracesRef.current.length > 0 : logsRef.current.length > 0;
			const presentation = presentWorkspaceError(error);
			setPhase(presentation.kind === "invalid-query" ? "invalid" : hasData ? "stale" : "unavailable");
			setMessage(`${presentation.message}${hasData ? " · showing retained results" : ""}`);
		}
	}, [commitState, dataSource]);

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
			setTraceDetail(undefined);
			return;
		}
		let cancelled = false;
		setTraceDetail((current) => (current?.traceId === traceId ? current : undefined));
		void dataSource
			.getTrace(traceId)
			.then((detail) => {
				if (!cancelled) {
					setTraceDetail(detail);
					const latest = workspaceRef.current;
					const reconciled = transitionWorkspace(latest, {
						type: "trace-detail-loaded",
						traceId: detail.traceId,
						spanIds: detail.spans.map((span) => span.spanId),
					});
					if (reconciled !== latest) commitState(reconciled, "replace");
				}
			})
			.catch((error) => {
				if (!cancelled) setMessage(presentWorkspaceError(error).message);
			});
		return () => {
			cancelled = true;
		};
	}, [commitState, dataSource, workspace.selectedTraceId]);

	useEffect(() => {
		const logId = workspace.selectedLogId;
		if (logId === undefined || dataSource === undefined) {
			setLogDetail(undefined);
			return;
		}
		let cancelled = false;
		setLogDetail((current) => (current?.id === logId ? current : undefined));
		void dataSource
			.getLog(logId)
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
		const handleShortcut = (event: KeyboardEvent) => {
			const target = event.target;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLSelectElement ||
				target instanceof HTMLTextAreaElement
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
	const activeItems = workspace.signal === "traces" ? traces : logs;

	return (
		<div className="app-shell">
			<WorkspaceToolbar
				workspace={workspace}
				services={services}
				phase={phase}
				message={message}
				endpoint={endpoint}
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

			<main className={showingTraceDetail ? "workspace-main detail-mode" : "workspace-main"}>
				{showingTraceDetail ? (
					traceDetail === undefined ? (
						<LoadingPanel label="Loading complete trace…" />
					) : (
						<TraceDetailView
							trace={traceDetail}
							workspace={workspace}
							onAction={dispatchWorkspaceAction}
							onOpenLog={selectLog}
							onClose={closeTrace}
							onNotice={setNotice}
						/>
					)
				) : (
					<>
						<div className="result-heading">
							<div>
								<p className="eyebrow">RECENT TELEMETRY</p>
								<h1>{workspace.signal === "traces" ? "Trace search" : "Log search"}</h1>
							</div>
							<span>{activeItems.length} visible records</span>
						</div>
						{activeItems.length === 0 && phase !== "loading" && phase !== "reconnecting" ? (
							<EmptyResults
								signal={workspace.signal}
								endpoint={endpoint}
								fromNs={
									workspace.signal === "traces"
										? workspace.traceQuery.fromNs
										: workspace.logQuery.fromNs
								}
								toNs={
									workspace.signal === "traces" ? workspace.traceQuery.toNs : workspace.logQuery.toNs
								}
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
							<LoadingPanel label="Loading bounded telemetry…" />
						) : null}
					</>
				)}

				{logDetail !== undefined ? (
					<LogDetailView
						log={logDetail}
						onAction={dispatchWorkspaceAction}
						onClose={closeLog}
						onOpenTrace={() => dispatchWorkspaceAction({ type: "correlated-trace-opened", log: logDetail })}
						onNotice={setNotice}
					/>
				) : null}
			</main>

			<footer className="status-bar">
				<span>
					<kbd>/</kbd> search · <kbd>r</kbd> refresh · <kbd>p</kbd> pause · <kbd>Esc</kbd> close detail
				</span>
				<a href="/openapi.json">OpenAPI</a>
				<a href="/docs/troubleshooting">Troubleshooting</a>
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

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const workspaceQueryRevision = (workspace: WorkspaceState): string =>
	JSON.stringify(
		{
			signal: workspace.signal,
			query: workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery,
			logCorrelation: workspace.logCorrelation,
		},
		(_key, value) => (typeof value === "bigint" ? value.toString() : value),
	);
