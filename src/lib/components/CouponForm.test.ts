import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import CouponFormHarness from "./testing/CouponFormHarness.svelte";
import { TestStores } from "./testing/test-helpers";

function renderForm(): TestStores {
	const stores = new TestStores();
	render(CouponFormHarness, {
		couponStore: stores.couponStore,
		themeStore: stores.themeStore,
		statusStore: stores.statusStore,
	});
	return stores;
}

describe("CouponForm", () => {
	it("renders title and body inputs", () => {
		renderForm();
		expect(screen.getByLabelText("Coupon title")).toBeInTheDocument();
		expect(screen.getByLabelText("Coupon text")).toBeInTheDocument();
	});

	it("renders the add button disabled by default", () => {
		renderForm();
		expect(screen.getByLabelText("Add coupon")).toBeDisabled();
	});

	it("enables the add button when body has text", async () => {
		renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "Free hug" },
		});
		expect(screen.getByLabelText("Add coupon")).toBeEnabled();
	});

	it("enables the add button when title has text", async () => {
		renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon title"), {
			target: { value: "My Gift" },
		});
		expect(screen.getByLabelText("Add coupon")).toBeEnabled();
	});

	it("does not enable the add button for whitespace-only input", async () => {
		renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "   " },
		});
		expect(screen.getByLabelText("Add coupon")).toBeDisabled();
	});

	it("adds a coupon to the store on button click", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "Free hug" },
		});
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(stores.couponStore.count).toBe(1);
		expect(stores.couponStore.coupons[0]?.text).toBe("Free hug");
	});

	it("adds a coupon with both title and body", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon title"), {
			target: { value: "My Gift" },
		});
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "Free hug" },
		});
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(stores.couponStore.coupons[0]?.title).toBe("My Gift");
		expect(stores.couponStore.coupons[0]?.text).toBe("Free hug");
	});

	it("clears inputs after adding a coupon", async () => {
		renderForm();
		const titleInput = screen.getByLabelText("Coupon title");
		const bodyInput = screen.getByLabelText("Coupon text");
		await fireEvent.input(titleInput, { target: { value: "Gift" } });
		await fireEvent.input(bodyInput, { target: { value: "Free hug" } });
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(titleInput).toHaveValue("");
		expect(bodyInput).toHaveValue("");
	});

	it("submits on Enter in the body field", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "Free hug" },
		});
		await fireEvent.keyDown(screen.getByLabelText("Coupon text"), {
			key: "Enter",
		});
		expect(stores.couponStore.count).toBe(1);
	});

	it("moves focus from title to body on Enter", async () => {
		renderForm();
		await fireEvent.keyDown(screen.getByLabelText("Coupon title"), {
			key: "Enter",
		});
		expect(screen.getByLabelText("Coupon text")).toHaveFocus();
	});

	it("trims whitespace from input values", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "  Free hug  " },
		});
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(stores.couponStore.coupons[0]?.text).toBe("Free hug");
	});

	it("renders suggestion chips", () => {
		renderForm();
		expect(
			screen.getByLabelText("Add coupon: One breakfast in bed"),
		).toBeInTheDocument();
	});

	it("adds a coupon when clicking a suggestion chip", async () => {
		const stores = renderForm();
		await fireEvent.click(
			screen.getByLabelText("Add coupon: One breakfast in bed"),
		);
		expect(stores.couponStore.count).toBe(1);
		expect(stores.couponStore.coupons[0]?.text).toBe("One breakfast in bed");
	});

	it("adds a coupon with empty title when using a suggestion", async () => {
		const stores = renderForm();
		await fireEvent.click(
			screen.getByLabelText("Add coupon: One breakfast in bed"),
		);
		expect(stores.couponStore.coupons[0]?.title).toBe("");
	});

	it("can add a coupon with title only", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon title"), {
			target: { value: "Special" },
		});
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(stores.couponStore.count).toBe(1);
		expect(stores.couponStore.coupons[0]?.title).toBe("Special");
		expect(stores.couponStore.coupons[0]?.text).toBe("");
	});

	it("announces when a coupon is added without title", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "Free hug" },
		});
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(stores.statusStore.message).toBe("Coupon added");
	});

	it("announces with title when coupon has a title", async () => {
		const stores = renderForm();
		await fireEvent.input(screen.getByLabelText("Coupon title"), {
			target: { value: "Gift" },
		});
		await fireEvent.input(screen.getByLabelText("Coupon text"), {
			target: { value: "Free hug" },
		});
		await fireEvent.click(screen.getByLabelText("Add coupon"));
		expect(stores.statusStore.message).toBe("Coupon added: Gift");
	});

	it("announces when a suggestion chip is clicked", async () => {
		const stores = renderForm();
		await fireEvent.click(
			screen.getByLabelText("Add coupon: One breakfast in bed"),
		);
		expect(stores.statusStore.message).toBe(
			"Coupon added: One breakfast in bed",
		);
	});

	it("limits title input to 80 characters", () => {
		renderForm();
		expect(screen.getByLabelText("Coupon title")).toHaveAttribute(
			"maxlength",
			"80",
		);
	});

	it("limits body input to 500 characters", () => {
		renderForm();
		expect(screen.getByLabelText("Coupon text")).toHaveAttribute(
			"maxlength",
			"500",
		);
	});
});
