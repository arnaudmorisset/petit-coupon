import { describe, expect, it } from "vitest";
import type { Theme } from "../domain/theme";
import { DEFAULT_THEME } from "../domain/theme";
import { ThemeRegistry } from "../domain/theme-registry";
import { ThemeStore } from "./theme-store.svelte";

function makeTheme(id: string, name: string): Theme {
	return {
		...DEFAULT_THEME,
		id,
		name,
	};
}

function createStore(): { store: ThemeStore; themes: readonly Theme[] } {
	const themes = [
		makeTheme("classic", "Classic"),
		makeTheme("romantic", "Romantic"),
		makeTheme("sunshine", "Sunshine"),
	];
	const registry = new ThemeRegistry(themes);
	return { store: new ThemeStore(registry), themes };
}

describe("ThemeStore", () => {
	it("selects the first theme by default", () => {
		const { store } = createStore();
		expect(store.selectedTheme.id).toBe("classic");
	});

	it("exposes all themes from registry", () => {
		const { store, themes } = createStore();
		expect(store.allThemes).toEqual(themes);
	});

	it("selects a theme by id", () => {
		const { store } = createStore();
		store.selectTheme("romantic");
		expect(store.selectedTheme.id).toBe("romantic");
	});

	it("throws when selecting unknown theme id", () => {
		const { store } = createStore();
		expect(() => store.selectTheme("nonexistent")).toThrow();
	});
});
