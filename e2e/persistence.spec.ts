import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
});

test.describe("Persistence", () => {
	test("coupons persist across page reload", async ({ page }) => {
		await page.getByRole("textbox", { name: "Coupon title" }).fill("Spa Day");
		await page
			.getByRole("textbox", { name: "Coupon text" })
			.fill("Full spa treatment");
		await page.getByRole("button", { name: "Add coupon", exact: true }).click();

		// Wait for the 300ms debounce to flush to localStorage
		await page.waitForTimeout(500);
		await page.reload();

		await expect(page.getByText("Spa Day").first()).toBeVisible();
		await expect(page.getByText("Full spa treatment").first()).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Download PDF/ }),
		).toBeEnabled();
	});

	test("theme selection persists across page reload", async ({ page }) => {
		await page.getByRole("button", { name: "Select Midnight theme" }).click();

		await page.waitForTimeout(500);
		await page.reload();

		await expect(
			page.getByRole("button", { name: "Select Midnight theme" }),
		).toHaveAttribute("aria-pressed", "true");
	});

	test("clear session removes all data", async ({ page }) => {
		await page
			.getByRole("button", { name: "Add coupon: One breakfast in bed" })
			.click();
		await expect(
			page.getByRole("heading", { name: /Your Coupons/ }),
		).toBeVisible();

		await page.waitForTimeout(500);

		page.on("dialog", (dialog) => dialog.accept());
		await page.getByRole("button", { name: "Start a new batch" }).click();

		await expect(page.getByText("Your coupons will appear here")).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Download PDF/ }),
		).toBeDisabled();

		await page.reload();
		await expect(page.getByText("Your coupons will appear here")).toBeVisible();
	});
});
