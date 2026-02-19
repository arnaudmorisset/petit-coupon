import { describe, expect, it } from "vitest";
import { Coupon } from "./coupon";
import { CouponCollection } from "./coupon-collection";
import { CouponId } from "./coupon-id";

let counter = 0;
function makeCoupon(text: string, title: string = ""): Coupon {
	counter++;
	return new Coupon(new CouponId(`id-${String(counter)}`), text, title);
}

describe("CouponCollection", () => {
	it("is empty when created", () => {
		const collection = new CouponCollection();

		expect(collection.isEmpty()).toBe(true);
		expect(collection.count()).toBe(0);
	});

	it("increases count when adding a coupon", () => {
		const collection = new CouponCollection();

		collection.add(makeCoupon("Happy Birthday!"));

		expect(collection.count()).toBe(1);
		expect(collection.isEmpty()).toBe(false);
	});

	it("stores the provided coupon", () => {
		const collection = new CouponCollection();
		const coupon = makeCoupon("Congratulations!");

		collection.add(coupon);

		const all = collection.getAll();
		expect(all[0]?.text).toBe("Congratulations!");
		expect(all[0]?.id.equals(coupon.id)).toBe(true);
	});

	it("removes a coupon by id", () => {
		const collection = new CouponCollection();
		const coupon = makeCoupon("To remove");
		collection.add(coupon);

		collection.remove(coupon.id);

		expect(collection.count()).toBe(0);
	});

	it("throws when removing a coupon with an unknown id", () => {
		const collection = new CouponCollection();

		expect(() => {
			collection.remove(new CouponId("nonexistent"));
		}).toThrow();
	});

	it("returns coupons in insertion order", () => {
		const collection = new CouponCollection();
		collection.add(makeCoupon("First"));
		collection.add(makeCoupon("Second"));
		collection.add(makeCoupon("Third"));

		const all = collection.getAll();

		expect(all[0]?.text).toBe("First");
		expect(all[1]?.text).toBe("Second");
		expect(all[2]?.text).toBe("Third");
	});

	it("returns a copy from getAll that does not affect the collection", () => {
		const collection = new CouponCollection();
		collection.add(makeCoupon("Original"));

		const copy = collection.getAll();
		copy.length = 0;

		expect(collection.count()).toBe(1);
	});

	describe("edit", () => {
		it("updates the coupon text", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Original");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { text: "Updated" });

			expect(updated.text).toBe("Updated");
			expect(collection.getAll()[0]?.text).toBe("Updated");
		});

		it("throws when editing a coupon with an unknown id", () => {
			const collection = new CouponCollection();

			expect(() => {
				collection.edit(new CouponId("nonexistent"), { text: "Text" });
			}).toThrow();
		});

		it("throws when result has empty text and empty title", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Original");
			collection.add(coupon);

			expect(() => {
				collection.edit(coupon.id, { text: "   " });
			}).toThrow("Coupon must have at least a title or text");
		});

		it("preserves the coupon ID", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Original");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { text: "Updated" });

			expect(updated.id.equals(coupon.id)).toBe(true);
		});

		it("preserves position in the list", () => {
			const collection = new CouponCollection();
			const first = makeCoupon("First");
			const second = makeCoupon("Second");
			const third = makeCoupon("Third");
			collection.add(first);
			collection.add(second);
			collection.add(third);

			collection.edit(second.id, { text: "Modified" });

			const all = collection.getAll();
			expect(all[0]?.text).toBe("First");
			expect(all[1]?.text).toBe("Modified");
			expect(all[2]?.text).toBe("Third");
		});
	});

	describe("title", () => {
		it("stores the provided title when adding a coupon", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Body text", "My Title");
			collection.add(coupon);

			expect(collection.getAll()[0]?.title).toBe("My Title");
		});

		it("defaults title to empty string when not provided", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Body text");
			collection.add(coupon);

			expect(collection.getAll()[0]?.title).toBe("");
		});

		it("updates the title when editing with a new title", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Body", "Old Title");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { title: "New Title" });

			expect(updated.title).toBe("New Title");
		});

		it("preserves existing title when editing only text", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Old Body", "Keep This");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { text: "New Body" });

			expect(updated.title).toBe("Keep This");
			expect(updated.text).toBe("New Body");
		});

		it("preserves existing text when editing only title", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Keep Body", "Old Title");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { title: "New Title" });

			expect(updated.text).toBe("Keep Body");
			expect(updated.title).toBe("New Title");
		});

		it("throws when editing results in empty text and empty title", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Body", "Title");
			collection.add(coupon);

			expect(() => {
				collection.edit(coupon.id, { text: "   ", title: "   " });
			}).toThrow();
		});

		it("allows empty text when title is non-empty", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Body", "Title");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { text: "", title: "Title" });

			expect(updated.text).toBe("");
			expect(updated.title).toBe("Title");
		});

		it("allows empty title when text is non-empty", () => {
			const collection = new CouponCollection();
			const coupon = makeCoupon("Body", "Title");
			collection.add(coupon);

			const updated = collection.edit(coupon.id, { text: "Body", title: "" });

			expect(updated.text).toBe("Body");
			expect(updated.title).toBe("");
		});
	});

	describe("move", () => {
		it("moves a coupon up by swapping with previous", () => {
			const collection = new CouponCollection();
			const first = makeCoupon("First");
			const second = makeCoupon("Second");
			collection.add(first);
			collection.add(second);

			collection.move(second.id, "up");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("Second");
			expect(all[1]?.text).toBe("First");
		});

		it("moves a coupon down by swapping with next", () => {
			const collection = new CouponCollection();
			const first = makeCoupon("First");
			const second = makeCoupon("Second");
			collection.add(first);
			collection.add(second);

			collection.move(first.id, "down");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("Second");
			expect(all[1]?.text).toBe("First");
		});

		it("is a no-op when moving the first coupon up", () => {
			const collection = new CouponCollection();
			const first = makeCoupon("First");
			collection.add(first);
			collection.add(makeCoupon("Second"));

			collection.move(first.id, "up");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("First");
			expect(all[1]?.text).toBe("Second");
		});

		it("is a no-op when moving the last coupon down", () => {
			const collection = new CouponCollection();
			collection.add(makeCoupon("First"));
			const second = makeCoupon("Second");
			collection.add(second);

			collection.move(second.id, "down");

			const all = collection.getAll();
			expect(all[0]?.text).toBe("First");
			expect(all[1]?.text).toBe("Second");
		});

		it("throws when moving a coupon with an unknown id", () => {
			const collection = new CouponCollection();

			expect(() => {
				collection.move(new CouponId("nonexistent"), "up");
			}).toThrow();
		});
	});

	describe("reorder", () => {
		it("moves coupon from index 0 to index 2", () => {
			const collection = new CouponCollection();
			collection.add(makeCoupon("First"));
			collection.add(makeCoupon("Second"));
			collection.add(makeCoupon("Third"));

			collection.reorder(0, 2);

			const all = collection.getAll();
			expect(all[0]?.text).toBe("Second");
			expect(all[1]?.text).toBe("Third");
			expect(all[2]?.text).toBe("First");
		});

		it("throws when fromIndex is out of bounds", () => {
			const collection = new CouponCollection();
			collection.add(makeCoupon("First"));

			expect(() => {
				collection.reorder(5, 0);
			}).toThrow("Index out of bounds");
		});

		it("throws when toIndex is out of bounds", () => {
			const collection = new CouponCollection();
			collection.add(makeCoupon("First"));

			expect(() => {
				collection.reorder(0, 5);
			}).toThrow("Index out of bounds");
		});
	});

	describe("after move, getAll reflects new order", () => {
		it("reflects the new order after multiple moves", () => {
			const collection = new CouponCollection();
			const a = makeCoupon("A");
			const b = makeCoupon("B");
			const c = makeCoupon("C");
			collection.add(a);
			collection.add(b);
			collection.add(c);

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
