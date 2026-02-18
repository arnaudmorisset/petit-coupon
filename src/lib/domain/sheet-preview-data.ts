import type { Coupon } from "./coupon";
import type { GridPosition } from "./grid-position";

export interface PageEntry {
	readonly coupon: Coupon;
	readonly position: GridPosition;
}

export interface PageData {
	readonly pageNumber: number;
	readonly entries: readonly PageEntry[];
}

export class SheetPreviewData {
	private readonly coupons: readonly Coupon[];
	private readonly positions: readonly GridPosition[];

	constructor(coupons: readonly Coupon[], positions: readonly GridPosition[]) {
		this.coupons = coupons;
		this.positions = positions;
	}

	getPages(): readonly PageData[] {
		if (this.coupons.length === 0) {
			return [];
		}

		const pageMap = new Map<number, PageEntry[]>();

		for (let i = 0; i < this.coupons.length; i++) {
			const coupon = this.coupons[i];
			const position = this.positions[i];
			if (coupon === undefined || position === undefined) {
				continue;
			}

			const entries = pageMap.get(position.page);
			if (entries !== undefined) {
				entries.push({ coupon, position });
			} else {
				pageMap.set(position.page, [{ coupon, position }]);
			}
		}

		const pages: PageData[] = [];
		const sortedKeys = [...pageMap.keys()].sort((a, b) => a - b);

		for (const pageNumber of sortedKeys) {
			const entries = pageMap.get(pageNumber);
			if (entries !== undefined) {
				pages.push({ pageNumber, entries });
			}
		}

		return pages;
	}
}
