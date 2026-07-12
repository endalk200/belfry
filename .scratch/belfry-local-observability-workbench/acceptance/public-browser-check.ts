import { join } from "node:path";
import { chromium } from "@playwright/test";

const endpoint = (process.argv[2] ?? "http://127.0.0.1:4318").replace(/\/$/u, "");
const outputDirectory = process.argv[3];
if (outputDirectory === undefined) {
	throw new Error("Usage: bun public-browser-check.ts <endpoint> <acceptance-output-directory>");
}

const traceId = "11111111111111111111111111111111";
const childSpanId = "3333333333333333";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
	const page = await browser.newPage({ viewport: { width: 1_440, height: 1_000 } });
	await page.goto(`${endpoint}/traces/${traceId}`);
	await page.getByRole("heading", { name: "Span waterfall" }).waitFor({ state: "visible" });
	await page.getByRole("button", { name: "Inspect span POST /checkout" }).click();
	await page.getByRole("heading", { name: "POST /checkout" }).last().waitFor({ state: "visible" });
	await page.screenshot({ path: join(outputDirectory, "browser-span-detail.png"), fullPage: true });

	await page.getByRole("button", { name: "Open correlated trace logs" }).click();
	await page.getByRole("heading", { name: "Log search" }).waitFor({ state: "visible" });
	const logButton = page.getByRole("button", { name: /inventory reservation declined/u }).first();
	await logButton.waitFor({ state: "visible" });
	await logButton.click();
	await page.getByText("COMPLETE BODY", { exact: true }).waitFor({ state: "visible" });
	await page.screenshot({ path: join(outputDirectory, "browser-log-detail.png"), fullPage: true });

	await page.getByRole("button", { name: "Pause" }).click();
	const restorableUrl = page.url();
	await page.reload();
	await page.getByRole("button", { name: "Resume" }).waitFor({ state: "visible" });
	await page.getByText("COMPLETE BODY", { exact: true }).waitFor({ state: "visible" });
	if (page.url() !== restorableUrl) throw new Error(`Browser URL did not restore: ${page.url()}`);

	await page.getByRole("button", { name: "Open complete trace and focus span" }).click();
	await page.getByRole("heading", { name: "Span waterfall" }).waitFor({ state: "visible" });
	if (!page.url().includes(`/traces/${traceId}`) || !page.url().includes(`span=${childSpanId}`)) {
		throw new Error(`Log correlation did not focus ${traceId}/${childSpanId}: ${page.url()}`);
	}
	await page.screenshot({ path: join(outputDirectory, "browser-wide-trace.png"), fullPage: true });

	console.log(
		JSON.stringify({
			result: "pass",
			endpoint,
			traceId,
			childSpanId,
			restoredLogUrl: restorableUrl,
			correlatedTraceUrl: page.url(),
			screenshots: ["browser-span-detail.png", "browser-log-detail.png", "browser-wide-trace.png"],
		}),
	);
} finally {
	await browser.close();
}
