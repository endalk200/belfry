import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const cliEntry = join(repository, "apps/cli/src/bin.ts");

describe("machine-wide Daemon lifecycle", () => {
	it("starts, adopts, survives clients, restarts with persisted data, and stops cleanly", async () => {
		const stateDirectory = mkdtempSync(join(tmpdir(), "belfry-lifecycle-"));
		const configPath = join(stateDirectory, "config.toml");
		writeFileSync(configPath, "");
		const port = await availablePort();
		const env = {
			...process.env,
			BELFRY_CONFIG_PATH: configPath,
			BELFRY_STATE_DIRECTORY: stateDirectory,
			BELFRY_DAEMON_PORT: String(port),
			BELFRY_TELEMETRY: "false",
			NO_COLOR: "1",
		};
		const traceStartNs = BigInt(Date.now()) * 1_000_000n;
		let running = false;
		try {
			const concurrentStarts = await Promise.all([
				runCliAsync(["daemon", "start", "--json"], env),
				runCliAsync(["daemon", "start", "--json"], env),
			]);
			const first = concurrentStarts.find((result) => result.adopted === false);
			const concurrentAdoption = concurrentStarts.find((result) => result.adopted === true);
			assert.isDefined(first);
			assert.isDefined(concurrentAdoption);
			assert.strictEqual(concurrentAdoption.pid, first.pid);
			running = true;
			assert.strictEqual(first.adopted, false);
			assert.strictEqual(first.state, "running");
			assert.strictEqual(first.endpoint, `http://127.0.0.1:${port}`);

			writeFileSync(join(stateDirectory, "daemon.json"), "{corrupt registry");
			const recoveredStatus = runCli(["daemon", "status", "--json"], env);
			assert.strictEqual(recoveredStatus.state, "running");
			assert.strictEqual(recoveredStatus.pid, first.pid);
			const recoveredStart = runCli(["daemon", "start", "--json"], env);
			assert.strictEqual(recoveredStart.adopted, true);
			assert.strictEqual(recoveredStart.pid, first.pid);

			const adopted = runCli(["daemon", "start", "--json"], env);
			assert.strictEqual(adopted.adopted, true);
			assert.strictEqual(adopted.pid, first.pid);

			const status = runCli(["daemon", "status", "--json"], env);
			assert.strictEqual(status.pid, first.pid);
			assert.strictEqual(status.nonce, first.nonce);
			const blockedMaintenance = runCliRaw(["database", "checkpoint", "--json"], env);
			assert.notStrictEqual(blockedMaintenance.status, 0);
			assert.match(
				`${blockedMaintenance.stdout}\n${blockedMaintenance.stderr}`,
				/daemon.*healthy|running|stop the daemon/iu,
			);

			const ingest = await fetch(`http://127.0.0.1:${port}/v1/traces`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(tracePayload(traceStartNs)),
			});
			assert.strictEqual(ingest.status, 200);
			assert.strictEqual((await searchTraces(port, traceStartNs)).items.length, 1);

			const restarted = runCli(["daemon", "restart", "--json"], env);
			assert.strictEqual(restarted.state, "running");
			assert.notStrictEqual(restarted.pid, first.pid);
			assert.strictEqual(
				(await searchTraces(port, traceStartNs)).items[0]?.traceId,
				"4bf92f3577b34da6a3ce929d0e0e4736",
			);

			const stopped = runCli(["daemon", "stop", "--json"], env);
			running = false;
			assert.strictEqual(stopped.state, "stopped");
			assert.strictEqual(existsSync(join(stateDirectory, "daemon.json")), false);
			assert.strictEqual(existsSync(join(stateDirectory, "telemetry.db")), true);
			const checkpointed = runCli(["database", "checkpoint", "--json"], env);
			assert.strictEqual(checkpointed.state, "checkpointed");
		} finally {
			if (running) runCli(["daemon", "stop", "--json"], env, true);
		}
	}, 30_000);
});

const runCli = (
	args: ReadonlyArray<string>,
	env: Record<string, string | undefined>,
	ignoreFailure = false,
): Record<string, unknown> => {
	const child = runCliRaw(args, env);
	if (child.status !== 0 && !ignoreFailure) {
		throw new Error(
			`CLI ${args.join(" ")} failed (${child.status ?? "signal"}).\n${child.stdout}\n${child.stderr}`,
		);
	}
	const line = child.stdout
		.trim()
		.split("\n")
		.reverse()
		.find((candidate) => candidate.startsWith("{"));
	return line === undefined ? {} : (JSON.parse(line) as Record<string, unknown>);
};

const runCliRaw = (args: ReadonlyArray<string>, env: Record<string, string | undefined>) =>
	spawnSync("bun", ["--conditions=development", "run", cliEntry, ...args], {
		cwd: repository,
		encoding: "utf8",
		env,
		timeout: 20_000,
	});

const runCliAsync = async (
	args: ReadonlyArray<string>,
	env: Record<string, string | undefined>,
): Promise<Record<string, unknown>> => {
	const child = spawn("bun", ["--conditions=development", "run", cliEntry, ...args], {
		cwd: repository,
		env,
		stdio: ["ignore", "pipe", "pipe"],
	});
	const [stdout, stderr, status] = await Promise.all([
		readOutput(child.stdout),
		readOutput(child.stderr),
		new Promise<number>((resolve, reject) => {
			const timeout = setTimeout(() => {
				child.kill("SIGKILL");
				reject(new Error(`CLI ${args.join(" ")} timed out.`));
			}, 20_000);
			child.once("error", (cause) => {
				clearTimeout(timeout);
				reject(cause);
			});
			child.once("close", (code, signal) => {
				clearTimeout(timeout);
				if (code === null) reject(new Error(`CLI ${args.join(" ")} exited by ${signal ?? "signal"}.`));
				else resolve(code);
			});
		}),
	]);
	if (status !== 0) throw new Error(`CLI ${args.join(" ")} failed (${status}).\n${stdout}\n${stderr}`);
	const line = stdout
		.trim()
		.split("\n")
		.reverse()
		.find((candidate) => candidate.startsWith("{"));
	if (line === undefined) throw new Error(`CLI ${args.join(" ")} returned no JSON.\n${stdout}`);
	return JSON.parse(line) as Record<string, unknown>;
};

const readOutput = (stream: Readable): Promise<string> =>
	new Promise((resolve, reject) => {
		let output = "";
		stream.setEncoding("utf8");
		stream.on("data", (chunk: string) => {
			output += chunk;
		});
		stream.once("end", () => resolve(output));
		stream.once("error", reject);
	});

const searchTraces = async (port: number, traceStartNs: bigint) => {
	let response: Response | undefined;
	let lastError: unknown;
	for (let attempt = 0; attempt < 5; attempt += 1) {
		try {
			response = await fetch(`http://127.0.0.1:${port}/api/traces/search`, {
				method: "POST",
				headers: { "content-type": "application/json", connection: "close" },
				body: JSON.stringify({
					fromNs: (traceStartNs - 60_000_000_000n).toString(),
					toNs: (traceStartNs + 60_000_000_000n).toString(),
					services: [],
					attributes: [],
					sort: "newest",
					limit: 100,
				}),
			});
			break;
		} catch (error) {
			lastError = error;
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}
	if (response === undefined) throw lastError;
	if (!response.ok) throw new Error(`Trace search failed: ${response.status} ${await response.text()}`);
	return (await response.json()) as { items: Array<{ traceId: string }> };
};

const availablePort = (): Promise<number> =>
	new Promise((resolve, reject) => {
		const server = createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address === null || typeof address === "string") {
				server.close();
				reject(new Error("Could not allocate a lifecycle test port."));
				return;
			}
			server.close((error) => (error === undefined ? resolve(address.port) : reject(error)));
		});
	});

const tracePayload = (startTimeNs: bigint) => ({
	resourceSpans: [
		{
			resource: {
				attributes: [
					{ key: "service.name", value: { stringValue: "lifecycle" } },
					{ key: "deployment.environment.name", value: { stringValue: "test" } },
				],
			},
			scopeSpans: [
				{
					spans: [
						{
							traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
							spanId: "00f067aa0ba902b7",
							name: "lifecycle",
							startTimeUnixNano: startTimeNs.toString(),
							endTimeUnixNano: (startTimeNs + 1_000_000n).toString(),
						},
					],
				},
			],
		},
	],
});
