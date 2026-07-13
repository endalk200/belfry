import { DaemonLifecycleFailure, DaemonManager, type DaemonStatus } from "@belfry/daemon/lifecycle";
import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { stringifyStableJson } from "../../../runtime/json.js";

const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit stable JSON for scripts"));

const startCommand = Command.make("start", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		const result = yield* manager.start;
		yield* Console.log(
			json
				? stringifyStableJson({ state: "running", adopted: result.adopted, ...result.registry })
				: result.adopted
					? `Adopted Belfry Daemon ${result.registry.pid} at ${result.registry.endpoint}.`
					: `Started Belfry Daemon ${result.registry.pid} at ${result.registry.endpoint}.`,
		);
	}),
).pipe(Command.withDescription("Start or adopt the machine-wide Belfry Daemon"));

const stopCommand = Command.make("stop", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		const registry = yield* manager.stop;
		yield* Console.log(
			json
				? stringifyStableJson({ state: "stopped", pid: registry.pid, endpoint: registry.endpoint })
				: `Stopped Belfry Daemon ${registry.pid}.`,
		);
	}),
).pipe(Command.withDescription("Stop the verified machine-wide Belfry Daemon"));

const restartCommand = Command.make("restart", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		const result = yield* manager.restart;
		yield* Console.log(
			json
				? stringifyStableJson({ state: "running", adopted: result.adopted, ...result.registry })
				: `Restarted Belfry Daemon ${result.registry.pid} at ${result.registry.endpoint}.`,
		);
	}),
).pipe(Command.withDescription("Stop and start the Belfry Daemon"));

const statusCommand = Command.make("status", { json: jsonFlag }, ({ json }) =>
	Effect.gen(function* () {
		const manager = yield* DaemonManager;
		const status = yield* manager.status;
		if (json) {
			yield* Console.log(stringifyStableJson(statusJson(status)));
		} else if (status.state === "running") {
			yield* Console.log(status.message);
		}
		if (status.state !== "running") {
			return yield* Effect.fail(new DaemonLifecycleFailure({ code: "not_running", message: status.message }));
		}
	}),
).pipe(Command.withDescription("Inspect Daemon liveness and verified identity"));

const serveCommand = Command.make("serve").pipe(
	Command.withDescription("Run the Belfry Daemon in the foreground"),
	Command.withHandler(() => Effect.flatMap(DaemonManager, (manager) => manager.serve)),
);

export const daemonCommand = Command.make("daemon").pipe(
	Command.withDescription("Manage the machine-wide Belfry Daemon"),
	Command.withShortDescription("Manage Daemon"),
	Command.withSubcommands([startCommand, stopCommand, restartCommand, statusCommand, serveCommand]),
);

const statusJson = (status: DaemonStatus): Record<string, unknown> =>
	status.state === "running"
		? { state: status.state, ...status.registry, message: status.message }
		: { state: status.state, ...("registry" in status ? status.registry : {}), message: status.message };
