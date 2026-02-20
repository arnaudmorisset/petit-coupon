import type { OrnamentAsset } from "../domain/theme-assets";

export const FLOURISH_ORNAMENT: OrnamentAsset = {
	path: {
		d: "M 0 20 C 0 10 5 5 10 2 C 12 1 14 0 16 0 C 14 2 10 5 8 8 C 12 6 16 4 20 4 C 16 6 12 9 10 12 C 14 10 18 8 20 8 C 16 10 12 14 10 16 C 8 18 4 20 0 20 Z",
		viewBox: "0 0 20 20",
	},
	widthMm: 6,
	heightMm: 6,
};

export const LEAF_ORNAMENT: OrnamentAsset = {
	path: {
		d: "M 0 16 C 2 12 6 8 12 4 C 14 3 16 2 18 2 C 16 4 14 6 12 8 C 10 10 6 14 4 16 C 3 17 2 18 0 18 Z M 4 12 C 6 10 8 8 12 6",
		viewBox: "0 0 18 18",
	},
	widthMm: 5,
	heightMm: 5,
};

export const GEOMETRIC_ORNAMENT: OrnamentAsset = {
	path: {
		d: "M 0 0 L 12 0 L 10 2 L 2 2 L 2 10 L 0 12 Z M 0 0 L 4 0 L 4 4 L 0 4 Z",
		viewBox: "0 0 12 12",
	},
	widthMm: 5,
	heightMm: 5,
};
