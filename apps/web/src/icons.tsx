/** Minimal inline icon set. Every icon is decorative (aria-hidden) — pair with text or aria-labels. */

type IconProps = {
	readonly size?: number;
};

const base = (size: number) =>
	({
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeLinejoin: "round",
	}) as const;

export const SearchIcon = ({ size = 14 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<circle cx="7" cy="7" r="4.5" />
		<path d="M10.5 10.5 14 14" />
	</svg>
);

export const ChevronDownIcon = ({ size = 12 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="m4 6 4 4 4-4" />
	</svg>
);

export const RefreshIcon = ({ size = 14 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
		<path d="M13.5 2.5v3h-3" />
	</svg>
);

export const PauseIcon = ({ size = 14 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M5.5 3v10M10.5 3v10" />
	</svg>
);

export const PlayIcon = ({ size = 14 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M5 3.5v9l7-4.5z" fill="currentColor" stroke="none" />
	</svg>
);

export const CopyIcon = ({ size = 12 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
		<path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
	</svg>
);

export const ArrowLeftIcon = ({ size = 13 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M13 8H3M7 4 3 8l4 4" />
	</svg>
);

export const CloseIcon = ({ size = 12 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="m4 4 8 8M12 4l-8 8" />
	</svg>
);

export const FilterIcon = ({ size = 13 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M2.5 4h11M4.5 8h7M6.5 12h3" />
	</svg>
);

export const LogsIcon = ({ size = 13 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M3 4h10M3 8h10M3 12h6" />
	</svg>
);

export const PulseIcon = ({ size = 32 }: IconProps) => (
	<svg {...base(size)} aria-hidden="true">
		<path d="M1.5 8.5h3l1.5-4 3 7 1.5-3h4" />
	</svg>
);
