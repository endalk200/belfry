import { assert, describe, it } from "@effect/vitest";
import { Effect, FileSystem } from "effect";
import * as PlatformError from "effect/PlatformError";

import {
	BELFRY_DAEMON_PORT_ENV,
	BELFRY_STATE_DIRECTORY_ENV,
	BelfryConfig,
	CONFIG_PATH_ENV,
	DEFAULT_DAEMON_PORT,
	DEFAULT_OTLP_HTTP_ENDPOINT,
	DEFAULT_RETENTION_MAX_BYTES,
	daemonEndpoint,
	initBelfryConfigFromEnvironment,
	loadBelfryConfigFromEnvironment,
	OTLP_ENDPOINT_ENV,
	parseTelemetryEnabledEnv,
	parseTelemetryEndpointEnv,
	resolveConfigPath,
	TELEMETRY_ENV,
	validateBelfryConfigFromEnvironment,
} from "./index.js";

const alreadyExistsError = (path: string) =>
	PlatformError.systemError({
		_tag: "AlreadyExists",
		module: "FileSystem",
		method: "writeFile",
		pathOrDescriptor: path,
	});

const fileSystemLayer = (files: Record<string, string>) =>
	FileSystem.layerNoop({
		exists: (path) => Effect.succeed(Object.hasOwn(files, String(path))),
		readFileString: (path) => Effect.succeed(files[String(path)] ?? ""),
		makeDirectory: () => Effect.void,
		writeFileString: (path, data, options) => {
			const filePath = String(path);
			if (options?.flag === "wx" && Object.hasOwn(files, filePath)) {
				return Effect.fail(alreadyExistsError(filePath));
			}
			return Effect.sync(() => {
				files[filePath] = data;
			});
		},
	});

describe("@belfry/config", () => {
	it("formats IPv4, hostname, and IPv6 Daemon endpoints", () => {
		assert.strictEqual(daemonEndpoint("127.0.0.1", 4318), "http://127.0.0.1:4318");
		assert.strictEqual(daemonEndpoint("localhost", 4318), "http://localhost:4318");
		assert.strictEqual(daemonEndpoint("::1", 4318), "http://[::1]:4318");
	});

	it.effect("loads built-in defaults when the default config file is missing", () =>
		Effect.gen(function* () {
			const config = yield* loadBelfryConfigFromEnvironment({});

			assert.strictEqual(config.telemetry.enabled, false);
			assert.strictEqual(config.telemetry.otlpEndpoint, DEFAULT_OTLP_HTTP_ENDPOINT);
			assert.strictEqual(config.daemon.host, "127.0.0.1");
			assert.strictEqual(config.daemon.port, DEFAULT_DAEMON_PORT);
			assert.match(config.daemon.stateDirectory, /belfry$/u);
			assert.strictEqual(config.storage.retentionMaxBytes, DEFAULT_RETENTION_MAX_BYTES);
			assert.strictEqual(config.storage.retentionMaxAgeNs, 604_800_000_000_000n);
			assert.strictEqual(config.ingestion.maxCompressedBytes < config.ingestion.maxDecompressedBytes, true);
			assert.strictEqual(config.ingestion.writerTimeoutMs, 30_000);
			assert.strictEqual(config.query.maxResults, 500);
		}).pipe(Effect.provide(fileSystemLayer({}))),
	);

	it.effect("derives the database and registry from an explicit machine state directory", () =>
		Effect.gen(function* () {
			const config = yield* loadBelfryConfigFromEnvironment({
				[BELFRY_STATE_DIRECTORY_ENV]: "/tmp/belfry-machine-state",
				[BELFRY_DAEMON_PORT_ENV]: "54321",
			});

			assert.strictEqual(config.daemon.port, 54_321);
			assert.strictEqual(config.daemon.stateDirectory, "/tmp/belfry-machine-state");
			assert.strictEqual(config.storage.databasePath, "/tmp/belfry-machine-state/telemetry.db");
			assert.strictEqual(config.daemon.registryPath, "/tmp/belfry-machine-state/daemon.json");
			assert.strictEqual(config.daemon.lockPath, "/tmp/belfry-machine-state/daemon.lock");
		}).pipe(Effect.provide(fileSystemLayer({}))),
	);

	it.effect("requires queue byte capacity for one maximum compressed request", () =>
		Effect.gen(function* () {
			const invalid = yield* Effect.flip(
				loadBelfryConfigFromEnvironment({ [CONFIG_PATH_ENV]: "/tmp/belfry-small-queue.toml" }).pipe(
					Effect.provide(
						fileSystemLayer({
							"/tmp/belfry-small-queue.toml": `[ingestion]
max_compressed_bytes = 8192
queue_byte_capacity = 4096
`,
						}),
					),
				),
			);

			assert.strictEqual(invalid._tag, "InvalidBelfryConfiguration");
			if (invalid._tag === "InvalidBelfryConfiguration") assert.strictEqual(invalid.path, "ingestion.queue");
		}),
	);

	it.effect("rejects unknown TOML sections and keys with a useful suggestion", () =>
		Effect.gen(function* () {
			for (const [contents, path, suggestion] of [
				["[storge]\nretention_days = 1\n", "storge", "storage"],
				["[storage]\nretention_dayz = 1\n", "storage.retention_dayz", "storage.retention_days"],
				["[daemon]\ntypo = true\n", "daemon.typo", "daemon."],
			] as const) {
				const configPath = `/tmp/belfry-unknown-${path.replaceAll(".", "-")}.toml`;
				const invalid = yield* Effect.flip(
					loadBelfryConfigFromEnvironment({ [CONFIG_PATH_ENV]: configPath }).pipe(
						Effect.provide(fileSystemLayer({ [configPath]: contents })),
					),
				);
				assert.strictEqual(invalid._tag, "InvalidBelfryConfiguration");
				if (invalid._tag !== "InvalidBelfryConfiguration") continue;
				assert.strictEqual(invalid.path, path);
				assert.include(invalid.expected, suggestion);
			}
		}),
	);

	it.effect("rejects non-finite TOML numbers as typed configuration failures", () =>
		Effect.gen(function* () {
			for (const [name, contents] of [
				["retention-inf", "[storage]\nretention_days = inf\n"],
				["lookback-negative-inf", "[query]\nmax_lookback_days = -inf\n"],
				["timeout-nan", "[ingestion]\nwriter_timeout_ms = nan\n"],
			] as const) {
				const configPath = `/tmp/belfry-${name}.toml`;
				const invalid = yield* Effect.flip(
					loadBelfryConfigFromEnvironment({ [CONFIG_PATH_ENV]: configPath }).pipe(
						Effect.provide(fileSystemLayer({ [configPath]: contents })),
					),
				);
				assert.strictEqual(invalid._tag, "ConfigError");
			}
		}),
	);

	it.effect("uses env overrides before TOML file values", () =>
		Effect.gen(function* () {
			const config = yield* loadBelfryConfigFromEnvironment({
				[CONFIG_PATH_ENV]: "/tmp/belfry-config-test.toml",
				[OTLP_ENDPOINT_ENV]: "http://127.0.0.1:4318/",
			});

			assert.deepStrictEqual(config.telemetry, {
				enabled: true,
				otlpEndpoint: "http://127.0.0.1:4318",
			});
		}).pipe(
			Effect.provide(
				fileSystemLayer({
					"/tmp/belfry-config-test.toml": `[telemetry]
enabled = true
otlp_endpoint = "http://localhost:9999"
`,
				}),
			),
		),
	);

	it.effect("keeps BELFRY_TELEMETRY strict", () =>
		Effect.gen(function* () {
			assert.strictEqual(yield* parseTelemetryEnabledEnv("true"), true);
			assert.strictEqual(yield* parseTelemetryEnabledEnv("false"), false);

			const invalid = yield* Effect.flip(parseTelemetryEnabledEnv("1"));

			assert.strictEqual(invalid._tag, "InvalidTelemetryEnvironment");
		}),
	);

	it.effect("parses BELFRY_OTLP_ENDPOINT as an absolute URL override", () =>
		Effect.gen(function* () {
			assert.strictEqual(yield* parseTelemetryEndpointEnv(undefined), undefined);
			assert.strictEqual(yield* parseTelemetryEndpointEnv("http://127.0.0.1:4318/"), "http://127.0.0.1:4318");

			const invalid = yield* Effect.flip(parseTelemetryEndpointEnv("not-a-url"));

			assert.strictEqual(invalid._tag, "InvalidTelemetryEndpoint");
		}),
	);

	it.effect("rejects whitespace-only config paths", () =>
		Effect.gen(function* () {
			const invalid = yield* Effect.flip(resolveConfigPath({ [CONFIG_PATH_ENV]: "   " }));

			assert.strictEqual(invalid._tag, "InvalidConfigPath");
			assert.strictEqual(invalid.value, "   ");
		}),
	);

	it.effect("reports invalid file and env sources separately", () =>
		Effect.gen(function* () {
			const report = yield* validateBelfryConfigFromEnvironment({
				[CONFIG_PATH_ENV]: "/tmp/belfry-invalid-config-test.toml",
				[TELEMETRY_ENV]: "1",
			});

			assert.strictEqual(report.file._tag, "invalid");
			assert.strictEqual(report.env._tag, "invalid");
			assert.strictEqual(report.effective._tag, "invalid");
		}).pipe(
			Effect.provide(
				fileSystemLayer({
					"/tmp/belfry-invalid-config-test.toml": `[telemetry]
enabled = true
otlp_endpoint = "not-a-url"
`,
				}),
			),
		),
	);

	it.effect("does not hide an invalid file source behind valid env overrides during validation", () =>
		Effect.gen(function* () {
			const report = yield* validateBelfryConfigFromEnvironment({
				[CONFIG_PATH_ENV]: "/tmp/belfry-invalid-lower-precedence.toml",
				[OTLP_ENDPOINT_ENV]: "http://127.0.0.1:4318",
			});

			assert.strictEqual(report.file._tag, "invalid");
			assert.strictEqual(report.env._tag, "valid");
			assert.strictEqual(report.effective._tag, "valid");
		}).pipe(
			Effect.provide(
				fileSystemLayer({
					"/tmp/belfry-invalid-lower-precedence.toml": `[telemetry]
enabled = true
otlp_endpoint = "not-a-url"
`,
				}),
			),
		),
	);

	it.effect("rejects interface preferences outside the authoritative bounded cadence and lookback", () =>
		Effect.gen(function* () {
			const report = yield* validateBelfryConfigFromEnvironment({
				[CONFIG_PATH_ENV]: "/tmp/belfry-invalid-interface-config.toml",
			});

			assert.strictEqual(report.file._tag, "valid");
			assert.strictEqual(report.effective._tag, "invalid");
			assert.match(report.effective.message, /interfaces\.refresh_interval_ms/u);
		}).pipe(
			Effect.provide(
				fileSystemLayer({
					"/tmp/belfry-invalid-interface-config.toml": `[interfaces]
refresh_interval_ms = 100
default_range_minutes = 15
`,
				}),
			),
		),
	);

	it.effect("rejects non-positive operational batch, index, drain, and timeout bounds", () =>
		Effect.gen(function* () {
			const cases = [
				["daemon.startup_timeout_ms", "[daemon]\nstartup_timeout_ms = 0\n"],
				["daemon.shutdown_timeout_ms", "[daemon]\nshutdown_timeout_ms = -1\n"],
				["storage.retention_batch_size", "[storage]\nretention_batch_size = 0\n"],
				["storage.indexed_attribute_limit", "[storage]\nindexed_attribute_limit = 0\n"],
				["storage.indexed_value_max_bytes", "[storage]\nindexed_value_max_bytes = 0\n"],
				["storage.indexed_key_limit", "[storage]\nindexed_key_limit = 0\n"],
				["storage.indexed_values_per_key_limit", "[storage]\nindexed_values_per_key_limit = 0\n"],
				["ingestion.drain_timeout_ms", "[ingestion]\ndrain_timeout_ms = 0\n"],
				["ingestion.writer_timeout_ms", "[ingestion]\nwriter_timeout_ms = 99\n"],
				["query.max_results", "[query]\nmax_results = 99\n"],
				["query.timeout_ms", "[query]\ntimeout_ms = 0\n"],
			] as const;
			for (const [path, contents] of cases) {
				const configPath = `/tmp/belfry-invalid-${path.replaceAll(".", "-")}.toml`;
				const report = yield* validateBelfryConfigFromEnvironment({ [CONFIG_PATH_ENV]: configPath }).pipe(
					Effect.provide(fileSystemLayer({ [configPath]: contents })),
				);
				assert.strictEqual(report.effective._tag, "invalid");
				assert.include(report.effective.message, path);
			}
		}),
	);

	it.effect("provides the resolved service through an Effect layer", () =>
		Effect.gen(function* () {
			const config = yield* BelfryConfig;

			assert.strictEqual(config.telemetry.enabled, false);
		}).pipe(Effect.provide(BelfryConfig.layerFromEnvironment({})), Effect.provide(fileSystemLayer({}))),
	);

	it.effect("initializes a starter config file without overwriting", () =>
		Effect.gen(function* () {
			const files: Record<string, string> = {};
			const env = { [CONFIG_PATH_ENV]: "/tmp/belfry-init-config-test.toml" };
			const path = yield* initBelfryConfigFromEnvironment(env).pipe(Effect.provide(fileSystemLayer(files)));

			assert.strictEqual(path.path, "/tmp/belfry-init-config-test.toml");
			assert.include(files["/tmp/belfry-init-config-test.toml"] ?? "", "[telemetry]");

			const alreadyExists = yield* Effect.flip(
				initBelfryConfigFromEnvironment(env).pipe(Effect.provide(fileSystemLayer(files))),
			);

			assert.strictEqual(alreadyExists._tag, "ConfigFileAlreadyExists");
		}),
	);

	it.effect("maps concurrent config creation to already exists", () =>
		Effect.gen(function* () {
			const path = "/tmp/belfry-init-race.toml";
			const alreadyExists = yield* Effect.flip(
				initBelfryConfigFromEnvironment({ [CONFIG_PATH_ENV]: path }).pipe(
					Effect.provide(
						FileSystem.layerNoop({
							makeDirectory: () => Effect.void,
							writeFileString: () => Effect.fail(alreadyExistsError(path)),
						}),
					),
				),
			);

			assert.strictEqual(alreadyExists._tag, "ConfigFileAlreadyExists");
		}),
	);

	it.effect("maps config init filesystem failures to config write errors", () =>
		Effect.gen(function* () {
			const path = "/tmp/belfry-init-write-failure.toml";
			const cause = PlatformError.systemError({
				_tag: "PermissionDenied",
				module: "FileSystem",
				method: "makeDirectory",
				pathOrDescriptor: "/tmp",
			});

			const failure = yield* Effect.flip(
				initBelfryConfigFromEnvironment({ [CONFIG_PATH_ENV]: path }).pipe(
					Effect.provide(
						FileSystem.layerNoop({
							exists: () => Effect.succeed(false),
							makeDirectory: () => Effect.fail(cause),
						}),
					),
				),
			);

			assert.strictEqual(failure._tag, "ConfigFileWriteError");
			if (failure._tag !== "ConfigFileWriteError") {
				return;
			}
			assert.strictEqual(failure.path, path);
			assert.include(failure.message, "PermissionDenied");
		}),
	);
});
