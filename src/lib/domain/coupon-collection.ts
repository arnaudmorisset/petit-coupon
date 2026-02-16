import { Coupon } from "./coupon";
import { CouponId } from "./coupon-id";
import type { IdGenerator } from "./id-generator";

export class CouponCollection {
	private readonly idGenerator: IdGenerator;
	private readonly coupons: Coupon[] = [];

	constructor(idGenerator: IdGenerator) {
		this.idGenerator = idGenerator;
	}

	add(text: string): Coupon {
		const coupon = new Coupon(new CouponId(this.idGenerator.generate()), text);
		this.coupons.push(coupon);
		return coupon;
	}

	remove(id: CouponId): void {
		const index = this.coupons.findIndex((c) => c.id.equals(id));
		if (index === -1) {
			throw new Error(`Coupon with id "${id.value}" not found`);
		}
		this.coupons.splice(index, 1);
	}

	getAll(): Coupon[] {
		return [...this.coupons];
	}

	count(): number {
		return this.coupons.length;
	}

	isEmpty(): boolean {
		return this.coupons.length === 0;
	}
}
