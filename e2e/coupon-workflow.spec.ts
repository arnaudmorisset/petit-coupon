import { stat } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
});

test.describe("Coupon workflow", () => {
	test("page loads with header and empty state", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Petit Coupon" }),
		).toBeVisible();
		await expect(page.getByText("Your coupons will appear here")).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Download PDF/ }),
		).toBeDisabled();
	});

	test("create a coupon using the form", async ({ page }) => {
		await page
			.getByRole("textbox", { name: "Coupon title" })
			.fill("Date Night");
		await page
			.getByRole("textbox", { name: "Coupon text" })
			.fill("One fancy dinner out");
		await page.getByRole("button", { name: "Add coupon", exact: true }).click();

		await expect(
			page.getByRole("heading", { name: /Your Coupons/ }),
		).toBeVisible();
		await expect(
			page.getByRole("textbox", { name: "Coupon title" }),
		).toHaveValue("");
		await expect(
			page.getByRole("textbox", { name: "Coupon text" }),
		).toHaveValue("");
		await expect(
			page.getByRole("button", { name: /Download PDF/ }),
		).toBeEnabled();
	});

	test("add a coupon via suggestion chip", async ({ page }) => {
		await page
			.getByRole("button", { name: "Add coupon: One breakfast in bed" })
			.click();

		await expect(
			page.getByRole("heading", { name: /Your Coupons/ }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Download PDF/ }),
		).toBeEnabled();
	});

	test("select a different theme", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: "Select Classic theme" }),
		).toHaveAttribute("aria-pressed", "true");

		await page.getByRole("button", { name: "Select Romantic theme" }).click();

		await expect(
			page.getByRole("button", { name: "Select Romantic theme" }),
		).toHaveAttribute("aria-pressed", "true");
		await expect(
			page.getByRole("button", { name: "Select Classic theme" }),
		).toHaveAttribute("aria-pressed", "false");
	});

	test("remove a coupon", async ({ page }) => {
		await page
			.getByRole("button", { name: "Add coupon: One breakfast in bed" })
			.click();
		await expect(
			page.getByRole("heading", { name: /Your Coupons/ }),
		).toBeVisible();

		await page.getByRole("button", { name: "Remove coupon" }).click();

		await expect(page.getByText("Your coupons will appear here")).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Download PDF/ }),
		).toBeDisabled();
	});

	test("download PDF generates a file", async ({ page }) => {
		await page
			.getByRole("button", { name: "Add coupon: One breakfast in bed" })
			.click();
		await page
			.getByRole("button", { name: "Add coupon: Movie night, your pick" })
			.click();

		await expect(page.getByRole("button", { name: /2 coupons/ })).toBeEnabled();

		const downloadPromise = page.waitForEvent("download");
		await page.getByRole("button", { name: /Download PDF/ }).click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toBe("petit-coupon.pdf");
		const filePath = await download.path();
		if (filePath) {
			const stats = await stat(filePath);
			expect(stats.size).toBeGreaterThan(1000);
		}
	});
});
