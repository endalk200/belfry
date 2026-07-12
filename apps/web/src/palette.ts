/** Deterministic, muted service hues so every span/list row identifies its service at a glance. */
const serviceHues = [
	"#7fb3e3", // blue
	"#7ec9a2", // green
	"#c9a2d6", // purple
	"#e3b566", // amber
	"#6cc4c4", // teal
	"#e09a7a", // salmon
	"#aab876", // olive
	"#8b9de0", // indigo
] as const;

export const serviceColor = (name: string): string => {
	let hash = 0;
	for (let index = 0; index < name.length; index += 1) {
		hash = (hash * 31 + name.charCodeAt(index)) | 0;
	}
	return serviceHues[Math.abs(hash) % serviceHues.length] ?? serviceHues[0];
};
