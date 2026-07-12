import {
	openTelemetryReader,
	type StorageFailure,
	StorageNotFound,
	type TelemetryReaderService,
} from "@belfry/storage";
import { Effect, Exit, Schema, Scope } from "effect";

import {
	type QueryWorkerRequest,
	QueryWorkerRequestSchema,
	type QueryWorkerResponse,
	QueryWorkerResponseSchema,
} from "./query-worker-protocol.js";

type WorkerGlobal = {
	onmessage: ((event: MessageEvent<unknown>) => void) | null;
	postMessage: (message: unknown) => void;
	close: () => void;
};

const workerGlobal = globalThis as unknown as WorkerGlobal;
let reader: TelemetryReaderService | undefined;
let readerScope: Scope.Closeable | undefined;
let messageChain = Promise.resolve();

workerGlobal.onmessage = (event) => {
	messageChain = messageChain
		.then(async () => {
			let request: QueryWorkerRequest;
			try {
				request = Schema.decodeUnknownSync(QueryWorkerRequestSchema)(event.data);
			} catch {
				post({
					_tag: "protocol-failure",
					id: requestId(event.data),
					message: "The Query worker received an invalid request.",
				});
				return;
			}

			const response = await Effect.runPromise(handleRequest(request));
			post(response);
			if (response._tag === "shutdown-success") workerGlobal.close();
		})
		.catch(() => undefined);
};

const handleRequest = (request: QueryWorkerRequest): Effect.Effect<QueryWorkerResponse> => {
	if (request._tag === "initialize") return initialize(request.id, request.configuration.databasePath);
	if (request._tag === "shutdown") return shutdown(request.id);
	if (reader === undefined) {
		return Effect.succeed({
			_tag: "storage-failure",
			id: request.id,
			code: "open_failed",
			message: "The Query worker has not opened its read-only Telemetry Store role.",
		});
	}

	switch (request._tag) {
		case "search-traces":
			return complete(request.id, reader.searchTraces(request.query, request.cursor), (result) => ({
				_tag: "trace-page",
				id: request.id,
				result,
			}));
		case "get-trace":
			return complete(request.id, reader.getTrace(request.traceId), (result) => ({
				_tag: "trace-detail",
				id: request.id,
				result,
			}));
		case "get-span":
			return complete(request.id, reader.getSpan(request.traceId, request.spanId), (result) => ({
				_tag: "span-detail",
				id: request.id,
				result,
			}));
		case "list-trace-logs":
			return complete(
				request.id,
				reader.listTraceLogs(request.traceId, request.limit, request.cursor, request.spanId),
				(result) => ({
					_tag: "log-page",
					id: request.id,
					result,
				}),
			);
		case "search-logs":
			return complete(request.id, reader.searchLogs(request.query, request.cursor), (result) => ({
				_tag: "log-page",
				id: request.id,
				result,
			}));
		case "get-log":
			return complete(request.id, reader.getLog(request.logId), (result) => ({
				_tag: "log-detail",
				id: request.id,
				result,
			}));
		case "list-services":
			return complete(
				request.id,
				reader.listServices(request.range, request.limit, request.cursor),
				(result) => ({
					_tag: "service-page",
					id: request.id,
					result,
				}),
			);
		case "list-diagnostics":
			return complete(
				request.id,
				reader.listDiagnostics(request.range, request.limit, request.cursor),
				(result) => ({ _tag: "diagnostic-page", id: request.id, result }),
			);
		case "facets":
			return complete(request.id, reader.facets(request.request, request.cursor), (result) => ({
				_tag: "facets-result",
				id: request.id,
				result,
			}));
	}
};

const initialize = (id: string, databasePath: string): Effect.Effect<QueryWorkerResponse> =>
	Effect.gen(function* () {
		if (reader !== undefined) {
			return {
				_tag: "protocol-failure",
				id,
				message: "The Query worker is already initialized.",
			} as const;
		}
		const scope = yield* Scope.make();
		const opened = yield* Effect.result(openTelemetryReader({ databasePath }).pipe(Scope.provide(scope)));
		if (opened._tag === "Failure") {
			yield* Scope.close(scope, Exit.fail(opened.failure));
			return {
				_tag: "storage-failure",
				id,
				code: opened.failure.code,
				message: opened.failure.message,
			} as const;
		}
		readerScope = scope;
		reader = opened.success;
		return { _tag: "ready", id } as const;
	});

const complete = <A>(
	id: string,
	operation: Effect.Effect<A, StorageFailure | StorageNotFound>,
	onSuccess: (result: A) => QueryWorkerResponse,
): Effect.Effect<QueryWorkerResponse> =>
	Effect.match(operation, {
		onFailure: (failure): QueryWorkerResponse =>
			failure instanceof StorageNotFound
				? {
						_tag: "not-found",
						id,
						entity: failure.entity,
						entityId: failure.id,
						message: failure.message,
					}
				: {
						_tag: "storage-failure",
						id,
						code: failure.code,
						message: failure.message,
					},
		onSuccess,
	});

const shutdown = (id: string): Effect.Effect<QueryWorkerResponse> =>
	Effect.gen(function* () {
		if (readerScope !== undefined) yield* Scope.close(readerScope, Exit.void);
		readerScope = undefined;
		reader = undefined;
		return { _tag: "shutdown-success", id } as const;
	});

const post = (response: QueryWorkerResponse): void => {
	workerGlobal.postMessage(Schema.encodeSync(QueryWorkerResponseSchema)(response));
};

const requestId = (value: unknown): string =>
	typeof value === "object" && value !== null && "id" in value && typeof value.id === "string" ? value.id : "unknown";
