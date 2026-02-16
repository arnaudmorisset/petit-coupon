import type { CouponDimensions } from "./coupon-dimensions";
import type { Margins } from "./margins";
import type { PageFormat } from "./page-format";

export class LayoutConfig {
	readonly pageFormat: PageFormat;
	readonly margins: Margins;
	readonly couponDimensions: CouponDimensions;
	readonly gutterMm: number;

	constructor(
		pageFormat: PageFormat,
		margins: Margins,
		couponDimensions: CouponDimensions,
		gutterMm: number,
	) {
		this.pageFormat = pageFormat;
		this.margins = margins;
		this.couponDimensions = couponDimensions;
		this.gutterMm = gutterMm;
	}
}
