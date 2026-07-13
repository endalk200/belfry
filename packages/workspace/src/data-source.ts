import type { BelfryClient, LogSearchQuery, Page, ServiceSummary, TraceSearchQuery } from "@belfry/query-api";
import type { LogDetail, LogSummary, TraceDetail, TraceSummary } from "@belfry/telemetry";
import { Effect } from "effect";

export type WorkspaceRequestOptions = { readonly signal?: AbortSignal | undefined };

export type WorkspaceDataSource = {
	readonly searchTraces: (query: TraceSearchQuery, options?: WorkspaceRequestOptions) => Promise<Page<TraceSummary>>;
	readonly searchLogs: (query: LogSearchQuery, options?: WorkspaceRequestOptions) => Promise<Page<LogSummary>>;
	readonly getTrace: (traceId: string, options?: WorkspaceRequestOptions) => Promise<TraceDetail>;
	readonly getLog: (logId: string, options?: WorkspaceRequestOptions) => Promise<LogDetail>;
	readonly listCorrelatedLogs: (
		traceId: string,
		spanId?: string,
		options?: WorkspaceRequestOptions,
	) => Promise<Page<LogSummary>>;
	readonly listServices: (
		fromNs: bigint,
		toNs: bigint,
		options?: WorkspaceRequestOptions,
	) => Promise<Page<ServiceSummary>>;
};

export const makeWorkspaceDataSource = (client: BelfryClient, maxResults = 500): WorkspaceDataSource => {
	const boundedMaxResults = Math.max(1, Math.min(500, Math.trunc(maxResults)));
	return {
		searchTraces: (payload, options) => run(client.traces.searchTraces({ payload }), options),
		searchLogs: (payload, options) => run(client.logs.searchLogs({ payload }), options),
		getTrace: (traceId, options) => run(client.traces.getTrace({ params: { traceId } }), options),
		getLog: (logId, options) => run(client.logs.getLog({ params: { logId } }), options),
		listCorrelatedLogs: (traceId, spanId, options) =>
			collectPages(
				(nextCursor, limit) =>
					run(
						client.traces.getTraceLogs({
							params: { traceId },
							query: {
								limit,
								...(nextCursor === undefined ? {} : { cursor: nextCursor }),
								...(spanId === undefined ? {} : { spanId }),
							},
						}),
						options,
					),
				boundedMaxResults,
				options,
			),
		listServices: (fromNs, toNs, options) =>
			collectPages(
				(nextCursor, limit) =>
					run(
						client.services.listServices({
							query: { fromNs, toNs, limit, ...(nextCursor === undefined ? {} : { cursor: nextCursor }) },
						}),
						options,
					),
				boundedMaxResults,
				options,
			),
	};
};

const collectPages = async <A>(
	load: (cursor: string | undefined, limit: number) => Promise<Page<A>>,
	maxResults: number,
	options?: WorkspaceRequestOptions,
): Promise<Page<A>> => {
	const items: Array<A> = [];
	let nextCursor: string | undefined;
	let page: Page<A> | undefined;
	do {
		options?.signal?.throwIfAborted();
		const remaining = maxResults - items.length;
		page = await load(nextCursor, Math.min(100, remaining));
		items.push(...page.items.slice(0, remaining));
		nextCursor = page.nextCursor;
	} while (nextCursor !== undefined && items.length < maxResults);

	if (page === undefined) throw new Error("The paginated query returned no page.");
	return {
		items,
		bounds: { ...page.bounds, limit: maxResults },
		truncated: nextCursor !== undefined || page.truncated,
		...(nextCursor === undefined ? {} : { nextCursor }),
	};
};

const run = <A, E>(effect: Effect.Effect<A, E>, options?: WorkspaceRequestOptions): Promise<A> =>
	Effect.runPromise(effect, options?.signal === undefined ? undefined : { signal: options.signal });
