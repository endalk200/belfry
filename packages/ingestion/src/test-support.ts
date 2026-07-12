export const failingWriterWorkerUrl = new URL(
	import.meta.url.endsWith(".ts")
		? "./test-support/failing-writer-worker.ts"
		: "./test-support/failing-writer-worker.js",
	import.meta.url,
);
