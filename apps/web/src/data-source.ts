import { makeBelfryClient } from "@belfry/query-api";
import { makeWorkspaceDataSource, type WorkspaceDataSource } from "@belfry/workspace";
import { Effect } from "effect";

export type WebWorkspaceDataSource = WorkspaceDataSource;

export const connectWebWorkspace = async (endpoint: string, maxResults = 500): Promise<WebWorkspaceDataSource> =>
	makeWorkspaceDataSource(await Effect.runPromise(makeBelfryClient(endpoint)), maxResults);
