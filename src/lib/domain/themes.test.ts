import { describe, expect, it } from "vitest";
import { ALL_THEMES, THEME_REGISTRY } from "./themes";

describe("ALL_THEMES", () => {
	it("has exactly 4 themes", () => {
		expect(ALL_THEMES).toHaveLength(4);
	});

	it("has unique ids", () => {
		const ids = ALL_THEMES.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it.each(ALL_THEMES)("theme '$id' has valid hex colors", (theme) => {
		const hexPattern = /^#[0-9a-fA-F]{6}$/;
		expect(theme.backgroundColor).toMatch(hexPattern);
		expect(theme.borderColor).toMatch(hexPattern);
		expect(theme.textColor).toMatch(hexPattern);
		expect(theme.titleColor).toMatch(hexPattern);
		expect(theme.accentColor).toMatch(hexPattern);
	});
});

describe("THEME_REGISTRY", () => {
	it("can look up each theme by id", () => {
		for (const theme of ALL_THEMES) {
			expect(THEME_REGISTRY.getById(theme.id)).toBe(theme);
		}
	});

	it("returns classic as the default theme", () => {
		expect(THEME_REGISTRY.getDefault().id).toBe("classic");
	});
});
