import { Context, Effect, Layer, Schema } from "effect";

import { IngestionUnavailable } from "./errors.js";
import { type WriterRequest, type WriterResponse, WriterResponseSchema } from "./worker-protocol.js";

export type WriterTransport = {
	readonly call: (request: WriterRequest) => Effect.Effect<WriterResponse, IngestionUnavailable>;
	readonly shutdown: Effect.Effect<void>;
};

export type WriterTransportOptions = {
	readonly timeoutMs: number;
	readonly workerUrl?: URL | undefined;
	readonly onUnavailable: Effect.Effect<void>;
};

export class WriterWorkerTransport extends Context.Service<WriterWorkerTransport, WriterTransport>()(
	"@belfry/ingestion/WriterWorkerTransport",
) {
	static readonly layer = (options: WriterTransportOptions) =>
		Layer.effect(WriterWorkerTransport)(openWriterTransport(options));
}

type PendingCall = {
	readonly resolve: (response: WriterResponse) => void;
	readonly reject: (cause: unknown) => void;
};

export const openWriterTransport = (
	options: WriterTransportOptions,
): Effect.Effect<WriterTransport, IngestionUnavailable, import("effect").Scope.Scope> =>
	Effect.gen(function* () {
		const worker = yield* Effect.acquireRelease(
			Effect.try({
				try: () => new Worker(options.workerUrl ?? defaultWorkerUrl(), { type: "module" }),
				catch: () => unavailable("Could not start the telemetry writer worker."),
			}).pipe(Effect.tapError(() => options.onUnavailable)),
			(worker) => Effect.sync(() => worker.terminate()),
		);
		const pending = new Map<string, PendingCall>();
		const failPending = (cause: unknown) => {
			for (const waiter of pending.values()) waiter.reject(cause);
			pending.clear();
		};
		const notifyUnavailable = (cause: unknown) => {
			failPending(cause);
			Effect.runFork(options.onUnavailable);
		};
		const onMessage = (event: MessageEvent<unknown>) => {
			try {
				const response = Schema.decodeUnknownSync(WriterResponseSchema)(event.data);
				pending.get(response.id)?.resolve(response);
				pending.delete(response.id);
			} catch (cause) {
				notifyUnavailable(cause);
			}
		};
		const onError = (event: ErrorEvent) => notifyUnavailable(event.error ?? event.message);
		worker.addEventListener("message", onMessage);
		worker.addEventListener("error", onError);
		yield* Effect.addFinalizer(() =>
			Effect.sync(() => {
				worker.removeEventListener("message", onMessage);
				worker.removeEventListener("error", onError);
				failPending(new Error("The telemetry writer transport closed."));
			}),
		);

		const call = Effect.fn("WriterWorkerTransport.call")(function* (request: WriterRequest) {
			return yield* Effect.tryPromise({
				try: () =>
					new Promise<WriterResponse>((resolve, reject) => {
						const timeout = setTimeout(() => {
							pending.delete(request.id);
							reject(new Error("Writer worker response timed out"));
						}, options.timeoutMs);
						pending.set(request.id, {
							resolve: (response) => {
								clearTimeout(timeout);
								resolve(response);
							},
							reject: (cause) => {
								clearTimeout(timeout);
								reject(cause);
							},
						});
						try {
							worker.postMessage(request);
						} catch (cause) {
							pending.delete(request.id);
							clearTimeout(timeout);
							reject(cause);
						}
					}),
				catch: () => unavailable("The telemetry writer worker is unavailable."),
			}).pipe(Effect.tapError(() => options.onUnavailable));
		});

		return {
			call,
			shutdown: call({ _tag: "shutdown", id: crypto.randomUUID() }).pipe(Effect.ignore),
		};
	});

const defaultWorkerUrl = (): URL =>
	new URL(import.meta.url.endsWith(".ts") ? "./writer-worker.ts" : "./writer-worker.js", import.meta.url);

const unavailable = (message: string) =>
	new IngestionUnavailable({
		code: "writer_unavailable",
		message,
	});
