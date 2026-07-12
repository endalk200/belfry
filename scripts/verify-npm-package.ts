import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..");
const cliRoot = join(repoRoot, "apps", "cli");
const npmCache = join(tmpdir(), "belfry-npm-cache");
const requiredFiles = [
	"dist/bin.js",
	"dist/query-worker.js",
	"dist/writer-worker.js",
	"dist/web/index.html",
	"dist/content/getting-started.md",
	"dist/content/instrumentation.md",
	"dist/content/troubleshooting.md",
	"dist/content/privacy.md",
	"dist/content/belfry-debug/SKILL.md",
	"LICENSE",
	"package.json",
	"README.md",
].sort();

const packageJson = (await Bun.file(join(cliRoot, "package.json")).json()) as {
	readonly dependencies?: Record<string, string>;
	readonly optionalDependencies?: Record<string, string>;
	readonly peerDependencies?: Record<string, string>;
	readonly private?: boolean;
	readonly version?: string;
	readonly engines?: Record<string, string>;
};

if (packageJson.private === true) {
	throw new Error("@belfry/cli must not be private when preparing the npm package.");
}

if (packageJson.engines?.bun === undefined || packageJson.engines.node !== undefined) {
	throw new Error("@belfry/cli must declare Bun, and must not claim Node.js production-runtime compatibility.");
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

if (
	Object.keys(packageJson.dependencies ?? {}).length !== 1 ||
	packageJson.dependencies?.["@opentui/core"] !== "0.4.3"
) {
	throw new Error("@belfry/cli must publish OpenTUI Core as its sole runtime dependency for native portability.");
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

console.log(`Verified @belfry/cli@${packedPackage.version} package contents.`);
