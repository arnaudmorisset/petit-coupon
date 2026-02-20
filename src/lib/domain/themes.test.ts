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

describe("Theme assets", () => {
	it("classic has pattern but no ornament or illustration", () => {
		const classic = ALL_THEMES.find((t) => t.id === "classic");
		expect(classic?.assets?.pattern).not.toBeNull();
		expect(classic?.assets?.cornerOrnament).toBeNull();
		expect(classic?.assets?.illustration).toBeNull();
	});

	it("romantic has pattern, ornament, and illustration", () => {
		const romantic = ALL_THEMES.find((t) => t.id === "romantic");
		expect(romantic?.assets?.pattern).not.toBeNull();
		expect(romantic?.assets?.cornerOrnament).not.toBeNull();
		expect(romantic?.assets?.illustration).not.toBeNull();
		expect(romantic?.assets?.illustration?.position).toBe("bottom-right");
	});

	it("sunshine has pattern, ornament, and illustration", () => {
		const sunshine = ALL_THEMES.find((t) => t.id === "sunshine");
		expect(sunshine?.assets?.pattern).not.toBeNull();
		expect(sunshine?.assets?.cornerOrnament).not.toBeNull();
		expect(sunshine?.assets?.illustration).not.toBeNull();
		expect(sunshine?.assets?.illustration?.position).toBe("top-right");
	});

	it("midnight has pattern, ornament, and illustration", () => {
		const midnight = ALL_THEMES.find((t) => t.id === "midnight");
		expect(midnight?.assets?.pattern).not.toBeNull();
		expect(midnight?.assets?.cornerOrnament).not.toBeNull();
		expect(midnight?.assets?.illustration).not.toBeNull();
		expect(midnight?.assets?.illustration?.position).toBe("top-right");
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
