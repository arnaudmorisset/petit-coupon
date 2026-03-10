import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.CI
	? "http://localhost:4173/petit-coupon"
	: "http://localhost:5173/petit-coupon";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? "github" : "list",

	use: {
		baseURL,
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: process.env.CI ? "npm run preview" : "npm run dev",
		url: `${baseURL}/`,
		reuseExistingServer: !process.env.CI,
	},
});
