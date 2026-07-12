import { spawnSync } from "node:child_process";
import { chmod, cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "./sync-cli-version.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDirectory, "..");
const cliRoot = join(repoRoot, "apps", "cli");
const distDirectory = join(cliRoot, "dist");

const run = (command: string, args: ReadonlyArray<string>) => {
	const result = spawnSync(command, [...args], {
		cwd: repoRoot,
		encoding: "utf8",
		stdio: "inherit",
	});
	if (result.error !== undefined) throw new Error(`Could not start ${command}: ${result.error.message}`);
	if (result.status !== 0) process.exit(result.status ?? 1);
};

run("bun", ["run", "--filter", "@belfry/web", "build"]);

await rm(distDirectory, { force: true, recursive: true });
await mkdir(distDirectory, { recursive: true });

run("bun", [
	"build",
	join(cliRoot, "src", "bin.ts"),
	"--target=bun",
	"--format=esm",
	"--packages=bundle",
	"--external=@opentui/core",
	`--outfile=${join(distDirectory, "bin.js")}`,
]);

run("bun", [
	"build",
	join(repoRoot, "packages", "ingestion", "src", "writer-worker.ts"),
	"--target=bun",
	"--format=esm",
	"--packages=bundle",
	`--outfile=${join(distDirectory, "writer-worker.js")}`,
]);

run("bun", [
	"build",
	join(repoRoot, "packages", "daemon", "src", "query-worker.ts"),
	"--target=bun",
	"--format=esm",
	"--packages=bundle",
	`--outfile=${join(distDirectory, "query-worker.js")}`,
]);

await cp(join(repoRoot, "apps", "web", "dist"), join(distDirectory, "web"), { recursive: true });
await cp(join(repoRoot, "packages", "docs", "content"), join(distDirectory, "content"), { recursive: true });

await chmod(join(distDirectory, "bin.js"), 0o755);
