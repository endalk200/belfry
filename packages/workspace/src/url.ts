import {
	MAX_ATTRIBUTE_FILTERS,
	MAX_ATTRIBUTE_KEY_LENGTH,
	MAX_QUERY_TEXT_LENGTH,
	MAX_SERVICE_FILTERS,
} from "@belfry/query-api";
import { canonicalSpanId, canonicalTraceId, type ServiceIdentity } from "@belfry/telemetry";

import { initialWorkspaceState, type WorkspaceState } from "./model.js";

export type WorkspaceRestoreBounds = {
	readonly maxLookbackNs?: bigint | undefined;
};

export const workspaceFromUrl = (
	url: URL,
	fallback = initialWorkspaceState(),
	bounds: WorkspaceRestoreBounds = {},
): WorkspaceState => {
	const parameters = url.searchParams;
	const routeSignal = url.pathname.startsWith("/logs") ? "logs" : "traces";
	const routeTrace = url.pathname.match(/^\/traces\/([0-9a-f]{32})$/u)?.[1];
	const selectedTraceId = canonicalTraceId(parameters.get("trace")) ?? canonicalTraceId(routeTrace ?? null);
	const selectedSpanId = canonicalSpanId(parameters.get("span"));
	const selectedLogId = nonEmpty(parameters.get("log"));
	const parsedFromNs = parseNanoseconds(parameters.get("from"), fallback.traceQuery.fromNs);
	const parsedToNs = parseNanoseconds(parameters.get("to"), fallback.traceQuery.toNs);
	const rangeIsValid =
		parsedFromNs >= 0n &&
		parsedFromNs <= parsedToNs &&
		(bounds.maxLookbackNs === undefined || parsedToNs - parsedFromNs <= bounds.maxLookbackNs);
	const fromNs = rangeIsValid ? parsedFromNs : fallback.traceQuery.fromNs;
	const toNs = rangeIsValid ? parsedToNs : fallback.traceQuery.toNs;
	const hasExplicitRange = parameters.has("from") || parameters.has("to");
	const requestedLiveRangeDurationNs =
		parameters.get("live") === "1" || (!hasExplicitRange && fallback.liveRangeDurationNs !== undefined)
			? toNs - fromNs
			: undefined;
	const liveRangeDurationNs =
		requestedLiveRangeDurationNs !== undefined &&
		requestedLiveRangeDurationNs > 0n &&
		(bounds.maxLookbackNs === undefined || requestedLiveRangeDurationNs <= bounds.maxLookbackNs)
			? requestedLiveRangeDurationNs
			: fallback.liveRangeDurationNs;
	const services = parameters.getAll("service").flatMap(decodeService).slice(0, MAX_SERVICE_FILTERS);
	const queryText = boundedNonEmpty(parameters.get("q"), MAX_QUERY_TEXT_LENGTH);
	const attributes = parameters.getAll("attribute").flatMap(decodeAttributeFilter).slice(0, MAX_ATTRIBUTE_FILTERS);
	const traceSort = parseLiteral(parameters.get("sort"), ["newest", "oldest", "slowest"], fallback.traceQuery.sort);
	const logSort = parseLiteral(parameters.get("sort"), ["newest", "oldest"], fallback.logQuery.sort);
	const filterTraceId = canonicalTraceId(parameters.get("filterTrace"));
	const filterSpanId = canonicalSpanId(parameters.get("filterSpan"));
	const parsedMinimumDurationNs = parseOptionalNanoseconds(parameters.get("minimumDuration"));
	const parsedMaximumDurationNs = parseOptionalNanoseconds(parameters.get("maximumDuration"));
	const durationBoundsAreValid =
		parsedMinimumDurationNs === undefined ||
		parsedMaximumDurationNs === undefined ||
		parsedMinimumDurationNs <= parsedMaximumDurationNs;
	const parsedMinimumSeverity = parseOptionalInteger(parameters.get("minimumSeverity"), 1, 24);
	const parsedMaximumSeverity = parseOptionalInteger(parameters.get("maximumSeverity"), 1, 24);
	const severityBoundsAreValid =
		parsedMinimumSeverity === undefined ||
		parsedMaximumSeverity === undefined ||
		parsedMinimumSeverity <= parsedMaximumSeverity;
	const correlationKind = parseOptionalLiteral(parameters.get("correlation"), ["trace", "span"]);
	const logCorrelation =
		routeSignal === "logs" && correlationKind !== undefined && filterTraceId !== undefined
			? {
					traceId: filterTraceId,
					spanId: correlationKind === "span" ? filterSpanId : undefined,
				}
			: undefined;
	return {
		...fallback,
		signal: routeSignal,
		selectedTraceId,
		selectedSpanId: selectedTraceId === undefined ? undefined : selectedSpanId,
		selectedLogId,
		serviceFilter: services,
		refreshPaused: parameters.get("paused") === "1",
		liveRangeDurationNs,
		logCorrelation,
		traceQuery: {
			...fallback.traceQuery,
			fromNs,
			toNs,
			services,
			text: queryText,
			operation: boundedNonEmpty(parameters.get("operation"), MAX_QUERY_TEXT_LENGTH),
			status: parseOptionalLiteral(parameters.get("status"), ["all", "error", "ok", "active"]),
			minimumDurationNs: durationBoundsAreValid ? parsedMinimumDurationNs : fallback.traceQuery.minimumDurationNs,
			maximumDurationNs: durationBoundsAreValid ? parsedMaximumDurationNs : fallback.traceQuery.maximumDurationNs,
			traceId: filterTraceId,
			attributes,
			sort: traceSort,
			cursor: undefined,
		},
		logQuery: {
			...fallback.logQuery,
			fromNs,
			toNs,
			services,
			text: queryText,
			minimumSeverity: severityBoundsAreValid ? parsedMinimumSeverity : fallback.logQuery.minimumSeverity,
			maximumSeverity: severityBoundsAreValid ? parsedMaximumSeverity : fallback.logQuery.maximumSeverity,
			traceId: filterTraceId,
			spanId: filterSpanId,
			attributes,
			sort: logSort,
			cursor: undefined,
		},
	};
};

export const workspaceToUrl = (state: WorkspaceState): string => {
	const path =
		state.signal === "logs"
			? "/logs"
			: state.selectedTraceId === undefined
				? "/traces"
				: `/traces/${state.selectedTraceId}`;
	const parameters = new URLSearchParams();
	const query = state.signal === "traces" ? state.traceQuery : state.logQuery;
	parameters.set("from", query.fromNs.toString());
	parameters.set("to", query.toNs.toString());
	parameters.set("sort", query.sort);
	if (query.text !== undefined) parameters.set("q", query.text);
	for (const service of state.serviceFilter) parameters.append("service", encodeService(service));
	for (const attribute of query.attributes) parameters.append("attribute", encodeAttributeFilter(attribute));
	if (query.traceId !== undefined) parameters.set("filterTrace", query.traceId);
	if (state.signal === "traces") {
		const traceQuery = state.traceQuery;
		if (traceQuery.operation !== undefined) parameters.set("operation", traceQuery.operation);
		if (traceQuery.status !== undefined) parameters.set("status", traceQuery.status);
		if (traceQuery.minimumDurationNs !== undefined)
			parameters.set("minimumDuration", traceQuery.minimumDurationNs.toString());
		if (traceQuery.maximumDurationNs !== undefined)
			parameters.set("maximumDuration", traceQuery.maximumDurationNs.toString());
	} else {
		const logQuery = state.logQuery;
		if (logQuery.spanId !== undefined) parameters.set("filterSpan", logQuery.spanId);
		if (logQuery.minimumSeverity !== undefined)
			parameters.set("minimumSeverity", logQuery.minimumSeverity.toString());
		if (logQuery.maximumSeverity !== undefined)
			parameters.set("maximumSeverity", logQuery.maximumSeverity.toString());
	}
	if (state.signal === "traces" && state.selectedSpanId !== undefined) parameters.set("span", state.selectedSpanId);
	if (state.selectedLogId !== undefined) parameters.set("log", state.selectedLogId);
	if (state.signal === "logs" && state.logCorrelation !== undefined) {
		parameters.set("correlation", state.logCorrelation.spanId === undefined ? "trace" : "span");
	}
	if (state.refreshPaused) parameters.set("paused", "1");
	if (state.liveRangeDurationNs !== undefined) parameters.set("live", "1");
	return `${path}?${parameters.toString()}`;
};

const encodeService = (service: ServiceIdentity): string =>
	encodeOpaque([service.namespace ?? null, service.name, service.environment ?? null]);

const decodeService = (value: string): ReadonlyArray<ServiceIdentity> => {
	try {
		const decoded = decodeOpaque(value);
		if (!Array.isArray(decoded) || decoded.length !== 3 || typeof decoded[1] !== "string" || decoded[1] === "")
			return [];
		const [namespace, name, environment] = decoded;
		if (
			(namespace !== null && typeof namespace !== "string") ||
			(environment !== null && typeof environment !== "string")
		)
			return [];
		return [{ namespace: namespace ?? undefined, name, environment: environment ?? undefined }];
	} catch {
		return [];
	}
};

const encodeAttributeFilter = (filter: {
	readonly key: string;
	readonly operator: "equals" | "contains";
	readonly value: string;
}): string => encodeOpaque([filter.key, filter.operator, filter.value]);

const decodeAttributeFilter = (
	value: string,
): ReadonlyArray<{ readonly key: string; readonly operator: "equals" | "contains"; readonly value: string }> => {
	try {
		const decoded = decodeOpaque(value);
		if (
			!Array.isArray(decoded) ||
			decoded.length !== 3 ||
			typeof decoded[0] !== "string" ||
			(decoded[1] !== "equals" && decoded[1] !== "contains") ||
			typeof decoded[2] !== "string"
		)
			return [];
		if (
			decoded[0].length === 0 ||
			decoded[0].length > MAX_ATTRIBUTE_KEY_LENGTH ||
			decoded[2].length > MAX_QUERY_TEXT_LENGTH
		)
			return [];
		return [{ key: decoded[0], operator: decoded[1], value: decoded[2] }];
	} catch {
		return [];
	}
};

const encodeOpaque = (value: unknown): string => {
	const bytes = new TextEncoder().encode(JSON.stringify(value));
	return btoa(String.fromCharCode(...bytes))
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/u, "");
};

const decodeOpaque = (value: string): unknown => {
	const base64 = value
		.replaceAll("-", "+")
		.replaceAll("_", "/")
		.padEnd(Math.ceil(value.length / 4) * 4, "=");
	return JSON.parse(
		new TextDecoder().decode(Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))),
	) as unknown;
};

const parseNanoseconds = (value: string | null, fallback: bigint): bigint => {
	if (value === null || !/^-?\d+$/u.test(value)) return fallback;
	try {
		return BigInt(value);
	} catch {
		return fallback;
	}
};

const parseOptionalNanoseconds = (value: string | null): bigint | undefined => {
	if (value === null || !/^\d+$/u.test(value)) return undefined;
	try {
		return BigInt(value);
	} catch {
		return undefined;
	}
};

const parseOptionalInteger = (value: string | null, minimum: number, maximum: number): number | undefined => {
	if (value === null || !/^\d+$/u.test(value)) return undefined;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : undefined;
};

const nonEmpty = (value: string | null): string | undefined => (value === null || value === "" ? undefined : value);

const boundedNonEmpty = (value: string | null, maximumLength: number): string | undefined => {
	const normalized = nonEmpty(value);
	return normalized === undefined ? undefined : normalized.slice(0, maximumLength);
};

const parseLiteral = <A extends string>(value: string | null, values: ReadonlyArray<A>, fallback: A): A =>
	value !== null && values.includes(value as A) ? (value as A) : fallback;

const parseOptionalLiteral = <A extends string>(value: string | null, values: ReadonlyArray<A>): A | undefined =>
	value !== null && values.includes(value as A) ? (value as A) : undefined;
