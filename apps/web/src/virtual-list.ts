import { type RefObject, useLayoutEffect, useState } from "react";

export type VirtualWindow = {
	readonly start: number;
	readonly end: number;
	readonly offset: number;
	readonly totalHeight: number;
};

export const useVirtualWindow = (
	container: RefObject<HTMLElement | null>,
	itemCount: number,
	rowHeight: number,
	overscan = 6,
): VirtualWindow => {
	const [viewport, setViewport] = useState({ height: 480, top: 0 });

	useLayoutEffect(() => {
		const element = container.current;
		if (element === null) return;
		const update = () => setViewport({ height: element.clientHeight, top: element.scrollTop });
		update();
		element.addEventListener("scroll", update, { passive: true });
		const resize = new ResizeObserver(update);
		resize.observe(element);
		return () => {
			element.removeEventListener("scroll", update);
			resize.disconnect();
		};
	}, [container]);

	const visibleStart = Math.floor(viewport.top / rowHeight);
	const visibleCount = Math.ceil(viewport.height / rowHeight);
	const start = Math.max(0, visibleStart - overscan);
	const end = Math.min(itemCount, visibleStart + visibleCount + overscan);
	return { start, end, offset: start * rowHeight, totalHeight: itemCount * rowHeight };
};
