type WorkerRequest = { readonly _tag?: string; readonly id?: string };
type WorkerGlobal = {
	onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
	postMessage: (message: unknown) => void;
};

const worker = globalThis as unknown as WorkerGlobal;

worker.onmessage = (event) => {
	if (event.data._tag === "initialize" && event.data.id !== undefined) {
		worker.postMessage({ _tag: "ready", id: event.data.id });
		return;
	}
	throw new Error("Simulated writer worker crash");
};
