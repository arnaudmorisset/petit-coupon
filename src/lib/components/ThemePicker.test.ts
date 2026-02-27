import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { ALL_THEMES } from "../domain/themes";
import ThemePickerHarness from "./testing/ThemePickerHarness.svelte";
import { TestStores } from "./testing/test-helpers";

function renderPicker(): TestStores {
	const stores = new TestStores();
	render(ThemePickerHarness, {
		couponStore: stores.couponStore,
		themeStore: stores.themeStore,
	});
	return stores;
}

describe("ThemePicker", () => {
	it("renders a card for each theme", () => {
		renderPicker();
		for (const theme of ALL_THEMES) {
			expect(
				screen.getByLabelText(`Select ${theme.name} theme`),
			).toBeInTheDocument();
		}
	});

	it("marks the default theme as selected", () => {
		renderPicker();
		const defaultTheme = ALL_THEMES[0];
		if (defaultTheme) {
			expect(
				screen.getByLabelText(`Select ${defaultTheme.name} theme`),
			).toHaveAttribute("aria-pressed", "true");
		}
	});

	it("marks non-selected themes as not pressed", () => {
		renderPicker();
		for (const theme of ALL_THEMES.slice(1)) {
			expect(
				screen.getByLabelText(`Select ${theme.name} theme`),
			).toHaveAttribute("aria-pressed", "false");
		}
	});

	it("selects a theme when its card is clicked", async () => {
		const stores = renderPicker();
		const romantic = ALL_THEMES.find((t) => t.id === "romantic");
		if (romantic) {
			await fireEvent.click(
				screen.getByLabelText(`Select ${romantic.name} theme`),
			);
			expect(stores.themeStore.selectedTheme.id).toBe("romantic");
		}
	});

	it("updates aria-pressed after selection changes", async () => {
		renderPicker();
		const romantic = ALL_THEMES.find((t) => t.id === "romantic");
		const classic = ALL_THEMES.find((t) => t.id === "classic");
		if (romantic && classic) {
			await fireEvent.click(
				screen.getByLabelText(`Select ${romantic.name} theme`),
			);
			expect(
				screen.getByLabelText(`Select ${romantic.name} theme`),
			).toHaveAttribute("aria-pressed", "true");
			expect(
				screen.getByLabelText(`Select ${classic.name} theme`),
			).toHaveAttribute("aria-pressed", "false");
		}
	});

	it("renders theme description text", () => {
		renderPicker();
		for (const theme of ALL_THEMES) {
			expect(screen.getByText(theme.description)).toBeInTheDocument();
		}
	});
});
