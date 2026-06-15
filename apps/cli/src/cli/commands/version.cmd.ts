import { Console } from "effect";
import { Command } from "effect/unstable/cli";

import { VERSION } from "../../version.js";

export const versionCommand = Command.make("version").pipe(
	Command.withDescription("Print the Belfry CLI version"),
	Command.withShortDescription("Print version"),

	Command.withHandler(() => {
		return Console.log(VERSION);
	}),
);
