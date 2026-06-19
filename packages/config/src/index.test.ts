import { assert, describe, it } from "@effect/vitest";
import { Effect, FileSystem } from "effect";
import * as PlatformError from "effect/PlatformError";

import {
	BelfryConfig,
	CONFIG_PATH_ENV,
	DEFAULT_OTLP_HTTP_ENDPOINT,
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
	it.effect("loads built-in defaults when the default config file is missing", () =>
		Effect.gen(function* () {
			const config = yield* loadBelfryConfigFromEnvironment({});

			assert.deepStrictEqual(config, {
				telemetry: {
					enabled: false,
					otlpEndpoint: DEFAULT_OTLP_HTTP_ENDPOINT,
				},
			});
		}).pipe(Effect.provide(fileSystemLayer({}))),
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
