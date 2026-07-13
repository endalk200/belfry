import { BelfryConfig, type BelfryConfiguration } from "@belfry/config";
import { DaemonLifecycleFailure, DaemonManager } from "@belfry/daemon/lifecycle";
import type { TelemetryReaderService, TelemetryStorageService } from "@belfry/storage";
import { Console, Effect, Schema } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { stringifyStableJson } from "../../../runtime/json.js";

export class DatabaseOperationFailure extends Schema.TaggedErrorClass<DatabaseOperationFailure>()(
	"DatabaseOperationFailure",
	{
		code: Schema.Literals(["daemon_running", "daemon_state_unsafe", "confirmation_required", "operation_failed"]),
		message: Schema.String,
	},
) {}

const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit stable JSON for scripts"));

const pathCommand = Command.make("path", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const configuration = yield* BelfryConfig;
		yield* Console.log(
			json
				? stringifyStableJson({ databasePath: configuration.storage.databasePath })
				: configuration.storage.databasePath,
		);
	}),
).pipe(Command.withDescription("Print the effective Telemetry Store path"));

const statsHandler = ({ json }: { readonly json: boolean }) =>
	Effect.gen(function* () {
		const configuration = yield* BelfryConfig;
		const manager = yield* DaemonManager;
		const daemon = yield* manager.status;
		const report =
			daemon.state === "running"
				? yield* fetchRunningStats(configuration, daemon.registry.endpoint)
				: yield* withReadableStorage(configuration, (storage) =>
						Effect.all({ information: storage.information, ingestion: storage.ingestionStats }).pipe(
							Effect.map(({ information, ingestion }) => ({
								daemon: daemon.state,
								...information,
								ingestion,
							})),
						),
					);
		yield* Console.log(json ? stringifyStableJson(report) : formatStats(report));
	});

const statsCommand = Command.make("stats", { json: jsonFlag }, statsHandler).pipe(
	Command.withDescription("Show Telemetry Store and ingestion statistics"),
);

const vacuumCommand = Command.make("vacuum", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const configuration = yield* BelfryConfig;
		yield* withStoppedStorage(configuration, (storage) => storage.vacuum);
		yield* Console.log(
			json
				? stringifyStableJson({ state: "vacuumed", databasePath: configuration.storage.databasePath })
				: `Vacuumed and checkpointed ${configuration.storage.databasePath}.`,
		);
	}),
).pipe(Command.withDescription("Vacuum the stopped Telemetry Store and checkpoint its WAL"));

const checkpointCommand = Command.make("checkpoint", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const configuration = yield* BelfryConfig;
		yield* withStoppedStorage(configuration, (storage) => storage.checkpoint);
		yield* Console.log(
			json
				? stringifyStableJson({ state: "checkpointed", databasePath: configuration.storage.databasePath })
				: `Checkpointed ${configuration.storage.databasePath}.`,
		);
	}),
).pipe(Command.withDescription("Checkpoint the stopped Telemetry Store WAL"));

const resetCommand = Command.make(
	"reset",
	{
		yes: Flag.boolean("yes").pipe(
			Flag.withDescription("Confirm permanent deletion of all locally stored telemetry"),
		),
		json: jsonFlag,
	},
	({ yes, json }) =>
		Effect.gen(function* () {
			if (!yes) {
				return yield* Effect.fail(
					new DatabaseOperationFailure({
						code: "confirmation_required",
						message: "Refusing to reset telemetry without the explicit --yes flag.",
					}),
				);
			}
			const configuration = yield* BelfryConfig;
			yield* withStoppedStorage(configuration, (storage) => storage.reset);
			yield* Console.log(
				json
					? stringifyStableJson({ state: "reset", databasePath: configuration.storage.databasePath })
					: `Reset all telemetry in ${configuration.storage.databasePath}.`,
			);
		}),
).pipe(Command.withDescription("Permanently delete telemetry after explicit confirmation"));

export const databaseCommand = Command.make("database").pipe(
	Command.withDescription("Inspect and maintain the machine-wide Telemetry Store"),
	Command.withShortDescription("Manage Telemetry Store"),
	Command.withSubcommands([pathCommand, statsCommand, checkpointCommand, vacuumCommand, resetCommand]),
);

const withStoppedStorage = <A, E>(
	configuration: BelfryConfiguration,
	use: (storage: TelemetryStorageService) => Effect.Effect<A, E>,
) =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		return yield* manager
			.withStoppedDaemonLock(
				Effect.gen(function* () {
					const module = yield* Effect.tryPromise({
						try: () => import("@belfry/storage"),
						catch: (cause) => databaseFailure("Could not load the Bun SQLite storage runtime.", cause),
					});
					const storage = yield* module
						.openTelemetryStorage({
							databasePath: configuration.storage.databasePath,
							maxIndexedAttributesPerRecord: configuration.storage.indexedAttributeLimit,
							maxIndexedValueBytes: configuration.storage.indexedValueMaxBytes,
							maxIndexedAttributeKeys: configuration.storage.indexedKeyLimit,
							maxIndexedValuesPerKey: configuration.storage.indexedValuesPerKeyLimit,
						})
						.pipe(
							Effect.mapError((cause) => databaseFailure("Could not open the Telemetry Store.", cause)),
						);
					return yield* use(storage).pipe(
						Effect.mapError((cause) => databaseFailure("The database operation failed.", cause)),
					);
				}),
			)
			.pipe(
				Effect.mapError((cause) =>
					cause instanceof DaemonLifecycleFailure
						? new DatabaseOperationFailure({
								code: cause.code === "already_running" ? "daemon_running" : "daemon_state_unsafe",
								message: cause.message,
							})
						: cause,
				),
			);
	});

const withReadableStorage = <A, E>(
	configuration: BelfryConfiguration,
	use: (storage: TelemetryReaderService) => Effect.Effect<A, E>,
) =>
	Effect.gen(function* () {
		const module = yield* Effect.tryPromise({
			try: () => import("@belfry/storage"),
			catch: (cause) => databaseFailure("Could not load the Bun SQLite storage runtime.", cause),
		});
		const storage = yield* module
			.openTelemetryReader({ databasePath: configuration.storage.databasePath })
			.pipe(Effect.mapError((cause) => databaseFailure("Could not open the Telemetry Store for reads.", cause)));
		return yield* use(storage).pipe(
			Effect.mapError((cause) => databaseFailure("The database read failed.", cause)),
		);
	});

const fetchRunningStats = (configuration: BelfryConfiguration, endpoint: string) =>
	Effect.tryPromise({
		try: async () => {
			const response = await fetch(`${endpoint}/api/ingestion/stats`, { signal: AbortSignal.timeout(2_500) });
			if (!response.ok) throw new Error(`Query API returned HTTP ${response.status}`);
			return {
				daemon: "running",
				databasePath: configuration.storage.databasePath,
				ingestion: (await response.json()) as unknown,
			};
		},
		catch: (cause) => databaseFailure("Could not read database statistics from the running Daemon.", cause),
	});

const databaseFailure = (message: string, cause: unknown) =>
	new DatabaseOperationFailure({
		code: "operation_failed",
		message: `${message} ${cause instanceof Error ? cause.message : String(cause)}`,
	});

const formatStats = (report: Record<string, unknown>): string => {
	const information = "information" in report ? (report.information as Record<string, unknown>) : report;
	const ingestion = (report.ingestion ?? {}) as Record<string, unknown>;
	return [
		`Telemetry Store: ${String(report.databasePath ?? information.databasePath ?? "unknown")}`,
		`Daemon: ${String(report.daemon ?? "unknown")}`,
		`Schema: ${String(information.schemaVersion ?? "managed by running Daemon")}`,
		`Journal: ${String(information.journalMode ?? "WAL")}`,
		`Live database bytes: ${String(information.databaseSizeBytes ?? ingestion.databaseSizeBytes ?? "unknown")}`,
		`Storage files bytes: ${String(information.storageSizeBytes ?? ingestion.storageSizeBytes ?? "unknown")}`,
		`WAL bytes: ${String(information.walSizeBytes ?? ingestion.walSizeBytes ?? "unknown")}`,
		`Queue: ${String(ingestion.queueDepth ?? "unknown")} requests / ${String(ingestion.queueBytes ?? "unknown")} bytes`,
		`Retention: ${ingestion.retentionRunning === true ? "running" : "idle"} · deleted ${String(ingestion.retentionDeletedRecords ?? 0)} records`,
	].join("\n");
};
