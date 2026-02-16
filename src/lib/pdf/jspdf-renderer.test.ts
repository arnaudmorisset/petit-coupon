import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponDimensions } from "../domain/coupon-dimensions";
import { CouponId } from "../domain/coupon-id";
import { LayoutConfig } from "../domain/layout-config";
import { LayoutEngine } from "../domain/layout-engine";
import { Margins } from "../domain/margins";
import { PageFormat } from "../domain/page-format";
import { DEFAULT_THEME } from "../domain/theme";
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

describe("JsPdfCouponRenderer", () => {
	it("returns a PDF blob", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(1),
			defaultLayout(),
			DEFAULT_THEME,
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe("application/pdf");
	});

	it("renders without error for 0 coupons", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render([], defaultLayout(), DEFAULT_THEME);

		expect(blob).toBeInstanceOf(Blob);
	});

	it("renders without error for a full page of 8 coupons", () => {
		const renderer = new JsPdfCouponRenderer();
		const blob = renderer.render(
			makeCoupons(8),
			defaultLayout(),
			DEFAULT_THEME,
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
		);

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});
});
