import { spawnSync } from "node:child_process";

type Advisory = {
	readonly severity: "low" | "moderate" | "high" | "critical";
	readonly title: string;
	readonly url: string;
};

type AuditReport = Record<string, ReadonlyArray<Advisory>>;

const severityRank = {
	low: 0,
	moderate: 1,
	high: 2,
	critical: 3,
} as const satisfies Record<Advisory["severity"], number>;

const acceptedDevOnlyModerateAdvisories = new Set([
	// Pulled in by @changesets/cli release tooling. js-yaml has no patched npm
	// version for GHSA-h67p-54hq-rp68 yet, and the CLI package publishes without
	// runtime npm dependencies.
	"https://github.com/advisories/GHSA-h67p-54hq-rp68",
]);

const audit = spawnSync("bun", ["audit", "--json", "--audit-level=moderate"], {
	encoding: "utf8",
	stdio: ["ignore", "pipe", "pipe"],
});

if (audit.status === 0) {
	console.log("Release dependency audit passed.");
	process.exit(0);
}

const jsonStart = audit.stdout.indexOf("{");

if (jsonStart === -1) {
	throw new Error(`Could not parse bun audit JSON output:\n${audit.stdout}\n${audit.stderr}`);
}

const report = JSON.parse(audit.stdout.slice(jsonStart)) as AuditReport;
const failures: Array<string> = [];
const accepted: Array<string> = [];

for (const [packageName, advisories] of Object.entries(report)) {
	for (const advisory of advisories) {
		if (advisory.severity === "moderate" && acceptedDevOnlyModerateAdvisories.has(advisory.url)) {
			accepted.push(`${packageName}: ${advisory.severity} - ${advisory.title} (${advisory.url})`);
			continue;
		}

		if (severityRank[advisory.severity] >= severityRank.moderate) {
			failures.push(`${packageName}: ${advisory.severity} - ${advisory.title} (${advisory.url})`);
		}
	}
}

if (failures.length > 0) {
	throw new Error(`Release dependency audit failed:\n${failures.join("\n")}`);
}

if (accepted.length > 0) {
	console.warn(`Release dependency audit accepted dev-only advisories:\n${accepted.join("\n")}`);
}

console.log("Release dependency audit passed.");
