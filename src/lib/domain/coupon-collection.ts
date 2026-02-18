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
		const index = this.findIndexOrThrow(id);
		this.coupons.splice(index, 1);
	}

	edit(id: CouponId, newText: string): Coupon {
		if (newText.trim().length === 0) {
			throw new Error("Coupon text cannot be empty");
		}
		const index = this.findIndexOrThrow(id);
		const updated = new Coupon(id, newText);
		this.coupons[index] = updated;
		return updated;
	}

	move(id: CouponId, direction: "up" | "down"): void {
		const index = this.findIndexOrThrow(id);

		if (direction === "up" && index === 0) {
			return;
		}
		if (direction === "down" && index === this.coupons.length - 1) {
			return;
		}

		const targetIndex = direction === "up" ? index - 1 : index + 1;
		const current = this.coupons[index] as Coupon;
		const target = this.coupons[targetIndex] as Coupon;
		this.coupons[index] = target;
		this.coupons[targetIndex] = current;
	}

	reorder(fromIndex: number, toIndex: number): void {
		if (
			fromIndex < 0 ||
			fromIndex >= this.coupons.length ||
			toIndex < 0 ||
			toIndex >= this.coupons.length
		) {
			throw new Error(
				`Index out of bounds: fromIndex=${String(fromIndex)}, toIndex=${String(toIndex)}, length=${String(this.coupons.length)}`,
			);
		}

		const [coupon] = this.coupons.splice(fromIndex, 1);
		this.coupons.splice(toIndex, 0, coupon as Coupon);
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

	private findIndexOrThrow(id: CouponId): number {
		const index = this.coupons.findIndex((c) => c.id.equals(id));
		if (index === -1) {
			throw new Error(`Coupon with id "${id.value}" not found`);
		}
		return index;
	}
}
