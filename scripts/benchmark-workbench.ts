import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { arch, cpus, freemem, platform, release, tmpdir, totalmem } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = resolve(projectRoot, "apps/cli/dist/bin.js");
const packageJson = JSON.parse(await readFile(resolve(projectRoot, "apps/cli/package.json"), "utf8")) as {
	version: string;
};
const lifecycleRepetitions = 3;
const ingestRepetitions = 3;
const queryRepetitions = 20;
const traceCount = 100;
const spansPerTrace = 64;
const spanCount = traceCount * spansPerTrace;
const logCount = 8_000;
const largeTraceSpanCount = 1_000;
const largeTraceId = "ffffffffffffffffffffffffffffffff";

async function main() {
	if (!existsSync(cliPath)) {
		throw new Error(`Built CLI not found at ${cliPath}. Run bun run --filter @belfry/cli build first.`);
	}
	if (platform() !== "darwin") {
		throw new Error(
			"The checked-in reference benchmark currently requires macOS /usr/bin/expect for real PTY timing.",
		);
	}

	const coldFirstFrameSamples: Array<number> = [];
	for (let repetition = 0; repetition < lifecycleRepetitions; repetition += 1) {
		const runtime = await temporaryRuntime("belfry-cold-");
		try {
			const tui = await openTui(runtime.env);
			coldFirstFrameSamples.push(tui.firstFrameMs);
			await closeTui(tui);
			await runCli(runtime.env, ["daemon", "stop", "--json"]).catch(() => undefined);
		} finally {
			await rm(runtime.stateDirectory, { recursive: true, force: true });
		}
	}

	const runtime = await temporaryRuntime("belfry-benchmark-");
	const endpoint = `http://127.0.0.1:${runtime.port}`;
	const daemon = Bun.spawn([process.execPath, cliPath, "daemon", "serve"], {
		cwd: projectRoot,
		env: runtime.env,
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
	});
	const daemonStdout = new Response(daemon.stdout as ReadableStream<Uint8Array>).text();
	const daemonStderr = new Response(daemon.stderr as ReadableStream<Uint8Array>).text();

	try {
		const daemonReadyMs = await waitForHealth(endpoint, daemon);
		const idleDaemonRssKb = await processTreeRssKb(daemon.pid);

		const warmAdoptionSamples: Array<number> = [];
		for (let repetition = 0; repetition < 5; repetition += 1) {
			warmAdoptionSamples.push(
				(await timed(() => runCli(runtime.env, ["daemon", "start", "--json"]))).durationMs,
			);
		}

		const warmTui = await openTui(runtime.env);
		await Bun.sleep(250);
		const idleTuiRssKb = await processTreeRssKb(warmTui.child.pid);
		const warmFirstFrameMs = warmTui.firstFrameMs;
		await closeTui(warmTui);

		const baseNs = BigInt(Date.now()) * 1_000_000n - 120_000_000_000n;
		const queryFromNs = baseNs - 10_000_000_000n;
		const queryToNs = BigInt(Date.now()) * 1_000_000n + 10_000_000_000n;
		const traceBody = JSON.stringify(tracePayload(baseNs));
		const logBody = JSON.stringify(logPayload(baseNs + 1_000_000_000n));
		const largeTraceBody = JSON.stringify(largeTracePayload(baseNs + 100_000_000_000n));
		assertRequestSize(traceBody, "trace");
		assertRequestSize(logBody, "log");
		assertRequestSize(largeTraceBody, "large trace");

		const traceIngestMs = (await timed(() => postOtlp(endpoint, "traces", traceBody))).durationMs;

		const traceQuery = {
			fromNs: queryFromNs.toString(),
			toNs: queryToNs.toString(),
			services: [],
			attributes: [],
			sort: "newest",
			limit: 100,
		};
		const responsivenessPromise = Promise.all(
			Array.from({ length: 8 }, async () => {
				const health = await timed(() => getJson(`${endpoint}/api/health`));
				const query = await timed(() => postJson(`${endpoint}/api/traces/search`, traceQuery));
				return { healthMs: health.durationMs, queryMs: query.durationMs };
			}),
		);
		const logIngest = await timed(() => postOtlp(endpoint, "logs", logBody));
		const responsiveness = await responsivenessPromise;
		const queryUnderIngestMaxMs = Math.max(
			...responsiveness.flatMap((sample) => [sample.healthMs, sample.queryMs]),
		);
		const freshIngestion = [];
		for (let repetition = 0; repetition < ingestRepetitions; repetition += 1) {
			freshIngestion.push(await measureFreshIngestion(traceBody, logBody));
		}
		const traceIngestSamples = freshIngestion.map(({ traceMs }) => traceMs);
		const logIngestSamples = freshIngestion.map(({ logMs }) => logMs);

		await postOtlp(endpoint, "traces", largeTraceBody);

		const queryMeasurements = {
			traces: await measureRepeated(
				() => postJson(`${endpoint}/api/traces/search`, traceQuery),
				queryRepetitions,
			),
			traceText: await measureRepeated(
				() => postJson(`${endpoint}/api/traces/search`, { ...traceQuery, text: "benchmark checkout" }),
				queryRepetitions,
			),
			logs: await measureRepeated(
				() =>
					postJson(`${endpoint}/api/logs/search`, {
						fromNs: queryFromNs.toString(),
						toNs: queryToNs.toString(),
						services: [],
						attributes: [],
						sort: "newest",
						limit: 100,
					}),
				queryRepetitions,
			),
			logText: await measureRepeated(
				() =>
					postJson(`${endpoint}/api/logs/search`, {
						fromNs: queryFromNs.toString(),
						toNs: queryToNs.toString(),
						services: [],
						text: "benchmark order complete",
						attributes: [],
						sort: "newest",
						limit: 100,
					}),
				queryRepetitions,
			),
		};
		const largeTraceQuery = await measureRepeated(() => getJson(`${endpoint}/api/traces/${largeTraceId}`), 10);

		const browserMeasurement = await measureBrowser(endpoint);
		const postWorkloadProcessTree = await processTreeSnapshot(daemon.pid);
		const postWorkloadDaemonRssKb = postWorkloadProcessTree.rssKb;
		const postWorkloadListenerCount = await listenerCount(postWorkloadProcessTree.pids);
		const healthBeforeRepeatedIngest = (await getJson(`${endpoint}/api/health`)) as {
			queueDepth: number;
			queueBytes: string;
			databaseSizeBytes: string;
		};
		for (let repetition = 0; repetition < 3; repetition += 1) {
			await postOtlp(endpoint, "traces", traceBody);
		}
		await Bun.sleep(500);
		const repeatedIngestProcessTree = await processTreeSnapshot(daemon.pid);
		const repeatedIngestDaemonRssKb = repeatedIngestProcessTree.rssKb;
		const repeatedIngestListenerCount = await listenerCount(repeatedIngestProcessTree.pids);
		const healthAfterRepeatedIngest = (await getJson(`${endpoint}/api/health`)) as {
			queueDepth: number;
			queueBytes: string;
			databaseSizeBytes: string;
		};

		const queryMedianMaxMs = Math.max(
			...Object.values(queryMeasurements).map((measurement) => measurement.medianMs),
		);
		const queryP95MaxMs = Math.max(...Object.values(queryMeasurements).map((measurement) => measurement.p95Ms));
		const databaseGrowthBytes = Number(
			BigInt(healthAfterRepeatedIngest.databaseSizeBytes) - BigInt(healthBeforeRepeatedIngest.databaseSizeBytes),
		);
		const thresholds = {
			coldDaemonAndTui: threshold(median(coldFirstFrameSamples), 750),
			warmAdoption: threshold(median(warmAdoptionSamples), 250),
			traceIngest: threshold(median(traceIngestSamples), 2_000),
			logIngest: threshold(median(logIngestSamples), 500),
			recentQueryMedian: threshold(queryMedianMaxMs, 100),
			recentQueryP95: threshold(queryP95MaxMs, 250),
			largeTraceQuery: threshold(largeTraceQuery.medianMs, 250),
			largeTraceInteractive: threshold(browserMeasurement.largeTraceInteractiveMs, 500),
			queryUnderIngest: threshold(queryUnderIngestMaxMs, 250),
			daemonRssGrowthUnderRepeatedIngest: threshold(
				(repeatedIngestDaemonRssKb - postWorkloadDaemonRssKb) / 1_024,
				64,
				"MB",
			),
			webHeapGrowth: threshold(browserMeasurement.heapGrowthMb, 20, "MB"),
			daemonProcessCountGrowth: atMost(
				repeatedIngestProcessTree.processCount - postWorkloadProcessTree.processCount,
				0,
				"processes",
			),
			listenerCountGrowth: atMost(repeatedIngestListenerCount - postWorkloadListenerCount, 0, "listeners"),
			databaseGrowthUnderRepeatedUpsert: threshold(databaseGrowthBytes, 4 * 1_024 * 1_024, "bytes"),
			queueDepthAfterRepeatedIngest: atMost(healthAfterRepeatedIngest.queueDepth, 0, "requests"),
			queueBytesAfterRepeatedIngest: atMost(Number(healthAfterRepeatedIngest.queueBytes), 0, "bytes"),
		};
		const passed = Object.values(thresholds).every((result) => result.pass);

		const results = {
			schemaVersion: 2,
			generatedAt: new Date().toISOString(),
			passed,
			product: {
				package: `@belfry/cli@${packageJson.version}`,
				runtime: `Bun ${Bun.version}`,
				publicEntry: "apps/cli/dist/bin.js",
			},
			referenceEnvironment: {
				platform: `${platform()} ${release()} ${arch()}`,
				cpu: cpus()[0]?.model ?? "unknown",
				logicalCpus: cpus().length,
				totalMemoryMb: Math.round(totalmem() / 1_048_576),
				freeMemoryMbAtReport: Math.round(freemem() / 1_048_576),
			},
			dataset: {
				traces: traceCount,
				spans: spanCount,
				logs: logCount,
				largeTraceSpans: largeTraceSpanCount,
				traceRequestBytes: Buffer.byteLength(traceBody),
				logRequestBytes: Buffer.byteLength(logBody),
				largeTraceRequestBytes: Buffer.byteLength(largeTraceBody),
			},
			lifecycle: {
				coldFirstFrameMs: summarize(coldFirstFrameSamples),
				warmAdoptionMs: summarize(warmAdoptionSamples),
				warmFirstFrameMs,
				foregroundDaemonReadyMs: daemonReadyMs,
			},
			ingestion: {
				traceIngestMs: summarize(traceIngestSamples),
				logIngestMs: summarize(logIngestSamples),
				primaryDatasetSetup: {
					traceMs: traceIngestMs,
					logWithConcurrentQueriesMs: logIngest.durationMs,
				},
				queryUnderIngestMaxMs,
				queueDepthAfter: healthAfterRepeatedIngest.queueDepth,
				queueBytesAfter: healthAfterRepeatedIngest.queueBytes,
				databaseSizeBytesBeforeRepeatedIngest: healthBeforeRepeatedIngest.databaseSizeBytes,
				databaseSizeBytesAfterRepeatedIngest: healthAfterRepeatedIngest.databaseSizeBytes,
				databaseGrowthBytes,
			},
			queries: {
				...queryMeasurements,
				largeTrace: largeTraceQuery,
			},
			interface: browserMeasurement,
			memory: {
				idleDaemonRssMb: idleDaemonRssKb / 1_024,
				postWorkloadDaemonRssMb: postWorkloadDaemonRssKb / 1_024,
				repeatedIngestDaemonRssMb: repeatedIngestDaemonRssKb / 1_024,
				repeatedIngestGrowthMb: (repeatedIngestDaemonRssKb - postWorkloadDaemonRssKb) / 1_024,
				postWorkloadProcessCount: postWorkloadProcessTree.processCount,
				repeatedIngestProcessCount: repeatedIngestProcessTree.processCount,
				postWorkloadListenerCount,
				repeatedIngestListenerCount,
				idleTuiProcessTreeRssMb: idleTuiRssKb / 1_024,
				idleWebHeapMb: browserMeasurement.idleHeapMb,
			},
			thresholds,
		};

		console.log(JSON.stringify(results, null, 2));
		if (!passed) process.exitCode = 1;
	} finally {
		if (daemon.exitCode === null) daemon.kill("SIGTERM");
		await Promise.race([daemon.exited, Bun.sleep(5_000)]);
		if (daemon.exitCode === null) daemon.kill("SIGKILL");
		await rm(runtime.stateDirectory, { recursive: true, force: true });
		await Promise.all([daemonStdout, daemonStderr]);
	}
}

type Runtime = {
	readonly stateDirectory: string;
	readonly port: number;
	readonly env: Record<string, string | undefined>;
};

type OpenTui = {
	readonly child: ReturnType<typeof Bun.spawn>;
	readonly reader: ReadableStreamDefaultReader<Uint8Array>;
	readonly stderr: Promise<string>;
	readonly firstFrameMs: number;
	readonly capture: string;
};

const temporaryRuntime = async (prefix: string): Promise<Runtime> => {
	const stateDirectory = await mkdtemp(join(tmpdir(), prefix));
	const port = await availablePort();
	return {
		stateDirectory,
		port,
		env: {
			...process.env,
			BELFRY_STATE_DIRECTORY: stateDirectory,
			BELFRY_DATABASE_PATH: join(stateDirectory, "telemetry.db"),
			BELFRY_DAEMON_PORT: String(port),
			NO_COLOR: "1",
		},
	};
};

const availablePort = (): Promise<number> =>
	new Promise((resolvePort, reject) => {
		const server = createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address === null || typeof address === "string") {
				server.close();
				reject(new Error("Could not reserve a benchmark port."));
				return;
			}
			server.close((error) => (error === undefined ? resolvePort(address.port) : reject(error)));
		});
	});

const measureFreshIngestion = async (
	traceBody: string,
	logBody: string,
): Promise<{ readonly traceMs: number; readonly logMs: number }> => {
	const runtime = await temporaryRuntime("belfry-ingest-benchmark-");
	const endpoint = `http://127.0.0.1:${runtime.port}`;
	const daemon = Bun.spawn([process.execPath, cliPath, "daemon", "serve"], {
		cwd: projectRoot,
		env: runtime.env,
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
	});
	const stdout = new Response(daemon.stdout as ReadableStream<Uint8Array>).text();
	const stderr = new Response(daemon.stderr as ReadableStream<Uint8Array>).text();
	try {
		await waitForHealth(endpoint, daemon);
		const traceMs = (await timed(() => postOtlp(endpoint, "traces", traceBody))).durationMs;
		const logMs = (await timed(() => postOtlp(endpoint, "logs", logBody))).durationMs;
		return { traceMs, logMs };
	} finally {
		if (daemon.exitCode === null) daemon.kill("SIGTERM");
		await Promise.race([daemon.exited, Bun.sleep(5_000)]);
		if (daemon.exitCode === null) daemon.kill("SIGKILL");
		await rm(runtime.stateDirectory, { recursive: true, force: true });
		await Promise.all([stdout, stderr]);
	}
};

const runCli = async (env: Runtime["env"], args: ReadonlyArray<string>): Promise<string> => {
	const child = Bun.spawn([process.execPath, cliPath, ...args], {
		cwd: projectRoot,
		env,
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(child.stdout as ReadableStream<Uint8Array>).text(),
		new Response(child.stderr as ReadableStream<Uint8Array>).text(),
		child.exited,
	]);
	if (exitCode !== 0) throw new Error(`belfry ${args.join(" ")} failed (${exitCode}): ${stderr || stdout}`);
	return stdout;
};

const openTui = async (env: Runtime["env"]): Promise<OpenTui> => {
	const startedAt = performance.now();
	const expectProgram = `
		log_user 1
		set timeout 10
		spawn -noecho {${process.execPath}} {${cliPath}}
		expect {
			-re {BELFRY} {}
			timeout { puts stderr "Timed out waiting for BELFRY"; exit 124 }
			eof { puts stderr "Belfry exited before its first frame"; exit 125 }
		}
		puts "__BELFRY_FIRST_FRAME__"
		flush stdout
		expect_user -re {q}
		send -- "q"
		expect eof
	`;
	const child = Bun.spawn(["/usr/bin/expect", "-c", expectProgram], {
		cwd: projectRoot,
		env,
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
	});
	const reader = (child.stdout as ReadableStream<Uint8Array>).getReader();
	const stderr = new Response(child.stderr as ReadableStream<Uint8Array>).text();
	const decoder = new TextDecoder();
	let capture = "";
	const deadline = Date.now() + 10_000;
	while (!capture.includes("__BELFRY_FIRST_FRAME__")) {
		const remaining = deadline - Date.now();
		if (remaining <= 0) throw new Error(`Timed out waiting for the public TUI frame. ${capture.slice(-1_000)}`);
		const chunk = await Promise.race([
			reader.read(),
			new Promise<undefined>((resolveTimeout) => setTimeout(resolveTimeout, remaining)),
		]);
		if (chunk === undefined)
			throw new Error(`Timed out waiting for the public TUI frame. ${capture.slice(-1_000)}`);
		if (chunk.done) {
			throw new Error(
				`The public TUI exited before its first frame. ${capture.slice(-1_000)} ${(await stderr).slice(-1_000)}`,
			);
		}
		capture += decoder.decode(chunk.value, { stream: true });
	}
	return { child, reader, stderr, firstFrameMs: performance.now() - startedAt, capture };
};

const closeTui = async (tui: OpenTui): Promise<void> => {
	const stdin = tui.child.stdin;
	if (stdin !== undefined && typeof stdin !== "number") {
		stdin.write("q");
		stdin.flush();
		stdin.end();
	}
	await Promise.race([tui.child.exited, Bun.sleep(5_000)]);
	if (tui.child.exitCode === null) tui.child.kill("SIGTERM");
	await tui.reader.cancel().catch(() => undefined);
	await tui.stderr;
};

const waitForHealth = async (endpoint: string, child: ReturnType<typeof Bun.spawn>): Promise<number> => {
	const startedAt = performance.now();
	const deadline = Date.now() + 10_000;
	while (Date.now() < deadline) {
		if (child.exitCode !== null) throw new Error(`Foreground Daemon exited with ${child.exitCode}.`);
		try {
			const response = await fetch(`${endpoint}/api/health`, { signal: AbortSignal.timeout(300) });
			if (response.ok) return performance.now() - startedAt;
		} catch {
			// The socket is expected to refuse connections until Bun starts listening.
		}
		await Bun.sleep(20);
	}
	throw new Error("Foreground Daemon did not become ready within ten seconds.");
};

const postOtlp = async (endpoint: string, signal: "traces" | "logs", body: string): Promise<void> => {
	const response = await fetch(`${endpoint}/v1/${signal}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body,
	});
	if (!response.ok) throw new Error(`OTLP ${signal} returned ${response.status}: ${await response.text()}`);
};

const getJson = async (url: string): Promise<unknown> => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`GET ${url} returned ${response.status}: ${await response.text()}`);
	return response.json();
};

const postJson = async (url: string, body: unknown): Promise<unknown> => {
	const response = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!response.ok) throw new Error(`POST ${url} returned ${response.status}: ${await response.text()}`);
	return response.json();
};

const timed = async <A>(operation: () => Promise<A>): Promise<{ readonly value: A; readonly durationMs: number }> => {
	const startedAt = performance.now();
	const value = await operation();
	return { value, durationMs: performance.now() - startedAt };
};

const measureRepeated = async (
	operation: () => Promise<unknown>,
	repetitions: number,
): Promise<{ readonly medianMs: number; readonly p95Ms: number; readonly samplesMs: ReadonlyArray<number> }> => {
	for (let warmup = 0; warmup < 3; warmup += 1) await operation();
	const samples: Array<number> = [];
	for (let repetition = 0; repetition < repetitions; repetition += 1) {
		samples.push((await timed(operation)).durationMs);
	}
	return { medianMs: median(samples), p95Ms: percentile(samples, 0.95), samplesMs: samples };
};

const measureBrowser = async (endpoint: string) => {
	const browser = await chromium.launch({
		channel: "chrome",
		headless: true,
		args: ["--enable-precise-memory-info"],
	});
	try {
		const page = await browser.newPage({ viewport: { width: 1_440, height: 1_000 } });
		await page.goto(`${endpoint}/traces`);
		const largeTraceButton = page.getByRole("button", { name: "Open trace benchmark 1000-span trace" });
		await largeTraceButton.waitFor({ state: "visible" });
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("HeapProfiler.enable");
		await cdp.send("HeapProfiler.collectGarbage");
		const idleHeap = (await cdp.send("Runtime.getHeapUsage")) as { usedSize: number };
		const startedAt = performance.now();
		await largeTraceButton.click();
		await page.getByRole("heading", { name: "Span waterfall" }).waitFor({ state: "visible" });
		await page
			.getByRole("button", { name: "Inspect span benchmark 1000-span trace" })
			.waitFor({ state: "visible" });
		const largeTraceInteractiveMs = performance.now() - startedAt;
		const renderedWaterfallRows = await page.locator(".waterfall-row").count();
		await cdp.send("HeapProfiler.collectGarbage");
		const initialHeap = (await cdp.send("Runtime.getHeapUsage")) as { usedSize: number };
		for (let refresh = 0; refresh < 25; refresh += 1) {
			const completed = page.waitForResponse(
				(response) => response.url().includes("/api/traces/search") && response.request().method() === "POST",
			);
			await page.getByRole("button", { name: "Refresh now" }).click();
			await completed;
		}
		await cdp.send("HeapProfiler.collectGarbage");
		const finalHeap = (await cdp.send("Runtime.getHeapUsage")) as { usedSize: number };
		return {
			largeTraceInteractiveMs,
			renderedWaterfallRows,
			idleHeapMb: idleHeap.usedSize / 1_048_576,
			largeTraceHeapMb: initialHeap.usedSize / 1_048_576,
			finalHeapMb: finalHeap.usedSize / 1_048_576,
			heapGrowthMb: (finalHeap.usedSize - initialHeap.usedSize) / 1_048_576,
		};
	} finally {
		await browser.close();
	}
};

const processTreeSnapshot = async (
	rootPid: number,
): Promise<{ readonly rssKb: number; readonly processCount: number; readonly pids: ReadonlyArray<number> }> => {
	const process = Bun.spawn(["ps", "-axo", "pid=,ppid=,rss="], { stdout: "pipe", stderr: "ignore" });
	const output = await new Response(process.stdout as ReadableStream<Uint8Array>).text();
	await process.exited;
	const rows = output
		.trim()
		.split("\n")
		.map((line) => line.trim().split(/\s+/u).map(Number))
		.filter((row): row is [number, number, number] => row.length === 3 && row.every(Number.isFinite));
	const tree = new Set([rootPid]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const [pid, parentPid] of rows) {
			if (tree.has(parentPid) && !tree.has(pid)) {
				tree.add(pid);
				changed = true;
			}
		}
	}
	return {
		rssKb: rows.reduce((total, [pid, , rss]) => total + (tree.has(pid) ? rss : 0), 0),
		processCount: tree.size,
		pids: [...tree].sort((left, right) => left - right),
	};
};

const processTreeRssKb = async (rootPid: number): Promise<number> => (await processTreeSnapshot(rootPid)).rssKb;

const listenerCount = async (pids: ReadonlyArray<number>): Promise<number> => {
	const process = Bun.spawn(["/usr/sbin/lsof", "-nP", "-a", "-p", pids.join(","), "-iTCP", "-sTCP:LISTEN"], {
		stdout: "pipe",
		stderr: "ignore",
	});
	const output = await new Response(process.stdout as ReadableStream<Uint8Array>).text();
	const status = await process.exited;
	if (status !== 0 && status !== 1) throw new Error(`lsof listener inspection failed with status ${status}.`);
	return output.trim() === "" ? 0 : Math.max(0, output.trim().split("\n").length - 1);
};

const tracePayload = (baseNs: bigint) => ({
	resourceSpans: [
		{
			resource: { attributes: benchmarkResourceAttributes },
			scopeSpans: [
				{
					scope: { name: "belfry.benchmark.traces", version: "1.0.0" },
					spans: Array.from({ length: spanCount }, (_, index) => {
						const traceIndex = Math.floor(index / spansPerTrace);
						const spanIndex = index % spansPerTrace;
						const traceId = hexadecimalId(BigInt(traceIndex + 1), 32);
						const rootSpanId = hexadecimalId(BigInt(traceIndex * spansPerTrace + 1), 16);
						const startTimeNs = baseNs + BigInt(traceIndex * 1_000_000 + spanIndex * 10_000);
						return {
							traceId,
							spanId: hexadecimalId(BigInt(index + 1), 16),
							...(spanIndex === 0 ? {} : { parentSpanId: rootSpanId }),
							name: spanIndex === 0 ? `benchmark checkout ${traceIndex}` : `benchmark child ${spanIndex}`,
							kind: spanIndex === 0 ? 2 : 3,
							startTimeUnixNano: startTimeNs.toString(),
							endTimeUnixNano: (startTimeNs + BigInt(500_000 + spanIndex * 1_000)).toString(),
							attributes: [
								{
									key: "benchmark.group",
									value: { stringValue: traceIndex % 2 === 0 ? "even" : "odd" },
								},
								{ key: "benchmark.span_index", value: { intValue: spanIndex } },
							],
							status: { code: traceIndex % 10 === 0 && spanIndex === spansPerTrace - 1 ? 2 : 1 },
						};
					}),
				},
			],
		},
	],
});

const logPayload = (baseNs: bigint) => ({
	resourceLogs: [
		{
			resource: { attributes: benchmarkResourceAttributes },
			scopeLogs: [
				{
					scope: { name: "belfry.benchmark.logs", version: "1.0.0" },
					logRecords: Array.from({ length: logCount }, (_, index) => {
						const traceIndex = index % traceCount;
						const timestampNs = baseNs + BigInt(index * 10_000);
						return {
							timeUnixNano: timestampNs.toString(),
							observedTimeUnixNano: (timestampNs + 100n).toString(),
							severityNumber: index % 20 === 0 ? 17 : 9,
							severityText: index % 20 === 0 ? "ERROR" : "INFO",
							traceId: hexadecimalId(BigInt(traceIndex + 1), 32),
							spanId: hexadecimalId(BigInt(traceIndex * spansPerTrace + (index % spansPerTrace) + 1), 16),
							body: { stringValue: `benchmark order complete ${index}` },
							attributes: [
								{ key: "benchmark.group", value: { stringValue: index % 2 === 0 ? "even" : "odd" } },
								{ key: "benchmark.log_index", value: { intValue: index } },
							],
						};
					}),
				},
			],
		},
	],
});

const largeTracePayload = (baseNs: bigint) => {
	const rootSpanId = hexadecimalId(9_000_001n, 16);
	return {
		resourceSpans: [
			{
				resource: { attributes: benchmarkResourceAttributes },
				scopeSpans: [
					{
						scope: { name: "belfry.benchmark.large-trace", version: "1.0.0" },
						spans: Array.from({ length: largeTraceSpanCount }, (_, index) => {
							const startTimeNs = baseNs + BigInt(index * 10_000);
							return {
								traceId: largeTraceId,
								spanId: hexadecimalId(9_000_001n + BigInt(index), 16),
								...(index === 0 ? {} : { parentSpanId: rootSpanId }),
								name: index === 0 ? "benchmark 1000-span trace" : `large child ${index}`,
								kind: index === 0 ? 2 : 3,
								startTimeUnixNano: startTimeNs.toString(),
								endTimeUnixNano: (startTimeNs + 500_000n).toString(),
								attributes: [{ key: "benchmark.large", value: { boolValue: true } }],
								status: { code: 1 },
							};
						}),
					},
				],
			},
		],
	};
};

const benchmarkResourceAttributes = [
	{ key: "service.namespace", value: { stringValue: "belfry" } },
	{ key: "service.name", value: { stringValue: "benchmark" } },
	{ key: "deployment.environment.name", value: { stringValue: "reference" } },
];

const hexadecimalId = (value: bigint, length: number): string =>
	value.toString(16).padStart(length, "0").slice(-length);

const assertRequestSize = (body: string, label: string): void => {
	const bytes = Buffer.byteLength(body);
	if (bytes > 8 * 1_024 * 1_024)
		throw new Error(`${label} benchmark request is ${bytes} bytes and exceeds the default limit.`);
};

const median = (values: ReadonlyArray<number>): number => percentile(values, 0.5);

const percentile = (values: ReadonlyArray<number>, percentileValue: number): number => {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * percentileValue) - 1))] ?? 0;
};

const summarize = (values: ReadonlyArray<number>) => ({
	medianMs: median(values),
	p95Ms: percentile(values, 0.95),
	samplesMs: values,
});

const threshold = (actual: number, limit: number, unit = "ms") => ({
	actual,
	limit,
	unit,
	pass: actual < limit,
});

const atMost = (actual: number, limit: number, unit: string) => ({
	actual,
	limit,
	unit,
	pass: actual <= limit,
});

await main();
