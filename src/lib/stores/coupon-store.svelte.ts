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
		this.mutate(() => this.collection.add(coupon));
	}

	remove(id: CouponId): void {
		this.mutate(() => this.collection.remove(id));
	}

	editCoupon(id: CouponId, updates: Partial<Coupon>): void {
		this.mutate(() => this.collection.edit(id, updates));
	}

	moveCoupon(id: CouponId, direction: "up" | "down"): void {
		this.mutate(() => this.collection.move(id, direction));
	}

	loadCoupons(coupons: readonly Coupon[]): void {
		this.mutate(() => {
			const current = this.collection.getAll();
			for (const c of current) {
				this.collection.remove(c.id);
			}
			for (const c of coupons) {
				this.collection.add(c);
			}
		});
	}

	private mutate(fn: () => void): void {
		fn();
		this.coupons = this.collection.getAll();
	}
}
