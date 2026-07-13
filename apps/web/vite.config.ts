import { writeFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		{
			name: "belfry-sbom-module-inventory",
			writeBundle() {
				writeFileSync(
					new URL("./dist/.sbom-modules.json", import.meta.url),
					`${JSON.stringify([...this.getModuleIds()].sort(), undefined, 2)}\n`,
				);
			},
		},
	],
	resolve: {
		conditions: ["development"],
	},
	build: {
		target: "es2022",
	},
});
