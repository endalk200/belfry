import { BelfryConfig } from "@belfry/config";
import { DaemonManager } from "@belfry/daemon/lifecycle";
import { Console, Effect, Schema } from "effect";
import { Command, Flag } from "effect/unstable/cli";

export const webCommand = Command.make(
	"web",
	{
		noOpen: Flag.boolean("no-open").pipe(Flag.withDescription("Start the web Workspace without opening a browser")),
	},
	({ noOpen }) => startWebWorkspace({ noOpen }),
).pipe(Command.withDescription("Start or adopt the Daemon and open the browser Workspace"));

export type StartWebWorkspaceOptions = {
	readonly noOpen: boolean;
	readonly launchBrowser?: typeof openBrowser | undefined;
};

export const startWebWorkspace = ({ noOpen, launchBrowser = openBrowser }: StartWebWorkspaceOptions) =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		const config = yield* BelfryConfig;
		const { registry } = yield* manager.start;
		const url = `${registry.endpoint}/traces`;
		if (shouldOpenWebWorkspace(config.interfaces.webOpenBrowser, noOpen)) yield* launchBrowser(url);
		yield* Console.log(`Belfry web Workspace: ${url}`);
	});

export const shouldOpenWebWorkspace = (configuredAutoOpen: boolean, noOpen: boolean): boolean =>
	configuredAutoOpen && !noOpen;

export class WebBrowserFailure extends Schema.TaggedErrorClass<WebBrowserFailure>()("WebBrowserFailure", {
	code: Schema.Literal("browser_open_failed"),
	message: Schema.String,
}) {}

export const openBrowser = (url: string): Effect.Effect<void, WebBrowserFailure> =>
	Effect.tryPromise({
		try: async () => {
			const command =
				process.platform === "darwin"
					? ["open", url]
					: process.platform === "win32"
						? ["cmd", "/c", "start", "", url]
						: ["xdg-open", url];
			const child = Bun.spawn(command, { stdin: "ignore", stdout: "ignore", stderr: "ignore" });
			const exitCode = await child.exited;
			if (exitCode !== 0) throw new Error(`${command[0]} exited with status ${exitCode}`);
		},
		catch: (cause) =>
			new WebBrowserFailure({
				code: "browser_open_failed",
				message: `Could not open ${url}: ${cause instanceof Error ? cause.message : String(cause)}. Open the URL manually.`,
			}),
	});
