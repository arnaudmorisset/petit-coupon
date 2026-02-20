import { PT_TO_MM } from "./units";

export interface TextMeasurer {
	measureTextWidthMm(
		text: string,
		fontSizePt: number,
		fontName: string,
	): number;
}

export class EstimatedTextMeasurer implements TextMeasurer {
	private readonly avgCharWidthRatio: number;

	constructor(avgCharWidthRatio: number) {
		this.avgCharWidthRatio = avgCharWidthRatio;
	}

	measureTextWidthMm(
		text: string,
		fontSizePt: number,
		_fontName: string,
	): number {
		return text.length * fontSizePt * PT_TO_MM * this.avgCharWidthRatio;
	}
}
