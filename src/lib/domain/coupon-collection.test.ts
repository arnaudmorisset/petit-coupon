import { describe, expect, it } from "vitest";
import { CouponCollection } from "./coupon-collection";
import type { IdGenerator } from "./id-generator";

class StubIdGenerator implements IdGenerator {
	private counter = 0;

	generate(): string {
		this.counter++;
		return `stub-${String(this.counter)}`;
	}
}

describe("CouponCollection", () => {
	it("is empty when created", () => {
		const collection = new CouponCollection(new StubIdGenerator());

		expect(collection.isEmpty()).toBe(true);
		expect(collection.count()).toBe(0);
	});

	it("increases count when adding a coupon", () => {
		const collection = new CouponCollection(new StubIdGenerator());

		collection.add("Happy Birthday!");

		expect(collection.count()).toBe(1);
		expect(collection.isEmpty()).toBe(false);
	});

	it("stores the provided text on the added coupon", () => {
		const collection = new CouponCollection(new StubIdGenerator());

		const coupon = collection.add("Congratulations!");

		expect(coupon.text).toBe("Congratulations!");
	});

	it("removes a coupon by id", () => {
		const collection = new CouponCollection(new StubIdGenerator());
		const coupon = collection.add("To remove");

		collection.remove(coupon.id);

		expect(collection.count()).toBe(0);
	});

	it("throws when removing a coupon with an unknown id", () => {
		const collection = new CouponCollection(new StubIdGenerator());

		expect(() => {
			collection.remove(
				// biome-ignore lint/suspicious/noExplicitAny: creating a fake CouponId for test
				{ value: "nonexistent" } as any,
			);
		}).toThrow();
	});

	it("returns coupons in insertion order", () => {
		const collection = new CouponCollection(new StubIdGenerator());
		collection.add("First");
		collection.add("Second");
		collection.add("Third");

		const all = collection.getAll();

		expect(all[0]?.text).toBe("First");
		expect(all[1]?.text).toBe("Second");
		expect(all[2]?.text).toBe("Third");
	});

	it("returns a copy from getAll that does not affect the collection", () => {
		const collection = new CouponCollection(new StubIdGenerator());
		collection.add("Original");

		const copy = collection.getAll();
		// Mutating the returned array should not affect the collection
		copy.length = 0;

		expect(collection.count()).toBe(1);
	});
});
