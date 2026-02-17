export type ThemeCategory = "romantic" | "friendly" | "playful" | "minimal";
export type BorderStyle = "solid" | "dashed" | "double";

export interface Theme {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly category: ThemeCategory;
	readonly backgroundColor: string;
	readonly borderColor: string;
	readonly textColor: string;
	readonly titleColor: string;
	readonly accentColor: string;
	readonly fontFamily: string;
	readonly titleFontFamily: string;
	readonly borderWidthMm: number;
	readonly borderRadiusMm: number;
	readonly borderStyle: BorderStyle;
	readonly paddingMm: number;
}

export const DEFAULT_THEME: Theme = {
	id: "classic",
	name: "Classic",
	description: "Clean and elegant",
	category: "minimal",
	backgroundColor: "#ffffff",
	borderColor: "#333333",
	textColor: "#333333",
	titleColor: "#333333",
	accentColor: "#999999",
	fontFamily: "Times",
	titleFontFamily: "Times",
	borderWidthMm: 0.5,
	borderRadiusMm: 2,
	borderStyle: "solid",
	paddingMm: 4,
};
