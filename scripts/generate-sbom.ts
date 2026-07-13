import { access, readFile, realpath, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";

type PackageManifest = {
	readonly name?: string;
	readonly version?: string;
	readonly license?: string;
};

type Component = {
	readonly type: "library";
	readonly name: string;
	readonly version: string;
	readonly licenses: ReadonlyArray<{ readonly expression: string }>;
	readonly purl: string;
	readonly "bom-ref": string;
};

const [outputPath, ...inventoryPaths] = process.argv.slice(2);
if (outputPath === undefined || inventoryPaths.length === 0) {
	throw new Error("Usage: generate-sbom.ts <output> <Bun/Vite module inventory>...");
}

const repoRoot = resolve(import.meta.dirname, "..");
const modulePaths = new Set<string>();
for (const inventoryPath of inventoryPaths) {
	const inventory = JSON.parse(await readFile(inventoryPath, "utf8")) as unknown;
	if (Array.isArray(inventory)) {
		for (const item of inventory) if (typeof item === "string") modulePaths.add(item);
		continue;
	}
	if (typeof inventory === "object" && inventory !== null && "inputs" in inventory) {
		const inputs = (inventory as { readonly inputs?: Record<string, unknown> }).inputs;
		for (const item of Object.keys(inputs ?? {})) modulePaths.add(item);
	}
}

const components = new Map<string, Component>();
for (const modulePath of modulePaths) {
	const packageDirectory = await findPackageDirectory(modulePath);
	if (packageDirectory === undefined) continue;
	const manifest = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8")) as PackageManifest;
	if (manifest.name === undefined || manifest.version === undefined || manifest.name.startsWith("@belfry/")) {
		continue;
	}
	const purl = npmPackageUrl(manifest.name, manifest.version);
	components.set(`${manifest.name}@${manifest.version}`, {
		type: "library",
		name: manifest.name,
		version: manifest.version,
		licenses: [{ expression: manifest.license ?? "NOASSERTION" }],
		purl,
		"bom-ref": purl,
	});
}

const cli = JSON.parse(await readFile(join(repoRoot, "apps", "cli", "package.json"), "utf8")) as {
	readonly name: string;
	readonly version: string;
};
const sbom = {
	bomFormat: "CycloneDX",
	specVersion: "1.5",
	version: 1,
	metadata: {
		component: { type: "application", name: cli.name, version: cli.version },
		properties: [
			{
				name: "belfry:inventory",
				value: "Modules bundled into the CLI, writer worker, query worker, and browser Workspace",
			},
		],
	},
	components: [...components.values()].sort((left, right) =>
		left.name === right.name ? left.version.localeCompare(right.version) : left.name.localeCompare(right.name),
	),
};

if (sbom.components.length === 0) throw new Error("The bundle module inventories produced an empty SBOM.");
await writeFile(outputPath, `${JSON.stringify(sbom, undefined, 2)}\n`);

async function findPackageDirectory(rawModulePath: string): Promise<string | undefined> {
	const cleaned = rawModulePath.replace(/^\0/u, "").split("?", 1)[0];
	if (cleaned === undefined || cleaned.startsWith("node:") || cleaned.startsWith("bun:")) return undefined;
	const absolute = isAbsolute(cleaned) ? cleaned : resolve(repoRoot, cleaned);
	const canonical = await realpath(absolute).catch(() => absolute);
	let directory = dirname(canonical);
	while (directory !== dirname(directory)) {
		if (!directory.includes(`${sep}node_modules${sep}`)) return undefined;
		const manifestPath = join(directory, "package.json");
		if (await exists(manifestPath)) return directory;
		directory = dirname(directory);
	}
	return undefined;
}

function exists(path: string): Promise<boolean> {
	return access(path).then(
		() => true,
		() => false,
	);
}

function npmPackageUrl(name: string, version: string): string {
	if (!name.startsWith("@")) return `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}`;
	const separator = name.indexOf("/");
	if (separator < 2 || separator === name.length - 1) throw new Error(`Invalid scoped npm package name: ${name}`);
	const namespace = name.slice(0, separator);
	const packageName = name.slice(separator + 1);
	return `pkg:npm/${encodeURIComponent(namespace)}/${encodeURIComponent(packageName)}@${encodeURIComponent(version)}`;
}
