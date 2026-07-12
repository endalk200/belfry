import { assert, describe, it } from "@effect/vitest";

import { virtualWindow, waterfallView } from "./layout.js";

describe("TUI bounded layout", () => {
	it("keeps the focused identity inside a stable virtual window and clamps invalid indexes", () => {
		const rows = Array.from({ length: 100 }, (_, index) => `row-${index}`);

		assert.deepStrictEqual(virtualWindow(rows, 50, 10), {
			items: rows.slice(45, 55),
			offset: 45,
		});
		assert.deepStrictEqual(virtualWindow(rows, -1, 10), {
			items: rows.slice(0, 10),
			offset: 0,
		});
	});

	it("derives bounded waterfall rows with an inspectable timing scale", () => {
		const rows = Array.from({ length: 30 }, (_, index) => ({
			span: {
				traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
				spanId: (index + 1).toString(16).padStart(16, "0"),
				name: `span-${index}`,
				kind: 2 as const,
				startTimeNs: BigInt(index * 10),
				endTimeNs: BigInt(index * 10 + 5),
				service: { name: "test" },
				status: { code: 1 as const },
				attributes: {},
				events: [],
				links: [],
				resource: { attributes: {} },
				scope: { name: "test" },
				logCount: 0,
				warnings: [],
			},
			depth: index % 3,
			relativeStartNs: String(index * 10),
			durationNs: "5",
			warnings: [],
			hasChildren: false,
			collapsed: false,
			hiddenDescendantCount: 0,
		}));

		const view = waterfallView(rows, 20, 8, 300n, 4, 12);

		assert.strictEqual(view.items.length, 8);
		assert.isAtLeast(view.offset, 0);
		assert.strictEqual(
			view.items.every((row) => row.timingBar.length === 12),
			true,
		);
	});
});
