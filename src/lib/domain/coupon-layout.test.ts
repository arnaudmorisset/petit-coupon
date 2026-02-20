import { describe, expect, it } from "vitest";
import { CouponTextLayout } from "./coupon-layout";
import { EstimatedTextMeasurer } from "./text-measurer";
import { TextScaler } from "./text-scaler";
import type { IllustrationAsset } from "./theme-assets";

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
			illustration: undefined,
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
			illustration: undefined,
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
			illustration: undefined,
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
			illustration: undefined,
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
			illustration: undefined,
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
			illustration: undefined,
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
			illustration: undefined,
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
			illustration: undefined,
		});

		expect(result.title).not.toBeNull();
		// Title starts at 14, body starts at 10 — they scale independently
		expect(result.title?.fontSizePt).toBeLessThanOrEqual(14);
		expect(result.body.fontSizePt).toBeLessThanOrEqual(10);
	});

	describe("illustration adjustment", () => {
		const illustration: IllustrationAsset = {
			path: { d: "M 0 0 L 10 10", viewBox: "0 0 20 20" },
			widthMm: 10,
			heightMm: 13,
			position: "bottom-right",
		};

		it("uses full width when no illustration is provided", () => {
			const layout = makeLayout();

			const withoutIllustration = layout.compute({
				title: "",
				text: "A moderately long text to test width usage",
				innerWidthMm: INNER_WIDTH,
				innerHeightMm: INNER_HEIGHT,
				maxTitleFontSizePt: 14,
				maxBodyFontSizePt: 10,
				illustration: undefined,
			});

			const withIllustration = layout.compute({
				title: "",
				text: "A moderately long text to test width usage",
				innerWidthMm: INNER_WIDTH,
				innerHeightMm: INNER_HEIGHT,
				maxTitleFontSizePt: 14,
				maxBodyFontSizePt: 10,
				illustration,
			});

			// With illustration, text has less width so more lines are needed
			expect(withIllustration.body.lines.length).toBeGreaterThanOrEqual(
				withoutIllustration.body.lines.length,
			);
		});

		it("reduces text width for illustration at top-right", () => {
			const layout = makeLayout();
			const topRightIllustration: IllustrationAsset = {
				...illustration,
				position: "top-right",
			};

			const result = layout.compute({
				title: "Title",
				text: "Body text that needs to fit alongside an illustration",
				innerWidthMm: INNER_WIDTH,
				innerHeightMm: INNER_HEIGHT,
				maxTitleFontSizePt: 14,
				maxBodyFontSizePt: 10,
				illustration: topRightIllustration,
			});

			expect(result.title).not.toBeNull();
			expect(result.body.lines.length).toBeGreaterThan(0);
		});

		it("reduces text width for illustration at bottom-left", () => {
			const layout = makeLayout();
			const bottomLeftIllustration: IllustrationAsset = {
				...illustration,
				position: "bottom-left",
			};

			const result = layout.compute({
				title: "",
				text: "Body text that needs to fit alongside an illustration on the left side",
				innerWidthMm: INNER_WIDTH,
				innerHeightMm: INNER_HEIGHT,
				maxTitleFontSizePt: 14,
				maxBodyFontSizePt: 10,
				illustration: bottomLeftIllustration,
			});

			expect(result.body.lines.length).toBeGreaterThan(0);
		});

		it("causes font to scale down for long text with illustration", () => {
			const layout = makeLayout();

			const withoutIllustration = layout.compute({
				title: "",
				text: "This is a long text that fills the available space and might cause scaling issues when combined with a large illustration element",
				innerWidthMm: 40,
				innerHeightMm: 20,
				maxTitleFontSizePt: 14,
				maxBodyFontSizePt: 10,
				illustration: undefined,
			});

			const withIllustration = layout.compute({
				title: "",
				text: "This is a long text that fills the available space and might cause scaling issues when combined with a large illustration element",
				innerWidthMm: 40,
				innerHeightMm: 20,
				maxTitleFontSizePt: 14,
				maxBodyFontSizePt: 10,
				illustration,
			});

			// With less width available, font may need to scale down more
			expect(withIllustration.body.fontSizePt).toBeLessThanOrEqual(
				withoutIllustration.body.fontSizePt,
			);
		});
	});
});
