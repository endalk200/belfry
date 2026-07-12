import { Schema } from "effect";

export class IngestionPayloadTooLarge extends Schema.TaggedErrorClass<IngestionPayloadTooLarge>()(
	"IngestionPayloadTooLarge",
	{
		stage: Schema.Literals(["compressed", "decompressed"]),
		limitBytes: Schema.Number,
		actualBytes: Schema.Number,
		message: Schema.String,
	},
) {}

export class IngestionUnsupportedMediaType extends Schema.TaggedErrorClass<IngestionUnsupportedMediaType>()(
	"IngestionUnsupportedMediaType",
	{
		contentType: Schema.String,
		message: Schema.String,
	},
) {}

export class IngestionUnsupportedEncoding extends Schema.TaggedErrorClass<IngestionUnsupportedEncoding>()(
	"IngestionUnsupportedEncoding",
	{
		contentEncoding: Schema.String,
		message: Schema.String,
	},
) {}

export class IngestionInvalidPayload extends Schema.TaggedErrorClass<IngestionInvalidPayload>()(
	"IngestionInvalidPayload",
	{
		code: Schema.Literals(["malformed_payload", "invalid_trace_id", "invalid_span_id"]),
		message: Schema.String,
	},
) {}

export class IngestionOverloaded extends Schema.TaggedErrorClass<IngestionOverloaded>()("IngestionOverloaded", {
	queueDepth: Schema.Number,
	queueBytes: Schema.Number,
	message: Schema.String,
}) {}

export class IngestionUnavailable extends Schema.TaggedErrorClass<IngestionUnavailable>()("IngestionUnavailable", {
	code: Schema.Literals(["writer_unavailable", "storage_unavailable", "shutdown", "worker_protocol_error"]),
	message: Schema.String,
}) {}

export type IngestionError =
	| IngestionInvalidPayload
	| IngestionOverloaded
	| IngestionPayloadTooLarge
	| IngestionUnavailable
	| IngestionUnsupportedEncoding
	| IngestionUnsupportedMediaType;
