import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import ClearButtonHarness from "./testing/ClearButtonHarness.svelte";
import { TestStores } from "./testing/test-helpers";

function renderButton(): TestStores {
	const stores = new TestStores();
	render(ClearButtonHarness, {
		couponStore: stores.couponStore,
		themeStore: stores.themeStore,
	});
	return stores;
}

describe("ClearButton", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the button", () => {
		renderButton();
		expect(screen.getByText("Start a new batch")).toBeInTheDocument();
	});

	it("shows confirm dialog when clicked", async () => {
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
		renderButton();
		await fireEvent.click(screen.getByText("Start a new batch"));
		expect(confirmSpy).toHaveBeenCalledOnce();
	});

	it("clears coupons when user confirms", async () => {
		vi.spyOn(window, "confirm").mockReturnValue(true);
		const stores = renderButton();
		stores.couponStore.add(new Coupon(new CouponId("a"), "Free hug", ""));
		expect(stores.couponStore.isEmpty).toBe(false);
		await fireEvent.click(screen.getByText("Start a new batch"));
		expect(stores.couponStore.isEmpty).toBe(true);
	});

	it("preserves coupons when user cancels", async () => {
		vi.spyOn(window, "confirm").mockReturnValue(false);
		const stores = renderButton();
		stores.couponStore.add(new Coupon(new CouponId("a"), "Free hug", ""));
		await fireEvent.click(screen.getByText("Start a new batch"));
		expect(stores.couponStore.count).toBe(1);
	});
});
