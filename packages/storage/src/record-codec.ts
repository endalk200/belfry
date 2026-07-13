import type { OtlpAnyValue, SpanDetail, TelemetryAttributes } from "@belfry/telemetry";
import { Schema } from "effect";

const sensitiveAttributeKey =
	/(?:^|[._-])(authorization|cookie|password|passwd|secret|token|api[._-]?key)(?:$|[._-])/iu;
const highCardinalityAttributeKey =
	/(?:^|[._-])(id|uuid|guid|email|address|stack|statement|query|url|uri|user[._-]?agent)(?:$|[._-])/iu;
const textEncoder = new TextEncoder();

export type AttributeProjection = { readonly key: string; readonly type: string; readonly value: string };

export type AttributeProjectionResult = {
	readonly projections: ReadonlyArray<AttributeProjection>;
	readonly truncatedValues: number;
};

export const attributeProjections = (
	attributes: TelemetryAttributes,
	maxAttributes: number,
	maxValueBytes: number,
): ReadonlyArray<AttributeProjection> => projectAttributes(attributes, maxAttributes, maxValueBytes).projections;

export const projectAttributes = (
	attributes: TelemetryAttributes,
	maxAttributes: number,
	maxValueBytes: number,
): AttributeProjectionResult => {
	const projections: Array<AttributeProjection> = [];
	let truncatedValues = 0;
	for (const [key, value] of Object.entries(attributes)) {
		if (sensitiveAttributeKey.test(key)) continue;
		if (!isAutomaticallyIndexableAttributeKey(key)) {
			truncatedValues += 1;
			continue;
		}
		const scalar = scalarProjection(value);
		if (scalar === undefined) continue;
		if (projections.length >= maxAttributes || textEncoder.encode(scalar.value).byteLength > maxValueBytes) {
			truncatedValues += 1;
			continue;
		}
		projections.push({ key, ...scalar });
	}
	return { projections, truncatedValues };
};

export const isAutomaticallyIndexableAttributeKey = (key: string): boolean =>
	key.length > 0 &&
	textEncoder.encode(key).byteLength <= 512 &&
	!sensitiveAttributeKey.test(key) &&
	!highCardinalityAttributeKey.test(key);

const scalarProjection = (value: OtlpAnyValue): Omit<AttributeProjection, "key"> | undefined => {
	switch (value.type) {
		case "string":
			return { type: "string", value: value.value };
		case "boolean":
			return { type: "boolean", value: String(value.value) };
		case "integer":
			return { type: "integer", value: value.value.toString() };
		case "double":
			return { type: "double", value: String(value.value) };
		default:
			return undefined;
	}
};

export const attributeSearchText = (attributes: TelemetryAttributes): string =>
	Object.entries(attributes)
		.filter(([key]) => !sensitiveAttributeKey.test(key))
		.map(([key, value]) => `${key} ${anyValueText(value)}`)
		.join(" ");

export const projectionSearchText = (projections: ReadonlyArray<AttributeProjection>): string =>
	projections.map(({ key, value }) => `${key} ${value}`).join(" ");

export const spanSearchText = (span: SpanDetail, projections: ReadonlyArray<AttributeProjection>): string =>
	[
		span.name,
		span.status.message ?? "",
		span.events.map((event) => event.name).join(" "),
		projectionSearchText(projections),
	].join(" ");

export const anyValueText = (value: OtlpAnyValue): string => {
	switch (value.type) {
		case "empty":
			return "";
		case "bytes":
			return `[${value.value.byteLength} bytes]`;
		case "array":
			return value.value.map(anyValueText).join(" ");
		case "key-value-list":
			return attributeSearchText(value.value);
		default:
			return String(value.value);
	}
};

export const encodeJson = <A, I>(schema: Schema.Codec<A, I>, value: A): string =>
	stableStringify(Schema.encodeSync(Schema.toCodecJson(schema))(value));

export const encodeDetailJson = <A, I>(schema: Schema.Codec<A, I>, value: A): string =>
	JSON.stringify(Schema.encodeSync(Schema.toCodecJson(schema))(value));

export const decodeJson = <A, I>(schema: Schema.Codec<A, I>, json: string): A =>
	Schema.decodeUnknownSync(Schema.toCodecJson(schema))(JSON.parse(json));

const stableStringify = (value: unknown): string => {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	return `{${Object.entries(value)
		.filter(([, item]) => item !== undefined)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
		.join(",")}}`;
};
