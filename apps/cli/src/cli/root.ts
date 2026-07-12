import { join } from "node:path";
import { BelfryConfig, daemonEndpoint } from "@belfry/config";
import { DaemonManager } from "@belfry/daemon/lifecycle";
import { Effect } from "effect";
import { Command } from "effect/unstable/cli";
import { reportTuiFailure } from "../runtime/failures.js";
import { configCommand } from "./commands/config/index.js";
import { daemonCommand } from "./commands/daemon/index.js";
import { databaseCommand } from "./commands/database/index.js";
import { versionCommand } from "./commands/version.cmd.js";
import { openBrowser, webCommand } from "./commands/web.cmd.js";

export const commandCatalog = [webCommand, daemonCommand, databaseCommand, configCommand, versionCommand] as const;

const openDefaultWorkspace = () =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		const config = yield* BelfryConfig;
		const startup = yield* Effect.result(manager.start);
		const tui = yield* Effect.tryPromise({
			try: () => import("@belfry/tui"),
			catch: (cause) => (cause instanceof Error ? cause : new Error(String(cause))),
		});
		yield* tui
			.runTui({
				endpoint:
					startup._tag === "Success"
						? startup.success.registry.endpoint
						: daemonEndpoint(config.daemon.host, config.daemon.port),
				startupMessage:
					startup._tag === "Failure"
						? `${startup.failure.message} Press r to retry Daemon startup.`
						: undefined,
				reconnect:
					startup._tag === "Failure"
						? () => Effect.runPromise(manager.start).then(() => undefined)
						: undefined,
				openBrowser: (url) => Effect.runPromise(openBrowser(url)),
				refreshIntervalMs: config.interfaces.refreshIntervalMs,
				defaultRangeMinutes: config.interfaces.defaultRangeMinutes,
				queryMaxResults: config.query.maxResults,
				queryMaxLookbackMinutes: Number(config.query.maxLookbackNs / 60_000_000_000n),
				sessionPath: join(config.daemon.stateDirectory, "tui-session.json"),
			})
			.pipe(Effect.tapError(reportTuiFailure));
	});

export const makeRootCommand = (commands: typeof commandCatalog = commandCatalog) =>
	Command.make("belfry", {}, openDefaultWorkspace).pipe(
		Command.withDescription("Manage Belfry configuration and local developer workflows."),
		Command.withSubcommands(commands),
	);

export const rootCommand = makeRootCommand();
