import { Command } from "effect/unstable/cli";

import { initCommand } from "./init.cmd.js";
import { pathCommand } from "./path.cmd.js";
import { validateCommand } from "./validate.cmd.js";

export const configCommand = Command.make("config").pipe(
	Command.withDescription("Manage Belfry Configuration"),
	Command.withShortDescription("Manage config"),
	Command.withSubcommands([validateCommand, initCommand, pathCommand]),
);
