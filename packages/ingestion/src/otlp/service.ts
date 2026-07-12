import { Context, Effect, Layer } from "effect";

import { IngestionPayloadTooLarge } from "../errors.js";
import { decodeOtlpLogs, decodeOtlpTraces, OtlpDecodeError, UnsupportedOtlpContentType } from "./decoder.js";
import type { NormalizedBatch } from "./types.js";

export type OtlpDecodeRequest = {
	readonly signal: "traces" | "logs";
	readonly contentType: string;
	readonly contentEncoding: "identity" | "gzip";
	readonly body: Uint8Array;
	readonly maxDecompressedBytes: number;
};

export type OtlpDecoderService = {
	readonly decode: (
		request: OtlpDecodeRequest,
	) => Effect.Effect<NormalizedBatch, IngestionPayloadTooLarge | OtlpDecodeError | UnsupportedOtlpContentType>;
};

export class OtlpDecoder extends Context.Service<OtlpDecoder, OtlpDecoderService>()("@belfry/ingestion/OtlpDecoder") {
	static readonly layer = Layer.succeed(OtlpDecoder, makeOtlpDecoder());
}

export function makeOtlpDecoder(): OtlpDecoderService {
	return {
		decode: Effect.fn("OtlpDecoder.decode")(function* (request: OtlpDecodeRequest) {
			const decompressed = yield* Effect.tryPromise({
				try: () => decompressBounded(request.body, request.contentEncoding, request.maxDecompressedBytes),
				catch: (cause) =>
					cause instanceof IngestionPayloadTooLarge
						? cause
						: new OtlpDecodeError({
								signal: request.signal,
								code: "malformed_payload",
								message: `Could not decompress the OTLP request: ${errorMessage(cause)}`,
							}),
			});
			return yield* Effect.try({
				try: () =>
					request.signal === "traces"
						? decodeOtlpTraces(decompressed, request.contentType)
						: decodeOtlpLogs(decompressed, request.contentType),
				catch: (cause) =>
					cause instanceof OtlpDecodeError || cause instanceof UnsupportedOtlpContentType
						? cause
						: new OtlpDecodeError({
								signal: request.signal,
								code: "malformed_payload",
								message: errorMessage(cause),
							}),
			});
		}),
	};
}

const decompressBounded = async (
	body: Uint8Array,
	contentEncoding: "identity" | "gzip",
	limitBytes: number,
): Promise<Uint8Array> => {
	if (contentEncoding === "identity") {
		if (body.byteLength > limitBytes) throw decompressedLimit(limitBytes, body.byteLength);
		return body;
	}
	const stream = new Blob([toArrayBuffer(body)]).stream().pipeThrough(new DecompressionStream("gzip"));
	const reader = stream.getReader();
	const chunks: Array<Uint8Array> = [];
	let bytes = 0;
	try {
		while (true) {
			const next = await reader.read();
			if (next.done) break;
			bytes += next.value.byteLength;
			if (bytes > limitBytes) {
				await reader.cancel();
				throw decompressedLimit(limitBytes, bytes);
			}
			chunks.push(next.value);
		}
	} finally {
		reader.releaseLock();
	}
	const result = new Uint8Array(bytes);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return result;
};

const decompressedLimit = (limitBytes: number, actualBytes: number) =>
	new IngestionPayloadTooLarge({
		stage: "decompressed",
		limitBytes,
		actualBytes,
		message: `The decompressed OTLP request exceeds Belfry's configured ${limitBytes} byte limit.`,
	});

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return copy.buffer;
};

const errorMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : String(cause));
