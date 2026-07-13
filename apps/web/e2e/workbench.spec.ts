import { workspaceScenario } from "@belfry/workspace/test-support";
import { expect, type Page, type Route, test } from "@playwright/test";

const { traceId, spanId } = workspaceScenario;
const bounds = { fromNs: "1781419000000000000", toNs: "1781421000000000000", limit: 100 };

test.beforeEach(async ({ page }) => {
	await installApiFixture(page);
});

test("filters, searches, correlates, restores URLs, and exposes complete detail", async ({ page }) => {
	await page.goto("/traces");
	await expect(page.getByRole("table", { name: "Trace results" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Open trace GET /checkout" })).toBeVisible();

	await page.getByRole("textbox", { name: "Search traces" }).fill("no-match");
	await page.getByRole("button", { name: "Apply trace search" }).click();
	await expect(page.getByRole("heading", { name: "No traces in this time range" })).toBeVisible();
	await page.getByRole("textbox", { name: "Search traces" }).fill("checkout");
	await page.getByRole("button", { name: "Apply trace search" }).click();
	await expect(page).toHaveURL(/q=checkout/u);
	await expect(page.getByText("Text: checkout", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "Open trace GET /checkout" })).toBeVisible();

	await page.getByRole("button", { name: "Logs" }).click();
	await expect(page.getByRole("button", { name: "payment declined" })).toBeVisible();
	await page.getByRole("button", { name: "Traces" }).click();
	await expect(page.getByRole("button", { name: "Open trace GET /checkout" })).toBeVisible();

	await page.locator('summary[aria-label^="Filter Services"]').click();
	await page.getByRole("checkbox", { name: /checkout/u }).check();
	await expect(page).toHaveURL(/service=/u);
	await page.locator('summary[aria-label^="More filters"]').click();
	await page.getByLabel("Status").selectOption("error");
	await page.getByLabel("Minimum duration (ms)").fill("1.5");
	await page.getByLabel("Trace ID").fill(traceId);
	await page.getByLabel("Attribute key").fill("http.route");
	await page.getByLabel("Attribute operator").selectOption("contains");
	await page.getByLabel("Attribute value").fill("/checkout");
	await page.getByRole("button", { name: "Apply filters" }).click();
	await expect(page).toHaveURL(/status=error/u);
	await expect(page).toHaveURL(/minimumDuration=1500000/u);
	await expect(page).toHaveURL(new RegExp(`filterTrace=${traceId}`, "u"));
	await expect(page.getByText("Status: error", { exact: true })).toBeVisible();
	await expect(page.getByText("Duration ≥ 1.5 ms", { exact: true })).toBeVisible();
	await expect(page.getByText("Attribute: http.route contains /checkout", { exact: true })).toBeVisible();

	await page.locator(".table-row").filter({ hasText: "GET /checkout" }).click();
	await expect(page).toHaveURL(new RegExp(`/traces/${traceId}`, "u"));
	await expect(page.getByRole("heading", { name: "Span waterfall" })).toBeVisible();
	await expect(page.getByRole("link", { name: "OpenAPI" })).toHaveAttribute("href", "/openapi.json");
	await page.getByRole("slider", { name: "Scale" }).fill("2");
	await expect(page.getByRole("status").filter({ hasText: "2.00×" })).toBeVisible();
	await page.getByRole("button", { name: "Collapse GET /checkout" }).click();
	await expect(page.getByRole("button", { name: "Inspect span charge card" })).toBeHidden();
	await page.getByRole("button", { name: "Expand GET /checkout" }).click();
	await expect(page.getByRole("button", { name: "Inspect span charge card" })).toBeVisible();
	await page.getByRole("button", { name: "Inspect span GET /checkout" }).click();
	await expect(page).toHaveURL(new RegExp(`span=${spanId}`, "u"));
	await expect(page.getByText("Dropped span attributes", { exact: true })).toBeVisible();
	await expect(page.getByText("vendor=sampled", { exact: true })).toBeVisible();
	await expect(page.getByRole("tree")).toHaveCount(0);
	await expect(page.getByRole("tab")).toHaveCount(0);
	await expect(page.getByRole("region", { name: "Trace-correlated logs" })).toBeVisible();
	expect(await page.locator(".trace-log-strip .correlated-log-row").count()).toBeLessThan(50);

	await page.getByRole("button", { name: "Attributes" }).click();
	await expect(page.getByText("http.method", { exact: true })).toBeVisible();
	await expect(page.getByText("GET", { exact: true })).toBeVisible();
	await page.getByRole("button", { name: "Filter traces by http.method equals GET" }).click();
	await expect(page).toHaveURL(/attribute=/u);
	await expect(page.getByText("Attribute: http.method = GET", { exact: true })).toBeVisible();
	await page.getByRole("button", { name: "Events (1)" }).click();
	await expect(page.getByText("checkout.authorized", { exact: true })).toBeVisible();
	await expect(page.getByText(/dropped attributes 5/u)).toBeVisible();
	await page.getByRole("button", { name: "Links (1)" }).click();
	await expect(page.getByText("Linked span", { exact: true })).toBeVisible();
	await expect(page.getByText(/Trace state linked=true · flags 1 · dropped attributes 7/u)).toBeVisible();

	await page.locator(".trace-log-strip .correlated-log").first().click();
	await expect(page.getByRole("heading", { name: /payment declined/u })).toBeVisible();
	await expect(page.getByText("COMPLETE BODY", { exact: true })).toBeVisible();
	await expect(page.getByText("request.user_agent", { exact: true })).toBeVisible();
	await expect(page.getByText("Dropped log attributes", { exact: true })).toBeVisible();

	let releaseCorrelatedLogs = () => {};
	const correlatedLogsPending = new Promise<void>((resolve) => {
		releaseCorrelatedLogs = resolve;
	});
	await page.unroute("**/api/**");
	await page.route("**/api/**", async (route) => {
		if (new URL(route.request().url()).pathname === `/api/traces/${traceId}/logs`) await correlatedLogsPending;
		await respond(route);
	});
	await page.getByRole("button", { name: "Open correlated trace logs" }).click();
	await expect(page).toHaveURL(/\/logs\?/u);
	await expect(page).toHaveURL(new RegExp(`filterTrace=${traceId}`, "u"));
	await expect(page).not.toHaveURL(/service=/u);
	await expect(page.getByRole("status").filter({ hasText: "Loading telemetry…" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "No logs in this time range" })).toHaveCount(0);
	releaseCorrelatedLogs();
	await page.getByRole("button", { name: "payment declined" }).click();
	await expect(page.getByRole("heading", { name: /payment declined/u })).toBeVisible();
	await page.getByRole("button", { name: "Open complete trace and focus span" }).click();
	await expect(page).toHaveURL(new RegExp(`/traces/${traceId}.*span=${spanId}`, "u"));

	let releaseSpanLogs = () => {};
	const spanLogsPending = new Promise<void>((resolve) => {
		releaseSpanLogs = resolve;
	});
	await page.unroute("**/api/**");
	await page.route("**/api/**", async (route) => {
		const url = new URL(route.request().url());
		if (url.pathname === `/api/traces/${traceId}/logs` && url.searchParams.has("spanId")) await spanLogsPending;
		await respond(route);
	});
	await page.getByRole("button", { name: "Open correlated logs for selected span" }).click();
	await expect(page).toHaveURL(new RegExp(`filterSpan=${spanId}`, "u"));
	await expect(page.getByRole("status").filter({ hasText: "Loading telemetry…" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "No logs in this time range" })).toHaveCount(0);
	releaseSpanLogs();
	await page.getByRole("button", { name: "payment declined" }).click();
	await expect(page.getByRole("heading", { name: /payment declined/u })).toBeVisible();

	await page.getByRole("button", { name: "Pause" }).click();
	await expect(page).toHaveURL(/paused=1/u);
	const restorableUrl = page.url();
	await page.reload();
	await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
	await expect(page.getByRole("heading", { name: /payment declined/u })).toBeVisible();
	await expect(page).toHaveURL(restorableUrl);

	await page.getByRole("button", { name: "Open complete trace and focus span" }).click();
	await expect(page).toHaveURL(new RegExp(`/traces/${traceId}.*span=${spanId}`, "u"));
	await page.goBack();
	await expect(page).toHaveURL(restorableUrl);
	await expect(page.getByRole("heading", { name: /payment declined/u })).toBeVisible();
	await page.goForward();
	await expect(page).toHaveURL(new RegExp(`/traces/${traceId}`, "u"));
});

test("virtualizes large log results while keeping accessible row controls", async ({ page }) => {
	await page.goto("/logs");
	await expect(page.getByRole("table", { name: "Log results" })).toBeVisible();
	await page.locator('summary[aria-label^="More filters"]').click();
	await page.getByLabel("Minimum severity").selectOption("17");
	await page.getByLabel("Span ID").fill(spanId);
	await page.getByRole("button", { name: "Apply filters" }).click();
	await expect(page).toHaveURL(/minimumSeverity=17/u);
	await expect(page).toHaveURL(new RegExp(`filterSpan=${spanId}`, "u"));
	await expect(page.getByText("Severity ≥ 17", { exact: true })).toBeVisible();
	await expect(page.getByRole("table", { name: "Log results" })).toHaveAttribute("aria-rowcount", "150");
	const renderedRows = page.locator(".table-row");
	expect(await renderedRows.count()).toBeLessThan(50);
	await expect(page.getByRole("button", { name: "payment declined" })).toBeVisible();
	const paymentRow = renderedRows.filter({ hasText: "payment declined" });
	await paymentRow.click();
	await expect(page.getByRole("heading", { name: /payment declined/u })).toBeVisible();
});

const installApiFixture = async (page: Page): Promise<void> => {
	await page.route("**/api/**", async (route) => respond(route));
};

const respond = async (route: Route): Promise<void> => {
	const request = route.request();
	const path = new URL(request.url()).pathname;
	if (path === "/api/services") return json(route, servicePage);
	if (path === "/api/traces/search") {
		const payload = request.postDataJSON() as { readonly text?: string };
		return json(route, payload.text === "no-match" ? { ...tracePage, items: [] } : tracePage);
	}
	if (path === `/api/traces/${traceId}`) return json(route, traceDetail);
	if (path === `/api/traces/${traceId}/logs`) {
		const cursor = new URL(request.url()).searchParams.get("cursor");
		return cursor === null
			? json(route, {
					items: correlatedLogs.slice(0, 100),
					bounds,
					truncated: true,
					nextCursor: "correlated-page-2",
				})
			: json(route, {
					items: correlatedLogs.slice(100),
					bounds,
					truncated: false,
				});
	}
	if (path === "/api/logs/search") return json(route, logPage);
	if (path.startsWith("/api/logs/")) return json(route, logDetail);
	if (path === "/api/health")
		return json(route, {
			status: "ok",
			live: true,
			migrationReady: true,
			writerReady: true,
			readsAvailable: true,
			queueDepth: 0,
			queueBytes: "0",
			databaseSizeBytes: "4096",
			storageSizeBytes: "4096",
			walSizeBytes: "0",
		});
	await route.fulfill({
		status: 404,
		contentType: "application/json",
		body: JSON.stringify({ code: "not_found", message: `No fixture for ${path}` }),
	});
};

const json = (route: Route, value: unknown): Promise<void> =>
	route.fulfill({
		status: 200,
		contentType: "application/json",
		body: JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item)),
	});

const servicePage = {
	items: [workspaceScenario.serviceSummary],
	bounds,
	truncated: false,
};
const traceSummary = workspaceScenario.traceSummary;
const tracePage = { items: [traceSummary], bounds, truncated: false };
const logPage = {
	items: workspaceScenario.makeLogSummaries(150),
	bounds: { ...bounds, limit: 200 },
	truncated: false,
};
const correlatedLogs = workspaceScenario.makeLogSummaries(150);
const traceDetail = {
	...workspaceScenario.traceDetail,
	spans: workspaceScenario.traceDetail.spans.map((span) => ({ ...span, logCount: 150 })),
	logs: correlatedLogs,
};
const logDetail = workspaceScenario.logDetail;
