import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import CouponPreviewHarness from "./testing/CouponPreviewHarness.svelte";
import { TestStores } from "./testing/test-helpers";

function renderPreview(
	overrides: {
		coupon?: Coupon;
		index?: number;
		total?: number;
		onedit?: () => void;
		onremove?: () => void;
		onmoveup?: () => void;
		onmovedown?: () => void;
	} = {},
) {
	const stores = new TestStores();
	const { coupon, index, total, ...callbacks } = overrides;
	render(CouponPreviewHarness, {
		couponStore: stores.couponStore,
		themeStore: stores.themeStore,
		statusStore: stores.statusStore,
		coupon: coupon ?? new Coupon(new CouponId("c1"), "Free hug", "Gift"),
		index: index ?? 0,
		total: total ?? 1,
		...callbacks,
	});
	return stores;
}

describe("CouponPreview", () => {
	it("displays coupon title and text", () => {
		renderPreview();
		expect(screen.getByText("Gift")).toBeInTheDocument();
		expect(screen.getByText("Free hug")).toBeInTheDocument();
	});

	it("does not show title when title is empty", () => {
		renderPreview({
			coupon: new Coupon(new CouponId("c1"), "Free hug", ""),
		});
		expect(screen.queryByText("Gift")).not.toBeInTheDocument();
		expect(screen.getByText("Free hug")).toBeInTheDocument();
	});

	it("does not show text when text is empty", () => {
		renderPreview({
			coupon: new Coupon(new CouponId("c1"), "", "Gift"),
		});
		expect(screen.getByText("Gift")).toBeInTheDocument();
	});

	it("shows remove button when onremove is provided", () => {
		renderPreview({ onremove: vi.fn() });
		expect(screen.getByLabelText("Remove coupon")).toBeInTheDocument();
	});

	it("does not show remove button when onremove is not provided", () => {
		renderPreview();
		expect(screen.queryByLabelText("Remove coupon")).not.toBeInTheDocument();
	});

	it("calls onremove when remove button is clicked", async () => {
		const onremove = vi.fn();
		renderPreview({ onremove });
		await fireEvent.click(screen.getByLabelText("Remove coupon"));
		expect(onremove).toHaveBeenCalledOnce();
	});

	it("enters edit mode when clicked with onedit provided", async () => {
		renderPreview({ onedit: vi.fn() });
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Edit coupon title")).toBeInTheDocument();
		expect(screen.getByLabelText("Edit coupon text")).toBeInTheDocument();
	});

	it("does not enter edit mode when onedit is not provided", async () => {
		renderPreview();
		await fireEvent.click(screen.getByText("Free hug"));
		expect(
			screen.queryByLabelText("Edit coupon title"),
		).not.toBeInTheDocument();
	});

	it("populates edit fields with current values", async () => {
		renderPreview({ onedit: vi.fn() });
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Edit coupon title")).toHaveValue("Gift");
		expect(screen.getByLabelText("Edit coupon text")).toHaveValue("Free hug");
	});

	it("exits edit mode on Escape", async () => {
		renderPreview({ onedit: vi.fn() });
		await fireEvent.click(screen.getByText("Free hug"));
		await fireEvent.keyDown(screen.getByLabelText("Edit coupon title"), {
			key: "Escape",
		});
		expect(
			screen.queryByLabelText("Edit coupon title"),
		).not.toBeInTheDocument();
		expect(screen.getByText("Free hug")).toBeInTheDocument();
	});

	it("shows reorder buttons in edit mode", async () => {
		renderPreview({
			onedit: vi.fn(),
			onmoveup: vi.fn(),
			onmovedown: vi.fn(),
			index: 1,
			total: 3,
		});
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Move coupon up")).toBeInTheDocument();
		expect(screen.getByLabelText("Move coupon down")).toBeInTheDocument();
	});

	it("disables up button when coupon is first", async () => {
		renderPreview({
			onedit: vi.fn(),
			onmoveup: vi.fn(),
			onmovedown: vi.fn(),
			index: 0,
			total: 3,
		});
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Move coupon up")).toBeDisabled();
		expect(screen.getByLabelText("Move coupon down")).toBeEnabled();
	});

	it("disables down button when coupon is last", async () => {
		renderPreview({
			onedit: vi.fn(),
			onmoveup: vi.fn(),
			onmovedown: vi.fn(),
			index: 2,
			total: 3,
		});
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Move coupon up")).toBeEnabled();
		expect(screen.getByLabelText("Move coupon down")).toBeDisabled();
	});

	it("announces when a coupon is updated", async () => {
		const onedit = vi.fn();
		const stores = renderPreview({ onedit });
		await fireEvent.click(screen.getByText("Free hug"));
		await fireEvent.input(screen.getByLabelText("Edit coupon text"), {
			target: { value: "Two free hugs" },
		});
		await fireEvent.click(screen.getByText("Done"));
		expect(stores.statusStore.message).toBe("Coupon updated");
	});

	it("does not announce when edit is cancelled", async () => {
		const stores = renderPreview({ onedit: vi.fn() });
		await fireEvent.click(screen.getByText("Free hug"));
		await fireEvent.keyDown(screen.getByLabelText("Edit coupon title"), {
			key: "Escape",
		});
		expect(stores.statusStore.message).toBe("");
	});

	it("limits edit title input to 80 characters", async () => {
		renderPreview({ onedit: vi.fn() });
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Edit coupon title")).toHaveAttribute(
			"maxlength",
			"80",
		);
	});

	it("limits edit body textarea to 500 characters", async () => {
		renderPreview({ onedit: vi.fn() });
		await fireEvent.click(screen.getByText("Free hug"));
		expect(screen.getByLabelText("Edit coupon text")).toHaveAttribute(
			"maxlength",
			"500",
		);
	});
});
