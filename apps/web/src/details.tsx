import type {
	LogDetail,
	LogSummary,
	OtlpAnyValue,
	SpanDetail,
	TelemetryAttributes,
	TraceDetail,
} from "@belfry/telemetry";
import {
	buildTraceWaterfall,
	formatAnyValue,
	formatNanoseconds,
	formatService,
	formatSeverity,
	formatSpanStatus,
	formatTimestamp,
	type WorkspaceAction,
	type WorkspaceState,
} from "@belfry/workspace";
import { useMemo, useRef, useState } from "react";

import { useVirtualWindow } from "./virtual-list.js";

export function TraceDetailView({
	trace,
	workspace,
	onAction,
	onOpenLog,
	onClose,
	onNotice,
}: {
	readonly trace: TraceDetail;
	readonly workspace: WorkspaceState;
	readonly onAction: (action: WorkspaceAction) => void;
	readonly onOpenLog: (log: LogSummary) => void;
	readonly onClose: () => void;
	readonly onNotice: (message: string) => void;
}) {
	const selectedSpan = trace.spans.find((span) => span.spanId === workspace.selectedSpanId);
	const promoteAttribute = (key: string, value: string) =>
		onAction({ type: "attribute-filter-promoted", signal: "traces", key, value });
	return (
		<article className="trace-detail" aria-labelledby="trace-title">
			<div className="detail-heading">
				<div>
					<button type="button" className="back-button" onClick={onClose}>
						← Trace list
					</button>
					<p className="eyebrow">TRACE DETAIL</p>
					<h1 id="trace-title">{trace.rootOperation || "Unnamed operation"}</h1>
					<button type="button" className="copy-id" onClick={() => void copyText(trace.traceId, onNotice)}>
						<code>{trace.traceId}</code>
						<span>Copy</span>
					</button>
				</div>
				<div className="trace-summary">
					<SummaryMetric label="Duration" value={formatNanoseconds(trace.durationNs)} />
					<SummaryMetric label="Spans" value={String(trace.spanCount)} />
					<SummaryMetric label="Errors" value={String(trace.errorCount)} alert={trace.errorCount > 0} />
					<SummaryMetric label="Services" value={String(trace.services.length)} />
				</div>
			</div>
			<div className="trace-context">
				<span>{formatTimestamp(trace.startTimeNs)}</span>
				<span>{trace.active ? "Running trace" : "Complete trace"}</span>
				<span>{trace.services.map(formatService).join(" → ")}</span>
				{trace.warnings.map((warning) => (
					<span className="warning" key={warning}>
						Warning: {warning}
					</span>
				))}
			</div>

			<Waterfall trace={trace} workspace={workspace} onAction={onAction} />

			<div className="correlation-actions">
				<button type="button" onClick={() => onAction({ type: "trace-logs-opened" })}>
					Open correlated trace logs
				</button>
				{selectedSpan !== undefined ? (
					<button type="button" onClick={() => onAction({ type: "span-logs-opened" })}>
						Open correlated logs for selected span
					</button>
				) : null}
			</div>

			{selectedSpan === undefined ? (
				<div className="detail-placeholder">
					<p>
						Select a waterfall row to inspect the span's complete attributes, events, links, resource,
						scope, and correlated logs.
					</p>
				</div>
			) : (
				<SpanDetailPanel
					span={selectedSpan}
					logs={trace.logs.filter((log) => log.spanId === selectedSpan.spanId)}
					onOpenLog={onOpenLog}
					onAction={onAction}
					onFilterAttribute={promoteAttribute}
					onNotice={onNotice}
				/>
			)}

			<section className="trace-log-strip" aria-labelledby="trace-logs-title">
				<div className="section-heading">
					<div>
						<p className="eyebrow">CORRELATION</p>
						<h2 id="trace-logs-title">Trace logs</h2>
					</div>
					<span>{trace.logs.length} records</span>
				</div>
				{trace.logs.length === 0 ? (
					<p className="muted">No logs carry this trace identity.</p>
				) : (
					<CorrelatedLogList logs={trace.logs} onOpenLog={onOpenLog} label="Trace-correlated logs" />
				)}
			</section>
		</article>
	);
}

function Waterfall({
	trace,
	workspace,
	onAction,
}: {
	readonly trace: TraceDetail;
	readonly workspace: WorkspaceState;
	readonly onAction: (action: WorkspaceAction) => void;
}) {
	const [zoom, setZoom] = useState(1);
	const container = useRef<HTMLDivElement>(null);
	const rows = useMemo(
		() => buildTraceWaterfall(trace.spans, workspace.collapsedSpanIds),
		[trace.spans, workspace.collapsedSpanIds],
	);
	const virtual = useVirtualWindow(container, rows.length, 36, 8);
	const traceStart = trace.startTimeNs;
	const traceDuration =
		trace.durationNs ??
		(rows.reduce((latest, row) => {
			const end = row.span.endTimeNs ?? row.span.startTimeNs;
			return end > latest ? end : latest;
		}, traceStart) - traceStart ||
			1n);

	return (
		<section className="waterfall-section" aria-labelledby="waterfall-title">
			<div className="section-heading">
				<div>
					<p className="eyebrow">TIMELINE</p>
					<h2 id="waterfall-title">Span waterfall</h2>
				</div>
				<label className="zoom-control">
					Scale{" "}
					<input
						type="range"
						min="1"
						max="4"
						step="0.25"
						value={zoom}
						onChange={(event) => setZoom(Number(event.currentTarget.value))}
					/>
					<output>{zoom.toFixed(2)}×</output>
				</label>
			</div>
			<div className="waterfall-header">
				<span>Span / Service</span>
				<span>Relative timeline</span>
				<span>Duration</span>
				<span>Logs</span>
			</div>
			<div className="waterfall-scroll" ref={container}>
				<div style={{ height: virtual.totalHeight, minWidth: `${Math.round(900 * zoom)}px` }}>
					<div style={{ transform: `translateY(${virtual.offset}px)` }}>
						{rows.slice(virtual.start, virtual.end).map((row) => {
							const selected = row.span.spanId === workspace.selectedSpanId;
							const startPercent = ratio(row.span.startTimeNs - traceStart, traceDuration) * 100;
							const duration =
								row.span.endTimeNs === undefined ? 0n : row.span.endTimeNs - row.span.startTimeNs;
							const widthPercent = Math.max(0.35, ratio(duration, traceDuration) * 100);
							return (
								<div className={`waterfall-row${selected ? " selected" : ""}`} key={row.span.spanId}>
									<div
										className="span-name"
										style={{ paddingInlineStart: `${12 + row.depth * 18}px` }}
									>
										{row.hasChildren ? (
											<button
												type="button"
												className="collapse"
												onClick={() =>
													onAction({ type: "span-collapse-toggled", spanId: row.span.spanId })
												}
												aria-label={`${row.collapsed ? "Expand" : "Collapse"} ${row.span.name}`}
											>
												{row.collapsed ? "▸" : "▾"}
											</button>
										) : (
											<span className="leaf" aria-hidden="true">
												·
											</span>
										)}
										<button
											type="button"
											className="span-select"
											aria-label={`Inspect span ${row.span.name}`}
											onClick={() =>
												onAction({
													type: "span-selected",
													traceId: trace.traceId,
													spanId: row.span.spanId,
												})
											}
										>
											<strong>{row.span.name}</strong>
											<small>
												{formatService(row.span.service)} · {spanStatus(row.span)}
											</small>
										</button>
									</div>
									<div className="timeline">
										<span
											className={`timeline-bar status-${spanStatus(row.span).toLocaleLowerCase()}`}
											style={{
												insetInlineStart: `${startPercent}%`,
												width: `${Math.min(100 - startPercent, widthPercent)}%`,
											}}
										/>
										<span className="relative-time">
											+{formatNanoseconds(row.span.startTimeNs - traceStart)}
										</span>
									</div>
									<span className="numeric">
										{formatNanoseconds(row.span.endTimeNs === undefined ? undefined : duration)}
									</span>
									<span className="numeric">{row.span.logCount}</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}

function SpanDetailPanel({
	span,
	logs,
	onOpenLog,
	onAction,
	onFilterAttribute,
	onNotice,
}: {
	readonly span: SpanDetail;
	readonly logs: ReadonlyArray<LogSummary>;
	readonly onOpenLog: (log: LogSummary) => void;
	readonly onAction: (action: WorkspaceAction) => void;
	readonly onFilterAttribute: (key: string, value: string) => void;
	readonly onNotice: (message: string) => void;
}) {
	const [tab, setTab] = useState<"overview" | "attributes" | "events" | "links">("overview");
	const filterableAttributeKeys = useMemo(
		() => new Set(span.filterableAttributeKeys ?? []),
		[span.filterableAttributeKeys],
	);
	return (
		<section className="bottom-detail" aria-labelledby="span-detail-title">
			<div className="section-heading">
				<div>
					<p className="eyebrow">SELECTED SPAN</p>
					<h2 id="span-detail-title">{span.name}</h2>
				</div>
				<button type="button" className="copy-id" onClick={() => void copyText(span.spanId, onNotice)}>
					<code>{span.spanId}</code>
					<span>Copy</span>
				</button>
			</div>
			<nav className="detail-tabs" aria-label="Span detail sections">
				{(["overview", "attributes", "events", "links"] as const).map((name) => (
					<button
						type="button"
						aria-pressed={tab === name}
						className={tab === name ? "active" : undefined}
						key={name}
						onClick={() => setTab(name)}
					>
						{titleCase(name)}{" "}
						{name === "events"
							? `(${span.events.length})`
							: name === "links"
								? `(${span.links.length})`
								: ""}
					</button>
				))}
			</nav>
			<div className="tab-panel">
				{tab === "overview" ? (
					<SpanOverview span={span} logs={logs} onOpenLog={onOpenLog} onAction={onAction} />
				) : null}
				{tab === "attributes" ? (
					<>
						<AttributeTable
							title="Span attributes"
							attributes={span.attributes}
							onFilter={onFilterAttribute}
							filterableKeys={filterableAttributeKeys}
						/>
						<AttributeTable title="Resource attributes" attributes={span.resource.attributes} />
						<AttributeTable title="Scope attributes" attributes={span.scope.attributes ?? {}} />
					</>
				) : null}
				{tab === "events" ? <EventList span={span} /> : null}
				{tab === "links" ? <LinkList span={span} /> : null}
			</div>
		</section>
	);
}

function SpanOverview({
	span,
	logs,
	onOpenLog,
	onAction,
}: {
	readonly span: SpanDetail;
	readonly logs: ReadonlyArray<LogSummary>;
	readonly onOpenLog: (log: LogSummary) => void;
	readonly onAction: (action: WorkspaceAction) => void;
}) {
	return (
		<>
			<div className="definition-grid">
				<Definition
					label="Status"
					value={`${spanStatus(span)}${span.status.message === undefined ? "" : ` · ${span.status.message}`}`}
				/>
				<Definition
					label="Duration"
					value={formatNanoseconds(
						span.endTimeNs === undefined ? undefined : span.endTimeNs - span.startTimeNs,
					)}
				/>
				<Definition label="Service" value={formatService(span.service)} />
				<Definition label="Kind" value={spanKind(span.kind)} />
				<Definition label="Started" value={formatTimestamp(span.startTimeNs)} />
				<Definition label="Parent" value={span.parentSpanId ?? "root"} mono />
				<Definition label="Trace state" value={span.traceState ?? "None"} mono />
				<Definition label="Flags" value={String(span.flags ?? 0)} />
				<Definition
					label="Scope"
					value={`${span.scope.name || "unnamed"}${span.scope.version === undefined ? "" : ` ${span.scope.version}`}`}
				/>
				<Definition label="Dropped span attributes" value={String(span.droppedAttributesCount ?? 0)} />
				<Definition label="Dropped events" value={String(span.droppedEventsCount ?? 0)} />
				<Definition label="Dropped links" value={String(span.droppedLinksCount ?? 0)} />
				<Definition
					label="Dropped resource attributes"
					value={String(span.resource.droppedAttributesCount ?? 0)}
				/>
				<Definition label="Dropped scope attributes" value={String(span.scope.droppedAttributesCount ?? 0)} />
				<Definition label="Warnings" value={span.warnings.length === 0 ? "None" : span.warnings.join(", ")} />
			</div>
			<div className="inline-actions">
				<button type="button" onClick={() => onAction({ type: "span-logs-opened" })}>
					Open correlated span logs
				</button>
			</div>
			<CorrelatedLogList logs={logs} onOpenLog={onOpenLog} label="Selected-span-correlated logs" />
		</>
	);
}

function CorrelatedLogList({
	logs,
	onOpenLog,
	label,
}: {
	readonly logs: ReadonlyArray<LogSummary>;
	readonly onOpenLog: (log: LogSummary) => void;
	readonly label: string;
}) {
	const container = useRef<HTMLDivElement>(null);
	const rowHeight = 54;
	const virtual = useVirtualWindow(container, logs.length, rowHeight, 6);
	return (
		<section className="correlated-log-scroll" ref={container} aria-label={label}>
			<div className="correlated-log-window" style={{ height: virtual.totalHeight }}>
				<div style={{ transform: `translateY(${virtual.offset}px)` }}>
					{logs.slice(virtual.start, virtual.end).map((log) => (
						<div className="correlated-log-row" key={log.id} style={{ height: rowHeight }}>
							<button type="button" className="correlated-log" onClick={() => onOpenLog(log)}>
								<time>{formatTimestamp(log.timestampNs ?? log.observedTimeNs)}</time>
								<strong>{formatSeverity(log.severityNumber, log.severityText)}</strong>
								<span>{log.bodyPreview}</span>
							</button>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function LogDetailView({
	log,
	onAction,
	onClose,
	onOpenTrace,
	onNotice,
}: {
	readonly log: LogDetail;
	readonly onAction: (action: WorkspaceAction) => void;
	readonly onClose: () => void;
	readonly onOpenTrace: () => void;
	readonly onNotice: (message: string) => void;
}) {
	const promoteAttribute = (key: string, value: string) =>
		onAction({ type: "attribute-filter-promoted", signal: "logs", key, value });
	return (
		<article className="bottom-detail log-detail" id="log-detail" aria-labelledby="log-detail-title">
			<div className="section-heading">
				<div>
					<p className="eyebrow">SELECTED LOG</p>
					<h2 id="log-detail-title">
						{formatSeverity(log.severityNumber, log.severityText)} · {log.bodyPreview || "Empty log body"}
					</h2>
				</div>
				<div className="heading-actions">
					<button type="button" className="copy-id" onClick={() => void copyText(log.id, onNotice)}>
						<code>{log.id}</code>
						<span>Copy</span>
					</button>
					<button type="button" className="quiet" onClick={onClose}>
						Close detail
					</button>
				</div>
			</div>
			<div className="log-body">
				<p className="eyebrow">COMPLETE BODY</p>
				<pre>{formatAnyValue(log.body)}</pre>
			</div>
			<div className="definition-grid">
				<Definition label="Timestamp" value={formatTimestamp(log.timestampNs)} />
				<Definition label="Observed" value={formatTimestamp(log.observedTimeNs)} />
				<Definition label="Service" value={formatService(log.service)} />
				<Definition label="Severity number" value={log.severityNumber?.toString() ?? "Unspecified"} />
				<Definition label="Trace" value={log.traceId ?? "Uncorrelated"} mono />
				<Definition label="Span" value={log.spanId ?? "None"} mono />
				<Definition label="Trace flags" value={String(log.traceFlags ?? 0)} />
				<Definition
					label="Scope"
					value={`${log.scope.name || "unnamed"}${log.scope.version === undefined ? "" : ` ${log.scope.version}`}`}
				/>
				<Definition label="Event name" value={log.eventName ?? "None"} />
				<Definition label="Preview truncated" value={log.truncated ? "Yes" : "No"} />
				<Definition label="Dropped log attributes" value={String(log.droppedAttributesCount ?? 0)} />
				<Definition
					label="Dropped resource attributes"
					value={String(log.resource.droppedAttributesCount ?? 0)}
				/>
				<Definition label="Dropped scope attributes" value={String(log.scope.droppedAttributesCount ?? 0)} />
			</div>
			{log.traceId !== undefined ? (
				<div className="inline-actions">
					<button type="button" onClick={onOpenTrace}>
						Open complete trace{log.spanId === undefined ? "" : " and focus span"}
					</button>
				</div>
			) : null}
			<AttributeTable
				title="Log attributes"
				attributes={log.attributes}
				onFilter={promoteAttribute}
				filterableKeys={new Set(log.filterableAttributeKeys ?? [])}
			/>
			<AttributeTable title="Resource attributes" attributes={log.resource.attributes} />
			<AttributeTable title="Scope attributes" attributes={log.scope.attributes ?? {}} />
		</article>
	);
}

function AttributeTable({
	title,
	attributes,
	onFilter,
	filterableKeys,
}: {
	readonly title: string;
	readonly attributes: TelemetryAttributes;
	readonly onFilter?: ((key: string, value: string) => void) | undefined;
	readonly filterableKeys?: ReadonlySet<string> | undefined;
}) {
	const entries = Object.entries(attributes).sort(([left], [right]) => left.localeCompare(right));
	return (
		<section className="attribute-section">
			<h3>{title}</h3>
			{entries.length === 0 ? (
				<p className="muted">No attributes.</p>
			) : (
				<dl className="attribute-list">
					{entries.map(([key, value]) => {
						const filterValue = scalarFilterValue(value);
						return (
							<div key={key}>
								<dt>
									<code>{key}</code>
									<span className="value-type">{value.type}</span>
								</dt>
								<dd>
									<span>{renderValue(value)}</span>
									{onFilter !== undefined && filterValue !== undefined && filterableKeys?.has(key) ? (
										<button
											type="button"
											className="attribute-filter"
											onClick={() => onFilter(key, filterValue)}
											aria-label={`Filter ${title.toLocaleLowerCase().includes("log") ? "logs" : "traces"} by ${key} equals ${filterValue}`}
										>
											Filter
										</button>
									) : null}
								</dd>
							</div>
						);
					})}
				</dl>
			)}
		</section>
	);
}

function EventList({ span }: { readonly span: SpanDetail }) {
	return (
		<div className="record-list">
			{span.events.length === 0 ? (
				<p className="muted">No span events.</p>
			) : (
				span.events.map((event) => (
					<article key={`${event.timeNs}-${event.name}`}>
						<header>
							<strong>{event.name}</strong>
							<time>
								{formatTimestamp(event.timeNs)} · dropped attributes {event.droppedAttributesCount ?? 0}
							</time>
						</header>
						<AttributeTable title="Event attributes" attributes={event.attributes} />
					</article>
				))
			)}
		</div>
	);
}

function LinkList({ span }: { readonly span: SpanDetail }) {
	return (
		<div className="record-list">
			{span.links.length === 0 ? (
				<p className="muted">No span links.</p>
			) : (
				span.links.map((link) => (
					<article key={`${link.traceId}-${link.spanId}`}>
						<header>
							<strong>Linked span</strong>
							<code>
								{link.traceId} / {link.spanId}
							</code>
							<span>
								Trace state {link.traceState ?? "none"} · flags {link.flags ?? 0} · dropped attributes{" "}
								{link.droppedAttributesCount ?? 0}
							</span>
						</header>
						<AttributeTable title="Link attributes" attributes={link.attributes} />
					</article>
				))
			)}
		</div>
	);
}

const Definition = ({
	label,
	value,
	mono = false,
}: {
	readonly label: string;
	readonly value: string;
	readonly mono?: boolean;
}) => (
	<div>
		<dt>{label}</dt>
		<dd className={mono ? "mono" : undefined}>{value}</dd>
	</div>
);
const SummaryMetric = ({
	label,
	value,
	alert = false,
}: {
	readonly label: string;
	readonly value: string;
	readonly alert?: boolean;
}) => (
	<div>
		<span>{label}</span>
		<strong className={alert ? "alert" : undefined}>{value}</strong>
	</div>
);
const ratio = (part: bigint, whole: bigint): number =>
	Number((part * 1_000_000n) / (whole === 0n ? 1n : whole)) / 1_000_000;
const spanStatus = formatSpanStatus;
const spanKind = (kind: SpanDetail["kind"]): string =>
	["Unspecified", "Internal", "Server", "Client", "Producer", "Consumer"][kind] ?? "Unspecified";
const titleCase = (value: string): string => `${value.slice(0, 1).toLocaleUpperCase()}${value.slice(1)}`;
const renderValue = (value: OtlpAnyValue): string => formatAnyValue(value);
const scalarFilterValue = (value: OtlpAnyValue): string | undefined => {
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
const copyText = async (value: string, notice: (message: string) => void): Promise<void> => {
	try {
		await navigator.clipboard.writeText(value);
		notice(`Copied ${value}`);
	} catch {
		notice(`Copy unavailable. Identifier: ${value}`);
	}
};
