export const stringifyStableJson = (value: unknown): string => JSON.stringify(normalizeJson(value));

const normalizeJson = (value: unknown): unknown => {
	if (typeof value === "bigint") return value.toString();
	if (Array.isArray(value)) return value.map(normalizeJson);
	if (typeof value !== "object" || value === null) return value;
	return Object.fromEntries(
		Object.entries(value)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, item]) => [key, normalizeJson(item)]),
	);
};
