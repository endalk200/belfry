import { makeBelfryClient } from "@belfry/query-api";
import { initialWorkspaceState } from "@belfry/workspace";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Effect, Schema } from "effect";
import { createElement } from "react";
import { TelemetryWorkspaceView } from "./app.js";
import { makeWorkspaceDataSource, type WorkspaceDataSource } from "./data-source.js";
import { loadWorkspaceSession, makeWorkspaceSessionWriter, WorkspaceSessionFailure } from "./session.js";

export * from "./app.js";
export * from "./commands.js";
export * from "./data-source.js";
export * from "./session.js";

export type RunTuiOptions = {
	readonly endpoint: string;
	readonly refreshIntervalMs?: number | undefined;
	readonly defaultRangeMinutes?: number | undefined;
	readonly queryMaxResults?: number | undefined;
	readonly queryMaxLookbackMinutes?: number | undefined;
	readonly sessionPath?: string | undefined;
	readonly openBrowser?: ((url: string) => Promise<void>) | undefined;
	readonly reconnect?: (() => Promise<void>) | undefined;
	readonly startupMessage?: string | undefined;
	/** Injects the typed Workspace boundary for renderer and PTY tests without opening a listener. */
	readonly dataSource?: WorkspaceDataSource | undefined;
};

export class TuiFailure extends Schema.TaggedErrorClass<TuiFailure>()("TuiFailure", {
	code: Schema.Literals(["client_unavailable", "renderer_unavailable", "render_failed", "session_write_failed"]),
	message: Schema.String,
}) {}

export const runTui = (options: RunTuiOptions): Effect.Effect<void, TuiFailure> =>
	Effect.gen(function* () {
		const dataSource =
			options.dataSource ??
			makeWorkspaceDataSource(
				yield* makeBelfryClient(options.endpoint).pipe(
					Effect.mapError(
						() =>
							new TuiFailure({
								code: "client_unavailable",
								message: "Could not initialize the Belfry Query client.",
							}),
					),
				),
				options.queryMaxResults,
			);
		const fallbackState = initialWorkspaceState(undefined, options.defaultRangeMinutes, options.queryMaxResults);
		const initialState =
			options.sessionPath === undefined
				? fallbackState
				: yield* Effect.promise(() =>
						loadWorkspaceSession(options.sessionPath as string, fallbackState, {
							maxLookbackNs: BigInt(options.queryMaxLookbackMinutes ?? 10_080) * 60_000_000_000n,
						}),
					);
		const renderer = yield* Effect.tryPromise({
			try: () =>
				createCliRenderer({
					exitOnCtrlC: false,
					screenMode: "alternate-screen",
					clearOnShutdown: true,
					useMouse: true,
				}),
			catch: () =>
				new TuiFailure({
					code: "renderer_unavailable",
					message: "Could not initialize the alternate-screen terminal renderer.",
				}),
		});
		const sessionWriter =
			options.sessionPath === undefined ? undefined : makeWorkspaceSessionWriter(options.sessionPath);
		yield* Effect.tryPromise({
			try: async () => {
				try {
					const root = createRoot(renderer);
					await new Promise<void>((resolve) => {
						let closing = false;
						const close = () => {
							if (closing) return;
							closing = true;
							queueMicrotask(() => {
								root.unmount();
								renderer.destroy();
								resolve();
							});
						};
						renderer.once("destroy", resolve);
						root.render(
							createElement(TelemetryWorkspaceView, {
								endpoint: options.endpoint,
								dataSource,
								onQuit: close,
								onOpenBrowser: options.openBrowser,
								onReconnect: options.reconnect,
								startupMessage: options.startupMessage,
								refreshIntervalMs: options.refreshIntervalMs,
								defaultRangeMinutes: options.defaultRangeMinutes,
								queryMaxResults: options.queryMaxResults,
								queryMaxLookbackMinutes: options.queryMaxLookbackMinutes,
								initialState,
								onWorkspaceChange:
									sessionWriter === undefined ? undefined : (state) => sessionWriter.enqueue(state),
							}),
						);
					});
					await sessionWriter?.close();
				} finally {
					if (!renderer.isDestroyed) renderer.destroy();
				}
			},
			catch: (cause) =>
				cause instanceof WorkspaceSessionFailure
					? new TuiFailure({ code: "session_write_failed", message: cause.message })
					: new TuiFailure({
							code: "render_failed",
							message: "The Belfry terminal renderer failed and restored the previous terminal screen.",
						}),
		});
	});
