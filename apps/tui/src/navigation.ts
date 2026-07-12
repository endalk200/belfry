import type { WorkspaceState } from "@belfry/workspace";

export type NavigationLevel = "list" | "waterfall" | "detail";

export const navigationForWorkspace = (workspace: WorkspaceState): NavigationLevel => {
	if (workspace.signal === "logs") return workspace.selectedLogId === undefined ? "list" : "detail";
	return workspace.selectedTraceId === undefined ? "list" : "waterfall";
};
