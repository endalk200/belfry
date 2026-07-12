import { defineConfig } from "vitest/config";

export default defineConfig({
	ssr: {
		noExternal: ["@opentui/react", "react-reconciler"],
	},
	test: {
		environment: "node",
	},
});
