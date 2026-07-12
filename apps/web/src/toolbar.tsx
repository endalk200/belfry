import type { LogSearchQuery, ServiceSummary, TraceSearchQuery } from "@belfry/query-api";
import { type ServiceIdentity, serviceIdentityKey } from "@belfry/telemetry";
import { formatService, type WorkspaceSignal, type WorkspaceState } from "@belfry/workspace";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { AdvancedFilters, countAdvancedFilters, formatMilliseconds } from "./advanced-filters.js";
import { ChevronDownIcon, CloseIcon, PauseIcon, PlayIcon, RefreshIcon, SearchIcon } from "./icons.js";
import { serviceColor } from "./palette.js";

export type WorkbenchPhase = "loading" | "ready" | "stale" | "invalid" | "reconnecting" | "unavailable";

export type WorkspaceToolbarProps = {
	readonly workspace: WorkspaceState;
	readonly services: ReadonlyArray<ServiceSummary>;
	readonly phase: WorkbenchPhase;
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
	const servicePickerRef = useRef<HTMLDetailsElement>(null);
	const serviceSearchRef = useRef<HTMLInputElement>(null);
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
	const removeService = (service: ServiceIdentity) => toggleService(service, false);
	const removeAttribute = (target: { key: string; operator: string; value: string }) => {
		const attributes = query.attributes.filter(
			(filter) =>
				!(filter.key === target.key && filter.operator === target.operator && filter.value === target.value),
		);
		if (workspace.signal === "traces") onTraceQuery({ attributes });
		else onLogQuery({ attributes });
	};
	const advancedFilterCount = countAdvancedFilters(workspace);
	const hasActiveFilters = workspace.serviceFilter.length > 0 || query.text !== undefined || advancedFilterCount > 0;

	useEffect(() => {
		const dismiss = (event: PointerEvent) => {
			if (!(event.target instanceof Node)) return;
			for (const picker of openPickers()) {
				if (!picker.contains(event.target)) picker.open = false;
			}
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			for (const picker of openPickers()) {
				picker.open = false;
				picker.querySelector("summary")?.focus();
				event.stopPropagation();
			}
		};
		document.addEventListener("pointerdown", dismiss);
		document.addEventListener("keydown", closeOnEscape, true);
		return () => {
			document.removeEventListener("pointerdown", dismiss);
			document.removeEventListener("keydown", closeOnEscape, true);
		};
	}, []);

	// Focus the Service search as soon as the picker opens.
	useEffect(() => {
		const picker = servicePickerRef.current;
		if (picker === null) return;
		const onToggle = () => {
			if (picker.open) serviceSearchRef.current?.focus();
		};
		picker.addEventListener("toggle", onToggle);
		return () => picker.removeEventListener("toggle", onToggle);
	}, []);

	return (
		<>
			<header className="command-bar">
				<a className="brand" href="/traces" aria-label="Belfry trace workspace">
					<span className="brand-mark" aria-hidden="true">
						B
					</span>
					<span className="brand-name">Belfry</span>
				</a>

				<nav className="signal-switch" aria-label="Telemetry signal">
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

				<form className="search-form" aria-label={`Search ${workspace.signal}`} onSubmit={submit}>
					<label className="sr-only" htmlFor="telemetry-search">
						Search {workspace.signal}
					</label>
					<span aria-hidden="true" className="search-icon">
						<SearchIcon />
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
					{search.trim() === "" ? (
						<kbd className="search-hint">/</kbd>
					) : (
						<button
							type="submit"
							className="search-submit"
							aria-label={`Apply ${workspace.signal === "traces" ? "trace" : "log"} search`}
						>
							Apply
						</button>
					)}
				</form>

				<details className="picker service-picker" ref={servicePickerRef}>
					<summary aria-label={`Filter Services, ${workspace.serviceFilter.length} selected`}>
						Services
						<span className={workspace.serviceFilter.length > 0 ? "filter-count engaged" : "filter-count"}>
							{workspace.serviceFilter.length || "all"}
						</span>
						<span className="summary-chevron" aria-hidden="true">
							<ChevronDownIcon />
						</span>
					</summary>
					<div className="popover service-popover">
						<label className="sr-only" htmlFor="service-search">
							Find a Service
						</label>
						<input
							id="service-search"
							ref={serviceSearchRef}
							value={serviceSearch}
							onChange={(event) => setServiceSearch(event.currentTarget.value)}
							placeholder="Filter Services…"
						/>
						<fieldset>
							<legend className="sr-only">Services</legend>
							{visibleServices.length === 0 ? (
								<p className="popover-empty">No Services in this time range.</p>
							) : null}
							{visibleServices.map(({ service, spanCount, logCount }) => {
								const key = serviceIdentityKey(service);
								return (
									<label key={key} className="service-option">
										<input
											type="checkbox"
											checked={selectedKeys.has(key)}
											onChange={(event) => toggleService(service, event.currentTarget.checked)}
										/>
										<span
											className="service-dot"
											aria-hidden="true"
											style={{ backgroundColor: serviceColor(service.name) }}
										/>
										<span className="service-name">{formatService(service)}</span>
										<small>{workspace.signal === "traces" ? spanCount : logCount}</small>
									</label>
								);
							})}
						</fieldset>
						{workspace.serviceFilter.length > 0 ? (
							<button type="button" className="popover-footer-action" onClick={() => onServices([])}>
								Clear Services
							</button>
						) : null}
					</div>
				</details>

				<AdvancedFilters
					workspace={workspace}
					count={advancedFilterCount}
					onTraceQuery={onTraceQuery}
					onLogQuery={onLogQuery}
				/>

				<label className="select-control" aria-label="Time range">
					<select
						value={String(activeRangeMinutes)}
						onChange={(event) => onRange(Number(event.currentTarget.value))}
					>
						{rangeOptions.map((minutes) => (
							<option key={minutes} value={minutes}>
								{rangeLabel(minutes)}
							</option>
						))}
					</select>
					<span className="summary-chevron" aria-hidden="true">
						<ChevronDownIcon />
					</span>
				</label>

				<label className="select-control" aria-label="Sort order">
					<select value={query.sort} onChange={(event) => onSort(event.currentTarget.value)}>
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
						{workspace.signal === "traces" ? <option value="slowest">Slowest</option> : null}
					</select>
					<span className="summary-chevron" aria-hidden="true">
						<ChevronDownIcon />
					</span>
				</label>

				<div className="live-controls">
					<button
						type="button"
						className="icon-button"
						onClick={onRefresh}
						aria-label="Refresh now"
						title="Refresh now (r)"
					>
						<RefreshIcon />
					</button>
					<button
						type="button"
						className={workspace.refreshPaused ? "pause active" : "pause"}
						onClick={onPause}
						title={workspace.refreshPaused ? "Resume live refresh (p)" : "Pause live refresh (p)"}
					>
						{workspace.refreshPaused ? <PlayIcon /> : <PauseIcon />}
						<span>{workspace.refreshPaused ? "Resume" : "Pause"}</span>
					</button>
					<div className={`connection connection-${phase}`} role="status" aria-live="polite">
						<span className="connection-glyph" aria-hidden="true" />
						<span>{phase === "ready" ? "Live" : phase}</span>
					</div>
				</div>
			</header>

			{hasActiveFilters ? (
				<section className="active-filters" aria-label="Active filters">
					{workspace.serviceFilter.map((service) => (
						<FilterChip
							key={serviceIdentityKey(service)}
							label={`Service: ${formatService(service)}`}
							onRemove={() => removeService(service)}
						/>
					))}
					{query.text !== undefined ? (
						<FilterChip label={`Text: ${query.text}`} onRemove={() => onSearch(undefined)} />
					) : null}
					{workspace.signal === "traces" && workspace.traceQuery.operation !== undefined ? (
						<FilterChip
							label={`Operation: ${workspace.traceQuery.operation}`}
							onRemove={() => onTraceQuery({ operation: undefined })}
						/>
					) : null}
					{workspace.signal === "traces" &&
					workspace.traceQuery.status !== undefined &&
					workspace.traceQuery.status !== "all" ? (
						<FilterChip
							label={`Status: ${workspace.traceQuery.status}`}
							onRemove={() => onTraceQuery({ status: undefined })}
						/>
					) : null}
					{workspace.signal === "traces" && workspace.traceQuery.minimumDurationNs !== undefined ? (
						<FilterChip
							label={`Duration ≥ ${formatMilliseconds(workspace.traceQuery.minimumDurationNs)} ms`}
							onRemove={() => onTraceQuery({ minimumDurationNs: undefined })}
						/>
					) : null}
					{workspace.signal === "traces" && workspace.traceQuery.maximumDurationNs !== undefined ? (
						<FilterChip
							label={`Duration ≤ ${formatMilliseconds(workspace.traceQuery.maximumDurationNs)} ms`}
							onRemove={() => onTraceQuery({ maximumDurationNs: undefined })}
						/>
					) : null}
					{query.attributes.map((filter) => (
						<FilterChip
							key={`${filter.key}:${filter.operator}:${filter.value}`}
							label={`Attribute: ${filter.key} ${filter.operator === "equals" ? "=" : "contains"} ${filter.value}`}
							onRemove={() => removeAttribute(filter)}
						/>
					))}
					{workspace.signal === "traces" && workspace.traceQuery.traceId !== undefined ? (
						<FilterChip
							label={`Trace: ${workspace.traceQuery.traceId}`}
							onRemove={() => onTraceQuery({ traceId: undefined })}
						/>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.minimumSeverity !== undefined ? (
						<FilterChip
							label={`Severity ≥ ${workspace.logQuery.minimumSeverity}`}
							onRemove={() => onLogQuery({ minimumSeverity: undefined })}
						/>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.maximumSeverity !== undefined ? (
						<FilterChip
							label={`Severity ≤ ${workspace.logQuery.maximumSeverity}`}
							onRemove={() => onLogQuery({ maximumSeverity: undefined })}
						/>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.traceId !== undefined ? (
						<FilterChip
							label={`Trace: ${workspace.logQuery.traceId}`}
							onRemove={() => onLogQuery({ traceId: undefined })}
						/>
					) : null}
					{workspace.signal === "logs" && workspace.logQuery.spanId !== undefined ? (
						<FilterChip
							label={`Span: ${workspace.logQuery.spanId}`}
							onRemove={() => onLogQuery({ spanId: undefined })}
						/>
					) : null}
					<button type="button" className="clear-all" onClick={onClear}>
						Clear all
					</button>
				</section>
			) : null}
		</>
	);
}

const FilterChip = ({ label, onRemove }: { readonly label: string; readonly onRemove: () => void }) => (
	<span className="filter-chip">
		<span>{label}</span>
		<button type="button" onClick={onRemove} aria-label={`Remove filter ${label}`}>
			<CloseIcon size={10} />
		</button>
	</span>
);

const rangeLabel = (minutes: number): string =>
	minutes === 60 ? "Last hour" : minutes % 60 === 0 ? `Last ${minutes / 60} hours` : `Last ${minutes} min`;

const openPickers = (): ReadonlyArray<HTMLDetailsElement> =>
	Array.from(document.querySelectorAll<HTMLDetailsElement>("details.picker[open]"));
