import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusStore } from "./status-store.svelte";

describe("StatusStore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts with an empty message", () => {
		const store = new StatusStore();
		expect(store.message).toBe("");
	});

	it("sets the message on announce", () => {
		const store = new StatusStore();
		store.announce("Coupon added");
		expect(store.message).toBe("Coupon added");
	});

	it("clears the message after 5 seconds", () => {
		const store = new StatusStore();
		store.announce("Coupon added");
		vi.advanceTimersByTime(5000);
		expect(store.message).toBe("");
	});

	it("does not clear the message before 5 seconds", () => {
		const store = new StatusStore();
		store.announce("Coupon added");
		vi.advanceTimersByTime(4999);
		expect(store.message).toBe("Coupon added");
	});

	it("replaces the previous message on a new announce", () => {
		const store = new StatusStore();
		store.announce("Coupon added");
		store.announce("Coupon removed");
		expect(store.message).toBe("Coupon removed");
	});

	it("resets the clear timer on a new announce", () => {
		const store = new StatusStore();
		store.announce("Coupon added");
		vi.advanceTimersByTime(3000);
		store.announce("Coupon removed");
		vi.advanceTimersByTime(3000);
		expect(store.message).toBe("Coupon removed");
		vi.advanceTimersByTime(2000);
		expect(store.message).toBe("");
	});
});
