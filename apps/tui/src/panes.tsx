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

import { type TuiCommandContext, tuiCommands } from "./commands.js";
import type { FilterEditorState, FilterInputField } from "./filters.js";
import type { WaterfallRowView } from "./layout.js";
import type { NavigationLevel } from "./navigation.js";

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
			<box width={wide ? "45%" : "100%"} border borderColor="#3b4048" flexDirection="column">
				<ListPane
					signal={workspace.signal}
					rows={visibleRows}
					offset={visibleOffset}
					selectedIndex={selectedIndex}
				/>
			</box>
			{wide ? (
				<box flexGrow={1} border borderColor="#3b4048">
					{workspace.signal === "traces" ? (
						<TracePane
							trace={traceDetail}
							workspace={workspace}
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
			<text fg="#81a2be"> TIME {signal === "traces" ? "OPERATION / DURATION" : "SEVERITY / BODY"}</text>
			{rows.length === 0 ? (
				<box flexDirection="column" padding={1}>
					<text fg="#888888">{emptyWorkspaceMessage(signal)}</text>
					<text fg="#b5bd68">Press f to clear filters or d to inspect bounded ingestion diagnostics.</text>
				</box>
			) : null}
			{rows.map((row, visibleIndex) => {
				const index = offset + visibleIndex;
				const selected = index === selectedIndex;
				if (signal === "traces") {
					const trace = row as TraceSummary;
					return (
						<text
							key={trace.traceId}
							bg={selected ? "#373b41" : undefined}
							fg={trace.errorCount > 0 ? "#cc6666" : "#c5c8c6"}
						>
							{selected ? "›" : " "} {shortTime(trace.startTimeNs)} {trace.rootOperation.slice(0, 30)} ·{" "}
							{formatNanoseconds(trace.durationNs)} · {trace.spanCount} spans
						</text>
					);
				}
				const log = row as LogSummary;
				return (
					<text
						key={log.id}
						bg={selected ? "#373b41" : undefined}
						fg={(log.severityNumber ?? 0) >= 17 ? "#cc6666" : "#c5c8c6"}
					>
						{selected ? "›" : " "} {shortTime(log.timestampNs ?? log.observedTimeNs)}{" "}
						{formatSeverity(log.severityNumber, log.severityText)} · {log.bodyPreview.slice(0, 38)}
					</text>
				);
			})}
		</box>
	);
}

function TracePane({
	trace,
	workspace,
	focused,
	waterfallRows,
	waterfallOffset,
	selectedSpanIndex,
	waterfallScale,
}: {
	readonly trace?: TraceDetail;
	readonly workspace: WorkspaceState;
	readonly focused: boolean;
	readonly waterfallRows: ReadonlyArray<WaterfallRowView>;
	readonly waterfallOffset: number;
	readonly selectedSpanIndex: number;
	readonly waterfallScale: number;
}) {
	if (trace === undefined) return <text fg="#888888">Select a trace to inspect its full waterfall.</text>;
	const selectedSpan = trace.spans.find((span) => span.spanId === workspace.selectedSpanId);
	const correlatedLogPreview = trace.logs.slice(0, 20);
	return (
		<scrollbox focused={focused} flexGrow={1} width="100%">
			<box flexDirection="column" padding={1}>
				<text>
					<strong>{trace.rootOperation}</strong> · {trace.traceId}
				</text>
				<text>
					Duration {formatNanoseconds(trace.durationNs)} · {trace.spanCount} spans · {trace.errorCount} errors
					· {trace.active ? "ACTIVE" : "complete"}
				</text>
				<text>Services {trace.services.map(formatService).join(", ")}</text>
				{trace.warnings.length > 0 ? <text fg="#f0c674">Warnings {trace.warnings.join(", ")}</text> : null}
				<text fg="#81a2be">
					WATERFALL · scale ×{waterfallScale} around focused span · rows {waterfallOffset + 1}–
					{waterfallOffset + waterfallRows.length} of {trace.spans.length} · press z to zoom
				</text>
				{waterfallRows.map((row, visibleIndex) => (
					<text
						key={row.span.spanId}
						bg={waterfallOffset + visibleIndex === selectedSpanIndex ? "#373b41" : undefined}
						fg={row.span.status.code === 2 ? "#cc6666" : "#c5c8c6"}
					>
						{waterfallOffset + visibleIndex === selectedSpanIndex ? "›" : " "} {row.timingBar}
						{" ".repeat(row.depth * 2)}
						{row.hasChildren ? (row.collapsed ? "▸" : "▾") : "·"} {row.span.name} · +
						{formatNanoseconds(BigInt(row.relativeStartNs))} ·{" "}
						{formatNanoseconds(row.durationNs === undefined ? undefined : BigInt(row.durationNs))} ·{" "}
						{formatSpanStatus(row.span)} · {formatService(row.span.service)} · {row.span.logCount} logs{" "}
						{row.warnings.join(" ")}
					</text>
				))}
				{selectedSpan === undefined ? null : (
					<SpanPane
						span={selectedSpan}
						logs={trace.logs.filter((log) => log.spanId === selectedSpan.spanId)}
					/>
				)}
				{trace.logs.length > 0 ? (
					<text fg="#81a2be">
						CORRELATED LOG PREVIEW ({correlatedLogPreview.length} of {trace.logs.length}) · press v for all
						trace logs
					</text>
				) : null}
				{correlatedLogPreview.map((log) => (
					<text key={log.id}>
						{formatTimestamp(log.timestampNs ?? log.observedTimeNs)} ·{" "}
						{formatSeverity(log.severityNumber, log.severityText)} · {log.bodyPreview}
					</text>
				))}
			</box>
		</scrollbox>
	);
}

function SpanPane({ span, logs }: { readonly span: SpanDetail; readonly logs: ReadonlyArray<LogSummary> }) {
	const logPreview = logs.slice(0, 20);
	return (
		<box flexDirection="column" border borderColor="#4f5963" padding={1}>
			<text fg="#81a2be">
				<strong>SELECTED SPAN</strong> · press l for correlated logs
			</text>
			<text>
				<strong>{span.name}</strong> · {span.spanId}
			</text>
			<text>
				Status {formatSpanStatus(span).toUpperCase()} {span.status.message ?? ""}
			</text>
			<text>
				Parent {span.parentSpanId ?? "root"} · Kind {span.kind} · Flags {span.flags ?? 0} · Trace state{" "}
				{span.traceState ?? "none"}
			</text>
			<text>
				Start {formatTimestamp(span.startTimeNs)} · Duration{" "}
				{formatNanoseconds(span.endTimeNs === undefined ? undefined : span.endTimeNs - span.startTimeNs)}
			</text>
			<text>
				Service {formatService(span.service)} · dropped span attributes {span.droppedAttributesCount ?? 0}
			</text>
			{span.warnings.length > 0 ? <text fg="#f0c674">Warnings {span.warnings.join(", ")}</text> : null}
			<text fg="#888888">Press a to promote the next scalar span attribute to an exact filter.</text>
			<AttributeLines title="SPAN ATTRIBUTES" attributes={span.attributes} />
			<text>Resource dropped attributes {span.resource.droppedAttributesCount ?? 0}</text>
			<AttributeLines title="RESOURCE ATTRIBUTES" attributes={span.resource.attributes} />
			<text fg="#81a2be">SCOPE</text>
			<text>
				{span.scope.name || "unnamed"} {span.scope.version ?? ""} · dropped{" "}
				{span.scope.droppedAttributesCount ?? 0}
			</text>
			<AttributeLines title="SCOPE ATTRIBUTES" attributes={span.scope.attributes ?? {}} />
			<text fg="#81a2be">
				EVENTS ({span.events.length}) · dropped {span.droppedEventsCount ?? 0}
			</text>
			{span.events.map((event) => (
				<box key={`${event.timeNs}-${event.name}`} flexDirection="column">
					<text>
						{formatTimestamp(event.timeNs)} · {event.name} · dropped attributes{" "}
						{event.droppedAttributesCount ?? 0}
					</text>
					<AttributeLines title="EVENT ATTRIBUTES" attributes={event.attributes} />
				</box>
			))}
			<text fg="#81a2be">
				LINKS ({span.links.length}) · dropped {span.droppedLinksCount ?? 0}
			</text>
			{span.links.map((link) => (
				<box key={`${link.traceId}-${link.spanId}`} flexDirection="column">
					<text>
						{link.traceId} / {link.spanId} · {link.traceState ?? "no trace state"} · flags {link.flags ?? 0}{" "}
						· dropped attributes {link.droppedAttributesCount ?? 0}
					</text>
					<AttributeLines title="LINK ATTRIBUTES" attributes={link.attributes} />
				</box>
			))}
			<text fg="#81a2be">
				SPAN LOG PREVIEW ({logPreview.length} of {logs.length}) · press l for correlated span logs
			</text>
			{logPreview.map((log) => (
				<text key={log.id}>
					{formatTimestamp(log.timestampNs ?? log.observedTimeNs)} ·{" "}
					{formatSeverity(log.severityNumber, log.severityText)} · {log.bodyPreview}
				</text>
			))}
		</box>
	);
}

function LogPane({ log, focused }: { readonly log?: LogDetail; readonly focused: boolean }) {
	if (log === undefined) return <text fg="#888888">Select a log to inspect its complete context.</text>;
	return (
		<scrollbox focused={focused} flexGrow={1} width="100%">
			<box flexDirection="column" padding={1}>
				<text>
					<strong>{formatSeverity(log.severityNumber, log.severityText)}</strong> ·{" "}
					{formatTimestamp(log.timestampNs ?? log.observedTimeNs)}
				</text>
				<text>ID {log.id}</text>
				<text>Service {formatService(log.service)}</text>
				<text>
					Trace {log.traceId ?? "uncorrelated"} · Span {log.spanId ?? "none"}
				</text>
				{log.traceId === undefined ? null : (
					<text fg="#888888">Press t to open the complete correlated trace.</text>
				)}
				<text>
					Trace flags {log.traceFlags ?? 0} · Event {log.eventName ?? "none"} · dropped attributes{" "}
					{log.droppedAttributesCount ?? 0}
				</text>
				<text fg="#81a2be">BODY</text>
				<text>{formatAnyValue(log.body)}</text>
				<text fg="#888888">Press a to promote the next scalar log attribute to an exact filter.</text>
				<AttributeLines title="ATTRIBUTES" attributes={log.attributes} />
				<text>Resource dropped attributes {log.resource.droppedAttributesCount ?? 0}</text>
				<AttributeLines title="RESOURCE" attributes={log.resource.attributes} />
				<text fg="#81a2be">SCOPE</text>
				<text>
					{log.scope.name} {log.scope.version ?? ""} · dropped {log.scope.droppedAttributesCount ?? 0}
				</text>
				<AttributeLines title="SCOPE ATTRIBUTES" attributes={log.scope.attributes ?? {}} />
			</box>
		</scrollbox>
	);
}

function AttributeLines({
	title,
	attributes,
}: {
	readonly title: string;
	readonly attributes: SpanDetail["attributes"];
}) {
	return (
		<box flexDirection="column">
			<text fg="#81a2be">{title}</text>
			{Object.entries(attributes).map(([key, value]) => (
				<text key={key}>
					{key} = {formatAnyValue(value)}
				</text>
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
			<box flexDirection="column" border borderColor="#d7af5f" padding={1}>
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
				<text fg="#888888">Enter applies · Esc returns to results</text>
			</box>
		);
	}
	const trace = workspace.traceQuery;
	const log = workspace.logQuery;
	return (
		<box flexDirection="column" border borderColor="#d7af5f" padding={1}>
			<text>
				<strong>STRUCTURED FILTERS</strong> · every active filter is combined
			</text>
			{workspace.signal === "traces" ? (
				<>
					<text>
						1 cycle status: {trace.status === undefined || trace.status === "all" ? "any" : trace.status}
					</text>
					<text>2 operation contains: {trace.operation ?? "any"}</text>
					<text>3 minimum duration: {formatDurationFilter(trace.minimumDurationNs)}</text>
					<text>4 maximum duration: {formatDurationFilter(trace.maximumDurationNs)}</text>
					<text>5 trace ID: {trace.traceId ?? "any"}</text>
					<text>6 add exact attribute: {trace.attributes.length} active</text>
				</>
			) : (
				<>
					<text>1 cycle minimum severity: {log.minimumSeverity ?? "any"}</text>
					<text>2 maximum severity: {log.maximumSeverity ?? "any"}</text>
					<text>3 trace ID: {log.traceId ?? "any"}</text>
					<text>4 span ID: {log.spanId ?? "any"}</text>
					<text>5 add exact attribute: {log.attributes.length} active</text>
				</>
			)}
			<text>c clear structured, text, attribute, identity, and Service filters</text>
			<text fg="#888888">Press a number to edit · Esc closes</text>
		</box>
	);
}

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
			<box flexDirection="column" border borderColor="#d7af5f" padding={1}>
				<text>
					<strong>COMMANDS</strong> · generated from the centralized registry
				</text>
				{tuiCommands.map((command) => (
					<text key={command.id} fg={command.availability(context) ? undefined : "#666666"}>
						{command.keys.join(" / ").padEnd(16)} {command.label.padEnd(16)} {command.description}
						{command.availability(context) ? "" : " · unavailable here"}
					</text>
				))}
			</box>
		</scrollbox>
	);
}

const shortTime = (nanoseconds: bigint | undefined): string => {
	if (nanoseconds === undefined) return "--:--:--.---";
	return new Date(Number(nanoseconds / 1_000_000n)).toISOString().slice(11, 23);
};
