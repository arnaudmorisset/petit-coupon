import { describe, expect, it, vi } from "vitest";
import { FontRegistry, type FontSource } from "./font-registry";

function makeFontSource(overrides: Partial<FontSource> = {}): FontSource {
	return {
		name: "TestFont",
		style: "normal",
		weight: "normal",
		base64: "AAAA",
		...overrides,
	};
}

describe("FontRegistry", () => {
	it("has returns true for a registered font", () => {
		const registry = new FontRegistry([makeFontSource({ name: "Custom" })]);
		expect(registry.has("Custom")).toBe(true);
	});

	it("has returns false for an unknown font", () => {
		const registry = new FontRegistry([makeFontSource({ name: "Custom" })]);
		expect(registry.has("Unknown")).toBe(false);
	});

	it("isBuiltIn returns true for Helvetica, Times, Courier", () => {
		const registry = new FontRegistry([]);
		expect(registry.isBuiltIn("Helvetica")).toBe(true);
		expect(registry.isBuiltIn("Times")).toBe(true);
		expect(registry.isBuiltIn("Courier")).toBe(true);
	});

	it("isBuiltIn returns false for a custom font", () => {
		const registry = new FontRegistry([]);
		expect(registry.isBuiltIn("DancingScript")).toBe(false);
	});

	it("registerAll calls addFileToVFS and addFont for each font", () => {
		const fonts = [
			makeFontSource({ name: "FontA" }),
			makeFontSource({ name: "FontB" }),
		];
		const registry = new FontRegistry(fonts);

		const doc = {
			addFileToVFS: vi.fn(),
			addFont: vi.fn(),
		};

		registry.registerAll(doc as never);

		expect(doc.addFileToVFS).toHaveBeenCalledTimes(2);
		expect(doc.addFont).toHaveBeenCalledTimes(2);
		expect(doc.addFileToVFS).toHaveBeenCalledWith("FontA.ttf", "AAAA");
		expect(doc.addFont).toHaveBeenCalledWith(
			"FontA.ttf",
			"FontA",
			"normal",
			"normal",
		);
	});
});
