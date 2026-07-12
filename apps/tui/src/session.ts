import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { canonicalSpanId } from "@belfry/telemetry";
import { type WorkspaceRestoreBounds, type WorkspaceState, workspaceFromUrl, workspaceToUrl } from "@belfry/workspace";
import { Schema } from "effect";

type PersistedWorkspaceSession = {
	readonly version: 1;
	readonly url: string;
	readonly collapsedSpanIds: ReadonlyArray<string>;
};

export class WorkspaceSessionFailure extends Schema.TaggedErrorClass<WorkspaceSessionFailure>()(
	"WorkspaceSessionFailure",
	{
		path: Schema.String,
		message: Schema.String,
	},
) {}

export type WorkspaceSessionWriter = {
	readonly enqueue: (state: WorkspaceState) => void;
	readonly close: () => Promise<void>;
};

export const encodeWorkspaceSession = (state: WorkspaceState): string =>
	JSON.stringify({
		version: 1,
		url: workspaceToUrl(state),
		collapsedSpanIds: state.collapsedSpanIds,
	} satisfies PersistedWorkspaceSession);

export const decodeWorkspaceSession = (
	contents: string,
	fallback: WorkspaceState,
	bounds: WorkspaceRestoreBounds = {},
): WorkspaceState => {
	try {
		const parsed = JSON.parse(contents) as Partial<PersistedWorkspaceSession>;
		if (parsed.version !== 1 || typeof parsed.url !== "string" || !Array.isArray(parsed.collapsedSpanIds)) {
			return fallback;
		}
		const restored = workspaceFromUrl(new URL(parsed.url, "http://127.0.0.1"), fallback, bounds);
		return {
			...restored,
			collapsedSpanIds: parsed.collapsedSpanIds.flatMap((value) => {
				const spanId = typeof value === "string" ? canonicalSpanId(value) : undefined;
				return spanId === undefined ? [] : [spanId];
			}),
		};
	} catch {
		return fallback;
	}
};

export const loadWorkspaceSession = async (
	path: string,
	fallback: WorkspaceState,
	bounds: WorkspaceRestoreBounds = {},
): Promise<WorkspaceState> => {
	try {
		return decodeWorkspaceSession(await readFile(path, "utf8"), fallback, bounds);
	} catch {
		return fallback;
	}
};

export const saveWorkspaceSession = async (path: string, state: WorkspaceState): Promise<void> => {
	try {
		await mkdir(dirname(path), { recursive: true, mode: 0o700 });
		await writeFile(path, `${encodeWorkspaceSession(state)}\n`, { mode: 0o600 });
	} catch (cause) {
		throw new WorkspaceSessionFailure({
			path,
			message: `Could not save the TUI Workspace session: ${cause instanceof Error ? cause.message : String(cause)}`,
		});
	}
};

/**
 * Coalesces rapid renderer updates while guaranteeing that at most one session
 * write is in flight. Failures are retained and reported by close(), never as
 * an unhandled fire-and-forget rejection.
 */
export const makeWorkspaceSessionWriter = (path: string): WorkspaceSessionWriter => {
	let pending: WorkspaceState | undefined;
	let running: Promise<void> | undefined;
	let failure: WorkspaceSessionFailure | undefined;

	const drain = async (): Promise<void> => {
		while (pending !== undefined && failure === undefined) {
			const state = pending;
			pending = undefined;
			try {
				await saveWorkspaceSession(path, state);
			} catch (cause) {
				failure =
					cause instanceof WorkspaceSessionFailure
						? cause
						: new WorkspaceSessionFailure({ path, message: "Could not save the TUI Workspace session." });
			}
		}
	};

	const start = () => {
		if (running !== undefined || failure !== undefined || pending === undefined) return;
		running = drain().finally(() => {
			running = undefined;
			start();
		});
	};

	return {
		enqueue: (state) => {
			pending = state;
			start();
		},
		close: async () => {
			start();
			while (running !== undefined) await running;
			if (failure !== undefined) throw failure;
		},
	};
};
