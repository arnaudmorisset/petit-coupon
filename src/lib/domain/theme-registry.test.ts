import { describe, expect, it } from "vitest";
import type { Theme } from "./theme";
import { ThemeRegistry } from "./theme-registry";

function makeTheme(overrides: Partial<Theme> = {}): Theme {
	return {
		id: "test",
		name: "Test Theme",
		description: "A test theme",
		category: "minimal",
		backgroundColor: "#ffffff",
		borderColor: "#000000",
		textColor: "#000000",
		titleColor: "#000000",
		accentColor: "#999999",
		fontFamily: "Helvetica",
		titleFontFamily: "Helvetica",
		borderWidthMm: 0.5,
		borderRadiusMm: 2,
		borderStyle: "solid",
		paddingMm: 4,
		...overrides,
	};
}

describe("ThemeRegistry", () => {
	it("returns all themes from getAll", () => {
		const theme = makeTheme();
		const registry = new ThemeRegistry([theme]);
		expect(registry.getAll()).toEqual([theme]);
	});

	it("returns the first theme as default", () => {
		const first = makeTheme({ id: "first" });
		const second = makeTheme({ id: "second" });
		const registry = new ThemeRegistry([first, second]);
		expect(registry.getDefault()).toBe(first);
	});

	it("returns the correct theme by id", () => {
		const alpha = makeTheme({ id: "alpha" });
		const beta = makeTheme({ id: "beta" });
		const registry = new ThemeRegistry([alpha, beta]);
		expect(registry.getById("beta")).toBe(beta);
	});

	it("throws when getById receives an unknown id", () => {
		const registry = new ThemeRegistry([makeTheme({ id: "known" })]);
		expect(() => registry.getById("unknown")).toThrow();
	});

	it("filters themes by category", () => {
		const romantic = makeTheme({ id: "r", category: "romantic" });
		const minimal = makeTheme({ id: "m", category: "minimal" });
		const registry = new ThemeRegistry([romantic, minimal]);
		expect(registry.getByCategory("romantic")).toEqual([romantic]);
	});

	it("returns empty array when no themes match category", () => {
		const registry = new ThemeRegistry([makeTheme({ category: "minimal" })]);
		expect(registry.getByCategory("playful")).toEqual([]);
	});

	it("throws when constructed with an empty array", () => {
		expect(() => new ThemeRegistry([])).toThrow();
	});

	it("throws when constructed with duplicate ids", () => {
		expect(
			() =>
				new ThemeRegistry([makeTheme({ id: "dup" }), makeTheme({ id: "dup" })]),
		).toThrow();
	});
});
