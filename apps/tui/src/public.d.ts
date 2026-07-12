import type { WorkspaceDataSource } from "@belfry/workspace";
import type { Effect } from "effect";

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
	readonly dataSource?: WorkspaceDataSource | undefined;
};

export declare const runTui: (options: RunTuiOptions) => Effect.Effect<void, TuiFailure>;

export declare class TuiFailure extends Error {
	readonly _tag: "TuiFailure";
	readonly code: "client_unavailable" | "renderer_unavailable" | "render_failed" | "session_write_failed";
}
