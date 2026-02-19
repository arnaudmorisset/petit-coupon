import { describe, expect, it } from "vitest";
import { CouponTextLayout } from "./coupon-layout";
import { EstimatedTextMeasurer } from "./text-measurer";
import { TextScaler } from "./text-scaler";

const measurer = new EstimatedTextMeasurer(0.5);
const textScaler = new TextScaler(6, 1.3, measurer);

function makeLayout(
	titleFontName: string = "Times",
	bodyFontName: string = "Times",
): CouponTextLayout {
	return new CouponTextLayout(textScaler, titleFontName, bodyFontName);
}

// A4 coupon inner dimensions after 4mm padding on a 90x55mm coupon
const INNER_WIDTH = 82; // 90 - 2*4
const INNER_HEIGHT = 47; // 55 - 2*4

describe("CouponTextLayout", () => {
	it("returns null title when title is empty", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "",
			text: "Some body text",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).toBeNull();
		expect(result.body.lines.length).toBeGreaterThan(0);
	});

	it("gives body the full inner height when no title", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "",
			text: "Body text",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.body.fits).toBe(true);
		expect(result.body.offsetYMm).toBe(0);
	});

	it("computes both title and body when title is present", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "My Title",
			text: "Body text here",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).not.toBeNull();
		expect(result.title?.lines.length).toBeGreaterThan(0);
		expect(result.body.lines.length).toBeGreaterThan(0);
		expect(result.body.offsetYMm).toBeGreaterThan(0);
	});

	it("scales down a long title", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title:
				"This is a very long title that should require font scaling to fit properly within the coupon width",
			text: "Short body",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).not.toBeNull();
		expect(result.title?.fits).toBe(true);
	});

	it("scales down a long body independently of title", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "Short",
			text: "This is a very long body text that goes on and on and should require the body font to scale down significantly to fit in the remaining space after the title",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).not.toBeNull();
		expect(result.body.lines.length).toBeGreaterThan(0);
	});

	it("handles title-only coupon with empty text", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "Title Only",
			text: "",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).not.toBeNull();
		expect(result.title?.lines.length).toBeGreaterThan(0);
		expect(result.body.lines).toHaveLength(0);
		expect(result.body.fits).toBe(true);
	});

	it("handles body-only coupon with empty title", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "",
			text: "Body only content",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).toBeNull();
		expect(result.body.lines.length).toBeGreaterThan(0);
		expect(result.body.fits).toBe(true);
	});

	it("title and body can have different font sizes", () => {
		const layout = makeLayout();

		const result = layout.compute({
			title: "A Title",
			text: "Some longer body text for testing",
			innerWidthMm: INNER_WIDTH,
			innerHeightMm: INNER_HEIGHT,
			maxTitleFontSizePt: 14,
			maxBodyFontSizePt: 10,
		});

		expect(result.title).not.toBeNull();
		// Title starts at 14, body starts at 10 — they scale independently
		expect(result.title?.fontSizePt).toBeLessThanOrEqual(14);
		expect(result.body.fontSizePt).toBeLessThanOrEqual(10);
	});
});
