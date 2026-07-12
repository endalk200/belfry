import { NanosecondsSchema } from "@belfry/telemetry";
import { Schema } from "effect";

import { InvalidQuery } from "./api.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const CursorPayloadSchema = Schema.Struct({
	v: Schema.Literal(1),
	sort: Schema.Literals(["newest", "oldest", "slowest"]),
	timeNs: NanosecondsSchema,
	id: Schema.String,
	fingerprint: Schema.String,
});

type CursorPayload = typeof CursorPayloadSchema.Type;

export type CursorPosition = Pick<CursorPayload, "sort" | "timeNs" | "id">;

export const encodeCursor = async (position: CursorPosition, query: unknown, secret: Uint8Array): Promise<string> => {
	const payload = Schema.encodeSync(CursorPayloadSchema)({
		v: 1,
		...position,
		fingerprint: await queryFingerprint(query),
	});
	const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
	const signature = await sign(encodedPayload, secret);
	return `${encodedPayload}.${encodeBase64Url(signature)}`;
};

export const decodeCursor = async (cursor: string, query: unknown, secret: Uint8Array): Promise<CursorPosition> => {
	try {
		const parts = cursor.split(".");
		if (parts.length !== 2) throw new Error("Malformed cursor");
		const [encodedPayload, encodedSignature] = parts;
		if (encodedPayload === undefined || encodedSignature === undefined) {
			throw new Error("Malformed cursor");
		}

		const key = await importSigningKey(secret);
		const valid = await crypto.subtle.verify(
			"HMAC",
			key,
			toArrayBuffer(decodeBase64Url(encodedSignature)),
			encoder.encode(encodedPayload),
		);
		if (!valid) throw new Error("Invalid cursor signature");

		const payload = Schema.decodeUnknownSync(CursorPayloadSchema)(
			JSON.parse(decoder.decode(decodeBase64Url(encodedPayload))),
		);
		if (payload.fingerprint !== (await queryFingerprint(query))) {
			throw new Error("Cursor does not belong to this query");
		}

		return { sort: payload.sort, timeNs: payload.timeNs, id: payload.id };
	} catch {
		throw new InvalidQuery({
			code: "invalid_cursor",
			message: "The cursor is invalid or does not match the current query.",
		});
	}
};

const queryFingerprint = async (query: unknown): Promise<string> => {
	const normalized =
		typeof query === "object" && query !== null && !Array.isArray(query)
			? Object.fromEntries(Object.entries(query).filter(([key]) => key !== "cursor"))
			: query;
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(stableSerialize(normalized)));
	return encodeBase64Url(new Uint8Array(digest));
};

const stableSerialize = (value: unknown): string => {
	if (typeof value === "bigint") return JSON.stringify({ $bigint: value.toString() });
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;

	return `{${Object.entries(value)
		.filter(([, item]) => item !== undefined)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
		.join(",")}}`;
};

const sign = async (payload: string, secret: Uint8Array): Promise<Uint8Array> => {
	const key = await importSigningKey(secret);
	return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
};

const importSigningKey = (secret: Uint8Array): Promise<CryptoKey> =>
	crypto.subtle.importKey("raw", toArrayBuffer(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return copy.buffer;
};

const encodeBase64Url = (bytes: Uint8Array): string =>
	btoa(String.fromCharCode(...bytes))
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/u, "");

const decodeBase64Url = (value: string): Uint8Array => {
	const padding = "=".repeat((4 - (value.length % 4)) % 4);
	const decoded = atob(value.replaceAll("-", "+").replaceAll("_", "/") + padding);
	return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
};
