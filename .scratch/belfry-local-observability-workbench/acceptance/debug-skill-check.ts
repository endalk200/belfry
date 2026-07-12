const cliPath = process.argv[2];
const skillPath = process.argv[3];
if (cliPath === undefined || skillPath === undefined) {
	throw new Error("Usage: bun debug-skill-check.ts <installed-belfry-executable-or-js> <installed-SKILL.md>");
}

const skill = await Bun.file(skillPath).text();
for (const required of [
	"belfry daemon status --json",
	"GET /api/health",
	"GET /api/services",
	"POST /api/traces/search",
	"GET /api/traces/{traceId}",
	"GET /api/traces/{traceId}/logs",
]) {
	if (!skill.includes(required)) throw new Error(`Installed Debugging Skill omits ${required}.`);
}

const cliPrefix = cliPath.endsWith(".js") ? ["bun", cliPath] : [cliPath];
const status = runCli([...cliPrefix, "daemon", "status", "--json"]);
const endpoint = stringField(status, "endpoint");
const nowNs = BigInt(Date.now()) * 1_000_000n;
const fromNs = nowNs - 30n * 60_000_000_000n;
const health = await requestJson(`${endpoint}/api/health`);
if (health.readsAvailable !== true) throw new Error(`Debugging Skill stopped at degraded read health: ${JSON.stringify(health)}`);

const services: Array<Record<string, unknown>> = [];
let serviceCursor: string | undefined;
do {
	const url = new URL("/api/services", endpoint);
	url.searchParams.set("fromNs", fromNs.toString());
	url.searchParams.set("toNs", nowNs.toString());
	url.searchParams.set("limit", "100");
	if (serviceCursor !== undefined) url.searchParams.set("cursor", serviceCursor);
	const page = await requestJson(url.toString());
	services.push(...arrayField(page, "items"));
	serviceCursor = page.truncated === true ? optionalStringField(page, "nextCursor") : undefined;
} while (serviceCursor !== undefined);
if (services.length === 0) throw new Error("Debugging Skill found no Services in the bounded acceptance window.");

const preferredName = process.env.BELFRY_ACCEPTANCE_SERVICE ?? "frontend";
const selectedSummary =
	services.find((item) => objectField(item, "service").name === preferredName) ?? services[0];
if (selectedSummary === undefined) throw new Error("Debugging Skill could not select a Service.");
const selectedService = objectField(selectedSummary, "service");
const baseTraceQuery = {
	fromNs: fromNs.toString(),
	toNs: nowNs.toString(),
	services: [selectedService],
	attributes: [],
	sort: "newest",
	limit: 100,
};
let tracePage = await postJson(`${endpoint}/api/traces/search`, { ...baseTraceQuery, status: "error" });
if (arrayField(tracePage, "items").length === 0) {
	tracePage = await postJson(`${endpoint}/api/traces/search`, baseTraceQuery);
}
const traceSummary = arrayField(tracePage, "items")[0];
if (traceSummary === undefined) throw new Error("Debugging Skill found no trace for the selected Service.");
const traceId = stringField(traceSummary, "traceId");
const trace = await requestJson(`${endpoint}/api/traces/${traceId}`);
const spans = arrayField(trace, "spans");
const failingSpan =
	spans.find((span) => objectField(span, "status").code === 2) ??
	spans.find((span) => optionalStringField(span, "spanId") === optionalStringField(trace, "rootSpanId")) ??
	spans[0];
const spanId = failingSpan === undefined ? undefined : optionalStringField(failingSpan, "spanId");

const logs: Array<Record<string, unknown>> = [];
let logCursor: string | undefined;
do {
	const url = new URL(`/api/traces/${traceId}/logs`, endpoint);
	url.searchParams.set("limit", "100");
	if (logCursor !== undefined) url.searchParams.set("cursor", logCursor);
	const page = await requestJson(url.toString());
	logs.push(...arrayField(page, "items"));
	logCursor = page.truncated === true ? optionalStringField(page, "nextCursor") : undefined;
} while (logCursor !== undefined);
if (logs.length === 0) {
	const page = await postJson(`${endpoint}/api/logs/search`, {
		fromNs: fromNs.toString(),
		toNs: nowNs.toString(),
		services: [],
		traceId,
		...(spanId === undefined ? {} : { spanId }),
		attributes: [],
		sort: "oldest",
		limit: 100,
	});
	logs.push(...arrayField(page, "items"));
}
if (logs.length === 0) throw new Error("Debugging Skill could not follow the selected trace into correlated logs.");

const selectedLog = logs[0] as Record<string, unknown>;
const digest = new Bun.CryptoHasher("sha256").update(skill).digest("hex");
console.log(
	JSON.stringify({
		result: "pass",
		installedSkill: skillPath,
		skillSha256: digest,
		lifecycleCommand: `${cliPath} daemon status --json`,
		endpoint,
		bounds: { fromNs: fromNs.toString(), toNs: nowNs.toString(), limit: 100 },
		service: selectedService,
		traceId,
		spanId,
		logId: stringField(selectedLog, "id"),
		logTimestampNs: optionalStringField(selectedLog, "timestampNs") ?? optionalStringField(selectedLog, "observedTimeNs"),
		conclusion: `The selected trace contains ${spans.length} spans and ${logs.length} correlated logs.`,
	}),
);

function runCli(command: ReadonlyArray<string>): Record<string, unknown> {
	const child = Bun.spawnSync(command, { cwd: process.cwd(), env: process.env, stdout: "pipe", stderr: "pipe" });
	const stdout = child.stdout.toString();
	if (child.exitCode !== 0) throw new Error(`${command.join(" ")} failed.\n${stdout}\n${child.stderr.toString()}`);
	const line = stdout
		.trim()
		.split("\n")
		.reverse()
		.find((candidate) => candidate.startsWith("{"));
	if (line === undefined) throw new Error(`No JSON status from ${command.join(" ")}.`);
	return JSON.parse(line) as Record<string, unknown>;
}

async function requestJson(url: string): Promise<Record<string, unknown>> {
	const response = await fetch(url);
	const body = (await response.json()) as Record<string, unknown>;
	if (!response.ok) throw new Error(`${response.status} from ${url}: ${JSON.stringify(body)}`);
	return body;
}

async function postJson(url: string, value: unknown): Promise<Record<string, unknown>> {
	const response = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(value),
	});
	const body = (await response.json()) as Record<string, unknown>;
	if (!response.ok) throw new Error(`${response.status} from ${url}: ${JSON.stringify(body)}`);
	return body;
}

function arrayField(record: Record<string, unknown>, key: string): Array<Record<string, unknown>> {
	const value = record[key];
	if (!Array.isArray(value)) throw new Error(`Expected ${key} to be an array.`);
	return value as Array<Record<string, unknown>>;
}

function objectField(record: Record<string, unknown>, key: string): Record<string, unknown> {
	const value = record[key];
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`Expected ${key} to be an object.`);
	return value as Record<string, unknown>;
}

function stringField(record: Record<string, unknown>, key: string): string {
	const value = optionalStringField(record, key);
	if (value === undefined) throw new Error(`Expected ${key} to be a string.`);
	return value;
}

function optionalStringField(record: Record<string, unknown>, key: string): string | undefined {
	const value = record[key];
	return typeof value === "string" ? value : undefined;
}
