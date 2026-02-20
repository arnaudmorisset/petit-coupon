export interface SvgPathData {
	readonly d: string;
	readonly viewBox: string;
}

export type IllustrationPosition = "top-right" | "bottom-left" | "bottom-right";

export interface PatternAsset {
	readonly path: SvgPathData;
	readonly tileWidthMm: number;
	readonly tileHeightMm: number;
	readonly opacity: number;
}

export interface OrnamentAsset {
	readonly path: SvgPathData;
	readonly widthMm: number;
	readonly heightMm: number;
}

export interface IllustrationAsset {
	readonly path: SvgPathData;
	readonly widthMm: number;
	readonly heightMm: number;
	readonly position: IllustrationPosition;
}

export interface ThemeAssets {
	readonly pattern: PatternAsset | null;
	readonly cornerOrnament: OrnamentAsset | null;
	readonly illustration: IllustrationAsset | null;
}
