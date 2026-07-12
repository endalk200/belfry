import type { LogSearchQuery, ServiceSummary, TraceSearchQuery } from "@belfry/query-api";
import { type ServiceIdentity, serviceIdentityKey } from "@belfry/telemetry";
import { formatService, type WorkspaceSignal, type WorkspaceState } from "@belfry/workspace";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AdvancedFilters, countAdvancedFilters, formatMilliseconds } from "./advanced-filters.js";

export type WorkbenchPhase = "loading" | "ready" | "stale" | "invalid" | "reconnecting" | "unavailable";

export type WorkspaceToolbarProps = {
	readonly workspace: WorkspaceState;
	readonly services: ReadonlyArray<ServiceSummary>;
	readonly phase: WorkbenchPhase;
	readonly message: string;
	readonly endpoint: string;
	readonly maxRangeMinutes: number;
	readonly onSignal: (signal: WorkspaceSignal) => void;
	readonly onSearch: (value: string | undefined) => void;
	readonly onSort: (value: string) => void;
	readonly onTraceQuery: (query: Partial<TraceSearchQuery>) => void;
	readonly onLogQuery: (query: Partial<LogSearchQuery>) => void;
	readonly onServices: (services: ReadonlyArray<ServiceIdentity>) => void;
	readonly onRange: (minutes: number) => void;
	readonly onPause: () => void;
	readonly onRefresh: () => void;
	readonly onClear: () => void;
};

export function WorkspaceToolbar({
	workspace,
	services,
	phase,
	message,
	endpoint,
	maxRangeMinutes,
	onSignal,
	onSearch,
	onSort,
	onTraceQuery,
	onLogQuery,
	onServices,
	onRange,
	onPause,
	onRefresh,
	onClear,
}: WorkspaceToolbarProps) {
	const query = workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery;
	const activeRangeMinutes = Math.max(
		1,
		Math.round(
			Number(workspace.liveRangeDurationNs ?? workspace.traceQuery.toNs - workspace.traceQuery.fromNs) /
				60_000_000_000,
		),
	);
	const standardRanges = [15, 60, 360, 1_440].filter((minutes) => minutes <= maxRangeMinutes);
	const rangeOptions = standardRanges.includes(activeRangeMinutes)
		? standardRanges
		: [activeRangeMinutes, ...standardRanges];
	const [search, setSearch] = useState(query.text ?? "");
	const [serviceSearch, setServiceSearch] = useState("");
	const selectedKeys = useMemo(
		() => new Set(workspace.serviceFilter.map(serviceIdentityKey)),
		[workspace.serviceFilter],
	);
	const visibleServices = services.filter((item) =>
		formatService(item.service).toLocaleLowerCase().includes(serviceSearch.toLocaleLowerCase()),
	);
	useEffect(() => setSearch(query.text ?? ""), [query.text]);
	const submit = (event: FormEvent) => {
		event.preventDefault();
		onSearch(search.trim() === "" ? undefined : search.trim());
	};
	const toggleService = (service: ServiceIdentity, selected: boolean) => {
		const key = serviceIdentityKey(service);
		onServices(
			selected
				? [...workspace.serviceFilter, service]
				: workspace.serviceFilter.filter((item) => serviceIdentityKey(item) !== key),
		);
	};
	const advancedFilterCount = countAdvancedFilters(workspace);

	return (
		<>
			<header className="topbar">
				<div className="brand-block">
					<a className="brand" href="/traces" aria-label="Belfry trace workspace">
						<span className="brand-mark" aria-hidden="true">
							B
						</span>
						<span>Belfry</span>
					</a>
					<span className="local-label">LOCAL WORKBENCH</span>
				</div>
				<div className={`connection connection-${phase}`} role="status" aria-live="polite">
					<span className="connection-glyph" aria-hidden="true" />
					<span>{phase === "ready" ? "Live" : phase}</span>
					<span className="connection-message">{message}</span>
				</div>
			</header>

			<div className="workspace-bar">
				<nav className="signal-tabs" aria-label="Telemetry signal">
					<button
						type="button"
						className={workspace.signal === "traces" ? "active" : undefined}
						aria-current={workspace.signal === "traces" ? "page" : undefined}
						onClick={() => onSignal("traces")}
					>
						Traces
					</button>
					<button
						type="button"
						className={workspace.signal === "logs" ? "active" : undefined}
						aria-current={workspace.signal === "logs" ? "page" : undefined}
						onClick={() => onSignal("logs")}
					>
						Logs
					</button>
				</nav>
				<span className="endpoint" title={endpoint}>
					OTLP {endpoint}
				</span>
			</div>

			<section className="filters" aria-label="Workspace filters">
				<form className="search-form" aria-label={`Search ${workspace.signal}`} onSubmit={submit}>
					<label className="sr-only" htmlFor="telemetry-search">
						Search {workspace.signal}
					</label>
					<span aria-hidden="true" className="search-icon">
						⌕
					</span>
					<input
						id="telemetry-search"
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
						placeholder={
							workspace.signal === "traces"
								? "Operation, trace ID, or attribute…"
								: "Log body, trace ID, or attribute…"
						}
					/>
					<button type="submit">Apply</button>
				</form>

				<details className="service-picker">
					<summary aria-label={`Filter Services, ${workspace.serviceFilter.length} selected`}>
						Services <span className="filter-count">{workspace.serviceFilter.length || "all"}</span>
					</summary>
					<div className="service-popover">
						<label htmlFor="service-search">Find a Service</label>
						<input
							id="service-search"
							value={serviceSearch}
							onChange={(event) => setServiceSearch(event.currentTarget.value)}
							placeholder="namespace / name / environment"
						/>
						<fieldset>
							<legend className="sr-only">Services</legend>
							{visibleServices.length === 0 ? <p>No matching Services in this range.</p> : null}
							{visibleServices.map(({ service, spanCount, logCount }) => {
								const key = serviceIdentityKey(service);
								return (
									<label key={key} className="service-option">
										<input
											type="checkbox"
											checked={selectedKeys.has(key)}
											onChange={(event) => toggleService(service, event.currentTarget.checked)}
										/>
										<span>{formatService(service)}</span>
										<small>
											{spanCount} spans · {logCount} logs
										</small>
									</label>
								);
							})}
						</fieldset>
						<button type="button" className="quiet" onClick={() => onServices([])}>
							Clear Services
						</button>
					</div>
				</details>

				<AdvancedFilters
					workspace={workspace}
					count={advancedFilterCount}
					onTraceQuery={onTraceQuery}
					onLogQuery={onLogQuery}
				/>

				<label className="select-control">
					<span>Range</span>
					<select
						value={String(activeRangeMinutes)}
						onChange={(event) => onRange(Number(event.currentTarget.value))}
					>
						{rangeOptions.map((minutes) => (
							<option key={minutes} value={minutes}>
								{minutes === 60
									? "Last hour"
									: minutes % 60 === 0
										? `Last ${minutes / 60} hours`
										: `Last ${minutes} minutes`}
							</option>
						))}
					</select>
				</label>

				<label className="select-control">
					<span>Sort</span>
					<select value={query.sort} onChange={(event) => onSort(event.currentTarget.value)}>
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
						{workspace.signal === "traces" ? <option value="slowest">Slowest</option> : null}
					</select>
				</label>

				<div className="filter-actions">
					<button type="button" className="quiet" onClick={onClear}>
						Clear filters
					</button>
					<button
						type="button"
						className="icon-button"
						onClick={onRefresh}
						aria-label="Refresh now"
						title="Refresh now"
					>
						↻
					</button>
					<button
						type="button"
						className={workspace.refreshPaused ? "pause active" : "pause"}
						onClick={onPause}
					>
						{workspace.refreshPaused ? "Resume" : "Pause"}
					</button>
				</div>
			</section>

			{workspace.serviceFilter.length > 0 || query.text !== undefined || advancedFilterCount > 0 ? (
				<fieldset className="active-filters">
					<legend>Active</legend>
					{workspace.serviceFilter.map((service) => (
						<span className="filter-chip" key={serviceIdentityKey(service)}>
							Service: {formatService(service)}
						</span>
					))}
					{query.text !== undefined ? <span className="filter-chip">Text: {query.text}</span> : null}
					{workspace.signal === "traces" && workspace.traceQuery.operation !== undefined ? (
						<span className="filter-chip">Operation: {workspace.traceQuery.operation}</span>
					) : null}
					{workspace.signal === "traces" &&
					workspace.traceQuery.status !== undefined &&
					workspace.traceQuery.status !== "all" ? (
						<span className="filter-chip">Status: {workspace.traceQuery.status}</span>
					) : null}
					{workspace.signal === "traces" && workspace.traceQuery.minimumDurationNs !== undefined ? (
						<span className="filter-chip">
							Duration ≥ {formatMilliseconds(workspace.traceQuery.minimumDurationNs)} ms
						</span>
					) : null}
					{workspace.signal === "traces" && workspace.traceQuery.maximumDurationNs !== undefined ? (
						<span className="filter-chip">
							Duration ≤ {formatMilliseconds(workspace.traceQuery.maximumDurationNs)} ms
						</span>
					) : null}
					{query.attributes.map((filter) => (
						<span className="filter-chip" key={`${filter.key}:${filter.operator}:${filter.value}`}>
							Attribute: {filter.key} {filter.operator === "equals" ? "=" : "contains"} {filter.value}
						</span>
					))}
					{workspace.signal === "traces" && workspace.traceQuery.traceId !== undefined ? (
						<span className="filter-chip">Trace: {workspace.traceQuery.traceId}</span>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.minimumSeverity !== undefined ? (
						<span className="filter-chip">Severity ≥ {workspace.logQuery.minimumSeverity}</span>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.maximumSeverity !== undefined ? (
						<span className="filter-chip">Severity ≤ {workspace.logQuery.maximumSeverity}</span>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.traceId !== undefined ? (
						<span className="filter-chip">Trace: {workspace.logQuery.traceId}</span>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.spanId !== undefined ? (
						<span className="filter-chip">Span: {workspace.logQuery.spanId}</span>
					) : null}
				</fieldset>
			) : null}
		</>
	);
}
