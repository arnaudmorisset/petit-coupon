export interface Theme {
	readonly id: string;
	readonly name: string;
	readonly backgroundColor: string;
	readonly borderColor: string;
	readonly textColor: string;
	readonly fontFamily: string;
	readonly borderWidthMm: number;
	readonly borderRadiusMm: number;
}

export const DEFAULT_THEME: Theme = {
	id: "classic",
	name: "Classic",
	backgroundColor: "#ffffff",
	borderColor: "#333333",
	textColor: "#333333",
	fontFamily: "Helvetica",
	borderWidthMm: 0.5,
	borderRadiusMm: 2,
};
