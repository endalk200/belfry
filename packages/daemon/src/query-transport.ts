import { StorageFailure, StorageNotFound, type TelemetryReaderService } from "@belfry/storage";
import { Context, Effect, Layer, Schema } from "effect";

import {
	type QueryWorkerRequest,
	QueryWorkerRequestSchema,
	type QueryWorkerResponse,
	QueryWorkerResponseSchema,
} from "./query-worker-protocol.js";

export type QueryReaderService = Pick<
	TelemetryReaderService,
	| "searchTraces"
	| "getTrace"
	| "getSpan"
	| "listTraceLogs"
	| "searchLogs"
	| "getLog"
	| "listServices"
	| "listDiagnostics"
	| "facets"
>;

type EffectSuccess<T> = T extends Effect.Effect<infer A, unknown, unknown> ? A : never;
type TracePage = EffectSuccess<ReturnType<QueryReaderService["searchTraces"]>>;
type TraceDetail = EffectSuccess<ReturnType<QueryReaderService["getTrace"]>>;
type SpanDetail = EffectSuccess<ReturnType<QueryReaderService["getSpan"]>>;
type LogPage = EffectSuccess<ReturnType<QueryReaderService["searchLogs"]>>;
type LogDetail = EffectSuccess<ReturnType<QueryReaderService["getLog"]>>;
type ServicePage = EffectSuccess<ReturnType<QueryReaderService["listServices"]>>;
type DiagnosticPage = EffectSuccess<ReturnType<QueryReaderService["listDiagnostics"]>>;
type Facets = EffectSuccess<ReturnType<QueryReaderService["facets"]>>;

export type QueryReaderOptions = {
	readonly databasePath: string;
	readonly timeoutMs: number;
	readonly maxTraceDetailSpans: number;
	readonly workerUrl?: URL | undefined;
};

export class IsolatedTelemetryQuery extends Context.Service<IsolatedTelemetryQuery, QueryReaderService>()(
	"@belfry/daemon/IsolatedTelemetryQuery",
) {
	static readonly layer = (options: QueryReaderOptions) =>
		Layer.effect(IsolatedTelemetryQuery)(openQueryReader(options));
}

type PendingCall = {
	readonly resolve: (response: QueryWorkerResponse) => void;
	readonly reject: (cause: unknown) => void;
};

type WorkerState = {
	readonly worker: Worker;
	readonly pending: Map<string, PendingCall>;
	readonly onMessage: (event: MessageEvent<unknown>) => void;
	readonly onError: (event: ErrorEvent) => void;
	disposed: boolean;
};

class QueryDeadlineExceeded extends Error {}
class QueryRequestAborted extends Error {}

export const openQueryReader = (
	options: QueryReaderOptions,
): Effect.Effect<QueryReaderService, StorageFailure, import("effect").Scope.Scope> =>
	Effect.gen(function* () {
		const transport = makeQueryTransport(options);
		yield* Effect.tryPromise({
			try: () => transport.initialize(),
			catch: () => queryFailure("read_failed", "Could not initialize the isolated Query worker."),
		});
		yield* Effect.addFinalizer(() => Effect.tryPromise(() => transport.close()).pipe(Effect.ignore));

		const call = Effect.fn("IsolatedTelemetryQuery.call")(function* (request: QueryWorkerRequest) {
			return yield* Effect.tryPromise({
				try: (signal) => transport.call(request, signal),
				catch: (cause) =>
					cause instanceof QueryDeadlineExceeded
						? queryFailure(
								"query_timeout",
								`The bounded query exceeded ${options.timeoutMs} ms and its isolated worker was restarted.`,
							)
						: queryFailure("read_failed", "The isolated Query worker is unavailable."),
			});
		});

		return {
			searchTraces: (query, cursor) =>
				call({
					_tag: "search-traces",
					id: crypto.randomUUID(),
					query,
					...(cursor === undefined ? {} : { cursor }),
				}).pipe(Effect.flatMap((response) => expectListResponse<TracePage>(response, "trace-page"))),
			getTrace: (traceId) =>
				call({ _tag: "get-trace", id: crypto.randomUUID(), traceId }).pipe(
					Effect.flatMap((response) => expectDetailResponse<TraceDetail>(response, "trace-detail")),
				),
			getSpan: (traceId, spanId) =>
				call({ _tag: "get-span", id: crypto.randomUUID(), traceId, spanId }).pipe(
					Effect.flatMap((response) => expectDetailResponse<SpanDetail>(response, "span-detail")),
				),
			listTraceLogs: (traceId, limit, cursor, spanId) =>
				call({
					_tag: "list-trace-logs",
					id: crypto.randomUUID(),
					traceId,
					limit,
					...(cursor === undefined ? {} : { cursor }),
					...(spanId === undefined ? {} : { spanId }),
				}).pipe(Effect.flatMap((response) => expectDetailResponse<LogPage>(response, "log-page"))),
			searchLogs: (query, cursor) =>
				call({
					_tag: "search-logs",
					id: crypto.randomUUID(),
					query,
					...(cursor === undefined ? {} : { cursor }),
				}).pipe(Effect.flatMap((response) => expectListResponse<LogPage>(response, "log-page"))),
			getLog: (logId) =>
				call({ _tag: "get-log", id: crypto.randomUUID(), logId }).pipe(
					Effect.flatMap((response) => expectDetailResponse<LogDetail>(response, "log-detail")),
				),
			listServices: (range, limit, cursor) =>
				call({
					_tag: "list-services",
					id: crypto.randomUUID(),
					range,
					limit,
					...(cursor === undefined ? {} : { cursor }),
				}).pipe(Effect.flatMap((response) => expectListResponse<ServicePage>(response, "service-page"))),
			listDiagnostics: (range, limit, cursor) =>
				call({
					_tag: "list-diagnostics",
					id: crypto.randomUUID(),
					range,
					limit,
					...(cursor === undefined ? {} : { cursor }),
				}).pipe(Effect.flatMap((response) => expectListResponse<DiagnosticPage>(response, "diagnostic-page"))),
			facets: (request, cursor) =>
				call({
					_tag: "facets",
					id: crypto.randomUUID(),
					request,
					...(cursor === undefined ? {} : { cursor }),
				}).pipe(Effect.flatMap((response) => expectListResponse<Facets>(response, "facets-result"))),
		};
	});

const makeQueryTransport = (options: QueryReaderOptions) => {
	const states = new Set<WorkerState>();
	let current: WorkerState | undefined;
	let starting: Promise<WorkerState> | undefined;
	let turn: Promise<void> = Promise.resolve();
	let closed = false;

	const dispose = (state: WorkerState, cause: unknown) => {
		if (state.disposed) return;
		state.disposed = true;
		if (current === state) current = undefined;
		states.delete(state);
		state.worker.removeEventListener("message", state.onMessage);
		state.worker.removeEventListener("error", state.onError);
		for (const waiter of state.pending.values()) waiter.reject(cause);
		state.pending.clear();
		state.worker.terminate();
	};

	const createState = (): WorkerState => {
		const worker = new Worker(options.workerUrl ?? defaultQueryWorkerUrl(), { type: "module" });
		const pending = new Map<string, PendingCall>();
		const state = {} as WorkerState;
		const onMessage = (event: MessageEvent<unknown>) => {
			try {
				const response = Schema.decodeUnknownSync(QueryWorkerResponseSchema)(event.data);
				pending.get(response.id)?.resolve(response);
				pending.delete(response.id);
			} catch (cause) {
				dispose(state, cause);
			}
		};
		const onError = (event: ErrorEvent) => dispose(state, event.error ?? event.message);
		Object.assign(state, { worker, pending, onMessage, onError, disposed: false });
		worker.addEventListener("message", onMessage);
		worker.addEventListener("error", onError);
		states.add(state);
		return state;
	};

	const requestOn = (
		state: WorkerState,
		request: QueryWorkerRequest,
		signal?: AbortSignal,
	): Promise<QueryWorkerResponse> =>
		new Promise((resolve, reject) => {
			if (state.disposed) {
				reject(new Error("Query worker closed"));
				return;
			}
			if (signal?.aborted) {
				reject(new QueryRequestAborted());
				return;
			}
			const cleanup = () => signal?.removeEventListener("abort", onAbort);
			const onAbort = () => {
				state.pending.delete(request.id);
				clearTimeout(timeout);
				cleanup();
				reject(new QueryRequestAborted());
			};
			const timeout = setTimeout(() => {
				state.pending.delete(request.id);
				cleanup();
				reject(new QueryDeadlineExceeded());
			}, options.timeoutMs);
			state.pending.set(request.id, {
				resolve: (response) => {
					clearTimeout(timeout);
					cleanup();
					resolve(response);
				},
				reject: (cause) => {
					clearTimeout(timeout);
					cleanup();
					reject(cause);
				},
			});
			signal?.addEventListener("abort", onAbort, { once: true });
			if (signal?.aborted) {
				onAbort();
				return;
			}
			try {
				state.worker.postMessage(Schema.encodeSync(QueryWorkerRequestSchema)(request));
			} catch (cause) {
				state.pending.delete(request.id);
				clearTimeout(timeout);
				cleanup();
				reject(cause);
			}
		});

	const ensureState = (): Promise<WorkerState> => {
		if (closed) return Promise.reject(new Error("Query transport closed"));
		if (current !== undefined && !current.disposed) return Promise.resolve(current);
		if (starting !== undefined) return starting;
		let state: WorkerState;
		try {
			state = createState();
		} catch (cause) {
			return Promise.reject(cause);
		}
		const promise = requestOn(state, {
			_tag: "initialize",
			id: crypto.randomUUID(),
			configuration: {
				databasePath: options.databasePath,
				maxTraceDetailSpans: options.maxTraceDetailSpans,
			},
		})
			.then((response) => {
				if (response._tag !== "ready") throw new Error("Query worker initialization failed");
				current = state;
				return state;
			})
			.catch((cause) => {
				dispose(state, cause);
				throw cause;
			});
		starting = promise;
		void promise.then(
			() => {
				if (starting === promise) starting = undefined;
			},
			() => {
				if (starting === promise) starting = undefined;
			},
		);
		return promise;
	};

	const call = (request: QueryWorkerRequest, signal?: AbortSignal): Promise<QueryWorkerResponse> => {
		const operation = turn.then(async () => {
			if (signal?.aborted) throw new QueryRequestAborted();
			const state = await ensureState();
			try {
				return await requestOn(state, request, signal);
			} catch (cause) {
				dispose(state, cause);
				throw cause;
			}
		});
		turn = operation.then(
			() => undefined,
			() => undefined,
		);
		return operation;
	};

	const close = async (): Promise<void> => {
		if (closed) return;
		closed = true;
		await Promise.race([turn, delay(250)]);
		for (const state of [...states]) {
			if (!state.disposed && state.pending.size === 0) {
				await Promise.race([
					requestOn(state, { _tag: "shutdown", id: crypto.randomUUID() }).catch(() => undefined),
					delay(250),
				]);
			}
			dispose(state, new Error("Query transport closed"));
		}
	};

	return {
		initialize: ensureState,
		call,
		close,
	};
};

const delay = (milliseconds: number): Promise<void> =>
	new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});

const expectListResponse = <A>(
	response: QueryWorkerResponse,
	tag: QueryWorkerResponse["_tag"],
): Effect.Effect<A, StorageFailure> => {
	if (response._tag === "storage-failure") {
		return Effect.fail(new StorageFailure({ code: response.code, message: response.message }));
	}
	if (response._tag === "not-found") {
		return Effect.fail(queryFailure("read_failed", "The Query worker returned an unexpected missing record."));
	}
	if (response._tag !== tag || !("result" in response)) {
		return Effect.fail(queryFailure("read_failed", "The Query worker returned an unexpected response."));
	}
	return Effect.succeed(response.result as A);
};

const expectDetailResponse = <A>(
	response: QueryWorkerResponse,
	tag: QueryWorkerResponse["_tag"],
): Effect.Effect<A, StorageFailure | StorageNotFound> =>
	response._tag === "not-found"
		? Effect.fail(
				new StorageNotFound({
					entity: response.entity,
					id: response.entityId,
					message: response.message,
				}),
			)
		: expectListResponse<A>(response, tag);

const queryFailure = (code: StorageFailure["code"], message: string) => new StorageFailure({ code, message });

const defaultQueryWorkerUrl = (): URL =>
	new URL(import.meta.url.endsWith(".ts") ? "./query-worker.ts" : "./query-worker.js", import.meta.url);
