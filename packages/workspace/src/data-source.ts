import type { BelfryClient, LogSearchQuery, Page, ServiceSummary, TraceSearchQuery } from "@belfry/query-api";
import type { LogDetail, LogSummary, TraceDetail, TraceSummary } from "@belfry/telemetry";
import { Effect } from "effect";

export type WorkspaceDataSource = {
	readonly searchTraces: (query: TraceSearchQuery) => Promise<Page<TraceSummary>>;
	readonly searchLogs: (query: LogSearchQuery) => Promise<Page<LogSummary>>;
	readonly getTrace: (traceId: string) => Promise<TraceDetail>;
	readonly getLog: (logId: string) => Promise<LogDetail>;
	readonly listCorrelatedLogs: (traceId: string, spanId?: string) => Promise<Page<LogSummary>>;
	readonly listServices: (fromNs: bigint, toNs: bigint) => Promise<Page<ServiceSummary>>;
};

export const makeWorkspaceDataSource = (client: BelfryClient, maxResults = 500): WorkspaceDataSource => {
	const boundedMaxResults = Math.max(1, Math.min(500, Math.trunc(maxResults)));
	return {
		searchTraces: (payload) => Effect.runPromise(client.traces.searchTraces({ payload })),
		searchLogs: (payload) => Effect.runPromise(client.logs.searchLogs({ payload })),
		getTrace: (traceId) => Effect.runPromise(client.traces.getTrace({ params: { traceId } })),
		getLog: (logId) => Effect.runPromise(client.logs.getLog({ params: { logId } })),
		listCorrelatedLogs: async (traceId, spanId) => {
			const items: Array<LogSummary> = [];
			let nextCursor: string | undefined;
			let firstPage: Page<LogSummary> | undefined;
			let finalPage: Page<LogSummary> | undefined;
			do {
				const remaining = boundedMaxResults - items.length;
				const page = await Effect.runPromise(
					client.traces.getTraceLogs({
						params: { traceId },
						query: {
							limit: Math.min(100, remaining),
							...(nextCursor === undefined ? {} : { cursor: nextCursor }),
							...(spanId === undefined ? {} : { spanId }),
						},
					}),
				);
				firstPage ??= page;
				finalPage = page;
				items.push(...page.items.slice(0, remaining));
				nextCursor = page.nextCursor;
			} while (nextCursor !== undefined && items.length < boundedMaxResults);

			const page = finalPage ?? firstPage;
			if (page === undefined) throw new Error("The correlated-log query returned no page.");
			return {
				items,
				bounds: { ...page.bounds, limit: boundedMaxResults },
				truncated: nextCursor !== undefined || page.truncated,
				...(nextCursor === undefined ? {} : { nextCursor }),
			};
		},
		listServices: (fromNs, toNs) =>
			Effect.runPromise(
				client.services.listServices({ query: { fromNs, toNs, limit: Math.min(100, boundedMaxResults) } }),
			),
	};
};
