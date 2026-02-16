import type { CouponId } from "./coupon-id";

export class Coupon {
	readonly id: CouponId;
	readonly text: string;

	constructor(id: CouponId, text: string) {
		this.id = id;
		this.text = text;
	}
}
