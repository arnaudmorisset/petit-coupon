import { describe, expect, it } from "vitest";
import { Coupon } from "./coupon";
import { CouponId } from "./coupon-id";
import { GridPosition } from "./grid-position";
import { SheetPreviewData } from "./sheet-preview-data";

function makeCoupon(index: number): Coupon {
	return new Coupon(
		new CouponId(`id-${String(index)}`),
		`Coupon ${String(index)}`,
	);
}

function makePosition(
	_index: number,
	page: number,
	row: number,
	col: number,
): GridPosition {
	return new GridPosition(page, row, col, 10 + col * 94, 10 + row * 59);
}

describe("SheetPreviewData", () => {
	it("returns 0 pages for 0 coupons", () => {
		const data = new SheetPreviewData([], []);

		expect(data.getPages()).toHaveLength(0);
	});

	it("returns 1 page with 1 entry for 1 coupon", () => {
		const coupons = [makeCoupon(0)];
		const positions = [makePosition(0, 0, 0, 0)];

		const pages = new SheetPreviewData(coupons, positions).getPages();

		expect(pages).toHaveLength(1);
		expect(pages[0]?.pageNumber).toBe(0);
		expect(pages[0]?.entries).toHaveLength(1);
	});

	it("returns 1 page with 8 entries for a full page", () => {
		const coupons = Array.from({ length: 8 }, (_, i) => makeCoupon(i));
		const positions: GridPosition[] = [];
		for (let i = 0; i < 8; i++) {
			const row = Math.floor(i / 2);
			const col = i % 2;
			positions.push(makePosition(i, 0, row, col));
		}

		const pages = new SheetPreviewData(coupons, positions).getPages();

		expect(pages).toHaveLength(1);
		expect(pages[0]?.entries).toHaveLength(8);
	});

	it("returns 2 pages when 9 coupons span two pages", () => {
		const coupons = Array.from({ length: 9 }, (_, i) => makeCoupon(i));
		const positions: GridPosition[] = [];
		for (let i = 0; i < 8; i++) {
			const row = Math.floor(i / 2);
			const col = i % 2;
			positions.push(makePosition(i, 0, row, col));
		}
		positions.push(makePosition(8, 1, 0, 0));

		const pages = new SheetPreviewData(coupons, positions).getPages();

		expect(pages).toHaveLength(2);
		expect(pages[0]?.entries).toHaveLength(8);
		expect(pages[1]?.pageNumber).toBe(1);
		expect(pages[1]?.entries).toHaveLength(1);
	});

	it("entries within a page are in correct order", () => {
		const coupons = [makeCoupon(0), makeCoupon(1), makeCoupon(2)];
		const positions = [
			makePosition(0, 0, 0, 0),
			makePosition(1, 0, 0, 1),
			makePosition(2, 0, 1, 0),
		];

		const pages = new SheetPreviewData(coupons, positions).getPages();
		const entries = pages[0]?.entries;

		expect(entries?.[0]?.coupon.text).toBe("Coupon 0");
		expect(entries?.[1]?.coupon.text).toBe("Coupon 1");
		expect(entries?.[2]?.coupon.text).toBe("Coupon 2");
	});

	it("pairs coupons with their correct positions", () => {
		const coupons = [makeCoupon(0), makeCoupon(1)];
		const positions = [makePosition(0, 0, 0, 0), makePosition(1, 0, 0, 1)];

		const pages = new SheetPreviewData(coupons, positions).getPages();
		const entries = pages[0]?.entries;

		expect(entries?.[0]?.coupon.id.value).toBe("id-0");
		expect(entries?.[0]?.position.col).toBe(0);
		expect(entries?.[1]?.coupon.id.value).toBe("id-1");
		expect(entries?.[1]?.position.col).toBe(1);
	});
});
