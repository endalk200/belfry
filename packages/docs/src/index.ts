import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Context, Effect, Layer, Schema } from "effect";

export type DocumentationEntry = {
	readonly slug: string;
	readonly title: string;
	readonly description: string;
	readonly href: string;
};

export type DocumentationIndex = {
	readonly items: ReadonlyArray<DocumentationEntry>;
	readonly openapi: string;
	readonly debuggingSkill: string;
};

export class DocumentationFailure extends Schema.TaggedErrorClass<DocumentationFailure>()("DocumentationFailure", {
	slug: Schema.String,
	message: Schema.String,
}) {}

export type DocumentationServiceShape = {
	readonly index: Effect.Effect<DocumentationIndex, DocumentationFailure>;
	readonly read: (slug: string) => Effect.Effect<string, DocumentationFailure>;
};

const entries = [
	{
		slug: "getting-started",
		title: "Install and run Belfry",
		description: "Start the local Daemon, TUI, and browser Workspace.",
		href: "/docs/getting-started",
	},
	{
		slug: "instrumentation",
		title: "Send traces and logs",
		description: "Configure an OpenTelemetry SDK for Belfry's loopback OTLP endpoints.",
		href: "/docs/instrumentation",
	},
	{
		slug: "troubleshooting",
		title: "Troubleshoot ingestion",
		description: "Interpret health, diagnostics, limits, and common exporter failures.",
		href: "/docs/troubleshooting",
	},
	{
		slug: "privacy",
		title: "Local telemetry and privacy",
		description: "Understand local-only binding, retention, indexing, and source-side redaction.",
		href: "/docs/privacy",
	},
	{
		slug: "belfry-debug",
		title: "Belfry Debugging Skill",
		description: "An evidence-first workflow for agents investigating local traces and logs.",
		href: "/docs/belfry-debug",
	},
] as const satisfies ReadonlyArray<DocumentationEntry>;

const contentFiles: Readonly<Record<string, string>> = {
	"getting-started": "getting-started.md",
	instrumentation: "instrumentation.md",
	troubleshooting: "troubleshooting.md",
	privacy: "privacy.md",
	"belfry-debug": join("belfry-debug", "SKILL.md"),
};

export class Documentation extends Context.Service<Documentation, DocumentationServiceShape>()(
	"@belfry/docs/Documentation",
) {
	static readonly layer = Layer.succeed(Documentation, makeDocumentation());
}

export function makeDocumentation(options: { readonly contentRoot?: string } = {}): DocumentationServiceShape {
	const contentRoot = resolveDocumentationRoot(options.contentRoot);
	const read = (slug: string) => {
		const file = contentFiles[slug];
		if (file === undefined) {
			return Effect.fail(
				new DocumentationFailure({ slug, message: `Documentation entry "${slug}" does not exist.` }),
			);
		}
		return Effect.tryPromise({
			try: () => readFile(join(contentRoot, file), "utf8"),
			catch: (cause) =>
				new DocumentationFailure({
					slug,
					message: `Could not read packaged documentation: ${cause instanceof Error ? cause.message : String(cause)}`,
				}),
		});
	};

	return {
		read,
		index: read("belfry-debug").pipe(
			Effect.map((debuggingSkill) => ({
				items: entries,
				openapi: "/openapi.json",
				debuggingSkill,
			})),
		),
	};
}

function resolveDocumentationRoot(configuredRoot?: string): string {
	const candidates = [
		configuredRoot,
		process.env.BELFRY_DOCS_ROOT,
		fileURLToPath(new URL("./content", import.meta.url)),
		fileURLToPath(new URL("../content", import.meta.url)),
	].filter((candidate): candidate is string => candidate !== undefined);
	return candidates.find((candidate) => existsSync(join(candidate, "getting-started.md"))) ?? candidates[0] ?? "";
}
