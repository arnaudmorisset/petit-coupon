import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import DownloadButtonHarness from "./testing/DownloadButtonHarness.svelte";
import { TestStores } from "./testing/test-helpers";

function renderButton(): TestStores {
	const stores = new TestStores();
	render(DownloadButtonHarness, {
		couponStore: stores.couponStore,
		themeStore: stores.themeStore,
	});
	return stores;
}

describe("DownloadButton", () => {
	it("renders a download button", () => {
		renderButton();
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("is disabled when there are no coupons", () => {
		renderButton();
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("is enabled when coupons exist", async () => {
		const stores = renderButton();
		stores.couponStore.add(new Coupon(new CouponId("a"), "Free hug", ""));
		await waitFor(() => {
			expect(screen.getByRole("button")).toBeEnabled();
		});
	});

	it("shows singular coupon count in label", async () => {
		const stores = renderButton();
		stores.couponStore.add(new Coupon(new CouponId("a"), "Free hug", ""));
		await waitFor(() => {
			expect(screen.getByRole("button").textContent).toContain("1 coupon");
		});
		expect(screen.getByRole("button").textContent).not.toContain("coupons");
	});

	it("shows plural coupon count in label", async () => {
		const stores = renderButton();
		stores.couponStore.add(new Coupon(new CouponId("a"), "Free hug", ""));
		stores.couponStore.add(new Coupon(new CouponId("b"), "Movie night", ""));
		await waitFor(() => {
			expect(screen.getByRole("button").textContent).toContain("2 coupons");
		});
	});
});
