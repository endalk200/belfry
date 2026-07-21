import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, it } from "@effect/vitest";

const expectedEffectVersion = "4.0.0-beta.100";
const repoRoot = join(import.meta.dirname, "../../../..");

const readPackage = (path: string) =>
	JSON.parse(readFileSync(join(repoRoot, path), "utf8")) as {
		readonly dependencies?: Record<string, string>;
		readonly devDependencies?: Record<string, string>;
		readonly overrides?: Record<string, string>;
	};

describe("Effect dependency alignment", () => {
	it("keeps every directly coupled Effect 4 package on beta.100", () => {
		const root = readPackage("package.json");
		const cli = readPackage("apps/cli/package.json");
		const config = readPackage("packages/config/package.json");
		const versions = [
			root.overrides?.["@effect/platform-node-shared"],
			cli.devDependencies?.effect,
			cli.devDependencies?.["@effect/opentelemetry"],
			cli.devDependencies?.["@effect/platform-bun"],
			cli.devDependencies?.["@effect/sql-sqlite-bun"],
			cli.devDependencies?.["@effect/vitest"],
			config.dependencies?.effect,
			config.devDependencies?.["@effect/vitest"],
		];

		assert.deepStrictEqual(
			versions,
			Array.from({ length: versions.length }, () => expectedEffectVersion),
		);
	});
});
