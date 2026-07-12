import { homedir } from "node:os";
import { dirname, isAbsolute, resolve } from "node:path";
import { Config, ConfigProvider, Context, Data, Effect, FileSystem, Layer, Result } from "effect";
import * as PlatformError from "effect/PlatformError";
import * as Toml from "toml";

export const DEFAULT_OTLP_HTTP_ENDPOINT = "http://localhost:4318";
export const DEFAULT_CONFIG_PATH = "~/.belfry/config.toml";
export const CONFIG_PATH_ENV = "BELFRY_CONFIG_PATH";
export const TELEMETRY_ENV = "BELFRY_TELEMETRY";
export const OTLP_ENDPOINT_ENV = "BELFRY_OTLP_ENDPOINT";
export const BELFRY_DAEMON_HOST_ENV = "BELFRY_DAEMON_HOST";
export const BELFRY_DAEMON_PORT_ENV = "BELFRY_DAEMON_PORT";
export const BELFRY_STATE_DIRECTORY_ENV = "BELFRY_STATE_DIRECTORY";
export const BELFRY_DATABASE_PATH_ENV = "BELFRY_DATABASE_PATH";
export const BELFRY_RETENTION_DAYS_ENV = "BELFRY_RETENTION_DAYS";
export const BELFRY_RETENTION_MAX_BYTES_ENV = "BELFRY_RETENTION_MAX_BYTES";

export const DEFAULT_DAEMON_HOST = "127.0.0.1";
export const DEFAULT_DAEMON_PORT = 4318;
export const DEFAULT_RETENTION_MAX_AGE_NS = 7n * 24n * 60n * 60n * 1_000_000_000n;
export const DEFAULT_RETENTION_MAX_BYTES = 1_073_741_824n;
export const DEFAULT_QUERY_MAX_LOOKBACK_NS = DEFAULT_RETENTION_MAX_AGE_NS;
export const DEFAULT_STATE_DIRECTORY = defaultStateDirectory();

export const daemonEndpoint = (host: string, port: number): string =>
	`http://${host.includes(":") ? `[${host}]` : host}:${port}`;

export type TelemetryConfig = {
	readonly enabled: boolean;
	readonly otlpEndpoint: string;
};

export type DaemonConfig = {
	readonly host: string;
	readonly port: number;
	readonly stateDirectory: string;
	readonly registryPath: string;
	readonly lockPath: string;
	readonly startupTimeoutMs: number;
	readonly shutdownTimeoutMs: number;
};

export type StorageConfig = {
	readonly databasePath: string;
	readonly retentionMaxAgeNs: bigint;
	readonly retentionMaxBytes: bigint;
	readonly retentionBatchSize: number;
	readonly indexedAttributeLimit: number;
	readonly indexedValueMaxBytes: number;
	readonly indexedKeyLimit: number;
	readonly indexedValuesPerKeyLimit: number;
};

export type IngestionConfig = {
	readonly maxCompressedBytes: number;
	readonly maxDecompressedBytes: number;
	readonly queueRequestCapacity: number;
	readonly queueByteCapacity: number;
	readonly drainTimeoutMs: number;
};

export type QueryConfig = {
	readonly maxLookbackNs: bigint;
	readonly maxResults: number;
	readonly timeoutMs: number;
	readonly cursorSecretPath: string;
};

export type InterfaceConfig = {
	readonly refreshIntervalMs: number;
	readonly defaultRangeMinutes: number;
	readonly webOpenBrowser: boolean;
};

export type BelfryConfiguration = {
	readonly telemetry: TelemetryConfig;
	readonly daemon: DaemonConfig;
	readonly storage: StorageConfig;
	readonly ingestion: IngestionConfig;
	readonly query: QueryConfig;
	readonly interfaces: InterfaceConfig;
};

export const defaultBelfryConfiguration: BelfryConfiguration = {
	telemetry: {
		enabled: false,
		otlpEndpoint: DEFAULT_OTLP_HTTP_ENDPOINT,
	},
	daemon: {
		host: DEFAULT_DAEMON_HOST,
		port: DEFAULT_DAEMON_PORT,
		stateDirectory: DEFAULT_STATE_DIRECTORY,
		registryPath: resolve(DEFAULT_STATE_DIRECTORY, "daemon.json"),
		lockPath: resolve(DEFAULT_STATE_DIRECTORY, "daemon.lock"),
		startupTimeoutMs: 5_000,
		shutdownTimeoutMs: 10_000,
	},
	storage: {
		databasePath: resolve(DEFAULT_STATE_DIRECTORY, "telemetry.db"),
		retentionMaxAgeNs: DEFAULT_RETENTION_MAX_AGE_NS,
		retentionMaxBytes: DEFAULT_RETENTION_MAX_BYTES,
		retentionBatchSize: 1_000,
		indexedAttributeLimit: 64,
		indexedValueMaxBytes: 512,
		indexedKeyLimit: 256,
		indexedValuesPerKeyLimit: 1_024,
	},
	ingestion: {
		maxCompressedBytes: 8 * 1_024 * 1_024,
		maxDecompressedBytes: 32 * 1_024 * 1_024,
		queueRequestCapacity: 64,
		queueByteCapacity: 64 * 1_024 * 1_024,
		drainTimeoutMs: 10_000,
	},
	query: {
		maxLookbackNs: DEFAULT_QUERY_MAX_LOOKBACK_NS,
		maxResults: 500,
		timeoutMs: 2_000,
		cursorSecretPath: resolve(DEFAULT_STATE_DIRECTORY, "cursor.key"),
	},
	interfaces: {
		refreshIntervalMs: 2_000,
		defaultRangeMinutes: 15,
		webOpenBrowser: true,
	},
};

export class InvalidTelemetryEnvironment extends Data.TaggedError("InvalidTelemetryEnvironment")<{
	readonly value: string;
}> {}

export class InvalidTelemetryEndpoint extends Data.TaggedError("InvalidTelemetryEndpoint")<{
	readonly value: string;
}> {}

export class InvalidConfigPath extends Data.TaggedError("InvalidConfigPath")<{
	readonly value: string;
}> {}

export class InvalidBelfryEnvironment extends Data.TaggedError("InvalidBelfryEnvironment")<{
	readonly key: string;
	readonly value: string;
	readonly expected: string;
}> {}

export class InvalidBelfryConfiguration extends Data.TaggedError("InvalidBelfryConfiguration")<{
	readonly path: string;
	readonly value: string;
	readonly expected: string;
}> {}

export class ConfigFileParseError extends Data.TaggedError("ConfigFileParseError")<{
	readonly path: string;
	readonly message: string;
	readonly cause: unknown;
}> {}

export class ConfigFileWriteError extends Data.TaggedError("ConfigFileWriteError")<{
	readonly path: string;
	readonly message: string;
	readonly cause: unknown;
}> {}

export class ExplicitConfigFileNotFound extends Data.TaggedError("ExplicitConfigFileNotFound")<{
	readonly path: string;
}> {}

export class ConfigFileAlreadyExists extends Data.TaggedError("ConfigFileAlreadyExists")<{
	readonly path: string;
}> {}

export type ConfigError =
	| Config.ConfigError
	| ConfigFileParseError
	| ConfigFileWriteError
	| ExplicitConfigFileNotFound
	| InvalidConfigPath
	| InvalidBelfryConfiguration
	| InvalidBelfryEnvironment
	| InvalidTelemetryEndpoint
	| InvalidTelemetryEnvironment;

export type ConfigPathResolution = {
	readonly path: string;
	readonly source: "default" | "env";
};

export type ConfigSourceStatus =
	| {
			readonly _tag: "valid";
			readonly message: string;
	  }
	| {
			readonly _tag: "warning";
			readonly message: string;
	  }
	| {
			readonly _tag: "invalid";
			readonly message: string;
	  };

export type ConfigValidationReport = {
	readonly path: ConfigPathResolution;
	readonly file: ConfigSourceStatus;
	readonly env: ConfigSourceStatus;
	readonly effective: ConfigSourceStatus;
	readonly config: BelfryConfiguration | undefined;
};

type ConfigSourceProvider = {
	readonly provider: ConfigProvider.ConfigProvider;
};

type ConfigFileSource = ConfigSourceProvider & {
	readonly _tag: "present" | "missingDefault";
};

type ResolvedConfigSources = {
	readonly path: ConfigPathResolution;
	readonly file: Result.Result<ConfigFileSource, ConfigFileParseError | ExplicitConfigFileNotFound>;
	readonly env: Result.Result<
		ConfigSourceProvider,
		InvalidBelfryEnvironment | InvalidTelemetryEndpoint | InvalidTelemetryEnvironment
	>;
};

const normalizeUrl = (url: URL): string => url.toString().replace(/\/$/, "");

export const telemetryConfigDescriptor = Config.all({
	enabled: Config.boolean("enabled").pipe(Config.withDefault(defaultBelfryConfiguration.telemetry.enabled)),
	otlpEndpoint: Config.url("otlp_endpoint").pipe(
		Config.withDefault(new URL(defaultBelfryConfiguration.telemetry.otlpEndpoint)),
		Config.map(normalizeUrl),
	),
}).pipe(
	Config.map(({ enabled, otlpEndpoint }) => ({
		enabled,
		otlpEndpoint,
	})),
	Config.nested("telemetry"),
);

const daemonConfigDescriptor = Config.all({
	host: Config.string("host").pipe(Config.withDefault(defaultBelfryConfiguration.daemon.host)),
	port: Config.number("port").pipe(Config.withDefault(defaultBelfryConfiguration.daemon.port)),
	stateDirectory: Config.string("state_directory").pipe(
		Config.withDefault(defaultBelfryConfiguration.daemon.stateDirectory),
	),
	startupTimeoutMs: Config.number("startup_timeout_ms").pipe(
		Config.withDefault(defaultBelfryConfiguration.daemon.startupTimeoutMs),
	),
	shutdownTimeoutMs: Config.number("shutdown_timeout_ms").pipe(
		Config.withDefault(defaultBelfryConfiguration.daemon.shutdownTimeoutMs),
	),
}).pipe(Config.nested("daemon"));

const storageConfigDescriptor = Config.all({
	databasePath: Config.string("database_path").pipe(Config.withDefault("")),
	retentionDays: Config.number("retention_days").pipe(Config.withDefault(7)),
	retentionMaxBytes: Config.number("retention_max_bytes").pipe(
		Config.withDefault(Number(DEFAULT_RETENTION_MAX_BYTES)),
	),
	retentionBatchSize: Config.number("retention_batch_size").pipe(
		Config.withDefault(defaultBelfryConfiguration.storage.retentionBatchSize),
	),
	indexedAttributeLimit: Config.number("indexed_attribute_limit").pipe(
		Config.withDefault(defaultBelfryConfiguration.storage.indexedAttributeLimit),
	),
	indexedValueMaxBytes: Config.number("indexed_value_max_bytes").pipe(
		Config.withDefault(defaultBelfryConfiguration.storage.indexedValueMaxBytes),
	),
	indexedKeyLimit: Config.number("indexed_key_limit").pipe(
		Config.withDefault(defaultBelfryConfiguration.storage.indexedKeyLimit),
	),
	indexedValuesPerKeyLimit: Config.number("indexed_values_per_key_limit").pipe(
		Config.withDefault(defaultBelfryConfiguration.storage.indexedValuesPerKeyLimit),
	),
}).pipe(Config.nested("storage"));

const ingestionConfigDescriptor = Config.all({
	maxCompressedBytes: Config.number("max_compressed_bytes").pipe(
		Config.withDefault(defaultBelfryConfiguration.ingestion.maxCompressedBytes),
	),
	maxDecompressedBytes: Config.number("max_decompressed_bytes").pipe(
		Config.withDefault(defaultBelfryConfiguration.ingestion.maxDecompressedBytes),
	),
	queueRequestCapacity: Config.number("queue_request_capacity").pipe(
		Config.withDefault(defaultBelfryConfiguration.ingestion.queueRequestCapacity),
	),
	queueByteCapacity: Config.number("queue_byte_capacity").pipe(
		Config.withDefault(defaultBelfryConfiguration.ingestion.queueByteCapacity),
	),
	drainTimeoutMs: Config.number("drain_timeout_ms").pipe(
		Config.withDefault(defaultBelfryConfiguration.ingestion.drainTimeoutMs),
	),
}).pipe(Config.nested("ingestion"));

const queryConfigDescriptor = Config.all({
	maxLookbackDays: Config.number("max_lookback_days").pipe(Config.withDefault(7)),
	maxResults: Config.number("max_results").pipe(Config.withDefault(defaultBelfryConfiguration.query.maxResults)),
	timeoutMs: Config.number("timeout_ms").pipe(Config.withDefault(defaultBelfryConfiguration.query.timeoutMs)),
}).pipe(Config.nested("query"));

const interfaceConfigDescriptor = Config.all({
	refreshIntervalMs: Config.number("refresh_interval_ms").pipe(
		Config.withDefault(defaultBelfryConfiguration.interfaces.refreshIntervalMs),
	),
	defaultRangeMinutes: Config.number("default_range_minutes").pipe(
		Config.withDefault(defaultBelfryConfiguration.interfaces.defaultRangeMinutes),
	),
	webOpenBrowser: Config.boolean("web_open_browser").pipe(
		Config.withDefault(defaultBelfryConfiguration.interfaces.webOpenBrowser),
	),
}).pipe(Config.nested("interfaces"));

export const belfryConfigDescriptor = Config.all({
	telemetry: telemetryConfigDescriptor,
	daemon: daemonConfigDescriptor,
	storage: storageConfigDescriptor,
	ingestion: ingestionConfigDescriptor,
	query: queryConfigDescriptor,
	interfaces: interfaceConfigDescriptor,
}).pipe(
	Config.map(({ daemon, ingestion, interfaces, query, storage, telemetry }): BelfryConfiguration => {
		const stateDirectory = resolveStateDirectory(daemon.stateDirectory);
		return {
			telemetry,
			daemon: {
				...daemon,
				port: Math.trunc(daemon.port),
				stateDirectory,
				registryPath: resolve(stateDirectory, "daemon.json"),
				lockPath: resolve(stateDirectory, "daemon.lock"),
				startupTimeoutMs: Math.trunc(daemon.startupTimeoutMs),
				shutdownTimeoutMs: Math.trunc(daemon.shutdownTimeoutMs),
			},
			storage: {
				databasePath: resolveStatePath(stateDirectory, storage.databasePath, "telemetry.db"),
				retentionMaxAgeNs: daysToNanoseconds(storage.retentionDays),
				retentionMaxBytes: BigInt(Math.trunc(storage.retentionMaxBytes)),
				retentionBatchSize: Math.trunc(storage.retentionBatchSize),
				indexedAttributeLimit: Math.trunc(storage.indexedAttributeLimit),
				indexedValueMaxBytes: Math.trunc(storage.indexedValueMaxBytes),
				indexedKeyLimit: Math.trunc(storage.indexedKeyLimit),
				indexedValuesPerKeyLimit: Math.trunc(storage.indexedValuesPerKeyLimit),
			},
			ingestion: {
				maxCompressedBytes: Math.trunc(ingestion.maxCompressedBytes),
				maxDecompressedBytes: Math.trunc(ingestion.maxDecompressedBytes),
				queueRequestCapacity: Math.trunc(ingestion.queueRequestCapacity),
				queueByteCapacity: Math.trunc(ingestion.queueByteCapacity),
				drainTimeoutMs: Math.trunc(ingestion.drainTimeoutMs),
			},
			query: {
				maxLookbackNs: daysToNanoseconds(query.maxLookbackDays),
				maxResults: Math.trunc(query.maxResults),
				timeoutMs: Math.trunc(query.timeoutMs),
				cursorSecretPath: resolve(stateDirectory, "cursor.key"),
			},
			interfaces: {
				refreshIntervalMs: Math.trunc(interfaces.refreshIntervalMs),
				defaultRangeMinutes: Math.trunc(interfaces.defaultRangeMinutes),
				webOpenBrowser: interfaces.webOpenBrowser,
			},
		};
	}),
);

export const starterConfigToml = `# Belfry Configuration
#
# Telemetry is disabled by default. Set enabled to true to export traces and logs
# to a local OTLP HTTP collector.

[telemetry]
enabled = false
otlp_endpoint = "${DEFAULT_OTLP_HTTP_ENDPOINT}"

[daemon]
host = "${DEFAULT_DAEMON_HOST}"
port = ${DEFAULT_DAEMON_PORT}
startup_timeout_ms = 5000
shutdown_timeout_ms = 10000

[storage]
retention_days = 7
retention_max_bytes = ${DEFAULT_RETENTION_MAX_BYTES}
retention_batch_size = 1000
indexed_attribute_limit = 64
indexed_value_max_bytes = 512
indexed_key_limit = 256
indexed_values_per_key_limit = 1024

[ingestion]
max_compressed_bytes = 8388608
max_decompressed_bytes = 33554432
queue_request_capacity = 64
queue_byte_capacity = 67108864
drain_timeout_ms = 10000

[query]
max_lookback_days = 7
max_results = 500
timeout_ms = 2000

[interfaces]
refresh_interval_ms = 2000
default_range_minutes = 15
web_open_browser = true
`;

const normalizeUrlString = (value: string) =>
	Effect.try({
		try: () => normalizeUrl(new URL(value)),
		catch: () => new InvalidTelemetryEndpoint({ value }),
	});

export const parseTelemetryEnabledEnv = (
	value: string | undefined,
): Effect.Effect<boolean | undefined, InvalidTelemetryEnvironment> => {
	if (value === undefined) {
		return Effect.succeed(undefined);
	}
	if (value === "true") {
		return Effect.succeed(true);
	}
	if (value === "false") {
		return Effect.succeed(false);
	}
	return Effect.fail(new InvalidTelemetryEnvironment({ value }));
};

export const parseTelemetryEndpointEnv = (
	value: string | undefined,
): Effect.Effect<string | undefined, InvalidTelemetryEndpoint> => {
	if (value === undefined) {
		return Effect.succeed(undefined);
	}
	return normalizeUrlString(value);
};

export const resolveConfigPath = (
	env: Record<string, string | undefined> = process.env,
): Effect.Effect<ConfigPathResolution, InvalidConfigPath> =>
	Effect.suspend(() => {
		const configuredPath = env[CONFIG_PATH_ENV];
		if (configuredPath !== undefined && configuredPath.trim() === "") {
			return Effect.fail(new InvalidConfigPath({ value: configuredPath }));
		}

		const path = configuredPath ?? DEFAULT_CONFIG_PATH;
		const source: ConfigPathResolution["source"] = configuredPath === undefined ? "default" : "env";
		return Effect.succeed({
			path: expandHome(path),
			source,
		});
	}).pipe(
		Effect.tap((path) =>
			Effect.annotateCurrentSpan({
				"belfry.config.path": path.path,
				"belfry.config.path_source": path.source,
			}),
		),
		Effect.tap((path) =>
			Effect.logDebug("Resolved config path", {
				path: path.path,
				source: path.source,
				pathEnvPresent: env[CONFIG_PATH_ENV] !== undefined,
			}),
		),
	);

export const loadBelfryConfigFromEnvironment = (env: Record<string, string | undefined>) =>
	Effect.gen(function* () {
		const sources = yield* resolveConfigSources(env);
		return yield* parseEffectiveConfig(sources);
	});

export const loadBelfryConfig = Effect.gen(function* () {
	const sources = yield* resolveConfigSources(process.env);
	return yield* parseEffectiveConfig(sources);
});

export const validateBelfryConfigFromEnvironment = (env: Record<string, string | undefined>) =>
	Effect.gen(function* () {
		const sources = yield* resolveConfigSources(env);

		return yield* validateResolvedConfigSources(sources);
	}).pipe(Effect.withSpan("belfry.config.validate.from_env"));

export const validateBelfryConfig = Effect.gen(function* () {
	const sources = yield* resolveConfigSources(process.env);

	return yield* validateResolvedConfigSources(sources);
}).pipe(Effect.withSpan("belfry.config.validate"));

const validateResolvedConfigSources = (sources: ResolvedConfigSources) =>
	Effect.gen(function* () {
		const fileStatus = yield* Result.match(sources.file, {
			onFailure: (error) => Effect.succeed(invalidStatus(formatConfigError(error))),
			onSuccess: (source) =>
				source._tag === "missingDefault"
					? Effect.succeed(warningStatus(`No config file found at ${sources.path.path}; using defaults.`))
					: belfryConfigDescriptor.parse(source.provider).pipe(
							Effect.as<ConfigSourceStatus>(validStatus(`Config file is valid at ${sources.path.path}.`)),
							Effect.catch((error) => Effect.succeed(invalidStatus(formatConfigError(error)))),
						),
		});

		const envStatus = Result.match(sources.env, {
			onFailure: (error) => invalidStatus(formatConfigError(error)),
			onSuccess: () => validStatus("Environment overrides are valid."),
		});

		const effectiveResult = yield* Effect.result(parseEffectiveConfig(sources));

		const report = {
			path: sources.path,
			file: fileStatus,
			env: envStatus,
			effective: Result.isSuccess(effectiveResult)
				? validStatus("Valid Belfry Configuration.")
				: invalidStatus(formatConfigError(effectiveResult.failure)),
			config: Result.isSuccess(effectiveResult) ? effectiveResult.success : undefined,
		};

		yield* Effect.annotateCurrentSpan({
			"belfry.config.valid":
				report.file._tag !== "invalid" && report.env._tag !== "invalid" && report.effective._tag !== "invalid",
			"belfry.config.file_validation_status": report.file._tag,
			"belfry.config.env_validation_status": report.env._tag,
			"belfry.config.effective_validation_status": report.effective._tag,
		});

		return report;
	});

export const initBelfryConfigFromEnvironment = (env: Record<string, string | undefined>) =>
	Effect.gen(function* () {
		const path = yield* resolveConfigPath(env);
		return yield* initBelfryConfigAtPath(path);
	});

export const initBelfryConfig = Effect.gen(function* () {
	const path = yield* resolveConfigPath(process.env);

	return yield* initBelfryConfigAtPath(path);
});

const initBelfryConfigAtPath = (path: ConfigPathResolution) =>
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		yield* fs
			.makeDirectory(dirname(path.path), { recursive: true })
			.pipe(Effect.mapError((cause) => makeConfigFileWriteError(path.path, cause)));
		yield* fs
			.writeFileString(path.path, starterConfigToml, { flag: "wx" })
			.pipe(
				Effect.mapError((cause): ConfigFileAlreadyExists | ConfigFileWriteError =>
					isAlreadyExistsPlatformError(cause)
						? new ConfigFileAlreadyExists({ path: path.path })
						: makeConfigFileWriteError(path.path, cause),
				),
			);

		yield* Effect.logInfo("Created Belfry Configuration file", {
			path: path.path,
			source: path.source,
		});

		yield* Effect.annotateCurrentSpan({
			"belfry.config.created": true,
		});

		return path;
	}).pipe(
		Effect.withSpan("belfry.config.write_file", {
			attributes: {
				"belfry.config.parent_directory": dirname(path.path),
				"file.operation": "write",
			},
		}),
	);

export class BelfryConfig extends Context.Service<BelfryConfig, BelfryConfiguration>()("BelfryConfig") {
	static readonly layer = Layer.effect(BelfryConfig)(loadBelfryConfig);
	static readonly layerFromEnvironment = (env: Record<string, string | undefined>) =>
		Layer.effect(BelfryConfig)(loadBelfryConfigFromEnvironment(env));
}

export const formatConfigError = (error: ConfigError | ConfigFileAlreadyExists): string => {
	switch (error._tag) {
		case "ConfigFileAlreadyExists":
			return `Config file already exists at ${error.path}.`;
		case "ConfigFileParseError":
			return `Could not parse config file at ${error.path}: ${error.message}`;
		case "ConfigFileWriteError":
			return `Could not write config file at ${error.path}: ${error.message}`;
		case "ExplicitConfigFileNotFound":
			return `Config file from ${CONFIG_PATH_ENV} does not exist at ${error.path}.`;
		case "InvalidConfigPath":
			return `Invalid ${CONFIG_PATH_ENV} value "${error.value}". Expected a non-empty path.`;
		case "InvalidBelfryConfiguration":
			return `Invalid ${error.path} value "${error.value}". Expected ${error.expected}.`;
		case "InvalidBelfryEnvironment":
			return `Invalid ${error.key} value "${error.value}". Expected ${error.expected}.`;
		case "InvalidTelemetryEndpoint":
			return `Invalid ${OTLP_ENDPOINT_ENV} value "${error.value}". Expected an absolute URL.`;
		case "InvalidTelemetryEnvironment":
			return `Invalid ${TELEMETRY_ENV} value "${error.value}". Expected "true" or "false".`;
		case "ConfigError":
			return error.message;
	}
};

const makeConfigFileWriteError = (path: string, cause: unknown) =>
	new ConfigFileWriteError({
		path,
		message: cause instanceof Error ? cause.message : String(cause),
		cause,
	});

const loadFileProvider = (
	path: ConfigPathResolution,
): Effect.Effect<ConfigFileSource, ConfigFileParseError | ExplicitConfigFileNotFound, FileSystem.FileSystem> =>
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const exists = yield* fs.exists(path.path).pipe(
			Effect.mapError(
				(cause) =>
					new ConfigFileParseError({
						path: path.path,
						message: cause.message,
						cause,
					}),
			),
		);

		yield* Effect.annotateCurrentSpan({
			"belfry.config.file_present": exists,
		});

		if (!exists) {
			if (path.source === "env") {
				return yield* Effect.fail(new ExplicitConfigFileNotFound({ path: path.path }));
			}
			yield* Effect.annotateCurrentSpan({
				"belfry.config.file_presence": "missing_default",
			});
			return {
				_tag: "missingDefault",
				provider: ConfigProvider.fromUnknown({}),
			} satisfies ConfigFileSource;
		}

		const contents = yield* fs.readFileString(path.path).pipe(
			Effect.mapError(
				(cause) =>
					new ConfigFileParseError({
						path: path.path,
						message: cause.message,
						cause,
					}),
			),
		);
		const parsed = yield* Effect.try({
			try: () => Toml.parse(contents) as unknown,
			catch: (cause) =>
				new ConfigFileParseError({
					path: path.path,
					message: cause instanceof Error ? cause.message : String(cause),
					cause,
				}),
		});

		yield* Effect.annotateCurrentSpan({
			"belfry.config.file_presence": "present",
		});

		return {
			_tag: "present",
			provider: ConfigProvider.fromUnknown(parsed),
		} satisfies ConfigFileSource;
	}).pipe(
		Effect.withSpan("belfry.config.load_file", {
			attributes: {
				"belfry.config.path": path.path,
				"belfry.config.path_source": path.source,
			},
		}),
	);

const loadEnvOverrideProvider = (
	env: Record<string, string | undefined> = process.env,
): Effect.Effect<
	ConfigSourceProvider,
	InvalidBelfryEnvironment | InvalidTelemetryEndpoint | InvalidTelemetryEnvironment
> =>
	Effect.gen(function* () {
		const enabled = yield* parseTelemetryEnabledEnv(env[TELEMETRY_ENV]);
		const otlpEndpoint = yield* parseTelemetryEndpointEnv(env[OTLP_ENDPOINT_ENV]);
		const host = yield* parseOptionalNonEmptyEnvironment(env, BELFRY_DAEMON_HOST_ENV);
		if (host !== undefined && !isLoopbackHost(host)) {
			return yield* Effect.fail(
				new InvalidBelfryEnvironment({
					key: BELFRY_DAEMON_HOST_ENV,
					value: host,
					expected: "a loopback host (127.0.0.1, localhost, or ::1)",
				}),
			);
		}
		const port = yield* parseOptionalIntegerEnvironment(env, BELFRY_DAEMON_PORT_ENV, 1, 65_535);
		const stateDirectory = yield* parseOptionalNonEmptyEnvironment(env, BELFRY_STATE_DIRECTORY_ENV);
		const databasePath = yield* parseOptionalNonEmptyEnvironment(env, BELFRY_DATABASE_PATH_ENV);
		const retentionDays = yield* parseOptionalNumberEnvironment(env, BELFRY_RETENTION_DAYS_ENV, 0.000_001);
		const retentionMaxBytes = yield* parseOptionalIntegerEnvironment(
			env,
			BELFRY_RETENTION_MAX_BYTES_ENV,
			1,
			Number.MAX_SAFE_INTEGER,
		);

		yield* Effect.annotateCurrentSpan({
			"belfry.telemetry.env_present": env[TELEMETRY_ENV] !== undefined,
			"belfry.telemetry.endpoint_env_present": env[OTLP_ENDPOINT_ENV] !== undefined,
		});

		return {
			provider: ConfigProvider.fromUnknown({
				telemetry: {
					...(enabled === undefined ? {} : { enabled }),
					...(otlpEndpoint === undefined ? {} : { otlp_endpoint: otlpEndpoint }),
				},
				daemon: {
					...(host === undefined ? {} : { host }),
					...(port === undefined ? {} : { port }),
					...(stateDirectory === undefined ? {} : { state_directory: stateDirectory }),
				},
				storage: {
					...(databasePath === undefined ? {} : { database_path: databasePath }),
					...(retentionDays === undefined ? {} : { retention_days: retentionDays }),
					...(retentionMaxBytes === undefined ? {} : { retention_max_bytes: retentionMaxBytes }),
				},
			}),
		};
	}).pipe(Effect.withSpan("belfry.config.load_env"));

const resolveConfigSources = (
	env: Record<string, string | undefined> = process.env,
): Effect.Effect<ResolvedConfigSources, InvalidConfigPath, FileSystem.FileSystem> =>
	Effect.gen(function* () {
		const path = yield* resolveConfigPath(env);
		const file = yield* Effect.result(loadFileProvider(path));
		const envOverrides = yield* Effect.result(loadEnvOverrideProvider(env));

		return {
			path,
			file,
			env: envOverrides,
		};
	});

const parseEffectiveConfig = (sources: ResolvedConfigSources): Effect.Effect<BelfryConfiguration, ConfigError> =>
	Effect.gen(function* () {
		const file = yield* Result.match(sources.file, {
			onFailure: Effect.fail,
			onSuccess: Effect.succeed,
		});
		const env = yield* Result.match(sources.env, {
			onFailure: Effect.fail,
			onSuccess: Effect.succeed,
		});
		const provider = ConfigProvider.orElse(
			env.provider,
			ConfigProvider.orElse(file.provider, ConfigProvider.fromUnknown(defaultBelfryConfiguration)),
		);

		const config = yield* belfryConfigDescriptor.parse(provider);
		yield* validateEffectiveConfiguration(config);

		yield* Effect.annotateCurrentSpan({
			"belfry.config.effective_status": "valid",
			"belfry.telemetry.enabled": config.telemetry.enabled,
		});

		return config;
	}).pipe(Effect.withSpan("belfry.config.parse_effective"));

const validStatus = (message: string): ConfigSourceStatus => ({
	_tag: "valid",
	message,
});

const isAlreadyExistsPlatformError = (cause: unknown): cause is PlatformError.PlatformError =>
	cause instanceof PlatformError.PlatformError && cause.reason._tag === "AlreadyExists";

const invalidStatus = (message: string): ConfigSourceStatus => ({
	_tag: "invalid",
	message,
});

const warningStatus = (message: string): ConfigSourceStatus => ({
	_tag: "warning",
	message,
});

const validateEffectiveConfiguration = (
	config: BelfryConfiguration,
): Effect.Effect<void, InvalidBelfryConfiguration> => {
	const invalid = (path: string, value: unknown, expected: string) =>
		Effect.fail(new InvalidBelfryConfiguration({ path, value: String(value), expected }));
	if (!isLoopbackHost(config.daemon.host)) {
		return invalid("daemon.host", config.daemon.host, "a loopback host (127.0.0.1, localhost, or ::1)");
	}
	if (!isIntegerBetween(config.daemon.port, 1, 65_535)) {
		return invalid("daemon.port", config.daemon.port, "an integer from 1 through 65535");
	}
	if (!isAbsolute(config.daemon.stateDirectory)) {
		return invalid("daemon.state_directory", config.daemon.stateDirectory, "an absolute state directory");
	}
	if (!isIntegerBetween(config.daemon.startupTimeoutMs, 1, 3_600_000)) {
		return invalid(
			"daemon.startup_timeout_ms",
			config.daemon.startupTimeoutMs,
			"an integer from 1 through 3600000 milliseconds",
		);
	}
	if (!isIntegerBetween(config.daemon.shutdownTimeoutMs, 1, 3_600_000)) {
		return invalid(
			"daemon.shutdown_timeout_ms",
			config.daemon.shutdownTimeoutMs,
			"an integer from 1 through 3600000 milliseconds",
		);
	}
	if (config.storage.retentionMaxAgeNs <= 0n || config.storage.retentionMaxBytes <= 0n) {
		return invalid("storage.retention", "non-positive", "positive time and byte limits");
	}
	if (!isIntegerBetween(config.storage.retentionBatchSize, 1, 10_000)) {
		return invalid(
			"storage.retention_batch_size",
			config.storage.retentionBatchSize,
			"an integer from 1 through 10000 records",
		);
	}
	if (!isIntegerBetween(config.storage.indexedAttributeLimit, 1, 1_024)) {
		return invalid(
			"storage.indexed_attribute_limit",
			config.storage.indexedAttributeLimit,
			"an integer from 1 through 1024 attributes per record",
		);
	}
	if (!isIntegerBetween(config.storage.indexedValueMaxBytes, 1, 1_048_576)) {
		return invalid(
			"storage.indexed_value_max_bytes",
			config.storage.indexedValueMaxBytes,
			"an integer from 1 through 1048576 bytes",
		);
	}
	if (!isIntegerBetween(config.storage.indexedKeyLimit, 1, 65_536)) {
		return invalid(
			"storage.indexed_key_limit",
			config.storage.indexedKeyLimit,
			"an integer from 1 through 65536 distinct attribute keys",
		);
	}
	if (!isIntegerBetween(config.storage.indexedValuesPerKeyLimit, 1, 1_000_000)) {
		return invalid(
			"storage.indexed_values_per_key_limit",
			config.storage.indexedValuesPerKeyLimit,
			"an integer from 1 through 1000000 distinct scalar values per key",
		);
	}
	if (
		!Number.isSafeInteger(config.ingestion.maxCompressedBytes) ||
		!Number.isSafeInteger(config.ingestion.maxDecompressedBytes) ||
		config.ingestion.maxCompressedBytes <= 0 ||
		config.ingestion.maxDecompressedBytes < config.ingestion.maxCompressedBytes
	) {
		return invalid(
			"ingestion.request_limits",
			`${config.ingestion.maxCompressedBytes}/${config.ingestion.maxDecompressedBytes}`,
			"positive limits with max_decompressed_bytes at least max_compressed_bytes",
		);
	}
	if (!isIntegerBetween(config.ingestion.drainTimeoutMs, 1, 3_600_000)) {
		return invalid(
			"ingestion.drain_timeout_ms",
			config.ingestion.drainTimeoutMs,
			"an integer from 1 through 3600000 milliseconds",
		);
	}
	if (
		!isIntegerBetween(config.ingestion.queueRequestCapacity, 1, 65_536) ||
		config.ingestion.queueByteCapacity < config.ingestion.maxCompressedBytes
	) {
		return invalid(
			"ingestion.queue",
			"invalid capacity",
			"a bounded request capacity and byte capacity at least as large as one compressed request",
		);
	}
	if (!isIntegerBetween(config.query.maxResults, 100, 500)) {
		return invalid("query.max_results", config.query.maxResults, "an integer from 100 through 500 results");
	}
	if (config.query.maxLookbackNs <= 0n) {
		return invalid("query.max_lookback_days", config.query.maxLookbackNs, "a positive lookback duration");
	}
	if (!isIntegerBetween(config.query.timeoutMs, 1, 3_600_000)) {
		return invalid("query.timeout_ms", config.query.timeoutMs, "an integer from 1 through 3600000 milliseconds");
	}
	if (!isIntegerBetween(config.interfaces.refreshIntervalMs, 750, 3_600_000)) {
		return invalid(
			"interfaces.refresh_interval_ms",
			config.interfaces.refreshIntervalMs,
			"an integer from 750 through 3600000 milliseconds",
		);
	}
	if (!isIntegerBetween(config.interfaces.defaultRangeMinutes, 1, 100_800)) {
		return invalid(
			"interfaces.default_range_minutes",
			config.interfaces.defaultRangeMinutes,
			"a positive whole-minute range within query.max_lookback_days",
		);
	}
	const defaultRangeNs = BigInt(config.interfaces.defaultRangeMinutes) * 60_000_000_000n;
	if (defaultRangeNs > config.query.maxLookbackNs) {
		return invalid(
			"interfaces.default_range_minutes",
			config.interfaces.defaultRangeMinutes,
			"a positive whole-minute range within query.max_lookback_days",
		);
	}
	return Effect.void;
};

const parseOptionalNonEmptyEnvironment = (
	env: Record<string, string | undefined>,
	key: string,
): Effect.Effect<string | undefined, InvalidBelfryEnvironment> => {
	const value = env[key];
	if (value === undefined) return Effect.succeed(undefined);
	if (value.trim() !== "") return Effect.succeed(value.trim());
	return Effect.fail(new InvalidBelfryEnvironment({ key, value, expected: "a non-empty value" }));
};

const parseOptionalNumberEnvironment = (
	env: Record<string, string | undefined>,
	key: string,
	minimum: number,
): Effect.Effect<number | undefined, InvalidBelfryEnvironment> => {
	const value = env[key];
	if (value === undefined) return Effect.succeed(undefined);
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= minimum
		? Effect.succeed(parsed)
		: Effect.fail(
				new InvalidBelfryEnvironment({
					key,
					value,
					expected: `a finite number greater than or equal to ${minimum}`,
				}),
			);
};

const parseOptionalIntegerEnvironment = (
	env: Record<string, string | undefined>,
	key: string,
	minimum: number,
	maximum: number,
): Effect.Effect<number | undefined, InvalidBelfryEnvironment> =>
	parseOptionalNumberEnvironment(env, key, minimum).pipe(
		Effect.flatMap((value) => {
			if (value === undefined || isIntegerBetween(value, minimum, maximum)) return Effect.succeed(value);
			return Effect.fail(
				new InvalidBelfryEnvironment({
					key,
					value: String(value),
					expected: `an integer from ${minimum} through ${maximum}`,
				}),
			);
		}),
	);

const isIntegerBetween = (value: number, minimum: number, maximum: number): boolean =>
	Number.isInteger(value) && value >= minimum && value <= maximum;

const isLoopbackHost = (host: string): boolean => host === "127.0.0.1" || host === "localhost" || host === "::1";

const daysToNanoseconds = (days: number): bigint => BigInt(Math.trunc(days * 86_400 * 1_000_000_000));

const resolveStatePath = (stateDirectory: string, configuredPath: string, fallbackName: string): string => {
	if (configuredPath.trim() === "") return resolve(stateDirectory, fallbackName);
	const expanded = configuredPath.startsWith("~") ? expandHome(configuredPath) : configuredPath;
	return isAbsolute(expanded) ? expanded : resolve(stateDirectory, expanded);
};

const resolveStateDirectory = (path: string): string => {
	if (path.startsWith("~")) return expandHome(path);
	return isAbsolute(path) ? path : resolve(homedir(), path);
};

const expandHome = (path: string): string => {
	if (path === "~") {
		return homedir();
	}
	if (path.startsWith("~/")) {
		return resolve(homedir(), path.slice(2));
	}
	return resolve(path);
};

function defaultStateDirectory(): string {
	if (process.platform === "darwin") return resolve(homedir(), "Library", "Application Support", "belfry");
	if (process.platform === "win32") {
		return resolve(process.env.LOCALAPPDATA ?? resolve(homedir(), "AppData", "Local"), "belfry");
	}
	return resolve(process.env.XDG_STATE_HOME ?? resolve(homedir(), ".local", "state"), "belfry");
}
