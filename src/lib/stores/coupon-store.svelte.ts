import type { Coupon } from "../domain/coupon";
import { CouponCollection } from "../domain/coupon-collection";
import type { CouponId } from "../domain/coupon-id";
import type { IdGenerator } from "../domain/id-generator";

export class CouponStore {
	private readonly collection: CouponCollection;
	coupons: readonly Coupon[] = $state([]);

	constructor(idGenerator: IdGenerator) {
		this.collection = new CouponCollection(idGenerator);
	}

	get count(): number {
		return this.coupons.length;
	}

	get isEmpty(): boolean {
		return this.coupons.length === 0;
	}

	add(text: string): Coupon {
		const coupon = this.collection.add(text);
		this.coupons = this.collection.getAll();
		return coupon;
	}

	remove(id: CouponId): void {
		this.collection.remove(id);
		this.coupons = this.collection.getAll();
	}
}
