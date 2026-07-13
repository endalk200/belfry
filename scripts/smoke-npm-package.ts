import { spawnSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..");
const cliRoot = join(repoRoot, "apps", "cli");
const packageJson = (await Bun.file(join(cliRoot, "package.json")).json()) as { readonly version: string };
const smokeRoot = await mkdtemp(join(tmpdir(), "belfry-cli-smoke-"));
const npmCache = join(smokeRoot, ".npm-cache");

const execute = (
	command: string,
	args: ReadonlyArray<string>,
	cwd: string,
	environment: Readonly<Record<string, string>> = {},
): ReturnType<typeof spawnSync> =>
	spawnSync(command, [...args], {
		cwd,
		encoding: "utf8",
		env: {
			...process.env,
			NPM_CONFIG_CACHE: npmCache,
			...environment,
		},
		stdio: ["ignore", "pipe", "pipe"],
	});

const run = (
	command: string,
	args: ReadonlyArray<string>,
	cwd: string,
	environment: Readonly<Record<string, string>> = {},
) => {
	const result = execute(command, args, cwd, environment);

	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} failed:\n${result.stderr}\n${result.stdout}`);
	}

	return (typeof result.stdout === "string" ? result.stdout : result.stdout.toString("utf8")).trim();
};

const packOutput = run("npm", ["pack", "--json", "--pack-destination", smokeRoot, cliRoot], repoRoot);
const [packedPackage] = JSON.parse(packOutput) as Array<{ readonly filename: string }>;
if (packedPackage === undefined) throw new Error("npm pack did not report a package artifact.");
const tarballPath = join(smokeRoot, packedPackage.filename);

run("bun", ["init", "-y"], smokeRoot);
run("bun", ["add", tarballPath], smokeRoot);

const binPath = join(smokeRoot, "node_modules", ".bin", "belfry");
const actualVersion = run("bun", [binPath, "version"], smokeRoot);

if (actualVersion !== packageJson.version) {
	throw new Error(`Expected belfry version to print ${packageJson.version}, got ${actualVersion}.`);
}

const flagVersion = run("bun", [binPath, "--version"], smokeRoot);

if (!flagVersion.includes(packageJson.version)) {
	throw new Error(`Expected belfry --version to include ${packageJson.version}, got ${flagVersion}.`);
}

const configPath = run("bun", [binPath, "config", "path"], smokeRoot);
const normalizedConfigPath = configPath.replaceAll("\\", "/");

if (!normalizedConfigPath.endsWith("/.belfry/config.toml")) {
	throw new Error(`Expected config path smoke test to print the default config path, got ${configPath}.`);
}

const databasePath = run("bun", [binPath, "database", "path"], smokeRoot);

if (!databasePath.endsWith("telemetry.db")) {
	throw new Error(`Expected database path smoke test to identify telemetry.db, got ${databasePath}.`);
}

const port = await availablePort();
const stateDirectory = join(smokeRoot, "state");
const isolatedConfigPath = join(smokeRoot, "belfry.toml");
await Bun.write(isolatedConfigPath, "[interfaces]\nweb_open_browser = false\n");
const isolatedEnvironment = {
	BELFRY_CONFIG_PATH: isolatedConfigPath,
	BELFRY_DAEMON_PORT: String(port),
	BELFRY_DATABASE_PATH: join(stateDirectory, "telemetry.db"),
	BELFRY_STATE_DIRECTORY: stateDirectory,
};
let workspaceStarted = false;
try {
	const workspace = run("bun", [binPath], smokeRoot, isolatedEnvironment);
	workspaceStarted = true;
	const expectedWorkspace = `Belfry web Workspace: http://127.0.0.1:${port}/traces`;
	if (workspace !== expectedWorkspace) {
		throw new Error(`Expected bare belfry to print ${expectedWorkspace}, got ${workspace}.`);
	}
} finally {
	if (workspaceStarted) run("bun", [binPath, "daemon", "stop", "--json"], smokeRoot, isolatedEnvironment);
}

const occupied = await occupyPort();
try {
	const failedStateDirectory = join(smokeRoot, "failed-state");
	const failed = execute("bun", [binPath], smokeRoot, {
		...isolatedEnvironment,
		BELFRY_DAEMON_PORT: String(occupied.port),
		BELFRY_DATABASE_PATH: join(failedStateDirectory, "telemetry.db"),
		BELFRY_STATE_DIRECTORY: failedStateDirectory,
	});
	if (failed.status === 0) throw new Error("Expected bare belfry to exit non-zero when Daemon startup fails.");
	if (!`${failed.stderr}\n${failed.stdout}`.includes("The Daemon did not become healthy")) {
		throw new Error(`Expected stable Daemon startup failure output, got:\n${failed.stderr}\n${failed.stdout}`);
	}
} finally {
	await occupied.close();
}

console.log(`Smoke-tested @belfry/cli@${packageJson.version} from ${packedPackage.filename}.`);

function availablePort(): Promise<number> {
	return new Promise((resolvePort, reject) => {
		const server = createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address === null || typeof address === "string") {
				server.close();
				reject(new Error("Could not reserve a smoke-test port."));
				return;
			}
			server.close((error) => (error === undefined ? resolvePort(address.port) : reject(error)));
		});
	});
}

function occupyPort(): Promise<{ readonly port: number; readonly close: () => Promise<void> }> {
	return new Promise((resolvePort, reject) => {
		const server = createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address === null || typeof address === "string") {
				server.close();
				reject(new Error("Could not occupy a smoke-test port."));
				return;
			}
			resolvePort({
				port: address.port,
				close: () =>
					new Promise((resolveClose, rejectClose) =>
						server.close((error) => (error === undefined ? resolveClose() : rejectClose(error))),
					),
			});
		});
	});
}
