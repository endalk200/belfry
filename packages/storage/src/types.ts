import type {
	CursorPosition,
	DiagnosticPageSchema,
	FacetPageSchema,
	FacetRequestSchema,
	Health,
	IngestionStats,
	LogPageSchema,
	LogSearchQuery,
	ServicePageSchema,
	TimeRange,
	TracePageSchema,
	TraceSearchQuery,
} from "@belfry/query-api";
import type {
	LogDetail,
	OtlpAnyValue,
	ResourceDetail,
	ScopeDetail,
	ServiceIdentity,
	SpanDetail,
	TelemetryAttributes,
	TraceDetail,
	TraceSpanDetail,
} from "@belfry/telemetry";
import type { Effect, Schema } from "effect";

export type LogWriteRecord = Omit<LogDetail, "id" | "bodyPreview" | "truncated"> & {
	readonly service: ServiceIdentity;
	readonly body: OtlpAnyValue;
	readonly attributes: TelemetryAttributes;
	readonly resource: ResourceDetail;
	readonly scope: ScopeDetail;
};

export type StorageDiagnosticInput = {
	readonly signal?: "traces" | "logs" | "storage" | "retention" | "daemon";
	readonly code: string;
	readonly message: string;
	readonly details?: unknown;
};

export type TelemetryWriteBatch =
	| {
			readonly signal: "traces";
			readonly spans: ReadonlyArray<SpanDetail>;
			readonly diagnostics?: ReadonlyArray<StorageDiagnosticInput>;
	  }
	| {
			readonly signal: "logs";
			readonly logs: ReadonlyArray<LogWriteRecord>;
			readonly diagnostics?: ReadonlyArray<StorageDiagnosticInput>;
	  };

export type StorageWriteResult = {
	readonly records: number;
	readonly logIds: ReadonlyArray<string>;
	readonly durationMs: number;
};

export type StorageInformation = {
	readonly databasePath: string;
	readonly journalMode: string;
	readonly writerRole: "read-write";
	readonly readerRole: "read-only";
	readonly schemaVersion: number;
	/** Live SQLite pages, excluding freelist pages. This is the retention size budget. */
	readonly databaseSizeBytes: bigint;
	/** Apparent bytes across the database, WAL, and shared-memory files. */
	readonly storageSizeBytes: bigint;
	readonly walSizeBytes: bigint;
};

export type RetentionOptions = {
	readonly nowNs: bigint;
	readonly maxAgeNs: bigint;
	readonly maxBytes: bigint;
	readonly batchSize: number;
};

export type RetentionResult = {
	readonly deletedRecords: number;
	readonly databaseSizeBytes: bigint;
	readonly needsMore: boolean;
};

export type TelemetryStorageService = {
	readonly information: Effect.Effect<StorageInformation, import("./errors.js").StorageFailure>;
	readonly write: (
		batch: TelemetryWriteBatch,
	) => Effect.Effect<StorageWriteResult, import("./errors.js").StorageFailure>;
	readonly searchTraces: (
		query: TraceSearchQuery,
		cursor?: CursorPosition,
	) => Effect.Effect<typeof TracePageSchema.Type, import("./errors.js").StorageFailure>;
	readonly getTrace: (
		traceId: string,
	) => Effect.Effect<TraceDetail, import("./errors.js").StorageFailure | import("./errors.js").StorageNotFound>;
	readonly getSpan: (
		traceId: string,
		spanId: string,
	) => Effect.Effect<TraceSpanDetail, import("./errors.js").StorageFailure | import("./errors.js").StorageNotFound>;
	readonly listTraceLogs: (
		traceId: string,
		limit: number,
		cursor?: CursorPosition,
		spanId?: string,
	) => Effect.Effect<
		typeof LogPageSchema.Type,
		import("./errors.js").StorageFailure | import("./errors.js").StorageNotFound
	>;
	readonly searchLogs: (
		query: LogSearchQuery,
		cursor?: CursorPosition,
	) => Effect.Effect<typeof LogPageSchema.Type, import("./errors.js").StorageFailure>;
	readonly getLog: (
		logId: string,
	) => Effect.Effect<LogDetail, import("./errors.js").StorageFailure | import("./errors.js").StorageNotFound>;
	readonly listServices: (
		range: TimeRange,
		limit: number,
		cursor?: CursorPosition,
	) => Effect.Effect<typeof ServicePageSchema.Type, import("./errors.js").StorageFailure>;
	readonly listDiagnostics: (
		range: TimeRange,
		limit: number,
		cursor?: CursorPosition,
	) => Effect.Effect<typeof DiagnosticPageSchema.Type, import("./errors.js").StorageFailure>;
	readonly facets: (
		request: typeof FacetRequestSchema.Type,
		cursor?: CursorPosition,
	) => Effect.Effect<typeof FacetPageSchema.Type, import("./errors.js").StorageFailure>;
	readonly health: Effect.Effect<Health, import("./errors.js").StorageFailure>;
	readonly ingestionStats: Effect.Effect<IngestionStats, import("./errors.js").StorageFailure>;
	readonly recordIngestionFailure: (
		decodeError: boolean,
		diagnostic?: StorageDiagnosticInput,
	) => Effect.Effect<void, import("./errors.js").StorageFailure>;
	readonly retain: (
		options: RetentionOptions,
	) => Effect.Effect<RetentionResult, import("./errors.js").StorageFailure>;
	readonly checkpoint: Effect.Effect<void, import("./errors.js").StorageFailure>;
	readonly vacuum: Effect.Effect<void, import("./errors.js").StorageFailure>;
	readonly reset: Effect.Effect<void, import("./errors.js").StorageFailure>;
};

export type TelemetryReaderService = Pick<
	TelemetryStorageService,
	| "information"
	| "searchTraces"
	| "getTrace"
	| "getSpan"
	| "listTraceLogs"
	| "searchLogs"
	| "getLog"
	| "listServices"
	| "listDiagnostics"
	| "facets"
	| "health"
	| "ingestionStats"
>;

// Keep Effect Schema imports in the public graph without introducing duplicate interfaces.
export type StorageSchema = Schema.Top;
