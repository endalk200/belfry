import type { FileHandle } from "node:fs/promises";
import { mkdir, open, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BelfryConfiguration } from "@belfry/config";
import { HealthSchema } from "@belfry/query-api";
import { Context, Effect, Layer, Schema } from "effect";

export const DaemonRegistrySchema = Schema.Struct({
	version: Schema.Literal(1),
	pid: Schema.Number,
	startedAt: Schema.Number,
	nonce: Schema.String,
	endpoint: Schema.String,
});
export type DaemonRegistry = typeof DaemonRegistrySchema.Type;

export type DaemonStatus =
	| { readonly state: "stopped"; readonly message: string }
	| { readonly state: "running"; readonly registry: DaemonRegistry; readonly message: string }
	| { readonly state: "stale" | "unhealthy"; readonly registry?: DaemonRegistry; readonly message: string };

export type DaemonStartResult = {
	readonly adopted: boolean;
	readonly registry: DaemonRegistry;
};

export class DaemonLifecycleFailure extends Schema.TaggedErrorClass<DaemonLifecycleFailure>()(
	"DaemonLifecycleFailure",
	{
		code: Schema.Literals([
			"already_running",
			"not_running",
			"start_timeout",
			"stop_timeout",
			"port_conflict",
			"registry_invalid",
			"identity_mismatch",
			"spawn_failed",
			"state_unavailable",
		]),
		message: Schema.String,
	},
) {}

export type DaemonManagerService = {
	readonly status: Effect.Effect<DaemonStatus>;
	readonly withStoppedDaemonLock: <A, E, R>(
		effect: Effect.Effect<A, E, R>,
	) => Effect.Effect<A, E | DaemonLifecycleFailure, R>;
	readonly start: Effect.Effect<DaemonStartResult, DaemonLifecycleFailure>;
	readonly stop: Effect.Effect<DaemonRegistry, DaemonLifecycleFailure>;
	readonly restart: Effect.Effect<DaemonStartResult, DaemonLifecycleFailure>;
	readonly serve: Effect.Effect<never, DaemonLifecycleFailure, import("effect").Scope.Scope>;
};

export type DaemonManagerOptions = {
	readonly configuration: BelfryConfiguration;
	readonly command?: ReadonlyArray<string> | undefined;
};

export class DaemonManager extends Context.Service<DaemonManager, DaemonManagerService>()(
	"@belfry/daemon/DaemonManager",
) {
	static readonly layer = (options: DaemonManagerOptions) => Layer.succeed(DaemonManager, makeDaemonManager(options));
}

export const makeDaemonManager = (options: DaemonManagerOptions): DaemonManagerService => {
	const config = options.configuration;
	const startupLockPath = `${config.daemon.lockPath}.startup`;

	const status: Effect.Effect<DaemonStatus> = readRegistry(config.daemon.registryPath).pipe(
		Effect.flatMap((registry) => {
			if (registry === undefined) {
				return Effect.succeed<DaemonStatus>({ state: "stopped", message: "Belfry Daemon is stopped." });
			}
			if (!processExists(registry.pid)) {
				return Effect.succeed<DaemonStatus>({
					state: "stale",
					registry,
					message: `Daemon registry points to exited process ${registry.pid}; run belfry daemon start to recover.`,
				});
			}
			return verifyIdentity(registry).pipe(
				Effect.match({
					onFailure: (message): DaemonStatus => ({
						state: "unhealthy",
						registry,
						message,
					}),
					onSuccess: (): DaemonStatus => ({
						state: "running",
						registry,
						message: `Belfry Daemon ${registry.pid} is healthy at ${registry.endpoint}.`,
					}),
				}),
			);
		}),
		Effect.catch(() =>
			Effect.succeed<DaemonStatus>({
				state: "stale",
				message: "Daemon registry is unreadable; start will repair it.",
			}),
		),
	);

	const start = ensureStateDirectory(config.daemon.stateDirectory).pipe(
		Effect.flatMap(() =>
			withFileLock(
				startupLockPath,
				config.daemon.startupTimeoutMs,
				Effect.gen(function* () {
					const current = yield* status;
					if (current.state === "running") return { adopted: true, registry: current.registry };
					if (
						current.state === "unhealthy" &&
						current.registry !== undefined &&
						processExists(current.registry.pid)
					) {
						return yield* Effect.fail(
							new DaemonLifecycleFailure({
								code: "identity_mismatch",
								message: `${current.message} Refusing to adopt or terminate an unverified process. Stop it explicitly or choose another loopback port.`,
							}),
						);
					}
					yield* cleanupStaleFiles(config);
					yield* spawnDaemon(options.command ?? defaultDaemonCommand(), config.daemon.stateDirectory);
					const registry = yield* waitForRunning(status, config.daemon.startupTimeoutMs);
					return { adopted: false, registry };
				}),
			),
		),
	);

	const withStoppedDaemonLock = <A, E, R>(
		effect: Effect.Effect<A, E, R>,
	): Effect.Effect<A, E | DaemonLifecycleFailure, R> =>
		ensureStateDirectory(config.daemon.stateDirectory).pipe(
			Effect.flatMap(() =>
				withFileLock(
					startupLockPath,
					config.daemon.startupTimeoutMs,
					Effect.gen(function* () {
						const current = yield* status;
						const positivelyStopped =
							current.state === "stopped" ||
							(current.state === "stale" &&
								current.registry !== undefined &&
								!processExists(current.registry.pid));
						if (!positivelyStopped) {
							return yield* Effect.fail(
								new DaemonLifecycleFailure({
									code: current.state === "running" ? "already_running" : "identity_mismatch",
									message: `${current.message} Direct write maintenance requires a positively verified stopped Daemon.`,
								}),
							);
						}
						if (current.state === "stale") yield* cleanupStaleFiles(config);
						return yield* Effect.acquireUseRelease(
							acquireDaemonLock(config.daemon.lockPath),
							() => effect,
							(handle) => releaseDaemonLock(handle, config.daemon.lockPath),
						);
					}),
				),
			),
		);

	const stop = Effect.gen(function* () {
		const current = yield* status;
		if (current.state !== "running") {
			return yield* Effect.fail(new DaemonLifecycleFailure({ code: "not_running", message: current.message }));
		}
		if (current.registry.pid === process.pid) {
			return yield* Effect.fail(
				new DaemonLifecycleFailure({
					code: "identity_mismatch",
					message: "The foreground Daemon cannot stop itself through its manager.",
				}),
			);
		}
		yield* Effect.try({
			try: () => process.kill(current.registry.pid, "SIGTERM"),
			catch: (cause) =>
				new DaemonLifecycleFailure({
					code: "identity_mismatch",
					message: `Could not signal verified Daemon ${current.registry.pid}: ${errorMessage(cause)}`,
				}),
		});
		yield* waitForStopped(current.registry.pid, config.daemon.shutdownTimeoutMs);
		yield* removeIfExists(config.daemon.registryPath);
		yield* removeIfExists(config.daemon.lockPath);
		return current.registry;
	});

	const restart = stop.pipe(
		Effect.catchTag("DaemonLifecycleFailure", (error) =>
			error.code === "not_running" ? Effect.void : Effect.fail(error),
		),
		Effect.flatMap(() => start),
	);

	const serve = Effect.gen(function* () {
		yield* ensureStateDirectory(config.daemon.stateDirectory);
		const daemonLock = yield* acquireDaemonLock(config.daemon.lockPath);
		yield* Effect.addFinalizer(() => releaseDaemonLock(daemonLock, config.daemon.lockPath));
		const serverModule = yield* Effect.promise(() => import("./server.js"));
		const server = yield* serverModule.startDaemonServer({ configuration: config }).pipe(
			Effect.mapError(
				(error) =>
					new DaemonLifecycleFailure({
						code: error.code === "listen_failed" ? "port_conflict" : "state_unavailable",
						message: `${error.message} Check belfry daemon status and the configured loopback port.`,
					}),
			),
		);
		const registry: DaemonRegistry = {
			version: 1,
			pid: process.pid,
			startedAt: server.startedAt,
			nonce: server.nonce,
			endpoint: server.endpoint,
		};
		yield* writeRegistry(config.daemon.registryPath, registry);
		yield* Effect.tryPromise({
			try: async () => {
				await daemonLock.truncate(0);
				await daemonLock.writeFile(JSON.stringify(registry));
			},
			catch: (cause) =>
				new DaemonLifecycleFailure({
					code: "state_unavailable",
					message: `Could not record the Daemon lock identity: ${errorMessage(cause)}`,
				}),
		});
		yield* Effect.addFinalizer(() => removeRegistryIfOwned(config.daemon.registryPath, registry.nonce));
		yield* Effect.logInfo("Belfry Daemon ready", { endpoint: registry.endpoint, pid: registry.pid });
		return yield* Effect.never;
	});

	return { status, withStoppedDaemonLock, start, stop, restart, serve };
};

const readRegistry = (path: string): Effect.Effect<DaemonRegistry | undefined, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: async () => {
			try {
				return Schema.decodeUnknownSync(DaemonRegistrySchema)(JSON.parse(await readFile(path, "utf8")));
			} catch (cause) {
				if (isFileCode(cause, "ENOENT")) return undefined;
				throw cause;
			}
		},
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "registry_invalid",
				message: `Could not read ${path}: ${errorMessage(cause)}`,
			}),
	});

const writeRegistry = (path: string, registry: DaemonRegistry): Effect.Effect<void, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: async () => {
			const temporary = `${path}.${registry.nonce}.tmp`;
			await writeFile(temporary, `${JSON.stringify(registry)}\n`, { mode: 0o600 });
			await rename(temporary, path);
		},
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "state_unavailable",
				message: `Could not write the Daemon registry: ${errorMessage(cause)}`,
			}),
	});

const ensureStateDirectory = (path: string): Effect.Effect<void, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: () => mkdir(path, { recursive: true, mode: 0o700 }).then(() => undefined),
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "state_unavailable",
				message: `Could not create the machine state directory ${path}: ${errorMessage(cause)}`,
			}),
	});

const verifyIdentity = (registry: DaemonRegistry): Effect.Effect<void, string> =>
	Effect.tryPromise({
		try: async () => {
			const response = await fetch(`${registry.endpoint}/api/health`, { signal: AbortSignal.timeout(750) });
			if (!response.ok) throw new Error(`health returned HTTP ${response.status}`);
			const health = Schema.decodeUnknownSync(HealthSchema)(await response.json());
			if (
				health.daemon === undefined ||
				health.daemon.pid !== registry.pid ||
				health.daemon.startedAt !== registry.startedAt ||
				health.daemon.nonce !== registry.nonce ||
				health.daemon.endpoint !== registry.endpoint
			) {
				throw new Error("health identity does not match the registry");
			}
		},
		catch: (cause) =>
			`A process exists for registry PID ${registry.pid}, but Belfry could not verify its nonce, start time, and endpoint (${errorMessage(cause)}).`,
	});

const spawnDaemon = (
	command: ReadonlyArray<string>,
	stateDirectory: string,
): Effect.Effect<void, DaemonLifecycleFailure> =>
	Effect.try({
		try: () => {
			const child = Bun.spawn([...command], {
				cwd: stateDirectory,
				env: { ...process.env, BELFRY_DAEMON_CHILD: "1" },
				stdin: "ignore",
				stdout: "ignore",
				stderr: "ignore",
			});
			child.unref();
		},
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "spawn_failed",
				message: `Could not launch the Bun Daemon process: ${errorMessage(cause)}. Run belfry daemon serve to inspect the foreground error.`,
			}),
	});

const defaultDaemonCommand = (): ReadonlyArray<string> => {
	const entry = process.argv[1];
	if (entry === undefined) return [process.execPath, "belfry", "daemon", "serve"];
	const absoluteEntry = resolve(entry);
	return absoluteEntry.endsWith(".ts")
		? [process.execPath, "--conditions=development", absoluteEntry, "daemon", "serve"]
		: [process.execPath, absoluteEntry, "daemon", "serve"];
};

const waitForRunning = (
	status: Effect.Effect<DaemonStatus>,
	timeoutMs: number,
): Effect.Effect<DaemonRegistry, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: async () => {
			const started = Date.now();
			while (Date.now() - started < timeoutMs) {
				const current = await Effect.runPromise(status);
				if (current.state === "running") return current.registry;
				await Bun.sleep(40);
			}
			throw new Error("timed out waiting for health and a verified registry");
		},
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "start_timeout",
				message: `The Daemon did not become healthy within ${timeoutMs} ms: ${errorMessage(cause)}. Run belfry daemon serve for a foreground diagnostic.`,
			}),
	});

const waitForStopped = (pid: number, timeoutMs: number): Effect.Effect<void, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: async () => {
			const started = Date.now();
			while (Date.now() - started < timeoutMs) {
				if (!processExists(pid)) return;
				await Bun.sleep(40);
			}
			throw new Error(`process ${pid} is still running`);
		},
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "stop_timeout",
				message: `The Daemon did not stop within ${timeoutMs} ms: ${errorMessage(cause)}`,
			}),
	});

const withFileLock = <A, E, R>(
	path: string,
	timeoutMs: number,
	effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E | DaemonLifecycleFailure, R> =>
	Effect.acquireUseRelease(
		acquireStartupLock(path, timeoutMs),
		() => effect,
		(handle) => Effect.promise(() => handle.close()).pipe(Effect.ensuring(removeIfExists(path)), Effect.ignore),
	);

const acquireStartupLock = (path: string, timeoutMs: number): Effect.Effect<FileHandle, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: async () => {
			const started = Date.now();
			while (Date.now() - started < timeoutMs) {
				try {
					const handle = await open(path, "wx", 0o600);
					await handle.writeFile(JSON.stringify({ pid: process.pid, startedAt: Date.now() }));
					return handle;
				} catch (cause) {
					if (!isFileCode(cause, "EEXIST")) throw cause;
					if (await lockIsStale(path, timeoutMs)) await unlink(path).catch(() => undefined);
					else await Bun.sleep(25);
				}
			}
			throw new Error("startup lock timed out");
		},
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: "start_timeout",
				message: `Could not acquire the Daemon startup lock: ${errorMessage(cause)}`,
			}),
	});

const acquireDaemonLock = (path: string): Effect.Effect<FileHandle, DaemonLifecycleFailure> =>
	Effect.tryPromise({
		try: () => open(path, "wx", 0o600),
		catch: (cause) =>
			new DaemonLifecycleFailure({
				code: isFileCode(cause, "EEXIST") ? "already_running" : "state_unavailable",
				message: isFileCode(cause, "EEXIST")
					? `A Daemon lock already exists at ${path}. Run belfry daemon status before removing a stale lock.`
					: `Could not create the Daemon lock: ${errorMessage(cause)}`,
			}),
	});

const releaseDaemonLock = (handle: FileHandle, path: string) =>
	Effect.promise(() => handle.close()).pipe(Effect.ensuring(removeIfExists(path)), Effect.ignore);

const cleanupStaleFiles = (config: BelfryConfiguration) =>
	Effect.gen(function* () {
		yield* removeIfExists(config.daemon.registryPath);
		if (yield* Effect.promise(() => lockIsStale(config.daemon.lockPath, config.daemon.startupTimeoutMs))) {
			yield* removeIfExists(config.daemon.lockPath);
		}
	});

const removeRegistryIfOwned = (path: string, nonce: string) =>
	readRegistry(path).pipe(
		Effect.flatMap((registry) => (registry?.nonce === nonce ? removeIfExists(path) : Effect.void)),
		Effect.ignore,
	);

const removeIfExists = (path: string): Effect.Effect<void> =>
	Effect.promise(() => unlink(path).catch(() => undefined)).pipe(Effect.asVoid);

const lockIsStale = async (path: string, timeoutMs: number): Promise<boolean> => {
	try {
		const contents = await readFile(path, "utf8");
		try {
			const parsed = JSON.parse(contents) as { pid?: unknown };
			if (typeof parsed.pid === "number") return !processExists(parsed.pid);
		} catch {
			// A crashed owner can leave an empty or partial lock; age is the bounded recovery signal.
		}
		const metadata = await stat(path);
		return Date.now() - metadata.mtimeMs > Math.max(timeoutMs, 5_000);
	} catch (cause) {
		return isFileCode(cause, "ENOENT");
	}
};

const processExists = (pid: number): boolean => {
	try {
		process.kill(pid, 0);
		return true;
	} catch (cause) {
		return isFileCode(cause, "EPERM");
	}
};

const isFileCode = (cause: unknown, code: string): boolean =>
	typeof cause === "object" && cause !== null && "code" in cause && cause.code === code;

const errorMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : String(cause));
