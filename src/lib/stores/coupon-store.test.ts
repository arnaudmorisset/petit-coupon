import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import type { IdGenerator } from "../domain/id-generator";
import { CouponStore } from "./coupon-store.svelte";

class SequentialIdGenerator implements IdGenerator {
	private counter = 0;

	generate(): string {
		this.counter++;
		return `id-${String(this.counter)}`;
	}
}

function createStore(): CouponStore {
	return new CouponStore(new SequentialIdGenerator());
}

function makeCoupon(id: string, text: string, title = ""): Coupon {
	return new Coupon(new CouponId(id), text, title);
}

describe("CouponStore", () => {
	it("starts empty", () => {
		const store = createStore();
		expect(store.isEmpty).toBe(true);
		expect(store.count).toBe(0);
		expect(store.coupons).toEqual([]);
	});

	it("generates sequential IDs", () => {
		const store = createStore();
		const id1 = store.nextId();
		const id2 = store.nextId();
		expect(id1.value).toBe("id-1");
		expect(id2.value).toBe("id-2");
	});

	it("adds a coupon and updates coupons array", () => {
		const store = createStore();
		const coupon = makeCoupon("a", "Free hug");
		store.add(coupon);
		expect(store.count).toBe(1);
		expect(store.isEmpty).toBe(false);
		expect(store.coupons[0]?.text).toBe("Free hug");
	});

	it("removes a coupon by id", () => {
		const store = createStore();
		const coupon = makeCoupon("a", "Free hug");
		store.add(coupon);
		store.remove(new CouponId("a"));
		expect(store.isEmpty).toBe(true);
	});

	it("edits a coupon", () => {
		const store = createStore();
		store.add(makeCoupon("a", "Old text", "Old title"));
		store.editCoupon(new CouponId("a"), { text: "New text" });
		expect(store.coupons[0]?.text).toBe("New text");
		expect(store.coupons[0]?.title).toBe("Old title");
	});

	it("moves a coupon", () => {
		const store = createStore();
		store.add(makeCoupon("a", "First"));
		store.add(makeCoupon("b", "Second"));
		store.moveCoupon(new CouponId("a"), "down");
		expect(store.coupons[0]?.id.value).toBe("b");
		expect(store.coupons[1]?.id.value).toBe("a");
	});

	it("loads coupons replacing existing ones", () => {
		const store = createStore();
		store.add(makeCoupon("a", "Original"));
		const newCoupons = [
			makeCoupon("x", "Loaded 1"),
			makeCoupon("y", "Loaded 2"),
		];
		store.loadCoupons(newCoupons);
		expect(store.count).toBe(2);
		expect(store.coupons[0]?.id.value).toBe("x");
		expect(store.coupons[1]?.id.value).toBe("y");
	});
});
