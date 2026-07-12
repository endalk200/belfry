import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

describe("OpenTUI Telemetry Workspace", () => {
	it("keeps trace/log commands and adaptive detail behavior in the real Bun test renderer", () => {
		const harness = fileURLToPath(new URL("./app.test-harness.tsx", import.meta.url));
		const child = spawnSync("bun", ["--conditions=development", "run", harness], {
			cwd: process.cwd(),
			encoding: "utf8",
			env: { ...process.env, NO_COLOR: "1" },
			timeout: 15_000,
		});
		if (child.status !== 0) {
			throw new Error(`OpenTUI harness failed (${child.status ?? "signal"}).\n${child.stdout}\n${child.stderr}`);
		}
		const line = child.stdout
			.split("\n")
			.reverse()
			.find((candidate) => candidate.startsWith("BELFRY_TEST_RESULT="));
		if (line === undefined) throw new Error(`OpenTUI harness returned no result.\n${child.stdout}`);
		const result = JSON.parse(line.slice("BELFRY_TEST_RESULT=".length)) as Record<string, boolean>;
		assert.deepStrictEqual(result, {
			recovered: true,
			structuredFilters: true,
			editableBackspace: true,
			initial: true,
			browserFailure: true,
			waterfall: true,
			spanDetail: true,
			promotedAttribute: true,
			sort: true,
			range: true,
			zoom: true,
			traceLogs: true,
			logs: true,
			correlatedTrace: true,
			help: true,
			quit: true,
		});
	});
});
