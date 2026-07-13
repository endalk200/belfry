type WorkerRequest = { readonly _tag?: string; readonly id?: string };
type WorkerGlobal = {
	onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
	postMessage: (message: unknown) => void;
	close: () => void;
};

const worker = globalThis as unknown as WorkerGlobal;

worker.onmessage = (event) => {
	const id = event.data.id ?? "unknown";
	if (event.data._tag === "initialize") {
		worker.postMessage({ _tag: "ready", id });
		return;
	}
	if (event.data._tag === "ingest") {
		setTimeout(() => {
			worker.postMessage({ _tag: "ingest-success", id, records: 1, logIds: [], durationMs: 350 });
		}, 350);
		return;
	}
	if (event.data._tag === "maintenance") {
		worker.postMessage({ _tag: "maintenance-success", id });
		return;
	}
	if (event.data._tag === "shutdown") {
		worker.postMessage({ _tag: "shutdown-success", id });
		worker.close();
	}
};
