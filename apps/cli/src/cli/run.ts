import { Effect, Stdio } from "effect";
import { Command } from "effect/unstable/cli";

import { VERSION } from "../version.js";
import { rootCommand } from "./root.js";

const rootSpanNameFromArgs = (args: ReadonlyArray<string>): string => {
	if (args.includes("--version") || args.includes("-v")) {
		return "belfry.cli.version";
	}

	const commandArgs = args.filter((arg) => !arg.startsWith("-"));
	const command = commandArgs.length === 0 ? "help" : commandArgs.join(".");

	return `belfry.cli.${command}`;
};

const commandNameFromRootSpan = (spanName: string): string => spanName.replace("belfry.cli.", "").replaceAll(".", " ");

const traceCliRun = <E, R>(args: ReadonlyArray<string>, effect: Effect.Effect<void, E, R>) =>
	Effect.suspend(() => {
		const spanName = rootSpanNameFromArgs(args);

		return Effect.gen(function* () {
			yield* Effect.logInfo("Belfry CLI command started", { args, version: VERSION });
			yield* effect;
		}).pipe(
			Effect.withSpan(spanName, {
				attributes: {
					"cli.command": commandNameFromRootSpan(spanName),
					"belfry.cli.args": args.join(" "),
					"belfry.cli.version": VERSION,
				},
			}),
		);
	});

const normalizeCliArgs = (args: ReadonlyArray<string>) => (args.length === 0 ? ["--help"] : args);

export const runCliWithArgs = (args: ReadonlyArray<string>) => {
	const commandArgs = normalizeCliArgs(args);

	return traceCliRun(
		commandArgs,
		Command.runWith(rootCommand, {
			version: VERSION,
		})(commandArgs),
	);
};

export const runCli = Stdio.Stdio.use(({ args }) => Effect.flatMap(args, runCliWithArgs));
