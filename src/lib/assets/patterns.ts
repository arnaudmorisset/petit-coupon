import type { PatternAsset } from "../domain/theme-assets";

export const DOTS_PATTERN: PatternAsset = {
	path: {
		d: "M 5 5 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0",
		viewBox: "0 0 10 10",
	},
	tileWidthMm: 4,
	tileHeightMm: 4,
	opacity: 0.05,
};

export const HEARTS_PATTERN: PatternAsset = {
	path: {
		d: "M 10 3 C 10 0 6 0 6 3 C 6 0 2 0 2 3 C 2 6 6 9 6 12 C 6 9 10 6 10 3 Z",
		viewBox: "0 0 12 14",
	},
	tileWidthMm: 5,
	tileHeightMm: 6,
	opacity: 0.08,
};

export const WAVES_PATTERN: PatternAsset = {
	path: {
		d: "M 0 5 C 5 0 10 10 15 5 C 20 0 25 10 30 5",
		viewBox: "0 0 30 10",
	},
	tileWidthMm: 8,
	tileHeightMm: 3,
	opacity: 0.06,
};

export const STARS_PATTERN: PatternAsset = {
	path: {
		d: "M 6 0 L 7.5 4 L 12 4.5 L 8.5 7.5 L 9.5 12 L 6 9.5 L 2.5 12 L 3.5 7.5 L 0 4.5 L 4.5 4 Z",
		viewBox: "0 0 12 12",
	},
	tileWidthMm: 5,
	tileHeightMm: 5,
	opacity: 0.1,
};
