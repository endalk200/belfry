import { opentelemetry } from "@belfry/otlp-proto";

export type OtlpSuccessResponse = {
	readonly contentType: "application/json" | "application/x-protobuf";
	readonly body: Uint8Array;
};

export type OtlpErrorResponse = OtlpSuccessResponse;

const encoder = new TextEncoder();

export const makeOtlpSuccessResponse = (signal: "traces" | "logs", requestContentType: string): OtlpSuccessResponse => {
	const contentType = requestContentType.split(";", 1)[0]?.trim().toLowerCase();
	if (contentType === "application/json") return { contentType, body: encoder.encode("{}") };
	const body =
		signal === "traces"
			? opentelemetry.proto.collector.trace.v1.ExportTraceServiceResponse.encode({}).finish()
			: opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse.encode({}).finish();
	return { contentType: "application/x-protobuf", body };
};

export const makeOtlpErrorResponse = (requestContentType: string, code: number, message: string): OtlpErrorResponse => {
	const contentType = requestContentType.split(";", 1)[0]?.trim().toLowerCase();
	if (contentType === "application/x-protobuf") {
		const messageBytes = encoder.encode(message);
		return {
			contentType,
			body: Uint8Array.from([
				8,
				...encodeVarint(code),
				18,
				...encodeVarint(messageBytes.byteLength),
				...messageBytes,
			]),
		};
	}
	return {
		contentType: "application/json",
		body: encoder.encode(JSON.stringify({ code, message })),
	};
};

const encodeVarint = (input: number): ReadonlyArray<number> => {
	const bytes: Array<number> = [];
	let value = input >>> 0;
	do {
		const byte = value & 0x7f;
		value >>>= 7;
		bytes.push(value === 0 ? byte : byte | 0x80);
	} while (value !== 0);
	return bytes;
};
