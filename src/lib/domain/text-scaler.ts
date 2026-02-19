import type { TextMeasurer } from "./text-measurer";

export interface TextScaleParams {
	readonly text: string;
	readonly boxWidthMm: number;
	readonly boxHeightMm: number;
	readonly fontSizePt: number;
	readonly fontName: string;
}

export interface TextScaleResult {
	readonly fontSizePt: number;
	readonly lines: readonly string[];
	readonly fits: boolean;
}

const PT_TO_MM = 25.4 / 72;
const FONT_SIZE_STEP = 0.5;

export class TextScaler {
	private readonly minFontSizePt: number;
	readonly lineHeightRatio: number;
	private readonly measurer: TextMeasurer;

	constructor(
		minFontSizePt: number,
		lineHeightRatio: number,
		measurer: TextMeasurer,
	) {
		this.minFontSizePt = minFontSizePt;
		this.lineHeightRatio = lineHeightRatio;
		this.measurer = measurer;
	}

	computeFontSize(params: TextScaleParams): TextScaleResult {
		if (params.text.length === 0) {
			return { fontSizePt: params.fontSizePt, lines: [], fits: true };
		}

		let fontSize = params.fontSizePt;

		while (fontSize >= this.minFontSizePt) {
			const lines = this.wrapText(
				params.text,
				params.boxWidthMm,
				fontSize,
				params.fontName,
			);
			const totalHeight =
				lines.length * fontSize * PT_TO_MM * this.lineHeightRatio;

			if (totalHeight <= params.boxHeightMm) {
				return { fontSizePt: fontSize, lines, fits: true };
			}

			fontSize -= FONT_SIZE_STEP;
		}

		const lines = this.wrapText(
			params.text,
			params.boxWidthMm,
			this.minFontSizePt,
			params.fontName,
		);
		return { fontSizePt: this.minFontSizePt, lines, fits: false };
	}

	wrapText(
		text: string,
		boxWidthMm: number,
		fontSizePt: number,
		fontName: string,
	): readonly string[] {
		const words = text.split(/\s+/).filter((w) => w.length > 0);
		if (words.length === 0) {
			return [];
		}

		const lines: string[] = [];
		let currentLine = "";

		for (const word of words) {
			const wordWidth = this.measurer.measureTextWidthMm(
				word,
				fontSizePt,
				fontName,
			);

			if (wordWidth > boxWidthMm) {
				if (currentLine.length > 0) {
					lines.push(currentLine);
					currentLine = "";
				}
				this.forceBreakWord(word, boxWidthMm, fontSizePt, fontName, lines);
				continue;
			}

			if (currentLine.length === 0) {
				currentLine = word;
			} else {
				const candidate = `${currentLine} ${word}`;
				const candidateWidth = this.measurer.measureTextWidthMm(
					candidate,
					fontSizePt,
					fontName,
				);

				if (candidateWidth <= boxWidthMm) {
					currentLine = candidate;
				} else {
					lines.push(currentLine);
					currentLine = word;
				}
			}
		}

		if (currentLine.length > 0) {
			lines.push(currentLine);
		}

		return lines;
	}

	private forceBreakWord(
		word: string,
		boxWidthMm: number,
		fontSizePt: number,
		fontName: string,
		lines: string[],
	): void {
		let remaining = word;

		while (remaining.length > 0) {
			let end = remaining.length;
			while (end > 1) {
				const chunk = remaining.slice(0, end);
				const chunkWidth = this.measurer.measureTextWidthMm(
					chunk,
					fontSizePt,
					fontName,
				);
				if (chunkWidth <= boxWidthMm) {
					break;
				}
				end--;
			}
			lines.push(remaining.slice(0, end));
			remaining = remaining.slice(end);
		}
	}
}
