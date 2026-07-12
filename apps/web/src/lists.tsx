import type { LogSummary, TraceSummary } from "@belfry/telemetry";
import { formatNanoseconds, formatService, formatSeverity, formatTimestamp } from "@belfry/workspace";
import { useRef } from "react";

import { useVirtualWindow } from "./virtual-list.js";

const traceRowHeight = 46;
const logRowHeight = 54;

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
	const window = useVirtualWindow(container, items.length, traceRowHeight);
	return (
		<section className="result-table" aria-label="Trace results">
			<div className="virtual-scroll" ref={container}>
				<table className="virtual-table" aria-label="Trace results" aria-rowcount={items.length}>
					<thead>
						<tr className="table-header trace-grid">
							<th scope="col">Start</th>
							<th scope="col">Service</th>
							<th scope="col">Operation</th>
							<th scope="col">Duration</th>
							<th scope="col">Status</th>
							<th scope="col">Spans</th>
						</tr>
					</thead>
					<tbody>
						<VirtualGap height={window.offset} columns={6} />
						{items.slice(window.start, window.end).map((trace, index) => {
							const selected = trace.traceId === selectedTraceId;
							return (
								<tr
									className={`table-row trace-grid${selected ? " selected" : ""}`}
									aria-rowindex={window.start + index + 1}
									key={trace.traceId}
									style={{ height: traceRowHeight }}
								>
									<td>
										<time dateTime={isoTime(trace.startTimeNs)}>
											{compactTime(trace.startTimeNs)}
										</time>
									</td>
									<td className="truncate" title={trace.services.map(formatService).join(", ")}>
										{trace.services.map((service) => service.name).join(" + ")}
									</td>
									<td className="primary-cell">
										<button
											type="button"
											onClick={() => onSelect(trace)}
											aria-label={`Open trace ${trace.rootOperation}`}
										>
											{trace.rootOperation || "unnamed operation"}
										</button>
										<code>{trace.traceId}</code>
									</td>
									<td className="numeric">{formatNanoseconds(trace.durationNs)}</td>
									<td>
										<StatusBadge error={trace.errorCount > 0} active={trace.active} />
									</td>
									<td className="numeric">{trace.spanCount}</td>
								</tr>
							);
						})}
						<VirtualGap height={window.totalHeight - window.end * traceRowHeight} columns={6} />
					</tbody>
				</table>
			</div>
		</section>
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
	const window = useVirtualWindow(container, items.length, logRowHeight);
	return (
		<section className="result-table" aria-label="Log results">
			<div className="virtual-scroll" ref={container}>
				<table className="virtual-table" aria-label="Log results" aria-rowcount={items.length}>
					<thead>
						<tr className="table-header log-grid">
							<th scope="col">Timestamp</th>
							<th scope="col">Service</th>
							<th scope="col">Severity</th>
							<th scope="col">Body</th>
							<th scope="col">Context</th>
						</tr>
					</thead>
					<tbody>
						<VirtualGap height={window.offset} columns={5} />
						{items.slice(window.start, window.end).map((log, index) => {
							const selected = log.id === selectedLogId;
							const timestamp = log.timestampNs ?? log.observedTimeNs;
							return (
								<tr
									className={`table-row log-grid${selected ? " selected" : ""}`}
									aria-rowindex={window.start + index + 1}
									key={log.id}
									style={{ height: logRowHeight }}
								>
									<td>
										<time
											dateTime={timestamp === undefined ? undefined : isoTime(timestamp)}
											title={formatTimestamp(timestamp)}
										>
											{timestamp === undefined ? "—" : compactTime(timestamp)}
										</time>
									</td>
									<td className="truncate" title={formatService(log.service)}>
										{log.service.name}
									</td>
									<td>
										<SeverityBadge number={log.severityNumber} text={log.severityText} />
									</td>
									<td className="primary-cell">
										<button
											type="button"
											onClick={() => onSelect(log)}
											aria-expanded={selected}
											aria-controls="log-detail"
										>
											{log.bodyPreview || "empty log body"}
										</button>
										<code>{log.id}</code>
									</td>
									<td className="context-cell">
										{log.traceId === undefined ? (
											"Uncorrelated"
										) : (
											<>
												<span>Trace</span>
												<code>{log.traceId.slice(0, 10)}…</code>
											</>
										)}
									</td>
								</tr>
							);
						})}
						<VirtualGap height={window.totalHeight - window.end * logRowHeight} columns={5} />
					</tbody>
				</table>
			</div>
		</section>
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
				⌁
			</span>
			<h2>No matching {signal}</h2>
			<p>
				Send OTLP/HTTP to{" "}
				<code>
					{endpoint}/v1/{signal}
				</code>
				, or clear the active filters and widen the time range.
			</p>
			<div>
				<button type="button" onClick={onClear}>
					Clear filters
				</button>{" "}
				<a href="/docs/getting-started">Exporter setup</a> <a href={diagnostics}>Ingestion diagnostics</a>
			</div>
		</div>
	);
}

const StatusBadge = ({ error, active }: { readonly error: boolean; readonly active: boolean }) => (
	<span className={`badge ${error ? "badge-error" : active ? "badge-active" : "badge-ok"}`}>
		{error ? "Error" : active ? "Running" : "OK"}
	</span>
);

const SeverityBadge = ({ number, text }: { readonly number?: number; readonly text?: string }) => {
	const level = number === undefined ? "unknown" : number >= 17 ? "error" : number >= 13 ? "warn" : "info";
	return <span className={`badge badge-${level}`}>{formatSeverity(number, text)}</span>;
};

const compactTime = (timeNs: bigint): string => {
	const date = new Date(Number(timeNs / 1_000_000n));
	return `${date.toLocaleTimeString([], { hour12: false })}.${String(Number((timeNs / 1_000n) % 1_000n)).padStart(3, "0")}`;
};

const isoTime = (timeNs: bigint): string => new Date(Number(timeNs / 1_000_000n)).toISOString();
