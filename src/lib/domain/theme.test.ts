import { describe, expect, it } from "vitest";
import { DEFAULT_THEME } from "./theme";

describe("DEFAULT_THEME", () => {
	it("has a non-empty id", () => {
		expect(DEFAULT_THEME.id.length).toBeGreaterThan(0);
	});

	it("has a non-empty name", () => {
		expect(DEFAULT_THEME.name.length).toBeGreaterThan(0);
	});

	it("has a non-empty description", () => {
		expect(DEFAULT_THEME.description.length).toBeGreaterThan(0);
	});

	it("has a valid category", () => {
		expect(["romantic", "friendly", "playful", "minimal"]).toContain(
			DEFAULT_THEME.category,
		);
	});

	it("has valid hex color strings", () => {
		const hexPattern = /^#[0-9a-fA-F]{3,6}$/;
		expect(DEFAULT_THEME.backgroundColor).toMatch(hexPattern);
		expect(DEFAULT_THEME.borderColor).toMatch(hexPattern);
		expect(DEFAULT_THEME.textColor).toMatch(hexPattern);
		expect(DEFAULT_THEME.titleColor).toMatch(hexPattern);
		expect(DEFAULT_THEME.accentColor).toMatch(hexPattern);
	});

	it("has non-empty font families", () => {
		expect(DEFAULT_THEME.fontFamily.length).toBeGreaterThan(0);
		expect(DEFAULT_THEME.titleFontFamily.length).toBeGreaterThan(0);
	});

	it("has a positive border width", () => {
		expect(DEFAULT_THEME.borderWidthMm).toBeGreaterThan(0);
	});

	it("has a non-negative border radius", () => {
		expect(DEFAULT_THEME.borderRadiusMm).toBeGreaterThanOrEqual(0);
	});

	it("has a valid border style", () => {
		expect(["solid", "dashed", "double"]).toContain(DEFAULT_THEME.borderStyle);
	});

	it("has a positive padding", () => {
		expect(DEFAULT_THEME.paddingMm).toBeGreaterThan(0);
	});
});
