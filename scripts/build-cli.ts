import { spawnSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "./sync-cli-version.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDirectory, "..");
const cliRoot = join(repoRoot, "apps", "cli");
const distDirectory = join(cliRoot, "dist");
const metadataDirectory = await mkdtemp(join(tmpdir(), "belfry-build-metadata-"));

const run = (command: string, args: ReadonlyArray<string>) => {
	const result = spawnSync(command, [...args], {
		cwd: repoRoot,
		encoding: "utf8",
		stdio: "inherit",
	});
	if (result.error !== undefined) throw new Error(`Could not start ${command}: ${result.error.message}`);
	if (result.status !== 0) process.exit(result.status ?? 1);
};

await rm(distDirectory, { force: true, recursive: true });
await mkdir(distDirectory, { recursive: true });

run("bun", [
	"build",
	join(cliRoot, "src", "bin.ts"),
	"--target=bun",
	"--format=esm",
	"--packages=bundle",
	`--outfile=${join(distDirectory, "bin.js")}`,
	`--metafile=${join(metadataDirectory, "cli.json")}`,
]);

run("bun", [
	"build",
	join(repoRoot, "packages", "ingestion", "src", "writer-worker.ts"),
	"--target=bun",
	"--format=esm",
	"--packages=bundle",
	`--outfile=${join(distDirectory, "writer-worker.js")}`,
	`--metafile=${join(metadataDirectory, "writer-worker.json")}`,
]);

run("bun", [
	"build",
	join(repoRoot, "packages", "daemon", "src", "query-worker.ts"),
	"--target=bun",
	"--format=esm",
	"--packages=bundle",
	`--outfile=${join(distDirectory, "query-worker.js")}`,
	`--metafile=${join(metadataDirectory, "query-worker.json")}`,
]);

await cp(join(repoRoot, "apps", "web", "dist"), join(distDirectory, "web"), { recursive: true });
await rm(join(distDirectory, "web", ".sbom-modules.json"), { force: true });

const licenseDirectory = join(distDirectory, "licenses");
await mkdir(licenseDirectory, { recursive: true });
const thirdPartyLicenses = [
	["Effect-MIT.txt", join(repoRoot, "packages", "daemon", "node_modules", "effect", "LICENSE")],
	["fast-check-MIT.txt", join(repoRoot, "node_modules", ".bun", "node_modules", "fast-check", "LICENSE")],
	["ini-ISC.txt", join(repoRoot, "node_modules", ".bun", "node_modules", "ini", "LICENSE")],
	["OpenTelemetry-Apache-2.0.txt", join(repoRoot, "node_modules", "@opentelemetry", "api", "LICENSE")],
	["ProtobufJS-BSD-3-Clause.txt", join(repoRoot, "packages", "otlp-proto", "node_modules", "protobufjs", "LICENSE")],
	["React-MIT.txt", join(repoRoot, "apps", "web", "node_modules", "react", "LICENSE")],
	["toml-MIT.txt", join(repoRoot, "packages", "config", "node_modules", "toml", "LICENSE")],
	["yaml-ISC.txt", join(repoRoot, "node_modules", ".bun", "node_modules", "yaml", "LICENSE")],
] as const;
for (const [name, source] of thirdPartyLicenses) await cp(source, join(licenseDirectory, name));

run("bun", [
	"run",
	join(scriptDirectory, "generate-sbom.ts"),
	join(distDirectory, "SBOM.cdx.json"),
	join(metadataDirectory, "cli.json"),
	join(metadataDirectory, "writer-worker.json"),
	join(metadataDirectory, "query-worker.json"),
	join(repoRoot, "apps", "web", "dist", ".sbom-modules.json"),
]);

await rm(metadataDirectory, { force: true, recursive: true });

await chmod(join(distDirectory, "bin.js"), 0o755);
