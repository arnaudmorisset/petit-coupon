import { Coupon } from "./coupon";
import type { CouponId } from "./coupon-id";

interface CouponEntry {
	readonly index: number;
	readonly coupon: Coupon;
}

export class CouponCollection {
	private readonly coupons: Coupon[] = [];

	add(coupon: Coupon): void {
		this.coupons.push(coupon);
	}

	remove(id: CouponId): void {
		const { index } = this.findEntryOrThrow(id);
		this.coupons.splice(index, 1);
	}

	edit(id: CouponId, updates: Partial<Coupon>): Coupon {
		const { index, coupon: existing } = this.findEntryOrThrow(id);
		const newText = updates.text ?? existing.text;
		const newTitle = updates.title ?? existing.title;

		if (newText.trim().length === 0 && newTitle.trim().length === 0) {
			throw new Error("Coupon must have at least a title or text");
		}

		const updated = new Coupon(id, newText, newTitle);
		this.coupons[index] = updated;
		return updated;
	}

	move(id: CouponId, direction: "up" | "down"): void {
		const { index, coupon: current } = this.findEntryOrThrow(id);

		if (direction === "up" && index === 0) {
			return;
		}
		if (direction === "down" && index === this.coupons.length - 1) {
			return;
		}

		const targetIndex = direction === "up" ? index - 1 : index + 1;
		const target = this.couponAt(targetIndex);
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

		const coupon = this.couponAt(fromIndex);
		this.coupons.splice(fromIndex, 1);
		this.coupons.splice(toIndex, 0, coupon);
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

	private couponAt(index: number): Coupon {
		const coupon = this.coupons[index];
		if (coupon === undefined) {
			throw new Error(`No coupon at index ${String(index)}`);
		}
		return coupon;
	}

	private findEntryOrThrow(id: CouponId): CouponEntry {
		const index = this.coupons.findIndex((c) => c.id.equals(id));
		if (index === -1) {
			throw new Error(`Coupon with id "${id.value}" not found`);
		}
		return { index, coupon: this.couponAt(index) };
	}
}
