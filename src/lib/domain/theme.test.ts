import { describe, expect, it } from "vitest";
import { DEFAULT_THEME } from "./theme";

describe("DEFAULT_THEME", () => {
	it("has a non-empty id", () => {
		expect(DEFAULT_THEME.id.length).toBeGreaterThan(0);
	});

	it("has a non-empty name", () => {
		expect(DEFAULT_THEME.name.length).toBeGreaterThan(0);
	});

	it("has valid hex color strings", () => {
		const hexPattern = /^#[0-9a-fA-F]{3,6}$/;
		expect(DEFAULT_THEME.backgroundColor).toMatch(hexPattern);
		expect(DEFAULT_THEME.borderColor).toMatch(hexPattern);
		expect(DEFAULT_THEME.textColor).toMatch(hexPattern);
	});

	it("has a non-empty font family", () => {
		expect(DEFAULT_THEME.fontFamily.length).toBeGreaterThan(0);
	});

	it("has a positive border width", () => {
		expect(DEFAULT_THEME.borderWidthMm).toBeGreaterThan(0);
	});

	it("has a non-negative border radius", () => {
		expect(DEFAULT_THEME.borderRadiusMm).toBeGreaterThanOrEqual(0);
	});
});
