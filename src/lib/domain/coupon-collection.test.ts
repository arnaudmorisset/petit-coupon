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

	describe("edit", () => {
		it("updates the coupon text", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			const coupon = collection.add("Original");

			const updated = collection.edit(coupon.id, "Updated");

			expect(updated.text).toBe("Updated");
			expect(collection.getAll()[0]?.text).toBe("Updated");
		});

		it("throws when editing a coupon with an unknown id", () => {
			const collection = new CouponCollection(new StubIdGenerator());

			expect(() => {
				collection.edit(
					// biome-ignore lint/suspicious/noExplicitAny: creating a fake CouponId for test
					{ value: "nonexistent", equals: () => false } as any,
					"Text",
				);
			}).toThrow();
		});

		it("throws when new text is empty", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			const coupon = collection.add("Original");

			expect(() => {
				collection.edit(coupon.id, "   ");
			}).toThrow("Coupon text cannot be empty");
		});

		it("preserves the coupon ID", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			const coupon = collection.add("Original");

			const updated = collection.edit(coupon.id, "Updated");

			expect(updated.id.equals(coupon.id)).toBe(true);
		});

		it("preserves position in the list", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			collection.add("First");
			const second = collection.add("Second");
			collection.add("Third");

			collection.edit(second.id, "Modified");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("First");
			expect(all[1]?.text).toBe("Modified");
			expect(all[2]?.text).toBe("Third");
		});
	});

	describe("move", () => {
		it("moves a coupon up by swapping with previous", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			collection.add("First");
			const second = collection.add("Second");

			collection.move(second.id, "up");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("Second");
			expect(all[1]?.text).toBe("First");
		});

		it("moves a coupon down by swapping with next", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			const first = collection.add("First");
			collection.add("Second");

			collection.move(first.id, "down");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("Second");
			expect(all[1]?.text).toBe("First");
		});

		it("is a no-op when moving the first coupon up", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			const first = collection.add("First");
			collection.add("Second");

			collection.move(first.id, "up");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("First");
			expect(all[1]?.text).toBe("Second");
		});

		it("is a no-op when moving the last coupon down", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			collection.add("First");
			const second = collection.add("Second");

			collection.move(second.id, "down");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("First");
			expect(all[1]?.text).toBe("Second");
		});

		it("throws when moving a coupon with an unknown id", () => {
			const collection = new CouponCollection(new StubIdGenerator());

			expect(() => {
				collection.move(
					// biome-ignore lint/suspicious/noExplicitAny: creating a fake CouponId for test
					{ value: "nonexistent", equals: () => false } as any,
					"up",
				);
			}).toThrow();
		});
	});

	describe("reorder", () => {
		it("moves coupon from index 0 to index 2", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			collection.add("First");
			collection.add("Second");
			collection.add("Third");

			collection.reorder(0, 2);

			const all = collection.getAll();
			expect(all[0]?.text).toBe("Second");
			expect(all[1]?.text).toBe("Third");
			expect(all[2]?.text).toBe("First");
		});

		it("throws when fromIndex is out of bounds", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			collection.add("First");

			expect(() => {
				collection.reorder(5, 0);
			}).toThrow("Index out of bounds");
		});

		it("throws when toIndex is out of bounds", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			collection.add("First");

			expect(() => {
				collection.reorder(0, 5);
			}).toThrow("Index out of bounds");
		});
	});

	describe("after move, getAll reflects new order", () => {
		it("reflects the new order after multiple moves", () => {
			const collection = new CouponCollection(new StubIdGenerator());
			const a = collection.add("A");
			collection.add("B");
			const c = collection.add("C");

			// A, B, C → move C up → A, C, B → move A down → C, A, B
			collection.move(c.id, "up");
			collection.move(a.id, "down");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("C");
			expect(all[1]?.text).toBe("A");
			expect(all[2]?.text).toBe("B");
		});
	});
});
