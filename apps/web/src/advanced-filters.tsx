import type { LogSearchQuery, TraceSearchQuery } from "@belfry/query-api";
import { canonicalSpanId, canonicalTraceId } from "@belfry/telemetry";
import type { WorkspaceState } from "@belfry/workspace";
import { type FormEvent, useEffect, useState } from "react";

import { ChevronDownIcon } from "./icons.js";

export function AdvancedFilters({
	workspace,
	count,
	onTraceQuery,
	onLogQuery,
}: {
	readonly workspace: WorkspaceState;
	readonly count: number;
	readonly onTraceQuery: (query: Partial<TraceSearchQuery>) => void;
	readonly onLogQuery: (query: Partial<LogSearchQuery>) => void;
}) {
	const query = workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery;
	const [operation, setOperation] = useState(workspace.traceQuery.operation ?? "");
	const [status, setStatus] = useState(workspace.traceQuery.status ?? "");
	const [minimumDuration, setMinimumDuration] = useState(
		formatOptionalMilliseconds(workspace.traceQuery.minimumDurationNs),
	);
	const [maximumDuration, setMaximumDuration] = useState(
		formatOptionalMilliseconds(workspace.traceQuery.maximumDurationNs),
	);
	const [minimumSeverity, setMinimumSeverity] = useState(workspace.logQuery.minimumSeverity?.toString() ?? "");
	const [maximumSeverity, setMaximumSeverity] = useState(workspace.logQuery.maximumSeverity?.toString() ?? "");
	const [traceId, setTraceId] = useState(query.traceId ?? "");
	const [spanId, setSpanId] = useState(workspace.logQuery.spanId ?? "");
	const [attributeKey, setAttributeKey] = useState("");
	const [attributeOperator, setAttributeOperator] = useState<"equals" | "contains">("equals");
	const [attributeValue, setAttributeValue] = useState("");

	useEffect(() => {
		setOperation(workspace.traceQuery.operation ?? "");
		setStatus(workspace.traceQuery.status ?? "");
		setMinimumDuration(formatOptionalMilliseconds(workspace.traceQuery.minimumDurationNs));
		setMaximumDuration(formatOptionalMilliseconds(workspace.traceQuery.maximumDurationNs));
		setMinimumSeverity(workspace.logQuery.minimumSeverity?.toString() ?? "");
		setMaximumSeverity(workspace.logQuery.maximumSeverity?.toString() ?? "");
		setTraceId(query.traceId ?? "");
		setSpanId(workspace.logQuery.spanId ?? "");
	}, [
		query.traceId,
		workspace.logQuery.maximumSeverity,
		workspace.logQuery.minimumSeverity,
		workspace.logQuery.spanId,
		workspace.traceQuery.maximumDurationNs,
		workspace.traceQuery.minimumDurationNs,
		workspace.traceQuery.operation,
		workspace.traceQuery.status,
	]);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		const popover = event.currentTarget.closest("details");
		if (popover instanceof HTMLDetailsElement) popover.open = false;
		const attributes =
			attributeKey.trim() === "" || attributeValue === ""
				? query.attributes
				: [
						...query.attributes.filter((filter) => filter.key !== attributeKey.trim()).slice(-31),
						{ key: attributeKey.trim(), operator: attributeOperator, value: attributeValue },
					];
		if (workspace.signal === "traces") {
			onTraceQuery({
				operation: optionalTrimmed(operation),
				status: status === "" ? undefined : (status as TraceSearchQuery["status"]),
				minimumDurationNs: parseOptionalMilliseconds(minimumDuration),
				maximumDurationNs: parseOptionalMilliseconds(maximumDuration),
				traceId: canonicalTraceId(optionalTrimmed(traceId)),
				attributes,
			});
		} else {
			onLogQuery({
				minimumSeverity: parseOptionalNumber(minimumSeverity),
				maximumSeverity: parseOptionalNumber(maximumSeverity),
				traceId: canonicalTraceId(optionalTrimmed(traceId)),
				spanId: canonicalSpanId(optionalTrimmed(spanId)),
				attributes,
			});
		}
		setAttributeKey("");
		setAttributeValue("");
	};

	return (
		<details className="advanced-picker">
			<summary aria-label={`More filters, ${count} active`}>
				More <span className={count > 0 ? "filter-count engaged" : "filter-count"}>{count}</span>
				<span className="summary-chevron" aria-hidden="true">
					<ChevronDownIcon />
				</span>
			</summary>
			<form className="advanced-popover" onSubmit={submit}>
				{workspace.signal === "traces" ? (
					<>
						<label>
							Operation
							<input value={operation} onChange={(event) => setOperation(event.currentTarget.value)} />
						</label>
						<label>
							Status
							<select value={status} onChange={(event) => setStatus(event.currentTarget.value)}>
								<option value="">Any status</option>
								<option value="error">Error</option>
								<option value="ok">OK</option>
								<option value="active">Active</option>
							</select>
						</label>
						<div className="advanced-grid">
							<label>
								Minimum duration (ms)
								<input
									type="number"
									min="0"
									step="0.001"
									value={minimumDuration}
									onChange={(event) => setMinimumDuration(event.currentTarget.value)}
								/>
							</label>
							<label>
								Maximum duration (ms)
								<input
									type="number"
									min="0"
									step="0.001"
									value={maximumDuration}
									onChange={(event) => setMaximumDuration(event.currentTarget.value)}
								/>
							</label>
						</div>
					</>
				) : (
					<div className="advanced-grid">
						<label>
							Minimum severity
							<select
								value={minimumSeverity}
								onChange={(event) => setMinimumSeverity(event.currentTarget.value)}
							>
								<option value="">Any minimum</option>
								{severityMinimumOptions.map(([value, label]) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
						</label>
						<label>
							Maximum severity
							<select
								value={maximumSeverity}
								onChange={(event) => setMaximumSeverity(event.currentTarget.value)}
							>
								<option value="">Any maximum</option>
								{severityMaximumOptions.map(([value, label]) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
						</label>
					</div>
				)}
				<label>
					Trace ID
					<input
						value={traceId}
						pattern="(?!0{32})[0-9a-f]{32}"
						placeholder="32 lowercase hex characters"
						onChange={(event) => setTraceId(event.currentTarget.value)}
					/>
				</label>
				{workspace.signal === "logs" ? (
					<label>
						Span ID
						<input
							value={spanId}
							pattern="(?!0{16})[0-9a-f]{16}"
							placeholder="16 lowercase hex characters"
							onChange={(event) => setSpanId(event.currentTarget.value)}
						/>
					</label>
				) : null}
				<fieldset className="attribute-builder">
					<legend>Attribute filter</legend>
					<input
						aria-label="Attribute key"
						value={attributeKey}
						placeholder="key"
						onChange={(event) => setAttributeKey(event.currentTarget.value)}
					/>
					<select
						aria-label="Attribute operator"
						value={attributeOperator}
						onChange={(event) => setAttributeOperator(event.currentTarget.value as "equals" | "contains")}
					>
						<option value="equals">equals</option>
						<option value="contains">contains</option>
					</select>
					<input
						aria-label="Attribute value"
						value={attributeValue}
						placeholder="value"
						onChange={(event) => setAttributeValue(event.currentTarget.value)}
					/>
				</fieldset>
				<button type="submit">Apply filters</button>
			</form>
		</details>
	);
}

export const countAdvancedFilters = (workspace: WorkspaceState): number =>
	workspace.signal === "traces"
		? countDefined([
				workspace.traceQuery.operation,
				workspace.traceQuery.status === "all" ? undefined : workspace.traceQuery.status,
				workspace.traceQuery.minimumDurationNs,
				workspace.traceQuery.maximumDurationNs,
				workspace.traceQuery.traceId,
			]) + workspace.traceQuery.attributes.length
		: countDefined([
				workspace.logQuery.minimumSeverity,
				workspace.logQuery.maximumSeverity,
				workspace.logQuery.traceId,
				workspace.logQuery.spanId,
			]) + workspace.logQuery.attributes.length;

const severityMinimumOptions = [
	[1, "Trace and above"],
	[5, "Debug and above"],
	[9, "Info and above"],
	[13, "Warn and above"],
	[17, "Error and above"],
	[21, "Fatal only"],
] as const;

const severityMaximumOptions = [
	[4, "Up to trace"],
	[8, "Up to debug"],
	[12, "Up to info"],
	[16, "Up to warn"],
	[20, "Up to error"],
	[24, "Up to fatal"],
] as const;

const countDefined = (values: ReadonlyArray<unknown>): number => values.filter((value) => value !== undefined).length;

const optionalTrimmed = (value: string): string | undefined => {
	const trimmed = value.trim();
	return trimmed === "" ? undefined : trimmed;
};

const parseOptionalNumber = (value: string): number | undefined =>
	value === "" ? undefined : Number.parseInt(value, 10);

const parseOptionalMilliseconds = (value: string): bigint | undefined => {
	if (value === "") return undefined;
	const nanoseconds = Math.round(Number(value) * 1_000_000);
	return Number.isSafeInteger(nanoseconds) && nanoseconds >= 0 ? BigInt(nanoseconds) : undefined;
};

const formatOptionalMilliseconds = (value: bigint | undefined): string =>
	value === undefined ? "" : formatMilliseconds(value);

export const formatMilliseconds = (value: bigint): string => {
	const whole = value / 1_000_000n;
	const fractional = (value % 1_000_000n).toString().padStart(6, "0").replace(/0+$/u, "");
	return fractional === "" ? whole.toString() : `${whole}.${fractional}`;
};
