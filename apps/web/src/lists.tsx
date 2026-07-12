import type { LogSummary, TraceSummary } from "@belfry/telemetry";
import { formatNanoseconds, formatService, formatSeverity, formatTimestamp } from "@belfry/workspace";
import { useRef } from "react";

import { PulseIcon } from "./icons.js";
import { serviceColor } from "./palette.js";
import { useVirtualWindow } from "./virtual-list.js";

const rowHeight = 46;

export function TraceList({
	items,
	selectedTraceId,
	onSelect,
}: {
	readonly items: ReadonlyArray<TraceSummary>;
	readonly selectedTraceId?: string;
	readonly onSelect: (trace: TraceSummary) => void;
}) {
	const container = useRef<HTMLDivElement>(null);
	const window = useVirtualWindow(container, items.length, rowHeight);
	return (
		<div className="virtual-scroll" ref={container}>
			<table className="virtual-table" aria-label="Trace results" aria-rowcount={items.length}>
				<thead className="sr-only">
					<tr>
						<th scope="col">Status</th>
						<th scope="col">Operation and Services</th>
						<th scope="col">Duration and start</th>
					</tr>
				</thead>
				<tbody>
					<VirtualGap height={window.offset} columns={3} />
					{items.slice(window.start, window.end).map((trace, index) => {
						const selected = trace.traceId === selectedTraceId;
						return (
							<tr
								className={`table-row${selected ? " selected" : ""}`}
								aria-rowindex={window.start + index + 1}
								key={trace.traceId}
								onClick={() => onSelect(trace)}
								style={{ height: rowHeight }}
							>
								<td className="row-status">
									<span
										className={`status-dot ${trace.errorCount > 0 ? "err" : trace.active ? "run" : "ok"}`}
										title={trace.errorCount > 0 ? "Error" : trace.active ? "Running" : "OK"}
									/>
								</td>
								<td className="row-primary">
									<button
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											onSelect(trace);
										}}
										aria-label={`Open trace ${trace.rootOperation}`}
										aria-current={selected ? "true" : undefined}
									>
										{trace.rootOperation || "unnamed operation"}
									</button>
									<small title={trace.services.map(formatService).join(", ")}>
										{trace.services.map((service) => (
											<span className="service-tag" key={formatService(service)}>
												<span
													className="service-dot"
													aria-hidden="true"
													style={{ backgroundColor: serviceColor(service.name) }}
												/>
												{service.name}
											</span>
										))}
									</small>
								</td>
								<td className="row-meta">
									<strong>{formatNanoseconds(trace.durationNs)}</strong>
									<small>
										{trace.spanCount} {trace.spanCount === 1 ? "span" : "spans"} ·{" "}
										<time dateTime={isoTime(trace.startTimeNs)}>
											{compactTime(trace.startTimeNs)}
										</time>
									</small>
								</td>
							</tr>
						);
					})}
					<VirtualGap height={window.totalHeight - window.end * rowHeight} columns={3} />
				</tbody>
			</table>
		</div>
	);
}

export function LogList({
	items,
	selectedLogId,
	onSelect,
}: {
	readonly items: ReadonlyArray<LogSummary>;
	readonly selectedLogId?: string;
	readonly onSelect: (log: LogSummary) => void;
}) {
	const container = useRef<HTMLDivElement>(null);
	const window = useVirtualWindow(container, items.length, rowHeight);
	return (
		<div className="virtual-scroll" ref={container}>
			<table className="virtual-table" aria-label="Log results" aria-rowcount={items.length}>
				<thead className="sr-only">
					<tr>
						<th scope="col">Severity</th>
						<th scope="col">Body and Service</th>
						<th scope="col">Timestamp</th>
					</tr>
				</thead>
				<tbody>
					<VirtualGap height={window.offset} columns={3} />
					{items.slice(window.start, window.end).map((log, index) => {
						const selected = log.id === selectedLogId;
						const timestamp = log.timestampNs ?? log.observedTimeNs;
						return (
							<tr
								className={`table-row${selected ? " selected" : ""}`}
								aria-rowindex={window.start + index + 1}
								key={log.id}
								onClick={() => onSelect(log)}
								style={{ height: rowHeight }}
							>
								<td className="row-status">
									<SeverityBadge number={log.severityNumber} text={log.severityText} />
								</td>
								<td className="row-primary">
									<button
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											onSelect(log);
										}}
										aria-expanded={selected}
										aria-controls="log-detail"
									>
										{log.bodyPreview || "empty log body"}
									</button>
									<small title={formatService(log.service)}>
										<span className="service-tag">
											<span
												className="service-dot"
												aria-hidden="true"
												style={{ backgroundColor: serviceColor(log.service.name) }}
											/>
											{log.service.name}
										</span>
										{log.traceId === undefined ? null : (
											<span className="trace-tag">
												trace <code>{log.traceId.slice(0, 8)}…</code>
											</span>
										)}
									</small>
								</td>
								<td className="row-meta">
									<time
										dateTime={timestamp === undefined ? undefined : isoTime(timestamp)}
										title={formatTimestamp(timestamp)}
									>
										{timestamp === undefined ? "—" : compactTime(timestamp)}
									</time>
								</td>
							</tr>
						);
					})}
					<VirtualGap height={window.totalHeight - window.end * rowHeight} columns={3} />
				</tbody>
			</table>
		</div>
	);
}

const VirtualGap = ({ height, columns }: { readonly height: number; readonly columns: number }) =>
	height <= 0 ? null : (
		<tr className="virtual-gap">
			<td colSpan={columns} style={{ height }} />
		</tr>
	);

export function EmptyResults({
	signal,
	endpoint,
	fromNs,
	toNs,
	onClear,
}: {
	readonly signal: "traces" | "logs";
	readonly endpoint: string;
	readonly fromNs: bigint;
	readonly toNs: bigint;
	readonly onClear: () => void;
}) {
	const diagnostics = `/api/ingestion/diagnostics?fromNs=${fromNs}&toNs=${toNs}&limit=100`;
	return (
		<div className="empty-state">
			<span className="empty-icon" aria-hidden="true">
				<PulseIcon size={24} />
			</span>
			<h2>No {signal} in this time range</h2>
			<p>
				Send OTLP/HTTP to{" "}
				<code>
					{endpoint}/v1/{signal}
				</code>{" "}
				or widen the time range.
			</p>
			<div>
				<button type="button" onClick={onClear}>
					Clear filters
				</button>{" "}
				<a href={diagnostics}>Ingestion diagnostics</a>
			</div>
		</div>
	);
}

const SeverityBadge = ({ number, text }: { readonly number?: number; readonly text?: string }) => {
	const level = number === undefined ? "unknown" : number >= 17 ? "error" : number >= 13 ? "warn" : "info";
	return <span className={`badge badge-${level}`}>{formatSeverity(number, text)}</span>;
};

const compactTime = (timeNs: bigint): string => {
	const date = new Date(Number(timeNs / 1_000_000n));
	return `${date.toLocaleTimeString([], { hour12: false })}.${String(Number((timeNs / 1_000n) % 1_000n)).padStart(3, "0")}`;
};

const isoTime = (timeNs: bigint): string => new Date(Number(timeNs / 1_000_000n)).toISOString();
