import { type KeyboardEvent, type PointerEvent, type RefObject, useCallback, useRef, useState } from "react";

const storageKey = "belfry.workbench.split";
const defaultFraction = 0.42;
const minimumFraction = 0.24;
const maximumFraction = 0.72;
const keyboardStep = 0.03;

const clamp = (fraction: number): number => Math.min(maximumFraction, Math.max(minimumFraction, fraction));

const readStoredFraction = (): number => {
	try {
		const raw = window.localStorage.getItem(storageKey);
		const parsed = raw === null ? Number.NaN : Number.parseFloat(raw);
		return Number.isFinite(parsed) ? clamp(parsed) : defaultFraction;
	} catch {
		return defaultFraction;
	}
};

const storeFraction = (fraction: number): void => {
	try {
		window.localStorage.setItem(storageKey, fraction.toFixed(4));
	} catch {
		/* storage unavailable — resize still works for the session */
	}
};

export type SplitPane = {
	/** Attach to the element that owns both panes. */
	readonly containerRef: RefObject<HTMLDivElement | null>;
	/** List-pane share of the container width, 0..1. */
	readonly fraction: number;
	readonly dragging: boolean;
	readonly separatorProps: {
		readonly role: "separator";
		readonly "aria-orientation": "vertical";
		readonly "aria-label": string;
		readonly "aria-valuenow": number;
		readonly "aria-valuemin": number;
		readonly "aria-valuemax": number;
		readonly tabIndex: 0;
		readonly onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
		readonly onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
		readonly onDoubleClick: () => void;
	};
};

/** Draggable vertical divider between the result list and the detail pane. */
export const useSplitPane = (): SplitPane => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [fraction, setFraction] = useState(readStoredFraction);
	const [dragging, setDragging] = useState(false);

	const commit = useCallback((next: number) => {
		const clamped = clamp(next);
		setFraction(clamped);
		storeFraction(clamped);
	}, []);

	const onPointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const container = containerRef.current;
			if (container === null || event.button !== 0) return;
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			setDragging(true);
			const bounds = container.getBoundingClientRect();
			const move = (pointer: globalThis.PointerEvent) => {
				commit((pointer.clientX - bounds.left) / Math.max(1, bounds.width));
			};
			const finish = () => {
				setDragging(false);
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", finish);
				window.removeEventListener("pointercancel", finish);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", finish);
			window.addEventListener("pointercancel", finish);
		},
		[commit],
	);

	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (event.key === "ArrowLeft") commit(fraction - keyboardStep);
			else if (event.key === "ArrowRight") commit(fraction + keyboardStep);
			else if (event.key === "Home") commit(minimumFraction);
			else if (event.key === "End") commit(maximumFraction);
			else return;
			event.preventDefault();
		},
		[commit, fraction],
	);

	const onDoubleClick = useCallback(() => commit(defaultFraction), [commit]);

	return {
		containerRef,
		fraction,
		dragging,
		separatorProps: {
			role: "separator",
			"aria-orientation": "vertical",
			"aria-label": "Resize result list",
			"aria-valuenow": Math.round(fraction * 100),
			"aria-valuemin": Math.round(minimumFraction * 100),
			"aria-valuemax": Math.round(maximumFraction * 100),
			tabIndex: 0,
			onPointerDown,
			onKeyDown,
			onDoubleClick,
		},
	};
};
