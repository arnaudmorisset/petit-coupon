import type { jsPDF } from "jspdf";
import type { TextMeasurer } from "../domain/text-measurer";
import { PT_TO_MM } from "../domain/units";

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
