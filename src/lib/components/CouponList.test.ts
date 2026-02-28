import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import CouponListHarness from "./testing/CouponListHarness.svelte";
import { TestStores } from "./testing/test-helpers";

function renderList(): TestStores {
	const stores = new TestStores();
	render(CouponListHarness, {
		couponStore: stores.couponStore,
		themeStore: stores.themeStore,
		statusStore: stores.statusStore,
	});
	return stores;
}

describe("CouponList", () => {
	it("announces when a coupon is removed", async () => {
		const stores = renderList();
		stores.couponStore.add(new Coupon(new CouponId("a"), "Free hug", "Gift"));
		await waitFor(() => {
			expect(screen.getByLabelText("Remove coupon")).toBeInTheDocument();
		});
		await fireEvent.click(screen.getByLabelText("Remove coupon"));
		expect(stores.statusStore.message).toBe("Coupon removed");
	});

	it("announces when a coupon is moved up", async () => {
		const stores = renderList();
		stores.couponStore.add(new Coupon(new CouponId("a"), "First", ""));
		stores.couponStore.add(new Coupon(new CouponId("b"), "Second", ""));
		await waitFor(() => {
			expect(screen.getByText("Second")).toBeInTheDocument();
		});
		// Enter edit mode on second coupon (index 1) — only it shows reorder buttons
		await fireEvent.click(screen.getByText("Second"));
		// At index 1, "Move up" is enabled
		await fireEvent.click(screen.getByLabelText("Move coupon up"));
		expect(stores.statusStore.message).toBe("Coupon moved up");
	});

	it("announces when a coupon is moved down", async () => {
		const stores = renderList();
		stores.couponStore.add(new Coupon(new CouponId("a"), "First", ""));
		stores.couponStore.add(new Coupon(new CouponId("b"), "Second", ""));
		await waitFor(() => {
			expect(screen.getByText("First")).toBeInTheDocument();
		});
		// Enter edit mode on first coupon (index 0) — only it shows reorder buttons
		await fireEvent.click(screen.getByText("First"));
		// At index 0, "Move down" is enabled
		await fireEvent.click(screen.getByLabelText("Move coupon down"));
		expect(stores.statusStore.message).toBe("Coupon moved down");
	});
});
