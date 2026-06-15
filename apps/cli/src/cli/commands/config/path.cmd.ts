import { resolveConfigPath } from "@belfry/config";
import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";

export const pathCommand = Command.make("path").pipe(
	Command.withDescription("Print the effective Belfry Configuration path"),
	Command.withShortDescription("Print config path"),
	Command.withHandler(() =>
		Effect.gen(function* () {
			const path = yield* resolveConfigPath();

			yield* Console.log(path.path);
		}).pipe(
			Effect.withSpan("belfry.cli.config.path", {
				attributes: {
					"cli.command": "config path",
					"belfry.command": "config path",
				},
			}),
			Effect.annotateLogs({
				"belfry.command": "config path",
			}),
		),
	),
);
