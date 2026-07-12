import { initialWorkspaceState, transitionWorkspace } from "@belfry/workspace";
import { assert, describe, it } from "@effect/vitest";

import { serviceFilterLabel } from "./data-source.js";
import { applyFilterInput, transitionFilterMenu, updateFilterDraft } from "./filters.js";

describe("TUI structured filters", () => {
	it("cycles signal-specific filters and clears the composed query", () => {
		const initial = initialWorkspaceState(1_800_000_000_000_000_000n);
		const status = transitionFilterMenu(initial, "1");
		assert.strictEqual(status?.workspace.traceQuery.status, "error");

		const withText = transitionWorkspace(status?.workspace ?? initial, {
			type: "trace-query-changed",
			query: { text: "checkout" },
		});
		const cleared = transitionFilterMenu(withText, "c");
		assert.strictEqual(cleared?.workspace.traceQuery.status, undefined);
		assert.strictEqual(cleared?.workspace.traceQuery.text, undefined);
		assert.deepStrictEqual(cleared?.workspace.traceQuery.attributes, []);
		assert.strictEqual(cleared?.workspace.traceQuery.sort, initial.traceQuery.sort);
		assert.strictEqual(cleared?.workspace.traceQuery.fromNs, initial.traceQuery.fromNs);
	});

	it("validates identities and applies a two-step exact attribute filter", () => {
		const initial = initialWorkspaceState(1_800_000_000_000_000_000n);
		const invalid = applyFilterInput(initial, { kind: "input", field: "trace-id", draft: "BAD" });
		assert.match(invalid.message ?? "", /32 lowercase/u);
		assert.strictEqual(invalid.editor?.kind, "input");

		const key = applyFilterInput(initial, {
			kind: "input",
			field: "attribute-key",
			draft: "http.method",
		});
		const valueEditor = updateFilterDraft(key.editor, "GET");
		const value = applyFilterInput(key.workspace, valueEditor);
		assert.deepStrictEqual(value.workspace.traceQuery.attributes, [
			{ key: "http.method", operator: "equals", value: "GET" },
		]);
		assert.strictEqual(value.editor, undefined);
	});

	it("edits operation, both duration bounds, and maximum log severity without syntax", () => {
		const initial = initialWorkspaceState(1_800_000_000_000_000_000n);
		const operation = applyFilterInput(initial, {
			kind: "input",
			field: "operation",
			draft: "POST /checkout",
		});
		const minimum = applyFilterInput(operation.workspace, {
			kind: "input",
			field: "minimum-duration",
			draft: "5",
		});
		const maximum = applyFilterInput(minimum.workspace, {
			kind: "input",
			field: "maximum-duration",
			draft: "25.5",
		});
		assert.strictEqual(maximum.workspace.traceQuery.operation, "POST /checkout");
		assert.strictEqual(maximum.workspace.traceQuery.minimumDurationNs, 5_000_000n);
		assert.strictEqual(maximum.workspace.traceQuery.maximumDurationNs, 25_500_000n);

		const logs = transitionWorkspace(maximum.workspace, { type: "signal-changed", signal: "logs" });
		const severity = applyFilterInput(logs, {
			kind: "input",
			field: "maximum-severity",
			draft: "20",
		});
		assert.strictEqual(severity.workspace.logQuery.maximumSeverity, 20);
		assert.strictEqual(transitionFilterMenu(logs, "5")?.editor?.kind, "input");
	});

	it("renders the complete canonical identity for same-name Services", () => {
		assert.strictEqual(
			serviceFilterLabel([
				{ namespace: "shop", name: "api", environment: "development" },
				{ namespace: "admin", name: "api", environment: "production" },
			]),
			"shop/api · development, admin/api · production",
		);
	});
});
