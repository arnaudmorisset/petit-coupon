import { describe, expect, it } from "vitest";
import type {
	IllustrationAsset,
	OrnamentAsset,
	PatternAsset,
	ThemeAssets,
} from "./theme-assets";

describe("ThemeAssets", () => {
	it("accepts a fully populated ThemeAssets object", () => {
		const assets: ThemeAssets = {
			pattern: {
				path: { d: "M 0 0 L 10 0 L 10 10 Z", viewBox: "0 0 10 10" },
				tileWidthMm: 5,
				tileHeightMm: 5,
				opacity: 0.1,
			},
			cornerOrnament: {
				path: { d: "M 0 0 C 5 0 5 5 0 5", viewBox: "0 0 10 10" },
				widthMm: 8,
				heightMm: 8,
			},
			illustration: {
				path: { d: "M 10 0 A 10 10 0 1 1 0 10", viewBox: "0 0 20 20" },
				widthMm: 15,
				heightMm: 15,
				position: "bottom-right",
			},
		};

		expect(assets.pattern).not.toBeNull();
		expect(assets.cornerOrnament).not.toBeNull();
		expect(assets.illustration).not.toBeNull();
	});

	it("accepts ThemeAssets with all null fields", () => {
		const assets: ThemeAssets = {
			pattern: null,
			cornerOrnament: null,
			illustration: null,
		};

		expect(assets.pattern).toBeNull();
		expect(assets.cornerOrnament).toBeNull();
		expect(assets.illustration).toBeNull();
	});

	it("enforces valid illustration positions", () => {
		const positions = ["top-right", "bottom-left", "bottom-right"] as const;
		for (const position of positions) {
			const illustration: IllustrationAsset = {
				path: { d: "M 0 0 L 10 10", viewBox: "0 0 10 10" },
				widthMm: 10,
				heightMm: 10,
				position,
			};
			expect(illustration.position).toBe(position);
		}
	});

	it("stores PatternAsset with required fields", () => {
		const pattern: PatternAsset = {
			path: { d: "M 5 0 L 10 10 L 0 10 Z", viewBox: "0 0 10 10" },
			tileWidthMm: 4,
			tileHeightMm: 4,
			opacity: 0.05,
		};

		expect(pattern.path.d.length).toBeGreaterThan(0);
		expect(pattern.path.viewBox).toBe("0 0 10 10");
		expect(pattern.tileWidthMm).toBeGreaterThan(0);
		expect(pattern.tileHeightMm).toBeGreaterThan(0);
		expect(pattern.opacity).toBeGreaterThanOrEqual(0);
		expect(pattern.opacity).toBeLessThanOrEqual(1);
	});

	it("stores OrnamentAsset with required fields", () => {
		const ornament: OrnamentAsset = {
			path: { d: "M 0 0 C 3 0 5 2 5 5", viewBox: "0 0 5 5" },
			widthMm: 6,
			heightMm: 6,
		};

		expect(ornament.path.d.length).toBeGreaterThan(0);
		expect(ornament.widthMm).toBeGreaterThan(0);
		expect(ornament.heightMm).toBeGreaterThan(0);
	});
});
