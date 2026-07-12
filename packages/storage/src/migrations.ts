import { SqliteMigrator } from "@effect/sql-sqlite-bun";
import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

const initialSchema = [
	`CREATE TABLE resources (
		id INTEGER PRIMARY KEY,
		fingerprint TEXT NOT NULL UNIQUE,
		data_json TEXT NOT NULL
	)`,
	`CREATE TABLE scopes (
		id INTEGER PRIMARY KEY,
		fingerprint TEXT NOT NULL UNIQUE,
		data_json TEXT NOT NULL
	)`,
	`CREATE TABLE services (
		service_key TEXT PRIMARY KEY,
		namespace TEXT,
		name TEXT NOT NULL,
		environment TEXT,
		unknown_service INTEGER NOT NULL DEFAULT 0,
		first_seen_ns INTEGER NOT NULL,
		last_seen_ns INTEGER NOT NULL
	)`,
	`CREATE TABLE traces (
		trace_id TEXT PRIMARY KEY,
		root_span_id TEXT,
		root_operation TEXT NOT NULL,
		start_time_ns INTEGER NOT NULL,
		end_time_ns INTEGER,
		duration_ns INTEGER,
		active INTEGER NOT NULL,
		span_count INTEGER NOT NULL,
		error_count INTEGER NOT NULL,
		warnings_json TEXT NOT NULL
	)`,
	`CREATE INDEX traces_start_time_idx ON traces(start_time_ns DESC, trace_id DESC)`,
	`CREATE INDEX traces_duration_idx ON traces(duration_ns DESC, trace_id DESC)`,
	`CREATE TABLE trace_services (
		trace_id TEXT NOT NULL REFERENCES traces(trace_id) ON DELETE CASCADE,
		service_key TEXT NOT NULL REFERENCES services(service_key),
		PRIMARY KEY (trace_id, service_key)
	) WITHOUT ROWID`,
	`CREATE INDEX trace_services_service_idx ON trace_services(service_key, trace_id)`,
	`CREATE TABLE spans (
		trace_id TEXT NOT NULL REFERENCES traces(trace_id) ON DELETE CASCADE,
		span_id TEXT NOT NULL,
		parent_span_id TEXT,
		service_key TEXT NOT NULL REFERENCES services(service_key),
		resource_id INTEGER NOT NULL REFERENCES resources(id),
		scope_id INTEGER NOT NULL REFERENCES scopes(id),
		name TEXT NOT NULL,
		kind INTEGER NOT NULL,
		start_time_ns INTEGER NOT NULL,
		end_time_ns INTEGER,
		status_code INTEGER NOT NULL,
		detail_json TEXT NOT NULL,
		PRIMARY KEY (trace_id, span_id)
	) WITHOUT ROWID`,
	`CREATE INDEX spans_trace_time_idx ON spans(trace_id, start_time_ns, span_id)`,
	`CREATE INDEX spans_service_time_idx ON spans(service_key, start_time_ns DESC)`,
	`CREATE TABLE span_attributes (
		trace_id TEXT NOT NULL,
		span_id TEXT NOT NULL,
		attribute_key TEXT NOT NULL,
		value_type TEXT NOT NULL,
		value_text TEXT NOT NULL,
		FOREIGN KEY (trace_id, span_id) REFERENCES spans(trace_id, span_id) ON DELETE CASCADE,
		PRIMARY KEY (trace_id, span_id, attribute_key)
	) WITHOUT ROWID`,
	`CREATE INDEX span_attributes_exact_idx ON span_attributes(attribute_key, value_text, trace_id)`,
	`CREATE INDEX span_attributes_trace_idx ON span_attributes(trace_id, span_id)`,
	`CREATE VIRTUAL TABLE span_search USING fts5(
		trace_id UNINDEXED,
		span_id UNINDEXED,
		text,
		tokenize = 'unicode61'
	)`,
	`CREATE TABLE logs (
		log_id TEXT PRIMARY KEY,
		timestamp_ns INTEGER,
		observed_time_ns INTEGER,
		service_key TEXT NOT NULL REFERENCES services(service_key),
		resource_id INTEGER NOT NULL REFERENCES resources(id),
		scope_id INTEGER NOT NULL REFERENCES scopes(id),
		severity_number INTEGER,
		severity_text TEXT,
		trace_id TEXT,
		span_id TEXT,
		body_preview TEXT NOT NULL,
		detail_json TEXT NOT NULL
	)`,
	`CREATE INDEX logs_time_idx ON logs(COALESCE(timestamp_ns, observed_time_ns) DESC, log_id DESC)`,
	`CREATE INDEX logs_service_time_idx ON logs(service_key, COALESCE(timestamp_ns, observed_time_ns) DESC)`,
	`CREATE INDEX logs_trace_time_idx ON logs(trace_id, COALESCE(timestamp_ns, observed_time_ns), log_id)`,
	`CREATE INDEX logs_span_time_idx ON logs(trace_id, span_id, COALESCE(timestamp_ns, observed_time_ns), log_id)`,
	`CREATE TABLE log_attributes (
		log_id TEXT NOT NULL REFERENCES logs(log_id) ON DELETE CASCADE,
		attribute_key TEXT NOT NULL,
		value_type TEXT NOT NULL,
		value_text TEXT NOT NULL,
		PRIMARY KEY (log_id, attribute_key)
	) WITHOUT ROWID`,
	`CREATE INDEX log_attributes_exact_idx ON log_attributes(attribute_key, value_text, log_id)`,
	`CREATE VIRTUAL TABLE log_search USING fts5(
		log_id UNINDEXED,
		text,
		tokenize = 'unicode61'
	)`,
	`CREATE TABLE diagnostics (
		id TEXT PRIMARY KEY,
		time_ns INTEGER NOT NULL,
		signal TEXT,
		code TEXT NOT NULL,
		message TEXT NOT NULL,
		details_json TEXT
	)`,
	`CREATE INDEX diagnostics_time_idx ON diagnostics(time_ns DESC, id DESC)`,
	`CREATE TABLE ingestion_counters (
		counter TEXT PRIMARY KEY,
		value INTEGER NOT NULL
	) WITHOUT ROWID`,
	`CREATE TABLE retention_state (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		running INTEGER NOT NULL DEFAULT 0,
		deleted_records INTEGER NOT NULL DEFAULT 0,
		last_run_ns INTEGER,
		last_error TEXT
	)`,
	`INSERT INTO retention_state(id) VALUES (1)`,
] as const;

const migration = Effect.gen(function* () {
	const sql = yield* SqlClient.SqlClient;
	yield* Effect.forEach(initialSchema, (statement) => sql.unsafe(statement), { discard: true });
});

export const runMigrations = SqliteMigrator.run({
	table: "belfry_migrations",
	loader: SqliteMigrator.fromRecord({ "1_initial_telemetry_store": migration }),
});
