import { Command } from "effect/unstable/cli";
import { configCommand } from "./commands/config/index.js";
import { daemonCommand } from "./commands/daemon/index.js";
import { databaseCommand } from "./commands/database/index.js";
import { versionCommand } from "./commands/version.cmd.js";
import { startWebWorkspace, webCommand } from "./commands/web.cmd.js";

export const commandCatalog = [webCommand, daemonCommand, databaseCommand, configCommand, versionCommand] as const;

export const makeRootCommand = (commands: typeof commandCatalog = commandCatalog) =>
	Command.make("belfry", {}, () => startWebWorkspace({ noOpen: false })).pipe(
		Command.withDescription("Manage Belfry configuration and local developer workflows."),
		Command.withSubcommands(commands),
	);

export const rootCommand = makeRootCommand();
