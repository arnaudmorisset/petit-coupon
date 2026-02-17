import type { Coupon } from "../domain/coupon";
import type { LayoutEngine } from "../domain/layout-engine";
import type { Theme } from "../domain/theme";
import type { FontRegistry } from "./font-registry";

export interface CouponRenderer {
	render(
		coupons: readonly Coupon[],
		layout: LayoutEngine,
		theme: Theme,
		fontRegistry: FontRegistry,
	): Blob;
}
