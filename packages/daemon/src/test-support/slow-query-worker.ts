type WorkerRequest = { readonly _tag?: string; readonly id?: string };
type WorkerGlobal = {
	onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
	postMessage: (message: unknown) => void;
	close: () => void;
};

const worker = globalThis as unknown as WorkerGlobal;

worker.onmessage = (event) => {
	if (event.data._tag === "initialize" && event.data.id !== undefined) {
		worker.postMessage({ _tag: "ready", id: event.data.id });
		return;
	}
	if (event.data._tag === "search-logs" && event.data.id !== undefined) {
		worker.postMessage({
			_tag: "log-page",
			id: event.data.id,
			result: {
				items: [],
				bounds: { fromNs: "1", toNs: "2", limit: 1 },
				truncated: false,
			},
		});
		return;
	}
	if (event.data._tag === "shutdown" && event.data.id !== undefined) {
		worker.postMessage({ _tag: "shutdown-success", id: event.data.id });
		worker.close();
		return;
	}
	const until = performance.now() + 1_000;
	while (performance.now() < until) {
		// Deliberately occupy only the isolated worker thread.
	}
};
