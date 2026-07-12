import type { TraceWaterfallRow } from "@belfry/workspace";

export type VirtualWindow<A> = {
	readonly items: ReadonlyArray<A>;
	readonly offset: number;
};

export const virtualWindow = <A>(
	items: ReadonlyArray<A>,
	selectedIndex: number,
	capacity: number,
): VirtualWindow<A> => {
	const boundedCapacity = Math.max(1, Math.trunc(capacity));
	if (items.length <= boundedCapacity) return { items, offset: 0 };
	const boundedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex));
	const offset = Math.max(
		0,
		Math.min(items.length - boundedCapacity, boundedIndex - Math.floor(boundedCapacity / 2)),
	);
	return { items: items.slice(offset, offset + boundedCapacity), offset };
};

export type WaterfallRowView = TraceWaterfallRow & {
	readonly timingBar: string;
};

export const waterfallView = (
	rows: ReadonlyArray<TraceWaterfallRow>,
	selectedIndex: number,
	capacity: number,
	traceDurationNs: bigint | undefined,
	scale: number,
	barWidth = 16,
): VirtualWindow<WaterfallRowView> => {
	const visible = virtualWindow(rows, selectedIndex, capacity);
	const total = traceDurationNs === undefined || traceDurationNs <= 0n ? 1n : traceDurationNs;
	const boundedScale = Math.max(1, Math.trunc(scale));
	const viewportDuration = total / BigInt(boundedScale) || 1n;
	const selectedStart = BigInt(rows[Math.max(0, selectedIndex)]?.relativeStartNs ?? 0);
	const unclampedStart = selectedStart - viewportDuration / 2n;
	const viewportStart =
		unclampedStart < 0n
			? 0n
			: unclampedStart + viewportDuration > total
				? total - viewportDuration
				: unclampedStart;
	const width = Math.max(4, Math.trunc(barWidth));

	return {
		offset: visible.offset,
		items: visible.items.map((row) => {
			const start = BigInt(row.relativeStartNs);
			const duration = row.durationNs === undefined ? 0n : BigInt(row.durationNs);
			const relativeStart = start - viewportStart;
			const startColumn = Number((relativeStart * BigInt(width)) / viewportDuration);
			const durationColumns = Math.max(1, Number((duration * BigInt(width)) / viewportDuration));
			const clippedStart = Math.max(0, Math.min(width - 1, startColumn));
			const clippedEnd = Math.max(clippedStart + 1, Math.min(width, startColumn + durationColumns));
			const visibleInViewport = startColumn < width && startColumn + durationColumns > 0;
			const timingBar = visibleInViewport
				? `${" ".repeat(clippedStart)}${"━".repeat(clippedEnd - clippedStart)}`.padEnd(width)
				: startColumn < 0
					? "◀".padEnd(width)
					: `${" ".repeat(width - 1)}▶`;
			return { ...row, timingBar };
		}),
	};
};
