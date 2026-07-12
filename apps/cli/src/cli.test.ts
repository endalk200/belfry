import { createRequire } from "node:module";
import {
	BelfryConfig,
	CONFIG_PATH_ENV,
	type ConfigValidationReport,
	defaultBelfryConfiguration,
	InvalidConfigPath,
	OTLP_ENDPOINT_ENV,
	parseTelemetryEnabledEnv,
	parseTelemetryEndpointEnv,
	TELEMETRY_ENV,
} from "@belfry/config";
import { DaemonLifecycleFailure, DaemonManager, type DaemonManagerService } from "@belfry/daemon/lifecycle";
import { assert, describe, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Logger, Path, Stdio, Terminal } from "effect";
import { TestConsole } from "effect/testing";
import { CliOutput } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";
import { configValidationHasFailures, formatConfigValidationReport } from "./cli/commands/config/validate.cmd.js";
import { shouldOpenWebWorkspace, startWebWorkspace } from "./cli/commands/web.cmd.js";
import { runCliWithArgs } from "./cli/run.js";
import { handleCliFailure, reportUnexpectedCliFailure } from "./runtime/failures.js";
import {
	DEFAULT_OTLP_HTTP_ENDPOINT,
	telemetryLayerFromConfiguration,
	withoutConsoleLogger,
} from "./runtime/telemetry.js";

const require = createRequire(import.meta.url);
const cliPackage = require("../package.json") as { readonly version: string };

const TerminalLayer = Layer.succeed(
	Terminal.Terminal,
	Terminal.make({
		columns: Effect.succeed(80),
		rows: Effect.succeed(24),
		display: () => Effect.void,
		readInput: Effect.die("readInput is not implemented in CLI tests"),
		readLine: Effect.succeed(""),
	}),
);

const SpawnerLayer = Layer.succeed(
	ChildProcessSpawner.ChildProcessSpawner,
	ChildProcessSpawner.make(() => Effect.die("Child process spawning is not implemented in CLI tests")),
);

const DaemonManagerTestService: DaemonManagerService = {
	status: Effect.succeed({ state: "stopped" as const, message: "test Daemon is stopped" }),
	withStoppedDaemonLock: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
	start: Effect.die("Daemon start is not implemented in CLI unit tests"),
	stop: Effect.die("Daemon stop is not implemented in CLI unit tests"),
	restart: Effect.die("Daemon restart is not implemented in CLI unit tests"),
	serve: Effect.never,
};

const cliTestLayer = (
	files: Record<string, string> = {},
	manager: DaemonManagerService = DaemonManagerTestService,
	config = defaultBelfryConfiguration,
) =>
	Layer.mergeAll(
		TestConsole.layer,
		FileSystem.layerNoop({
			exists: (path) => Effect.succeed(Object.hasOwn(files, String(path))),
			readFileString: (path) => Effect.succeed(files[String(path)] ?? ""),
			makeDirectory: () => Effect.void,
			writeFileString: (path, data) =>
				Effect.sync(() => {
					files[String(path)] = data;
				}),
		}),
		Path.layer,
		TerminalLayer,
		CliOutput.layer(CliOutput.defaultFormatter({ colors: false })),
		SpawnerLayer,
		Layer.succeed(DaemonManager, manager),
		Layer.succeed(BelfryConfig, config),
		Stdio.layerTest({}),
		withoutConsoleLogger,
	);

const belfryEnvKeys = [CONFIG_PATH_ENV, TELEMETRY_ENV, OTLP_ENDPOINT_ENV] as const;

const withIsolatedBelfryEnvironment = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	Effect.suspend(() => {
		const previous = Object.fromEntries(belfryEnvKeys.map((key) => [key, process.env[key]]));

		for (const key of belfryEnvKeys) {
			delete process.env[key];
		}

		return effect.pipe(
			Effect.ensuring(
				Effect.sync(() => {
					for (const key of belfryEnvKeys) {
						const value = previous[key];
						if (value === undefined) {
							delete process.env[key];
						} else {
							process.env[key] = value;
						}
					}
				}),
			),
		);
	});

const runBelfryCommand = (
	args: ReadonlyArray<string>,
	files: Record<string, string> = {},
	manager: DaemonManagerService = DaemonManagerTestService,
	config = defaultBelfryConfiguration,
) =>
	Effect.gen(function* () {
		yield* runCliWithArgs(args);

		return {
			stdout: yield* TestConsole.logLines,
			stderr: yield* TestConsole.errorLines,
		};
	}).pipe(withIsolatedBelfryEnvironment, Effect.provide(cliTestLayer(files, manager, config)));

describe("belfry CLI", () => {
	it.effect("starts the browser Workspace and prints its URL for the bare command", () =>
		Effect.gen(function* () {
			const endpoint = "http://127.0.0.1:24318";
			const manager: DaemonManagerService = {
				...DaemonManagerTestService,
				start: Effect.succeed({
					adopted: false,
					registry: { version: 1, pid: 42, startedAt: 1, nonce: "test", endpoint },
				}),
			};
			const config = {
				...defaultBelfryConfiguration,
				interfaces: { ...defaultBelfryConfiguration.interfaces, webOpenBrowser: false },
			};

			const { stdout } = yield* runBelfryCommand([], {}, manager, config);

			assert.deepStrictEqual(stdout, [`Belfry web Workspace: ${endpoint}/traces`]);
		}),
	);

	it.effect("propagates Daemon startup failure from the bare command", () =>
		Effect.gen(function* () {
			const expected = new DaemonLifecycleFailure({
				code: "start_timeout",
				message: "The test Daemon did not become ready.",
			});
			const manager: DaemonManagerService = {
				...DaemonManagerTestService,
				start: Effect.fail(expected),
			};

			const failure = yield* Effect.flip(runBelfryCommand([], {}, manager));

			assert.strictEqual(failure, expected);
		}),
	);

	it.effect("prints root help when explicitly requested", () =>
		Effect.gen(function* () {
			const { stdout } = yield* runBelfryCommand(["--help"]);
			const stdoutText = stdout.join("\n");

			assert.include(stdoutText, "belfry <subcommand> [flags]");
			assert.include(stdoutText, "Manage Belfry configuration");
			assert.include(stdoutText, "config");
			assert.include(stdoutText, "database");
			assert.include(stdoutText, "version");
		}),
	);

	it.effect("prints the package version with the version command", () =>
		Effect.gen(function* () {
			const { stdout } = yield* runBelfryCommand(["version"]);

			assert.deepStrictEqual(stdout, [cliPackage.version]);
		}),
	);

	it.effect("prints the effective config path", () =>
		Effect.gen(function* () {
			const { stdout } = yield* runBelfryCommand(["config", "path"]);
			const normalizedPath = String(stdout[0] ?? "").replaceAll("\\", "/");

			assert.strictEqual(normalizedPath.endsWith("/.belfry/config.toml"), true);
		}),
	);

	it.effect("prints the machine-wide Telemetry Store path", () =>
		Effect.gen(function* () {
			const { stdout } = yield* runBelfryCommand(["database", "path"]);
			const normalizedPath = String(stdout[0] ?? "").replaceAll("\\", "/");

			assert.strictEqual(normalizedPath, defaultBelfryConfiguration.storage.databasePath.replaceAll("\\", "/"));
		}),
	);

	it.effect("validates the missing default config with defaults", () =>
		Effect.gen(function* () {
			const { stdout } = yield* runBelfryCommand(["config", "validate"]);
			const stdoutText = stdout.join("\n");

			assert.include(stdoutText, "No config file found");
			assert.include(stdoutText, "Environment overrides are valid");
			assert.include(stdoutText, "Valid Belfry Configuration.");
		}),
	);

	it.effect("formats config validation output and failure policy in one place", () =>
		Effect.sync(() => {
			const report: ConfigValidationReport = {
				path: { path: "/tmp/belfry.toml", source: "env" },
				file: { _tag: "valid", message: "file ok" },
				env: { _tag: "valid", message: "env ok" },
				effective: { _tag: "invalid", message: "effective invalid" },
				config: undefined,
			};

			assert.deepStrictEqual(formatConfigValidationReport(report), ["file ok", "env ok", "effective invalid"]);
			assert.strictEqual(configValidationHasFailures(report), true);
		}),
	);

	it.effect("keeps telemetry env parsing in Belfry Configuration", () =>
		Effect.gen(function* () {
			assert.strictEqual(yield* parseTelemetryEnabledEnv(undefined), undefined);
			assert.strictEqual(yield* parseTelemetryEnabledEnv("false"), false);
			assert.strictEqual(yield* parseTelemetryEnabledEnv("true"), true);
			assert.strictEqual(yield* parseTelemetryEndpointEnv(undefined), undefined);
			assert.strictEqual(yield* parseTelemetryEndpointEnv("http://127.0.0.1:27686/"), "http://127.0.0.1:27686");

			const invalid = yield* Effect.flip(parseTelemetryEnabledEnv("1"));

			assert.strictEqual(invalid._tag, "InvalidTelemetryEnvironment");
			assert.strictEqual(invalid.value, "1");
		}),
	);

	it.effect("builds disabled telemetry from resolved Belfry Configuration", () =>
		Effect.gen(function* () {
			const loggers = yield* Logger.CurrentLoggers;

			assert.strictEqual(loggers.size, 0);
		}).pipe(
			Effect.provide(
				telemetryLayerFromConfiguration({
					telemetry: {
						enabled: false,
						otlpEndpoint: DEFAULT_OTLP_HTTP_ENDPOINT,
					},
				}),
			),
		),
	);

	it.effect("disables telemetry with a warning when the configured collector is unavailable", () =>
		Effect.gen(function* () {
			const previousFetch = globalThis.fetch;
			globalThis.fetch = (() => Promise.reject(new Error("collector unavailable"))) as unknown as typeof fetch;

			yield* Effect.gen(function* () {
				const loggers = yield* Logger.CurrentLoggers;
				const stderr = yield* TestConsole.errorLines;

				assert.strictEqual(loggers.size, 0);
				assert.deepStrictEqual(stderr, [
					"Warning: OTLP collector unreachable at http://127.0.0.1:65535; telemetry disabled.",
				]);
			}).pipe(
				Effect.provide(
					telemetryLayerFromConfiguration({
						telemetry: {
							enabled: true,
							otlpEndpoint: "http://127.0.0.1:65535",
						},
					}),
				),
				Effect.ensuring(
					Effect.sync(() => {
						globalThis.fetch = previousFetch;
					}),
				),
			);
		}).pipe(Effect.provide(TestConsole.layer)),
	);

	it.effect("keeps telemetry enabled when collector rejects OPTIONS with 404", () =>
		Effect.gen(function* () {
			const previousFetch = globalThis.fetch;
			globalThis.fetch = (() => Promise.resolve(new Response(null, { status: 404 }))) as unknown as typeof fetch;

			yield* Effect.gen(function* () {
				const loggers = yield* Logger.CurrentLoggers;
				const stderr = yield* TestConsole.errorLines;

				assert.strictEqual(loggers.size, 1);
				assert.deepStrictEqual(stderr, []);
			}).pipe(
				Effect.provide(
					telemetryLayerFromConfiguration({
						telemetry: {
							enabled: true,
							otlpEndpoint: "http://127.0.0.1:27686",
						},
					}),
				),
				Effect.ensuring(
					Effect.sync(() => {
						globalThis.fetch = previousFetch;
					}),
				),
			);
		}).pipe(Effect.provide(TestConsole.layer)),
	);

	it.effect("keeps telemetry enabled when collector rejects OPTIONS with 401", () =>
		Effect.gen(function* () {
			const previousFetch = globalThis.fetch;
			globalThis.fetch = (() => Promise.resolve(new Response(null, { status: 401 }))) as unknown as typeof fetch;

			yield* Effect.gen(function* () {
				const loggers = yield* Logger.CurrentLoggers;
				const stderr = yield* TestConsole.errorLines;

				assert.strictEqual(loggers.size, 1);
				assert.deepStrictEqual(stderr, []);
			}).pipe(
				Effect.provide(
					telemetryLayerFromConfiguration({
						telemetry: {
							enabled: true,
							otlpEndpoint: "http://127.0.0.1:27686",
						},
					}),
				),
				Effect.ensuring(
					Effect.sync(() => {
						globalThis.fetch = previousFetch;
					}),
				),
			);
		}).pipe(Effect.provide(TestConsole.layer)),
	);

	it.effect("removes the default console loggers when telemetry is disabled", () =>
		Effect.gen(function* () {
			const loggers = yield* Logger.CurrentLoggers;

			assert.strictEqual(loggers.size, 0);
		}).pipe(Effect.provide(withoutConsoleLogger)),
	);

	it("uses the configured web auto-open preference with an explicit no-open override", () => {
		assert.strictEqual(shouldOpenWebWorkspace(true, false), true);
		assert.strictEqual(shouldOpenWebWorkspace(false, false), false);
		assert.strictEqual(shouldOpenWebWorkspace(true, true), false);
	});

	it.effect("launches the browser when Workspace auto-open is configured", () =>
		Effect.gen(function* () {
			const endpoint = "http://127.0.0.1:24318";
			const manager: DaemonManagerService = {
				...DaemonManagerTestService,
				start: Effect.succeed({
					adopted: true,
					registry: { version: 1, pid: 42, startedAt: 1, nonce: "test", endpoint },
				}),
			};
			let launchedUrl: string | undefined;

			yield* startWebWorkspace({
				noOpen: false,
				launchBrowser: (url) =>
					Effect.sync(() => {
						launchedUrl = url;
					}),
			}).pipe(Effect.provide(cliTestLayer({}, manager)));

			assert.strictEqual(launchedUrl, `${endpoint}/traces`);
		}),
	);

	it.effect("prints CLI failures to stderr through the failure reporting module", () =>
		Effect.gen(function* () {
			const error = new InvalidConfigPath({ value: "" });
			yield* Effect.flip(handleCliFailure.InvalidConfigPath(error));
			yield* Effect.flip(
				handleCliFailure.DaemonLifecycleFailure(
					new DaemonLifecycleFailure({ code: "start_timeout", message: "The Daemon did not become ready." }),
				),
			);
			yield* Effect.flip(
				handleCliFailure.WebBrowserFailure({
					_tag: "WebBrowserFailure",
					code: "browser_open_failed",
					message: "Could not open the browser. Open the URL manually.",
				} as Parameters<typeof handleCliFailure.WebBrowserFailure>[0]),
			);

			const stderr = yield* TestConsole.errorLines;

			assert.deepStrictEqual(stderr, [
				'Invalid BELFRY_CONFIG_PATH value "". Expected a non-empty path.',
				"The Daemon did not become ready.",
				"Could not open the browser. Open the URL manually.",
			]);
		}).pipe(Effect.provide(TestConsole.layer)),
	);

	it.effect("prints unexpected CLI failures to stderr", () =>
		Effect.gen(function* () {
			yield* Effect.exit(Effect.die("boom").pipe(Effect.catchCause(reportUnexpectedCliFailure)));

			const stderr = yield* TestConsole.errorLines;
			const stderrText = stderr.join("\n");

			assert.include(stderrText, "Unexpected Belfry failure");
			assert.include(stderrText, "boom");
		}).pipe(Effect.provide(TestConsole.layer)),
	);
});
