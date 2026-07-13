import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..");
const cliRoot = join(repoRoot, "apps", "cli");
const npmCache = join(tmpdir(), "belfry-npm-cache");
const requiredFiles = [
	"dist/SBOM.cdx.json",
	"dist/bin.js",
	"dist/licenses/Effect-MIT.txt",
	"dist/licenses/fast-check-MIT.txt",
	"dist/licenses/ini-ISC.txt",
	"dist/licenses/OpenTelemetry-Apache-2.0.txt",
	"dist/licenses/ProtobufJS-BSD-3-Clause.txt",
	"dist/licenses/React-MIT.txt",
	"dist/licenses/toml-MIT.txt",
	"dist/licenses/yaml-ISC.txt",
	"dist/query-worker.js",
	"dist/writer-worker.js",
	"dist/web/index.html",
	"LICENSE",
	"package.json",
	"README.md",
	"THIRD_PARTY_NOTICES.md",
].sort();

const packageJson = (await Bun.file(join(cliRoot, "package.json")).json()) as {
	readonly dependencies?: Record<string, string>;
	readonly optionalDependencies?: Record<string, string>;
	readonly peerDependencies?: Record<string, string>;
	readonly private?: boolean;
	readonly version?: string;
	readonly engines?: Record<string, string>;
	readonly license?: string;
};

if (packageJson.private === true) {
	throw new Error("@belfry/cli must not be private when preparing the npm package.");
}

if (packageJson.engines?.bun === undefined || packageJson.engines.node !== undefined) {
	throw new Error("@belfry/cli must declare Bun, and must not claim Node.js production-runtime compatibility.");
}

const [rootLicense, packageLicense] = await Promise.all([
	Bun.file(join(repoRoot, "LICENSE")).text(),
	Bun.file(join(cliRoot, "LICENSE")).text(),
]);
if (packageJson.license !== "MIT" || rootLicense !== packageLicense) {
	throw new Error("The npm package must declare MIT and ship the repository's exact MIT license.");
}

const dependencyFields = {
	optionalDependencies: packageJson.optionalDependencies,
	peerDependencies: packageJson.peerDependencies,
} as const;
const presentDependencyFields = Object.entries(dependencyFields)
	.filter(([, dependencies]) => dependencies !== undefined && Object.keys(dependencies).length > 0)
	.map(([field]) => field);

if (presentDependencyFields.length > 0) {
	throw new Error(`@belfry/cli has unexpected dependency fields: ${presentDependencyFields.join(", ")}.`);
}

if (Object.keys(packageJson.dependencies ?? {}).length !== 0) {
	throw new Error("@belfry/cli must bundle its implementation and publish without runtime dependencies.");
}

const pack = spawnSync("npm", ["pack", "--dry-run", "--json", cliRoot], {
	cwd: repoRoot,
	encoding: "utf8",
	env: {
		...process.env,
		NPM_CONFIG_CACHE: npmCache,
	},
	stdio: ["ignore", "pipe", "pipe"],
});

if (pack.status !== 0) {
	throw new Error(`npm pack --dry-run failed:\n${pack.stderr}`);
}

const [packedPackage] = JSON.parse(pack.stdout) as Array<{
	readonly files: ReadonlyArray<{ readonly path: string }>;
	readonly version: string;
}>;
if (packedPackage === undefined) throw new Error("npm pack --dry-run did not report a package artifact.");

if (packedPackage.version !== packageJson.version) {
	throw new Error(`Packed version ${packedPackage.version} does not match package version ${packageJson.version}.`);
}

const actualFiles = packedPackage.files.map((file) => file.path).sort();

const missingFiles = requiredFiles.filter((file) => !actualFiles.includes(file));
const webAssets = actualFiles.filter((file) => /^dist\/web\/assets\/.+\.(?:css|js)$/u.test(file));
const requiredFileSet = new Set(requiredFiles);
const unexpectedFiles = actualFiles.filter(
	(file) => !requiredFileSet.has(file) && !/^dist\/web\/assets\/[A-Za-z0-9._-]+\.(?:css|js)$/u.test(file),
);

if (
	missingFiles.length > 0 ||
	unexpectedFiles.length > 0 ||
	!webAssets.some((file) => file.endsWith(".css")) ||
	!webAssets.some((file) => file.endsWith(".js"))
) {
	throw new Error(
		`Invalid npm package contents. Missing:\n${missingFiles.join("\n")}\nUnexpected:\n${unexpectedFiles.join("\n")}\nPacked:\n${actualFiles.join("\n")}`,
	);
}

const sbom = (await Bun.file(join(cliRoot, "dist", "SBOM.cdx.json")).json()) as {
	readonly bomFormat?: string;
	readonly metadata?: { readonly component?: { readonly name?: string; readonly version?: string } };
	readonly components?: ReadonlyArray<{
		readonly name?: string;
		readonly version?: string;
		readonly licenses?: ReadonlyArray<{ readonly expression?: string }>;
		readonly purl?: string;
		readonly "bom-ref"?: string;
	}>;
};
if (
	sbom.bomFormat !== "CycloneDX" ||
	sbom.metadata?.component?.name !== "@belfry/cli" ||
	sbom.metadata?.component?.version !== packageJson.version ||
	(sbom.components?.length ?? 0) === 0
) {
	throw new Error("The packaged CycloneDX SBOM is missing, empty, or does not match @belfry/cli.");
}
const documentedLicenses = new Set(["Apache-2.0", "BSD-3-Clause", "ISC", "MIT"]);
const undocumentedLicenses = (sbom.components ?? [])
	.flatMap((component) => component.licenses ?? [])
	.map((license) => license.expression ?? "NOASSERTION")
	.filter((license) => !documentedLicenses.has(license));
if (undocumentedLicenses.length > 0) {
	throw new Error(`The SBOM contains undocumented licenses: ${[...new Set(undocumentedLicenses)].join(", ")}.`);
}
const invalidPackageUrls = (sbom.components ?? []).filter((component) => {
	if (component.name === undefined || component.version === undefined) return true;
	const expected = canonicalNpmPackageUrl(component.name, component.version);
	return component.purl !== expected || component["bom-ref"] !== expected;
});
if (invalidPackageUrls.length > 0) {
	throw new Error(
		`The SBOM contains invalid npm package URLs: ${invalidPackageUrls.map((component) => component.purl ?? "missing").join(", ")}.`,
	);
}

console.log(`Verified @belfry/cli@${packedPackage.version} package contents.`);

function canonicalNpmPackageUrl(name: string, version: string): string {
	if (!name.startsWith("@")) return `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}`;
	const separator = name.indexOf("/");
	if (separator < 2 || separator === name.length - 1) return "invalid";
	return `pkg:npm/${encodeURIComponent(name.slice(0, separator))}/${encodeURIComponent(name.slice(separator + 1))}@${encodeURIComponent(version)}`;
}
