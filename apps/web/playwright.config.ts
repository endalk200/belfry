import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: "line",
	use: {
		baseURL: "http://127.0.0.1:4173",
		channel: "chrome",
		headless: true,
		viewport: { width: 1440, height: 1000 },
		trace: "retain-on-failure",
	},
	webServer: {
		command: "bun run dev:e2e",
		url: "http://127.0.0.1:4173/traces",
		reuseExistingServer: false,
		timeout: 30_000,
	},
});
