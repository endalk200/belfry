import type { LogWriteRecord } from "@belfry/storage";
import type { SpanDetail } from "@belfry/telemetry";

export type IngestionDiagnostic = {
	readonly code: "unknown_service" | "truncated_value";
	readonly message: string;
};

export type NormalizedSpan = SpanDetail;

export type NormalizedLog = LogWriteRecord;

export type NormalizedTraceBatch = {
	readonly signal: "traces";
	readonly spans: ReadonlyArray<NormalizedSpan>;
	readonly diagnostics: ReadonlyArray<IngestionDiagnostic>;
};

export type NormalizedLogBatch = {
	readonly signal: "logs";
	readonly logs: ReadonlyArray<NormalizedLog>;
	readonly diagnostics: ReadonlyArray<IngestionDiagnostic>;
};

export type NormalizedBatch = NormalizedTraceBatch | NormalizedLogBatch;
