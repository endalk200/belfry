import type { OtlpAnyValue, ServiceIdentity, SpanDetail } from "@belfry/telemetry";

import type { WorkspaceSignal } from "./model.js";

export const formatService = (service: ServiceIdentity): string =>
	[
		service.namespace === undefined ? undefined : `${service.namespace}/`,
		service.name,
		service.environment === undefined ? undefined : ` · ${service.environment}`,
	]
		.filter((part) => part !== undefined)
		.join("");

export const formatNanoseconds = (nanoseconds: bigint | undefined): string => {
	if (nanoseconds === undefined) return "running";
	if (nanoseconds < 1_000n) return `${nanoseconds} ns`;
	if (nanoseconds < 1_000_000n) return `${trimDecimal(Number(nanoseconds) / 1_000)} µs`;
	if (nanoseconds < 1_000_000_000n) return `${trimDecimal(Number(nanoseconds) / 1_000_000)} ms`;
	return `${trimDecimal(Number(nanoseconds) / 1_000_000_000)} s`;
};

export const formatTimestamp = (nanoseconds: bigint | undefined): string => {
	if (nanoseconds === undefined) return "no timestamp";
	const milliseconds = Number(nanoseconds / 1_000_000n);
	const remainder = (nanoseconds % 1_000_000n).toString().padStart(6, "0");
	return `${new Date(milliseconds).toISOString().replace("Z", "")}${remainder}Z`;
};

export const formatSeverity = (number: number | undefined, text: string | undefined): string =>
	text ?? (number === undefined ? "UNSPECIFIED" : `severity ${number}`);

export const formatSpanStatus = (span: Pick<SpanDetail, "endTimeNs" | "status">): "Error" | "Running" | "OK" =>
	span.status.code === 2 ? "Error" : span.endTimeNs === undefined ? "Running" : "OK";

export const emptyWorkspaceMessage = (signal: WorkspaceSignal): string =>
	`No matching ${signal}. Configure an OTLP exporter, clear active filters, or inspect ingestion diagnostics.`;

export type WorkspaceErrorPresentation = {
	readonly kind: "invalid-query" | "not-found" | "unavailable" | "unexpected";
	readonly message: string;
};

export const presentWorkspaceError = (error: unknown): WorkspaceErrorPresentation => {
	const record = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : undefined;
	const code = typeof record?.code === "string" ? record.code : undefined;
	const detail =
		typeof record?.message === "string" ? record.message : error instanceof Error ? error.message : String(error);
	if (
		code === "invalid_query" ||
		code === "invalid_cursor" ||
		code === "range_too_large" ||
		code === "limit_exceeded"
	) {
		return { kind: "invalid-query", message: `Invalid bounded query: ${detail}` };
	}
	if (code === "not_found") return { kind: "not-found", message: `Telemetry no longer available: ${detail}` };
	if (code === "store_unavailable" || code === "migration_unavailable" || code === "query_timeout") {
		return { kind: "unavailable", message: `Query unavailable: ${detail}` };
	}
	return { kind: "unexpected", message: `Workspace request failed: ${detail}` };
};

export const formatAnyValue = (value: OtlpAnyValue): string => {
	switch (value.type) {
		case "empty":
			return "∅";
		case "bytes":
			return `${value.value.byteLength} bytes (${toBase64(value.value)})`;
		case "array":
			return `[${value.value.map(formatAnyValue).join(", ")}]`;
		case "key-value-list":
			return `{ ${Object.entries(value.value)
				.map(([key, item]) => `${key}: ${formatAnyValue(item)}`)
				.join(", ")} }`;
		case "string":
			return value.value;
		default:
			return String(value.value);
	}
};

const trimDecimal = (value: number): string =>
	value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2).replace(/\.0+$/u, "");

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
