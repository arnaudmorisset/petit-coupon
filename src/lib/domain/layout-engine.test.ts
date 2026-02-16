import { describe, expect, it } from "vitest";
import { CouponDimensions } from "./coupon-dimensions";
import { LayoutConfig } from "./layout-config";
import { LayoutEngine } from "./layout-engine";
import { Margins } from "./margins";
import { PageFormat } from "./page-format";

function defaultConfig(
	overrides: Partial<{
		margins: Margins;
		couponDimensions: CouponDimensions;
		gutterMm: number;
	}> = {},
): LayoutConfig {
	return new LayoutConfig(
		PageFormat.A4,
		overrides.margins ?? new Margins(10, 10, 10, 10),
		overrides.couponDimensions ?? new CouponDimensions(90, 55),
		overrides.gutterMm ?? 4,
	);
}

describe("LayoutEngine", () => {
	describe("computeGrid", () => {
		it("computes correct grid for A4 with 10mm margins, 90x55mm coupons, 4mm gutter", () => {
			const engine = new LayoutEngine(defaultConfig());
			const grid = engine.computeGrid();

			// usableWidth = 210 - 10 - 10 = 190, (190 + 4) / (90 + 4) = 2.06 → 2 cols
			// usableHeight = 297 - 10 - 10 = 277, (277 + 4) / (55 + 4) = 4.76 → 4 rows
			expect(grid.cols).toBe(2);
			expect(grid.rows).toBe(4);
			expect(grid.couponsPerPage).toBe(8);
		});

		it("computes correct grid with zero gutter", () => {
			const engine = new LayoutEngine(defaultConfig({ gutterMm: 0 }));
			const grid = engine.computeGrid();

			// usableWidth = 190, 190 / 90 = 2.11 → 2 cols
			// usableHeight = 277, 277 / 55 = 5.03 → 5 rows
			expect(grid.cols).toBe(2);
			expect(grid.rows).toBe(5);
			expect(grid.couponsPerPage).toBe(10);
		});

		it("returns zero cols and rows when coupon is wider than usable area", () => {
			const engine = new LayoutEngine(
				defaultConfig({ couponDimensions: new CouponDimensions(200, 55) }),
			);
			const grid = engine.computeGrid();

			expect(grid.cols).toBe(0);
			expect(grid.rows).toBe(4);
			expect(grid.couponsPerPage).toBe(0);
		});
	});

	describe("computePositions", () => {
		it("returns empty array for 0 coupons", () => {
			const engine = new LayoutEngine(defaultConfig());
			const positions = engine.computePositions(0);

			expect(positions).toEqual([]);
		});

		it("returns one position at top-left for 1 coupon", () => {
			const engine = new LayoutEngine(defaultConfig());
			const positions = engine.computePositions(1);

			expect(positions).toHaveLength(1);
			expect(positions[0]?.page).toBe(0);
			expect(positions[0]?.row).toBe(0);
			expect(positions[0]?.col).toBe(0);
			expect(positions[0]?.xMm).toBe(10); // marginLeft
			expect(positions[0]?.yMm).toBe(10); // marginTop
		});

		it("places all coupons on page 0 when count equals couponsPerPage", () => {
			const engine = new LayoutEngine(defaultConfig());
			const positions = engine.computePositions(8);

			expect(positions).toHaveLength(8);
			for (const pos of positions) {
				expect(pos.page).toBe(0);
			}
		});

		it("overflows to page 1 when count exceeds couponsPerPage", () => {
			const engine = new LayoutEngine(defaultConfig());
			const positions = engine.computePositions(9);

			expect(positions).toHaveLength(9);
			expect(positions[8]?.page).toBe(1);
			expect(positions[8]?.row).toBe(0);
			expect(positions[8]?.col).toBe(0);
			expect(positions[8]?.xMm).toBe(10);
			expect(positions[8]?.yMm).toBe(10);
		});

		it("correctly spaces coupons horizontally", () => {
			const engine = new LayoutEngine(defaultConfig());
			const positions = engine.computePositions(2);

			// col 0: xMm = 10
			// col 1: xMm = 10 + 90 + 4 = 104
			expect(positions[0]?.xMm).toBe(10);
			expect(positions[1]?.xMm).toBe(104);
		});

		it("correctly spaces coupons vertically", () => {
			const engine = new LayoutEngine(defaultConfig());
			const positions = engine.computePositions(4);

			// row 0: yMm = 10
			// row 1: yMm = 10 + 55 + 4 = 69
			expect(positions[0]?.yMm).toBe(10);
			expect(positions[2]?.yMm).toBe(69);
		});
	});

	describe("computePageCount", () => {
		it("returns 0 for 0 coupons", () => {
			const engine = new LayoutEngine(defaultConfig());
			expect(engine.computePageCount(0)).toBe(0);
		});

		it("returns 1 for coupons fitting on one page", () => {
			const engine = new LayoutEngine(defaultConfig());
			expect(engine.computePageCount(1)).toBe(1);
			expect(engine.computePageCount(8)).toBe(1);
		});

		it("returns 2 when coupons overflow to a second page", () => {
			const engine = new LayoutEngine(defaultConfig());
			expect(engine.computePageCount(9)).toBe(2);
			expect(engine.computePageCount(16)).toBe(2);
		});

		it("returns 3 for 17 coupons", () => {
			const engine = new LayoutEngine(defaultConfig());
			expect(engine.computePageCount(17)).toBe(3);
		});
	});
});
