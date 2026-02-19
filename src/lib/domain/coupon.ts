import type { CouponId } from "./coupon-id";

export class Coupon {
	readonly id: CouponId;
	readonly text: string;
	readonly title: string;

	constructor(id: CouponId, text: string, title: string = "") {
		this.id = id;
		this.text = text;
		this.title = title;
	}
}
