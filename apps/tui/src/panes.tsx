/** @jsxImportSource @opentui/react */

import type { LogDetail, LogSummary, SpanDetail, TraceDetail, TraceSummary } from "@belfry/telemetry";
import {
	emptyWorkspaceMessage,
	formatAnyValue,
	formatNanoseconds,
	formatService,
	formatSeverity,
	formatSpanStatus,
	formatTimestamp,
	type WorkspaceState,
} from "@belfry/workspace";
import { useTerminalDimensions } from "@opentui/react";

import { type TuiCommandContext, tuiCommands } from "./commands.js";
import type { FilterEditorState, FilterInputField } from "./filters.js";
import type { WaterfallRowView } from "./layout.js";
import type { NavigationLevel } from "./navigation.js";

/** Shared TUI palette (base16-inspired, matches the app chrome). */
const ui = {
	border: "#3b4048",
	borderFocus: "#d7af5f",
	dim: "#5c6672",
	muted: "#888888",
	text: "#c5c8c6",
	heading: "#81a2be",
	accent: "#d7af5f",
	green: "#b5bd68",
	red: "#cc6666",
	yellow: "#f0c674",
	cyan: "#8abeb7",
	selection: "#373b41",
} as const;

export function WorkspaceContent({
	wide,
	workspace,
	navigationLevel,
	visibleRows,
	visibleOffset,
	selectedIndex,
	traceDetail,
	logDetail,
	waterfallRows,
	waterfallOffset,
	selectedSpanIndex,
	waterfallScale,
}: {
	readonly wide: boolean;
	readonly workspace: WorkspaceState;
	readonly navigationLevel: NavigationLevel;
	readonly visibleRows: ReadonlyArray<TraceSummary | LogSummary>;
	readonly visibleOffset: number;
	readonly selectedIndex: number;
	readonly traceDetail?: TraceDetail;
	readonly logDetail?: LogDetail;
	readonly waterfallRows: ReadonlyArray<WaterfallRowView>;
	readonly waterfallOffset: number;
	readonly selectedSpanIndex: number;
	readonly waterfallScale: number;
}) {
	const detailVisible =
		workspace.signal === "traces" ? workspace.selectedTraceId !== undefined : workspace.selectedLogId !== undefined;
	if (!wide && detailVisible) {
		return workspace.signal === "traces" ? (
			<TracePane
				trace={traceDetail}
				workspace={workspace}
				wide={wide}
				focused={navigationLevel !== "list"}
				waterfallRows={waterfallRows}
				waterfallOffset={waterfallOffset}
				selectedSpanIndex={selectedSpanIndex}
				waterfallScale={waterfallScale}
			/>
		) : (
			<LogPane log={logDetail} focused={navigationLevel === "detail"} />
		);
	}
	return (
		<box flexDirection="row" width="100%" height="100%">
			<box
				width={wide ? "45%" : "100%"}
				border
				borderColor={navigationLevel === "list" ? ui.borderFocus : ui.border}
				flexDirection="column"
			>
				<ListPane
					signal={workspace.signal}
					rows={visibleRows}
					offset={visibleOffset}
					selectedIndex={selectedIndex}
				/>
			</box>
			{wide ? (
				<box flexGrow={1} border borderColor={navigationLevel === "list" ? ui.border : ui.borderFocus}>
					{workspace.signal === "traces" ? (
						<TracePane
							trace={traceDetail}
							workspace={workspace}
							wide={wide}
							focused={navigationLevel !== "list"}
							waterfallRows={waterfallRows}
							waterfallOffset={waterfallOffset}
							selectedSpanIndex={selectedSpanIndex}
							waterfallScale={waterfallScale}
						/>
					) : (
						<LogPane log={logDetail} focused={navigationLevel === "detail"} />
					)}
				</box>
			) : null}
		</box>
	);
}

function ListPane({
	signal,
	rows,
	offset,
	selectedIndex,
}: {
	readonly signal: WorkspaceState["signal"];
	readonly rows: ReadonlyArray<TraceSummary | LogSummary>;
	readonly offset: number;
	readonly selectedIndex: number;
}) {
	return (
		<box flexDirection="column" width="100%">
			<text fg={ui.dim}>
				{"  TIME          "}
				{signal === "traces" ? "DURATION  OPERATION" : "SEVERITY  BODY"}
			</text>
			{rows.length === 0 ? (
				<box flexDirection="column" padding={1}>
					<text fg={ui.muted}>{emptyWorkspaceMessage(signal)}</text>
					<text fg={ui.dim}>f clear filters · d ingestion diagnostics</text>
				</box>
			) : null}
			{rows.map((row, visibleIndex) => {
				const index = offset + visibleIndex;
				const selected = index === selectedIndex;
				if (signal === "traces") {
					const trace = row as TraceSummary;
					const failed = trace.errorCount > 0;
					return (
						<box
							key={trace.traceId}
							flexDirection="row"
							backgroundColor={selected ? ui.selection : undefined}
						>
							<text fg={selected ? ui.accent : ui.dim}>{selected ? "› " : "  "}</text>
							<text fg={ui.dim}>{shortTime(trace.startTimeNs)} </text>
							<text fg={failed ? ui.red : ui.cyan}>
								{formatNanoseconds(trace.durationNs).padStart(9)}{" "}
							</text>
							<text fg={failed ? ui.red : ui.text}>{trace.rootOperation.slice(0, 34)}</text>
							<text fg={ui.dim}> · {trace.spanCount} spans</text>
							{failed ? <text fg={ui.red}> ✗{trace.errorCount}</text> : null}
						</box>
					);
				}
				const log = row as LogSummary;
				const level = log.severityNumber ?? 0;
				const severityColor = level >= 17 ? ui.red : level >= 13 ? ui.yellow : ui.text;
				return (
					<box key={log.id} flexDirection="row" backgroundColor={selected ? ui.selection : undefined}>
						<text fg={selected ? ui.accent : ui.dim}>{selected ? "› " : "  "}</text>
						<text fg={ui.dim}>{shortTime(log.timestampNs ?? log.observedTimeNs)} </text>
						<text fg={severityColor}>
							{formatSeverity(log.severityNumber, log.severityText).padEnd(9).slice(0, 9)}{" "}
						</text>
						<text fg={level >= 17 ? ui.red : ui.text}>{log.bodyPreview.slice(0, 44)}</text>
					</box>
				);
			})}
		</box>
	);
}

function TracePane({
	trace,
	workspace,
	wide,
	focused,
	waterfallRows,
	waterfallOffset,
	selectedSpanIndex,
	waterfallScale,
}: {
	readonly trace?: TraceDetail;
	readonly workspace: WorkspaceState;
	readonly wide: boolean;
	readonly focused: boolean;
	readonly waterfallRows: ReadonlyArray<WaterfallRowView>;
	readonly waterfallOffset: number;
	readonly selectedSpanIndex: number;
	readonly waterfallScale: number;
}) {
	const dimensions = useTerminalDimensions();
	if (trace === undefined)
		return (
			<box padding={1}>
				<text fg={ui.muted}>Select a trace to inspect its waterfall.</text>
			</box>
		);
	const selectedSpan = trace.spans.find((span) => span.spanId === workspace.selectedSpanId);
	const focusedRow = waterfallRows.find((row) => row.span.spanId === workspace.selectedSpanId);
	const correlatedLogPreview = trace.logs.slice(0, 10);
	const paneWidth = (wide ? Math.floor(dimensions.width * 0.55) : dimensions.width) - 4;
	const barWidth = waterfallRows[0]?.timingBar.length ?? 16;
	const durationWidth = 9;
	const nameWidth = Math.max(14, paneWidth - barWidth - durationWidth - 5);
	return (
		<scrollbox focused={focused} flexGrow={1} width="100%">
			<box flexDirection="column" padding={1}>
				<text>
					<strong>{trace.rootOperation || "unnamed operation"}</strong>
				</text>
				<text fg={ui.dim}>{trace.traceId}</text>
				<box flexDirection="row">
					<text fg={ui.cyan}>{formatNanoseconds(trace.durationNs)}</text>
					<text fg={ui.dim}> · {trace.spanCount} spans · </text>
					<text fg={trace.errorCount > 0 ? ui.red : ui.dim}>{trace.errorCount} errors</text>
					<text fg={ui.dim}> · {trace.active ? "active" : "complete"}</text>
				</box>
				<text fg={ui.dim}>{trace.services.map(formatService).join(" · ")}</text>
				{trace.warnings.length > 0 ? <text fg={ui.yellow}>⚠ {trace.warnings.join(", ")}</text> : null}
				<text> </text>
				<text fg={ui.heading}>
					<strong>WATERFALL</strong> · rows {waterfallOffset + 1}–{waterfallOffset + waterfallRows.length} of{" "}
					{trace.spans.length} · scale ×{waterfallScale} · z zoom
				</text>
				<box flexDirection="row">
					<text fg={ui.dim}>
						{"  "}
						{"SPAN".padEnd(nameWidth)} {"TIMELINE".padEnd(barWidth).slice(0, barWidth)}{" "}
						{"DURATION".padStart(durationWidth)}
					</text>
				</box>
				{waterfallRows.map((row, visibleIndex) => {
					const selected = waterfallOffset + visibleIndex === selectedSpanIndex;
					const failed = row.span.status.code === 2;
					const running = row.span.endTimeNs === undefined;
					const glyph = row.hasChildren ? (row.collapsed ? "▸" : "▾") : "·";
					const collapsedSuffix =
						row.collapsed && row.hiddenDescendantCount > 0 ? ` (+${row.hiddenDescendantCount})` : "";
					const label = `${" ".repeat(Math.min(row.depth, 8))}${glyph} ${row.span.name}${collapsedSuffix}`
						.padEnd(nameWidth)
						.slice(0, nameWidth);
					const duration = formatNanoseconds(
						row.durationNs === undefined ? undefined : BigInt(row.durationNs),
					).padStart(durationWidth);
					return (
						<box
							key={row.span.spanId}
							flexDirection="row"
							backgroundColor={selected ? ui.selection : undefined}
						>
							<text fg={selected ? ui.accent : ui.dim}>{selected ? "› " : "  "}</text>
							<text fg={failed ? ui.red : ui.text}>{label}</text>
							<text fg={failed ? ui.red : running ? ui.yellow : ui.green}> {row.timingBar}</text>
							<text fg={ui.dim}> {duration}</text>
						</box>
					);
				})}
				{focusedRow === undefined ? null : (
					<box flexDirection="row">
						<text fg={ui.dim}>
							{"  starts +"}
							{formatNanoseconds(BigInt(focusedRow.relativeStartNs))}
							{" · "}
							{formatSpanStatus(focusedRow.span)}
							{" · "}
							{formatService(focusedRow.span.service)}
							{" · "}
							{focusedRow.span.logCount} logs
							{focusedRow.warnings.length > 0 ? ` · ⚠ ${focusedRow.warnings.join(", ")}` : ""}
						</text>
					</box>
				)}
				{selectedSpan === undefined ? null : (
					<SpanPane
						span={selectedSpan}
						logs={trace.logs.filter((log) => log.spanId === selectedSpan.spanId)}
					/>
				)}
				{trace.logs.length > 0 ? (
					<>
						<text> </text>
						<text fg={ui.heading}>
							<strong>TRACE LOGS</strong> · {correlatedLogPreview.length} of {trace.logs.length} · v all
						</text>
					</>
				) : null}
				{correlatedLogPreview.map((log) => (
					<box key={log.id} flexDirection="row">
						<text fg={ui.dim}>{shortTime(log.timestampNs ?? log.observedTimeNs)} </text>
						<text fg={(log.severityNumber ?? 0) >= 17 ? ui.red : ui.muted}>
							{formatSeverity(log.severityNumber, log.severityText).padEnd(9).slice(0, 9)}{" "}
						</text>
						<text fg={ui.text}>{log.bodyPreview.slice(0, Math.max(10, paneWidth - 24))}</text>
					</box>
				))}
			</box>
		</scrollbox>
	);
}

function SpanPane({ span, logs }: { readonly span: SpanDetail; readonly logs: ReadonlyArray<LogSummary> }) {
	const logPreview = logs.slice(0, 10);
	const failed = span.status.code === 2;
	return (
		<box flexDirection="column" border borderColor={ui.border} padding={1} marginTop={1}>
			<text fg={ui.heading}>
				<strong>SELECTED SPAN</strong> · l correlated logs · a promote attribute
			</text>
			<text>
				<strong>{span.name}</strong>
			</text>
			<text fg={ui.dim}>{span.spanId}</text>
			<box flexDirection="row">
				<text fg={failed ? ui.red : ui.green}>
					{formatSpanStatus(span).toUpperCase()}
					{span.status.message === undefined ? "" : ` ${span.status.message}`}
				</text>
				<text fg={ui.dim}>
					{" · "}
					{formatNanoseconds(span.endTimeNs === undefined ? undefined : span.endTimeNs - span.startTimeNs)}
					{" · "}
					{formatService(span.service)}
				</text>
			</box>
			<text fg={ui.dim}>
				start {formatTimestamp(span.startTimeNs)} · parent {span.parentSpanId ?? "root"} · kind {span.kind}
			</text>
			{span.warnings.length > 0 ? <text fg={ui.yellow}>⚠ {span.warnings.join(", ")}</text> : null}
			<AttributeLines title="SPAN ATTRIBUTES" attributes={span.attributes} />
			<AttributeLines title="RESOURCE ATTRIBUTES" attributes={span.resource.attributes} />
			<text fg={ui.heading}>SCOPE</text>
			<text fg={ui.text}>
				{"  "}
				{span.scope.name || "unnamed"}
				{span.scope.version === undefined ? "" : ` ${span.scope.version}`}
			</text>
			<AttributeLines title="SCOPE ATTRIBUTES" attributes={span.scope.attributes ?? {}} />
			<DroppedCounts span={span} />
			{span.events.length > 0 ? <text fg={ui.heading}>EVENTS ({span.events.length})</text> : null}
			{span.events.map((event) => (
				<box key={`${event.timeNs}-${event.name}`} flexDirection="column">
					<text fg={ui.text}>
						{"  "}
						{formatTimestamp(event.timeNs)} · {event.name}
						{(event.droppedAttributesCount ?? 0) > 0
							? ` · dropped attributes ${event.droppedAttributesCount}`
							: ""}
					</text>
					<AttributeLines title="EVENT ATTRIBUTES" attributes={event.attributes} indent />
				</box>
			))}
			{span.links.length > 0 ? <text fg={ui.heading}>LINKS ({span.links.length})</text> : null}
			{span.links.map((link) => (
				<box key={`${link.traceId}-${link.spanId}`} flexDirection="column">
					<text fg={ui.text}>
						{"  "}
						{link.traceId} / {link.spanId}
						{link.traceState === undefined ? "" : ` · ${link.traceState}`} · flags {link.flags ?? 0}
						{(link.droppedAttributesCount ?? 0) > 0
							? ` · dropped attributes ${link.droppedAttributesCount}`
							: ""}
					</text>
					<AttributeLines title="LINK ATTRIBUTES" attributes={link.attributes} indent />
				</box>
			))}
			{logPreview.length > 0 ? (
				<text fg={ui.heading}>
					SPAN LOGS · {logPreview.length} of {logs.length} · l all
				</text>
			) : null}
			{logPreview.map((log) => (
				<box key={log.id} flexDirection="row">
					<text fg={ui.dim}>
						{"  "}
						{shortTime(log.timestampNs ?? log.observedTimeNs)}{" "}
					</text>
					<text fg={(log.severityNumber ?? 0) >= 17 ? ui.red : ui.muted}>
						{formatSeverity(log.severityNumber, log.severityText)}{" "}
					</text>
					<text fg={ui.text}>{log.bodyPreview.slice(0, 60)}</text>
				</box>
			))}
		</box>
	);
}

function DroppedCounts({ span }: { readonly span: SpanDetail }) {
	const dropped = [
		[span.droppedAttributesCount ?? 0, "span attributes"],
		[span.droppedEventsCount ?? 0, "events"],
		[span.droppedLinksCount ?? 0, "links"],
		[span.resource.droppedAttributesCount ?? 0, "resource attributes"],
		[span.scope.droppedAttributesCount ?? 0, "scope attributes"],
	] as const;
	const reported = dropped.filter(([count]) => count > 0);
	if (reported.length === 0) return null;
	return <text fg={ui.yellow}>⚠ dropped {reported.map(([count, label]) => `${count} ${label}`).join(", ")}</text>;
}

function LogPane({ log, focused }: { readonly log?: LogDetail; readonly focused: boolean }) {
	if (log === undefined)
		return (
			<box padding={1}>
				<text fg={ui.muted}>Select a log to inspect its complete context.</text>
			</box>
		);
	const level = log.severityNumber ?? 0;
	return (
		<scrollbox focused={focused} flexGrow={1} width="100%">
			<box flexDirection="column" padding={1}>
				<box flexDirection="row">
					<text fg={level >= 17 ? ui.red : level >= 13 ? ui.yellow : ui.green}>
						<strong>{formatSeverity(log.severityNumber, log.severityText)}</strong>
					</text>
					<text fg={ui.dim}> · {formatTimestamp(log.timestampNs ?? log.observedTimeNs)}</text>
				</box>
				<text fg={ui.dim}>{log.id}</text>
				<text fg={ui.dim}>
					{formatService(log.service)} · trace {log.traceId ?? "uncorrelated"} · span {log.spanId ?? "none"}
				</text>
				{log.traceId === undefined ? null : <text fg={ui.muted}>t opens the correlated trace</text>}
				<text> </text>
				<text fg={ui.heading}>
					<strong>BODY</strong>
				</text>
				<text>{formatAnyValue(log.body)}</text>
				<AttributeLines title="ATTRIBUTES" attributes={log.attributes} />
				<AttributeLines title="RESOURCE" attributes={log.resource.attributes} />
				<text fg={ui.heading}>SCOPE</text>
				<text fg={ui.text}>
					{"  "}
					{log.scope.name || "unnamed"}
					{log.scope.version === undefined ? "" : ` ${log.scope.version}`}
				</text>
				<AttributeLines title="SCOPE ATTRIBUTES" attributes={log.scope.attributes ?? {}} />
				{(log.droppedAttributesCount ?? 0) > 0 ||
				(log.resource.droppedAttributesCount ?? 0) > 0 ||
				(log.scope.droppedAttributesCount ?? 0) > 0 ? (
					<text fg={ui.yellow}>
						⚠ dropped attributes: log {log.droppedAttributesCount ?? 0}, resource{" "}
						{log.resource.droppedAttributesCount ?? 0}, scope {log.scope.droppedAttributesCount ?? 0}
					</text>
				) : null}
				<text fg={ui.muted}>a promotes the next scalar attribute to an exact filter</text>
			</box>
		</scrollbox>
	);
}

function AttributeLines({
	title,
	attributes,
	indent = false,
}: {
	readonly title: string;
	readonly attributes: SpanDetail["attributes"];
	readonly indent?: boolean;
}) {
	const entries = Object.entries(attributes);
	if (entries.length === 0) return null;
	const pad = indent ? "    " : "  ";
	return (
		<box flexDirection="column">
			<text fg={ui.heading}>
				{indent ? "  " : ""}
				{title}
			</text>
			{entries.map(([key, value]) => (
				<box key={key} flexDirection="row">
					<text fg={ui.muted}>
						{pad}
						{key}
					</text>
					<text fg={ui.dim}> = </text>
					<text fg={ui.text}>{formatAnyValue(value)}</text>
				</box>
			))}
		</box>
	);
}

export function FilterPane({
	workspace,
	editor,
	onDraft,
	onSubmit,
	onCancel,
}: {
	readonly workspace: WorkspaceState;
	readonly editor: FilterEditorState;
	readonly onDraft: (value: string) => void;
	readonly onSubmit: () => void;
	readonly onCancel: () => void;
}) {
	if (editor.kind === "input") {
		const label = filterInputLabel(editor.field, editor.attributeKey);
		return (
			<box flexDirection="column" border borderColor={ui.borderFocus} padding={1}>
				<text>
					<strong>{label}</strong>
				</text>
				<input
					focused
					value={editor.draft}
					placeholder={filterInputPlaceholder(editor.field)}
					onInput={onDraft}
					onKeyDown={(event) => {
						if (event.name !== "escape") return;
						event.preventDefault();
						event.stopPropagation();
						onCancel();
					}}
					onSubmit={onSubmit}
				/>
				<text fg={ui.muted}>Enter applies · Esc returns to results</text>
			</box>
		);
	}
	const trace = workspace.traceQuery;
	const log = workspace.logQuery;
	return (
		<box flexDirection="column" border borderColor={ui.borderFocus} padding={1}>
			<text>
				<strong>STRUCTURED FILTERS</strong>
			</text>
			<text fg={ui.dim}>Every active filter is combined.</text>
			{workspace.signal === "traces" ? (
				<>
					<FilterRow index="1" label="cycle status" value={filterValue(trace.status, "any")} />
					<FilterRow index="2" label="operation contains" value={trace.operation ?? "any"} />
					<FilterRow
						index="3"
						label="minimum duration"
						value={formatDurationFilter(trace.minimumDurationNs)}
					/>
					<FilterRow
						index="4"
						label="maximum duration"
						value={formatDurationFilter(trace.maximumDurationNs)}
					/>
					<FilterRow index="5" label="trace ID" value={trace.traceId ?? "any"} />
					<FilterRow index="6" label="add exact attribute" value={`${trace.attributes.length} active`} />
				</>
			) : (
				<>
					<FilterRow index="1" label="cycle minimum severity" value={String(log.minimumSeverity ?? "any")} />
					<FilterRow index="2" label="maximum severity" value={String(log.maximumSeverity ?? "any")} />
					<FilterRow index="3" label="trace ID" value={log.traceId ?? "any"} />
					<FilterRow index="4" label="span ID" value={log.spanId ?? "any"} />
					<FilterRow index="5" label="add exact attribute" value={`${log.attributes.length} active`} />
				</>
			)}
			<FilterRow index="c" label="clear all filters" value="structured, text, attribute, identity, Service" />
			<text fg={ui.muted}>Press a number to edit · Esc closes</text>
		</box>
	);
}

const FilterRow = ({
	index,
	label,
	value,
}: {
	readonly index: string;
	readonly label: string;
	readonly value: string;
}) => (
	<box flexDirection="row">
		<text fg={ui.accent}>{index}</text>
		<text fg={ui.text}> {label}: </text>
		<text fg={value === "any" || value.startsWith("0 ") ? ui.dim : ui.cyan}>{value}</text>
	</box>
);

const filterValue = (value: string | undefined, fallback: string): string =>
	value === undefined || value === "all" ? fallback : value;

const filterInputLabel = (field: FilterInputField, key?: string): string => {
	switch (field) {
		case "operation":
			return "Operation contains";
		case "minimum-duration":
			return "Minimum duration in milliseconds";
		case "maximum-duration":
			return "Maximum duration in milliseconds";
		case "maximum-severity":
			return "Maximum OpenTelemetry severity number";
		case "trace-id":
			return "Canonical trace ID";
		case "span-id":
			return "Canonical span ID";
		case "attribute-key":
			return "Attribute key";
		case "attribute-value":
			return `Exact value for ${key ?? "attribute"}`;
	}
};

const filterInputPlaceholder = (field: FilterInputField): string => {
	switch (field) {
		case "operation":
			return "for example POST /checkout";
		case "minimum-duration":
		case "maximum-duration":
			return "for example 25.5";
		case "maximum-severity":
			return "integer from 1 through 24";
		case "trace-id":
			return "32 lowercase hex characters";
		case "span-id":
			return "16 lowercase hex characters";
		case "attribute-key":
			return "for example http.method";
		case "attribute-value":
			return "exact scalar value";
	}
};

const formatDurationFilter = (nanoseconds: bigint | undefined): string =>
	nanoseconds === undefined ? "any" : `${Number(nanoseconds) / 1_000_000} ms`;

export function HelpPane({ context }: { readonly context: TuiCommandContext }) {
	return (
		<scrollbox focused flexGrow={1} width="100%">
			<box flexDirection="column" border borderColor={ui.borderFocus} padding={1}>
				<text>
					<strong>COMMANDS</strong>
				</text>
				{tuiCommands.map((command) => {
					const available = command.availability(context);
					return (
						<box key={command.id} flexDirection="row">
							<text fg={available ? ui.accent : ui.dim}>{command.keys.join(" / ").padEnd(16)}</text>
							<text fg={available ? ui.text : ui.dim}>{command.label.padEnd(16)}</text>
							<text fg={available ? ui.muted : ui.dim}>
								{command.description}
								{available ? "" : " · unavailable here"}
							</text>
						</box>
					);
				})}
			</box>
		</scrollbox>
	);
}

const shortTime = (nanoseconds: bigint | undefined): string => {
	if (nanoseconds === undefined) return "--:--:--.---";
	return new Date(Number(nanoseconds / 1_000_000n)).toISOString().slice(11, 23);
};
