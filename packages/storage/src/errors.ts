import { Schema } from "effect";

export class StorageFailure extends Schema.TaggedErrorClass<StorageFailure>()("StorageFailure", {
	code: Schema.Literals([
		"open_failed",
		"migration_failed",
		"write_failed",
		"read_failed",
		"retention_failed",
		"maintenance_failed",
		"query_timeout",
	]),
	message: Schema.String,
}) {}

export class StorageNotFound extends Schema.TaggedErrorClass<StorageNotFound>()("StorageNotFound", {
	entity: Schema.Literals(["trace", "span", "log"]),
	id: Schema.String,
	message: Schema.String,
}) {}
