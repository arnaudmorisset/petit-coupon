import type { jsPDF } from "jspdf";
import type { TextMeasurer } from "../domain/text-measurer";

const PT_TO_MM = 25.4 / 72;

export class JsPdfTextMeasurer implements TextMeasurer {
	private readonly doc: jsPDF;

	constructor(doc: jsPDF) {
		this.doc = doc;
	}

	measureTextWidthMm(
		text: string,
		fontSizePt: number,
		fontName: string,
	): number {
		this.doc.setFont(fontName, "normal");
		this.doc.setFontSize(fontSizePt);
		const unitWidth = this.doc.getStringUnitWidth(text);
		return unitWidth * fontSizePt * PT_TO_MM;
	}
}
