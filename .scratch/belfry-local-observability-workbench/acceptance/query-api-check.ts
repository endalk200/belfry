const endpoint = (process.argv[2] ?? "http://127.0.0.1:4318").replace(/\/$/u, "");
const traceId = "11111111111111111111111111111111";
const rootSpanId = "2222222222222222";
const childSpanId = "3333333333333333";
const nowNs = BigInt(Date.now()) * 1_000_000n;
const fromNs = nowNs - 60n * 60n * 1_000_000_000n;
const inventory = {
	namespace: "belfry-acceptance",
	name: "inventory",
	environment: "test",
};

const json = async (path: string, init?: RequestInit) => {
	const response = await fetch(`${endpoint}${path}`, init);
	if (!response.ok) throw new Error(`${init?.method ?? "GET"} ${path} returned ${response.status}: ${await response.text()}`);
	return response.json() as Promise<Record<string, unknown>>;
};

const post = (path: string, body: unknown) =>
	json(path, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});

const health = await json("/api/health");
if (health.status !== "ok" || health.readsAvailable !== true || health.writerReady !== true) {
	throw new Error(`Daemon is not healthy: ${JSON.stringify(health)}`);
}

const services = await json(`/api/services?fromNs=${fromNs}&toNs=${nowNs}&limit=100`);
const serviceItems = services.items as ReadonlyArray<Record<string, unknown>>;
if (serviceItems.length < 2) throw new Error(`Expected both SDK fixture Services, received ${serviceItems.length}.`);

const tracePage = await post("/api/traces/search", {
	fromNs: fromNs.toString(),
	toNs: nowNs.toString(),
	services: [inventory],
	status: "error",
	traceId,
	attributes: [],
	sort: "newest",
	limit: 100,
});
const traceItems = tracePage.items as ReadonlyArray<Record<string, unknown>>;
if (traceItems.length !== 1 || traceItems[0]?.traceId !== traceId) {
	throw new Error(`Inventory Service Filter did not find the complete trace: ${JSON.stringify(tracePage)}`);
}

const traceDetail = await json(`/api/traces/${traceId}`);
const spans = traceDetail.spans as ReadonlyArray<Record<string, unknown>>;
const participatingServices = traceDetail.services as ReadonlyArray<Record<string, unknown>>;
if (
	spans.length !== 2 ||
	spans[0]?.spanId !== rootSpanId ||
	spans[1]?.spanId !== childSpanId ||
	participatingServices.length !== 2
) {
	throw new Error(`Trace hierarchy or cross-Service detail is incomplete: ${JSON.stringify(traceDetail)}`);
}

const logPage = await post("/api/logs/search", {
	fromNs: fromNs.toString(),
	toNs: nowNs.toString(),
	services: [inventory],
	minimumSeverity: 17,
	traceId,
	spanId: childSpanId,
	text: "reservation declined",
	attributes: [],
	sort: "newest",
	limit: 100,
});
const logItems = logPage.items as ReadonlyArray<Record<string, unknown>>;
const logId = logItems[0]?.id;
if (typeof logId !== "string") throw new Error(`Expected one correlated error log: ${JSON.stringify(logPage)}`);

const logDetail = await json(`/api/logs/${logId}`);
if (logDetail.traceId !== traceId || logDetail.spanId !== childSpanId || logDetail.body === undefined) {
	throw new Error(`Correlated log detail is incomplete: ${JSON.stringify(logDetail)}`);
}

const traceLogs = await json(`/api/traces/${traceId}/logs`);
if ((traceLogs.items as ReadonlyArray<unknown>).length !== 1) {
	throw new Error(`Trace log correlation returned an unexpected result: ${JSON.stringify(traceLogs)}`);
}

const docs = await json("/api/docs");
const skill = await fetch(`${endpoint}/docs/belfry-debug`).then((response) => response.text());
const openapi = await json("/openapi.json");
if (!skill.includes("evidence-first") || docs.openapi !== "/openapi.json" || openapi.openapi === undefined) {
	throw new Error("Packaged documentation, Debugging Skill, or generated OpenAPI is unavailable.");
}

console.log(
	JSON.stringify({
		endpoint,
		daemonPid: (health.daemon as Record<string, unknown>).pid,
		serviceCount: serviceItems.length,
		traceId,
		rootSpanId,
		childSpanId,
		logId,
		traceStartTimeNs: traceDetail.startTimeNs,
		logTimestampNs: logDetail.timestampNs,
		participatingServices,
		docsEntries: (docs.items as ReadonlyArray<unknown>).length,
		openapiTitle: ((openapi.info as Record<string, unknown>)?.title ?? "unknown") as string,
	}),
);
