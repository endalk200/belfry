import { canonicalSpanId, canonicalTraceId } from "@belfry/telemetry";
import { transitionWorkspace, type WorkspaceState } from "@belfry/workspace";

export type FilterInputField =
	| "operation"
	| "minimum-duration"
	| "maximum-duration"
	| "maximum-severity"
	| "trace-id"
	| "span-id"
	| "attribute-key"
	| "attribute-value";

export type FilterEditorState =
	| { readonly kind: "menu" }
	| {
			readonly kind: "input";
			readonly field: FilterInputField;
			readonly draft: string;
			readonly attributeKey?: string;
	  };

export const updateFilterDraft = (
	editor: FilterEditorState | undefined,
	draft: string,
): FilterEditorState | undefined => (editor?.kind === "input" ? { ...editor, draft } : editor);

export const transitionFilterMenu = (
	workspace: WorkspaceState,
	key: string,
): { readonly workspace: WorkspaceState; readonly editor: FilterEditorState | undefined } | undefined => {
	if (key === "1") {
		return {
			workspace:
				workspace.signal === "traces"
					? transitionWorkspace(workspace, {
							type: "trace-query-changed",
							query: { status: nextTraceStatus(workspace.traceQuery.status) },
						})
					: transitionWorkspace(workspace, {
							type: "log-query-changed",
							query: {
								minimumSeverity: nextMinimumSeverity(
									workspace.logQuery.minimumSeverity,
									workspace.logQuery.maximumSeverity,
								),
							},
						}),
			editor: { kind: "menu" },
		};
	}
	if (key === "2") {
		return {
			workspace,
			editor:
				workspace.signal === "traces"
					? { kind: "input", field: "operation", draft: workspace.traceQuery.operation ?? "" }
					: {
							kind: "input",
							field: "maximum-severity",
							draft: workspace.logQuery.maximumSeverity?.toString() ?? "",
						},
		};
	}
	if (key === "3") {
		return {
			workspace,
			editor:
				workspace.signal === "traces"
					? durationEditor("minimum-duration", workspace.traceQuery.minimumDurationNs)
					: { kind: "input", field: "trace-id", draft: workspace.logQuery.traceId ?? "" },
		};
	}
	if (key === "4") {
		return {
			workspace,
			editor:
				workspace.signal === "traces"
					? durationEditor("maximum-duration", workspace.traceQuery.maximumDurationNs)
					: { kind: "input", field: "span-id", draft: workspace.logQuery.spanId ?? "" },
		};
	}
	if (key === "5") {
		return {
			workspace,
			editor:
				workspace.signal === "traces"
					? { kind: "input", field: "trace-id", draft: workspace.traceQuery.traceId ?? "" }
					: { kind: "input", field: "attribute-key", draft: "" },
		};
	}
	if (key === "6" && workspace.signal === "traces") {
		return { workspace, editor: { kind: "input", field: "attribute-key", draft: "" } };
	}
	if (key === "c") {
		return { workspace: transitionWorkspace(workspace, { type: "filters-cleared" }), editor: undefined };
	}
	return undefined;
};

export const applyFilterInput = (
	workspace: WorkspaceState,
	editor: FilterEditorState | undefined,
): {
	readonly workspace: WorkspaceState;
	readonly editor: FilterEditorState | undefined;
	readonly message: string | undefined;
} => {
	if (editor?.kind !== "input") return { workspace, editor, message: undefined };
	const draft = editor.draft.trim();
	switch (editor.field) {
		case "operation":
			return {
				workspace: transitionWorkspace(workspace, {
					type: "trace-query-changed",
					query: { operation: draft === "" ? undefined : draft },
				}),
				editor: undefined,
				message: undefined,
			};
		case "minimum-duration":
		case "maximum-duration": {
			const nanoseconds = Math.round(Number(draft) * 1_000_000);
			if (draft !== "" && (!Number.isSafeInteger(nanoseconds) || nanoseconds < 0)) {
				return {
					workspace,
					editor,
					message: "Duration must be a non-negative millisecond value.",
				};
			}
			const value = draft === "" ? undefined : BigInt(nanoseconds);
			if (
				(editor.field === "minimum-duration" &&
					value !== undefined &&
					workspace.traceQuery.maximumDurationNs !== undefined &&
					value > workspace.traceQuery.maximumDurationNs) ||
				(editor.field === "maximum-duration" &&
					value !== undefined &&
					workspace.traceQuery.minimumDurationNs !== undefined &&
					value < workspace.traceQuery.minimumDurationNs)
			) {
				return { workspace, editor, message: "Minimum duration cannot exceed maximum duration." };
			}
			return {
				workspace: transitionWorkspace(workspace, {
					type: "trace-query-changed",
					query:
						editor.field === "minimum-duration"
							? { minimumDurationNs: value }
							: { maximumDurationNs: value },
				}),
				editor: undefined,
				message: undefined,
			};
		}
		case "maximum-severity": {
			const severity = draft === "" ? undefined : Number(draft);
			if (
				severity !== undefined &&
				(!Number.isSafeInteger(severity) ||
					severity < 1 ||
					severity > 24 ||
					(workspace.logQuery.minimumSeverity !== undefined && severity < workspace.logQuery.minimumSeverity))
			) {
				return {
					workspace,
					editor,
					message: "Maximum severity must be an integer from 1 through 24 and not below the minimum.",
				};
			}
			return {
				workspace: transitionWorkspace(workspace, {
					type: "log-query-changed",
					query: { maximumSeverity: severity },
				}),
				editor: undefined,
				message: undefined,
			};
		}
		case "trace-id": {
			const traceId = draft === "" ? undefined : canonicalTraceId(draft);
			if (draft !== "" && traceId === undefined) {
				return {
					workspace,
					editor,
					message: "Trace ID must be 32 lowercase hexadecimal characters and non-zero.",
				};
			}
			return {
				workspace: transitionWorkspace(
					workspace,
					workspace.signal === "traces"
						? { type: "trace-query-changed", query: { traceId } }
						: { type: "log-query-changed", query: { traceId } },
				),
				editor: undefined,
				message: undefined,
			};
		}
		case "span-id": {
			const spanId = draft === "" ? undefined : canonicalSpanId(draft);
			if (draft !== "" && spanId === undefined) {
				return {
					workspace,
					editor,
					message: "Span ID must be 16 lowercase hexadecimal characters and non-zero.",
				};
			}
			return {
				workspace: transitionWorkspace(workspace, { type: "log-query-changed", query: { spanId } }),
				editor: undefined,
				message: undefined,
			};
		}
		case "attribute-key":
			return draft === ""
				? { workspace, editor, message: "Attribute key cannot be empty." }
				: {
						workspace,
						editor: { kind: "input", field: "attribute-value", draft: "", attributeKey: draft },
						message: undefined,
					};
		case "attribute-value":
			if (editor.attributeKey === undefined) return { workspace, editor: undefined, message: undefined };
			return {
				workspace: transitionWorkspace(workspace, {
					type: "attribute-filter-promoted",
					signal: workspace.signal,
					key: editor.attributeKey,
					value: draft,
				}),
				editor: undefined,
				message: undefined,
			};
	}
};

const durationEditor = (
	field: "minimum-duration" | "maximum-duration",
	value: bigint | undefined,
): FilterEditorState => ({
	kind: "input",
	field,
	draft: value === undefined ? "" : String(Number(value) / 1_000_000),
});

export const workspaceFilterLabel = (workspace: WorkspaceState): string => {
	const query = workspace.signal === "traces" ? workspace.traceQuery : workspace.logQuery;
	const filters: Array<string> = [];
	if (query.text !== undefined) filters.push(`text=${query.text}`);
	if (workspace.signal === "traces") {
		const trace = workspace.traceQuery;
		if (trace.operation !== undefined) filters.push(`operation=${trace.operation}`);
		if (trace.status !== undefined && trace.status !== "all") filters.push(`status=${trace.status}`);
		if (trace.minimumDurationNs !== undefined)
			filters.push(`duration≥${Number(trace.minimumDurationNs) / 1_000_000}ms`);
		if (trace.maximumDurationNs !== undefined)
			filters.push(`duration≤${Number(trace.maximumDurationNs) / 1_000_000}ms`);
		if (trace.traceId !== undefined) filters.push(`trace=${trace.traceId}`);
	} else {
		const log = workspace.logQuery;
		if (log.minimumSeverity !== undefined) filters.push(`severity≥${log.minimumSeverity}`);
		if (log.maximumSeverity !== undefined) filters.push(`severity≤${log.maximumSeverity}`);
		if (log.traceId !== undefined) filters.push(`trace=${log.traceId}`);
		if (log.spanId !== undefined) filters.push(`span=${log.spanId}`);
	}
	if (query.attributes.length > 0) filters.push(`${query.attributes.length} attribute`);
	return filters.length === 0 ? "none" : filters.join(" · ");
};

const nextTraceStatus = (current: WorkspaceState["traceQuery"]["status"]): WorkspaceState["traceQuery"]["status"] => {
	switch (current) {
		case undefined:
		case "all":
			return "error";
		case "error":
			return "active";
		case "active":
			return "ok";
		case "ok":
			return undefined;
	}
};

const nextMinimumSeverity = (current: number | undefined, maximum: number | undefined): number | undefined => {
	const next = current === undefined ? 13 : current === 13 ? 17 : current === 17 ? 21 : undefined;
	return next !== undefined && maximum !== undefined && next > maximum ? undefined : next;
};
