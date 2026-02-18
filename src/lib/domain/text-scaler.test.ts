import { describe, expect, it } from "vitest";
import { EstimatedTextMeasurer } from "./text-measurer";
import { TextScaler } from "./text-scaler";

const MIN_FONT_SIZE = 6;
const LINE_HEIGHT_RATIO = 1.3;
const AVG_CHAR_WIDTH_RATIO = 0.5;
const PT_TO_MM = 25.4 / 72;

function createScaler(
	avgCharWidthRatio: number = AVG_CHAR_WIDTH_RATIO,
): TextScaler {
	return new TextScaler(
		MIN_FONT_SIZE,
		LINE_HEIGHT_RATIO,
		new EstimatedTextMeasurer(avgCharWidthRatio),
	);
}

describe("TextScaler", () => {
	it("returns max font size when short text fits", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "Hi",
			boxWidthMm: 80,
			boxHeightMm: 40,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		expect(result.fontSizePt).toBe(14);
		expect(result.fits).toBe(true);
	});

	it("shrinks font size for long text that overflows", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "This is a much longer text that should require the font size to be reduced significantly to fit within the bounding box properly",
			boxWidthMm: 30,
			boxHeightMm: 15,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		expect(result.fontSizePt).toBeLessThan(14);
		expect(result.fits).toBe(true);
	});

	it("returns min font size with fits false when text cannot fit", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "This is an extremely long text that absolutely cannot fit into this tiny box no matter how small the font size gets because the box is just too small for all of this content to be displayed properly",
			boxWidthMm: 10,
			boxHeightMm: 3,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		expect(result.fontSizePt).toBe(MIN_FONT_SIZE);
		expect(result.fits).toBe(false);
	});

	it("returns max font size with 0 lines for empty string", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "",
			boxWidthMm: 80,
			boxHeightMm: 40,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		expect(result.fontSizePt).toBe(14);
		expect(result.lines).toHaveLength(0);
		expect(result.fits).toBe(true);
	});

	it("wraps single word that fits on one line into 1 line", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "Hello",
			boxWidthMm: 80,
			boxHeightMm: 40,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		expect(result.lines).toHaveLength(1);
		expect(result.lines[0]).toBe("Hello");
	});

	it("wraps text into multiple lines", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "Happy Birthday dear friend",
			boxWidthMm: 15,
			boxHeightMm: 40,
			fontSizePt: 10,
			fontName: "Helvetica",
		});

		expect(result.lines.length).toBeGreaterThan(1);
	});

	it("force-breaks a word longer than the line width", () => {
		const scaler = createScaler();
		const result = scaler.computeFontSize({
			text: "Supercalifragilisticexpialidocious",
			boxWidthMm: 10,
			boxHeightMm: 80,
			fontSizePt: 10,
			fontName: "Helvetica",
		});

		expect(result.lines.length).toBeGreaterThan(1);
		for (const line of result.lines) {
			const lineWidth = line.length * 10 * PT_TO_MM * AVG_CHAR_WIDTH_RATIO;
			// Each line should not exceed box width (with 1-char tolerance for the break algorithm)
			expect(lineWidth).toBeLessThanOrEqual(
				10 + 10 * PT_TO_MM * AVG_CHAR_WIDTH_RATIO,
			);
		}
	});

	it("shrinks font size when box size decreases", () => {
		const scaler = createScaler();
		const text = "A moderately long coupon text";

		const largebox = scaler.computeFontSize({
			text,
			boxWidthMm: 80,
			boxHeightMm: 40,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		const smallBox = scaler.computeFontSize({
			text,
			boxWidthMm: 15,
			boxHeightMm: 5,
			fontSizePt: 14,
			fontName: "Helvetica",
		});

		expect(smallBox.fontSizePt).toBeLessThanOrEqual(largebox.fontSizePt);
	});

	it("shrinks font size earlier with wider avgCharWidthRatio", () => {
		const narrowScaler = createScaler(0.4);
		const wideScaler = createScaler(0.7);

		const text = "A medium length coupon text here";
		const params = {
			text,
			boxWidthMm: 30,
			boxHeightMm: 10,
			fontSizePt: 14,
			fontName: "Helvetica",
		};

		const narrowResult = narrowScaler.computeFontSize(params);
		const wideResult = wideScaler.computeFontSize(params);

		expect(wideResult.fontSizePt).toBeLessThanOrEqual(narrowResult.fontSizePt);
	});

	it("wrapText handles text that exactly fills the line", () => {
		const scaler = createScaler();
		// With font size 10, avgCharWidthRatio 0.5, ptToMm = 0.3528
		// char width = 10 * 0.3528 * 0.5 = 1.764mm
		// For boxWidth = 8.82mm → exactly 5 chars fit
		const charWidth = 10 * PT_TO_MM * AVG_CHAR_WIDTH_RATIO;
		const boxWidth = charWidth * 5;

		const lines = scaler.wrapText("Hello World", boxWidth, 10, "Helvetica");

		expect(lines).toHaveLength(2);
		expect(lines[0]).toBe("Hello");
		expect(lines[1]).toBe("World");
	});
});
