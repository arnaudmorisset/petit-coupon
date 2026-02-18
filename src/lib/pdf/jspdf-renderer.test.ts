import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponDimensions } from "../domain/coupon-dimensions";
import { CouponId } from "../domain/coupon-id";
import { LayoutConfig } from "../domain/layout-config";
import { LayoutEngine } from "../domain/layout-engine";
import { Margins } from "../domain/margins";
import { PageFormat } from "../domain/page-format";
import { DEFAULT_THEME } from "../domain/theme";
import {
	MIDNIGHT_THEME,
	ROMANTIC_THEME,
	SUNSHINE_THEME,
} from "../domain/themes";
import { FontRegistry } from "./font-registry";
import { APP_FONT_REGISTRY } from "./fonts";
import { JsPdfCouponRenderer } from "./jspdf-renderer";

function defaultLayout(): LayoutEngine {
	return new LayoutEngine(
		new LayoutConfig(
			PageFormat.A4,
			new Margins(10, 10, 10, 10),
			new CouponDimensions(90, 55),
			4,
		),
	);
}

function makeCoupons(count: number): Coupon[] {
	return Array.from(
		{ length: count },
		(_, i) =>
			new Coupon(new CouponId(`id-${String(i)}`), `Coupon #${String(i + 1)}`),
	);
}

const emptyFontRegistry = new FontRegistry([]);

describe("JsPdfCouponRenderer", () => {
	it("returns a PDF blob", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(1),
			defaultLayout(),
			DEFAULT_THEME,
			emptyFontRegistry,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe("application/pdf");
	});

	it("renders without error for 0 coupons", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			[],
			defaultLayout(),
			DEFAULT_THEME,
			emptyFontRegistry,
		);

		expect(blob).toBeInstanceOf(Blob);
	});

	it("renders without error for a full page of 8 coupons", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(8),
			defaultLayout(),
			DEFAULT_THEME,
			emptyFontRegistry,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders without error for 9 coupons (multi-page)", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(9),
			defaultLayout(),
			DEFAULT_THEME,
			emptyFontRegistry,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders with romantic theme and custom font", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(2),
			defaultLayout(),
			ROMANTIC_THEME,
			APP_FONT_REGISTRY,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders with sunshine theme and custom font", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(2),
			defaultLayout(),
			SUNSHINE_THEME,
			APP_FONT_REGISTRY,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders with midnight theme (double border)", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(2),
			defaultLayout(),
			MIDNIGHT_THEME,
			APP_FONT_REGISTRY,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders with dashed border style", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(1),
			defaultLayout(),
			ROMANTIC_THEME,
			APP_FONT_REGISTRY,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders coupon with very long text without error", () => {
		const renderer = new JsPdfCouponRenderer();
		const longTextCoupon = new Coupon(
			new CouponId("long-text"),
			"This is a very long coupon text that should trigger font scaling to fit within the coupon boundaries properly without overflowing",
		);
		const blob = renderer.render(
			[longTextCoupon],
			defaultLayout(),
			DEFAULT_THEME,
			emptyFontRegistry,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it("renders coupon with empty text without error", () => {
		const renderer = new JsPdfCouponRenderer();
		const emptyCoupon = new Coupon(new CouponId("empty"), "");
		const blob = renderer.render(
			[emptyCoupon],
			defaultLayout(),
			DEFAULT_THEME,
			emptyFontRegistry,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});
});
