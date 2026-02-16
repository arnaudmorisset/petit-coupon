import { describe, expect, it } from "vitest";
import { Coupon } from "./coupon";
import { CouponDimensions } from "./coupon-dimensions";
import { CouponId } from "./coupon-id";
import { GridPosition } from "./grid-position";
import { LayoutConfig } from "./layout-config";
import { Margins } from "./margins";
import { PageFormat } from "./page-format";

describe("CouponId", () => {
	it("wraps a string value", () => {
		const id = new CouponId("abc-123");
		expect(id.value).toBe("abc-123");
	});

	it("two CouponIds with the same value are equal", () => {
		const a = new CouponId("abc");
		const b = new CouponId("abc");
		expect(a.equals(b)).toBe(true);
	});

	it("two CouponIds with different values are not equal", () => {
		const a = new CouponId("abc");
		const b = new CouponId("xyz");
		expect(a.equals(b)).toBe(false);
	});
});

describe("Coupon", () => {
	it("holds an id and text", () => {
		const id = new CouponId("1");
		const coupon = new Coupon(id, "Happy Birthday!");
		expect(coupon.id).toEqual(id);
		expect(coupon.text).toBe("Happy Birthday!");
	});
});

describe("PageFormat", () => {
	it("A4 has correct dimensions", () => {
		const a4 = PageFormat.A4;
		expect(a4.widthMm).toBe(210);
		expect(a4.heightMm).toBe(297);
	});
});

describe("Margins", () => {
	it("holds margin values", () => {
		const margins = new Margins(10, 10, 10, 10);
		expect(margins.topMm).toBe(10);
		expect(margins.rightMm).toBe(10);
		expect(margins.bottomMm).toBe(10);
		expect(margins.leftMm).toBe(10);
	});
});

describe("CouponDimensions", () => {
	it("holds width and height", () => {
		const dims = new CouponDimensions(90, 55);
		expect(dims.widthMm).toBe(90);
		expect(dims.heightMm).toBe(55);
	});
});

describe("GridPosition", () => {
	it("holds page, row, col, and coordinates", () => {
		const pos = new GridPosition(0, 1, 2, 100, 65);
		expect(pos.page).toBe(0);
		expect(pos.row).toBe(1);
		expect(pos.col).toBe(2);
		expect(pos.xMm).toBe(100);
		expect(pos.yMm).toBe(65);
	});
});

describe("LayoutConfig", () => {
	it("groups page format, margins, coupon dimensions and gutter", () => {
		const config = new LayoutConfig(
			PageFormat.A4,
			new Margins(10, 10, 10, 10),
			new CouponDimensions(90, 55),
			4,
		);
		expect(config.pageFormat).toBe(PageFormat.A4);
		expect(config.gutterMm).toBe(4);
	});
});
