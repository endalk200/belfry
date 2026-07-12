import { Schema } from "effect";

export const WriterConfigurationSchema = Schema.Struct({
	databasePath: Schema.String,
	maxIndexedAttributesPerRecord: Schema.Number,
	maxIndexedValueBytes: Schema.Number,
	maxIndexedAttributeKeys: Schema.Number,
	maxIndexedValuesPerKey: Schema.Number,
	maxDecompressedBytes: Schema.Number,
	retentionMaxAgeNs: Schema.BigInt,
	retentionMaxBytes: Schema.BigInt,
	retentionBatchSize: Schema.Number,
});
export type WriterConfiguration = typeof WriterConfigurationSchema.Type;

const InitializeRequestSchema = Schema.Struct({
	_tag: Schema.Literal("initialize"),
	id: Schema.String,
	configuration: WriterConfigurationSchema,
});

const IngestRequestSchema = Schema.Struct({
	_tag: Schema.Literal("ingest"),
	id: Schema.String,
	signal: Schema.Literals(["traces", "logs"]),
	contentType: Schema.String,
	contentEncoding: Schema.Literals(["identity", "gzip"]),
	body: Schema.Uint8Array,
});

export const WriterDiagnosticSchema = Schema.Struct({
	signal: Schema.optional(Schema.Literals(["traces", "logs", "storage", "retention", "daemon"])),
	code: Schema.String,
	message: Schema.String,
});
export type WriterDiagnostic = typeof WriterDiagnosticSchema.Type;

export const WriterRetentionResultSchema = Schema.Struct({
	deletedRecords: Schema.Number,
	databaseSizeBytes: Schema.BigIntFromString,
	needsMore: Schema.Boolean,
});

const MaintenanceRequestSchema = Schema.Struct({
	_tag: Schema.Literal("maintenance"),
	id: Schema.String,
	operation: Schema.Literals([
		"retention",
		"checkpoint",
		"vacuum",
		"reset",
		"stats",
		"record-rejected",
		"record-decode-error",
	]),
	diagnostic: Schema.optional(WriterDiagnosticSchema),
});

const ShutdownRequestSchema = Schema.Struct({
	_tag: Schema.Literal("shutdown"),
	id: Schema.String,
});

export const WriterRequestSchema = Schema.Union([
	InitializeRequestSchema,
	IngestRequestSchema,
	MaintenanceRequestSchema,
	ShutdownRequestSchema,
]);
export type WriterRequest = typeof WriterRequestSchema.Type;

const ReadyResponseSchema = Schema.Struct({
	_tag: Schema.Literal("ready"),
	id: Schema.String,
});

const IngestSuccessResponseSchema = Schema.Struct({
	_tag: Schema.Literal("ingest-success"),
	id: Schema.String,
	records: Schema.Number,
	logIds: Schema.Array(Schema.String),
	durationMs: Schema.Number,
});

const MaintenanceSuccessResponseSchema = Schema.Struct({
	_tag: Schema.Literal("maintenance-success"),
	id: Schema.String,
	result: Schema.optional(Schema.Json),
});

const ShutdownSuccessResponseSchema = Schema.Struct({
	_tag: Schema.Literal("shutdown-success"),
	id: Schema.String,
});

const FailureResponseSchema = Schema.Struct({
	_tag: Schema.Literal("failure"),
	id: Schema.String,
	code: Schema.Literals([
		"unsupported_content_type",
		"unsupported_content_encoding",
		"malformed_payload",
		"invalid_trace_id",
		"invalid_span_id",
		"decompressed_too_large",
		"storage_unavailable",
		"maintenance_failed",
		"worker_protocol_error",
	]),
	message: Schema.String,
	limitBytes: Schema.optional(Schema.Number),
	actualBytes: Schema.optional(Schema.Number),
});

export const WriterResponseSchema = Schema.Union([
	ReadyResponseSchema,
	IngestSuccessResponseSchema,
	MaintenanceSuccessResponseSchema,
	ShutdownSuccessResponseSchema,
	FailureResponseSchema,
]);
export type WriterResponse = typeof WriterResponseSchema.Type;
