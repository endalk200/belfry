import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { TelemetryWorkbench } from "./workbench.js";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Belfry web root is missing");

const refreshIntervalMs = parsePositiveInteger(root.dataset.refreshIntervalMs, 2_000);
const defaultRangeMinutes = parsePositiveInteger(root.dataset.defaultRangeMinutes, 15);
const queryMaxResults = parsePositiveInteger(root.dataset.queryMaxResults, 500);
const queryMaxLookbackMinutes = parsePositiveInteger(root.dataset.queryMaxLookbackMinutes, 10_080);

createRoot(root).render(
	<StrictMode>
		<TelemetryWorkbench
			endpoint={window.location.origin}
			refreshIntervalMs={refreshIntervalMs}
			defaultRangeMinutes={defaultRangeMinutes}
			queryMaxResults={queryMaxResults}
			queryMaxLookbackMinutes={queryMaxLookbackMinutes}
		/>
	</StrictMode>,
);

function parsePositiveInteger(value: string | undefined, fallback: number): number {
	const parsed = value === undefined ? Number.NaN : Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
