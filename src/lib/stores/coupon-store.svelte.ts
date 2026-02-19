import type { Coupon } from "../domain/coupon";
import { CouponCollection } from "../domain/coupon-collection";
import { CouponId } from "../domain/coupon-id";
import type { IdGenerator } from "../domain/id-generator";

export class CouponStore {
	private readonly idGenerator: IdGenerator;
	private readonly collection = new CouponCollection();
	coupons: readonly Coupon[] = $state([]);

	constructor(idGenerator: IdGenerator) {
		this.idGenerator = idGenerator;
	}

	get count(): number {
		return this.coupons.length;
	}

	get isEmpty(): boolean {
		return this.coupons.length === 0;
	}

	nextId(): CouponId {
		return new CouponId(this.idGenerator.generate());
	}

	add(coupon: Coupon): void {
		this.collection.add(coupon);
		this.coupons = this.collection.getAll();
	}

	remove(id: CouponId): void {
		this.collection.remove(id);
		this.coupons = this.collection.getAll();
	}

	editCoupon(id: CouponId, updates: Partial<Coupon>): void {
		this.collection.edit(id, updates);
		this.coupons = this.collection.getAll();
	}

	moveCoupon(id: CouponId, direction: "up" | "down"): void {
		this.collection.move(id, direction);
		this.coupons = this.collection.getAll();
	}

	loadCoupons(coupons: readonly Coupon[]): void {
		const current = this.collection.getAll();
		for (const c of current) {
			this.collection.remove(c.id);
		}
		for (const c of coupons) {
			this.collection.add(c);
		}
		this.coupons = this.collection.getAll();
	}
}
