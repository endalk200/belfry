import type { ServiceSummary } from "@belfry/query-api";
import type {
	LogDetail,
	LogSummary,
	ServiceIdentity,
	SpanDetail,
	SpanStructuralWarning,
	TraceSpanDetail,
	TraceSummary,
} from "@belfry/telemetry";

export type TraceRow = {
	readonly trace_id: string;
	readonly root_span_id: string | null;
	readonly root_operation: string;
	readonly start_time_ns: bigint;
	readonly end_time_ns: bigint | null;
	readonly duration_ns: bigint | null;
	readonly active: bigint;
	readonly span_count: bigint;
	readonly error_count: bigint;
	readonly warnings_json: string;
};

export type SpanRow = {
	readonly trace_id: string;
	readonly span_id: string;
	readonly detail_json: string;
	readonly log_count?: bigint;
};

export type LogRow = {
	readonly log_id: string;
	readonly detail_json: string;
};

export type ServiceRow = {
	readonly service_key: string;
	readonly namespace: string | null;
	readonly name: string;
	readonly environment: string | null;
	readonly unknown_service: bigint;
	readonly first_seen_ns?: bigint;
	readonly last_seen_ns?: bigint;
	readonly span_count?: bigint;
	readonly log_count?: bigint;
	readonly error_count?: bigint;
};

export const traceSummaryFromRow = (row: TraceRow, services: ReadonlyArray<ServiceIdentity>): TraceSummary => ({
	traceId: row.trace_id,
	rootSpanId: row.root_span_id ?? undefined,
	rootOperation: row.root_operation,
	startTimeNs: row.start_time_ns,
	endTimeNs: row.end_time_ns ?? undefined,
	durationNs: row.duration_ns ?? undefined,
	active: row.active === 1n,
	spanCount: Number(row.span_count),
	errorCount: Number(row.error_count),
	services,
	warnings: JSON.parse(row.warnings_json) as Array<SpanStructuralWarning>,
});

export const logSummary = (log: LogDetail): LogSummary => ({
	id: log.id,
	timestampNs: log.timestampNs,
	observedTimeNs: log.observedTimeNs,
	service: log.service,
	severityNumber: log.severityNumber,
	severityText: log.severityText,
	bodyPreview: log.bodyPreview,
	traceId: log.traceId,
	spanId: log.spanId,
	truncated: log.truncated,
});

export const serviceIdentityFromRow = (row: ServiceRow): ServiceIdentity => ({
	namespace: row.namespace ?? undefined,
	name: row.name,
	environment: row.environment ?? undefined,
});

export const serviceSummaryFromRow = (row: ServiceRow): ServiceSummary => ({
	service: serviceIdentityFromRow(row),
	firstSeenNs: row.first_seen_ns ?? 0n,
	lastSeenNs: row.last_seen_ns ?? 0n,
	spanCount: Number(row.span_count ?? 0n),
	logCount: Number(row.log_count ?? 0n),
	errorCount: Number(row.error_count ?? 0n),
	unknownService: row.unknown_service === 1n,
});

export const orderSpanTree = (spans: ReadonlyArray<SpanDetail>): ReadonlyArray<TraceSpanDetail> => {
	const structure = analyzeStructure(spans);
	const result: Array<TraceSpanDetail> = [];
	const visited = new Set<string>();
	const visit = (span: SpanDetail, ancestors: ReadonlySet<string>, depth: number) => {
		if (visited.has(span.spanId)) return;
		visited.add(span.spanId);
		const warningSet = new Set(span.warnings);
		for (const warning of structure.spanWarnings.get(span.spanId) ?? []) warningSet.add(warning);
		result.push({ ...span, depth, warnings: [...warningSet] });
		if (ancestors.has(span.spanId)) return;
		const next = new Set(ancestors).add(span.spanId);
		for (const child of structure.children.get(span.spanId) ?? []) visit(child, next, depth + 1);
	};
	for (const root of structure.roots) visit(root, new Set(), 0);
	for (const span of [...spans].sort(compareSpan)) visit(span, new Set(), 0);
	return result;
};

export const analyzeStructure = (spans: ReadonlyArray<SpanDetail>) => {
	const byId = new Map(spans.map((span) => [span.spanId, span]));
	const children = new Map<string, Array<SpanDetail>>();
	const roots: Array<SpanDetail> = [];
	const spanWarnings = new Map<string, Set<SpanStructuralWarning>>();
	const traceWarnings = new Set<SpanStructuralWarning>();
	const warn = (spanId: string, warning: SpanStructuralWarning) => {
		const warnings = spanWarnings.get(spanId) ?? new Set<SpanStructuralWarning>();
		warnings.add(warning);
		spanWarnings.set(spanId, warnings);
		traceWarnings.add(warning);
	};
	for (const span of spans) {
		if (span.endTimeNs === undefined) warn(span.spanId, "running-span");
		if (span.parentSpanId === undefined) {
			roots.push(span);
			continue;
		}
		const parent = byId.get(span.parentSpanId);
		if (parent === undefined) {
			warn(span.spanId, "missing-parent");
			warn(span.spanId, "orphan-span");
			roots.push(span);
			continue;
		}
		if (parent.spanId === span.spanId) {
			warn(span.spanId, "cycle");
			roots.push(span);
			continue;
		}
		const siblings = children.get(parent.spanId) ?? [];
		siblings.push(span);
		children.set(parent.spanId, siblings);
	}
	for (const siblings of children.values()) siblings.sort(compareSpan);
	const fullyVisited = new Set<string>();
	for (const span of spans) {
		if (fullyVisited.has(span.spanId)) continue;
		const path: Array<SpanDetail> = [];
		const pathIndex = new Map<string, number>();
		let current: SpanDetail | undefined = span;
		while (current !== undefined && !fullyVisited.has(current.spanId)) {
			const cycleIndex = pathIndex.get(current.spanId);
			if (cycleIndex !== undefined) {
				for (const cycleSpan of path.slice(cycleIndex)) warn(cycleSpan.spanId, "cycle");
				break;
			}
			pathIndex.set(current.spanId, path.length);
			path.push(current);
			current = current.parentSpanId === undefined ? undefined : byId.get(current.parentSpanId);
		}
		for (const visitedSpan of path) fullyVisited.add(visitedSpan.spanId);
	}
	roots.sort(compareSpan);
	if (roots.length > 1) {
		traceWarnings.add("multiple-roots");
		for (const root of roots) warn(root.spanId, "multiple-roots");
	}
	return { roots, children, spanWarnings, traceWarnings };
};

const compareSpan = (left: SpanDetail, right: SpanDetail): number => {
	if (left.startTimeNs < right.startTimeNs) return -1;
	if (left.startTimeNs > right.startTimeNs) return 1;
	return left.spanId.localeCompare(right.spanId);
};
