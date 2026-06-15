import { initBelfryConfig } from "@belfry/config";
import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";

export const initCommand = Command.make("init").pipe(
	Command.withDescription("Create a starter Belfry Configuration file"),
	Command.withShortDescription("Create config file"),
	Command.withHandler(() =>
		Effect.gen(function* () {
			const path = yield* initBelfryConfig;

			yield* Console.log(`Created Belfry Configuration at ${path.path}.`);
		}).pipe(
			Effect.withSpan("belfry.cli.config.init", {
				attributes: {
					"cli.command": "config init",
					"belfry.command": "config init",
				},
			}),
			Effect.annotateLogs({
				"belfry.command": "config init",
			}),
		),
	),
);
