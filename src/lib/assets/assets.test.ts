import { describe, expect, it } from "vitest";
import {
	MOON_ILLUSTRATION,
	ROSE_ILLUSTRATION,
	SUN_ILLUSTRATION,
} from "./illustrations";
import {
	FLOURISH_ORNAMENT,
	GEOMETRIC_ORNAMENT,
	LEAF_ORNAMENT,
} from "./ornaments";
import {
	DOTS_PATTERN,
	HEARTS_PATTERN,
	STARS_PATTERN,
	WAVES_PATTERN,
} from "./patterns";

describe("Pattern assets", () => {
	const patterns = [
		{ name: "DOTS_PATTERN", asset: DOTS_PATTERN },
		{ name: "HEARTS_PATTERN", asset: HEARTS_PATTERN },
		{ name: "WAVES_PATTERN", asset: WAVES_PATTERN },
		{ name: "STARS_PATTERN", asset: STARS_PATTERN },
	];

	for (const { name, asset } of patterns) {
		it(`${name} has valid structure`, () => {
			expect(asset.path.d.length).toBeGreaterThan(0);
			expect(asset.path.viewBox).toMatch(/^\d+ \d+ \d+ \d+$/);
			expect(asset.tileWidthMm).toBeGreaterThan(0);
			expect(asset.tileHeightMm).toBeGreaterThan(0);
			expect(asset.opacity).toBeGreaterThan(0);
			expect(asset.opacity).toBeLessThanOrEqual(1);
		});
	}
});

describe("Ornament assets", () => {
	const ornaments = [
		{ name: "FLOURISH_ORNAMENT", asset: FLOURISH_ORNAMENT },
		{ name: "LEAF_ORNAMENT", asset: LEAF_ORNAMENT },
		{ name: "GEOMETRIC_ORNAMENT", asset: GEOMETRIC_ORNAMENT },
	];

	for (const { name, asset } of ornaments) {
		it(`${name} has valid structure`, () => {
			expect(asset.path.d.length).toBeGreaterThan(0);
			expect(asset.path.viewBox).toMatch(/^\d+ \d+ \d+ \d+$/);
			expect(asset.widthMm).toBeGreaterThan(0);
			expect(asset.heightMm).toBeGreaterThan(0);
		});
	}
});

describe("Illustration assets", () => {
	const illustrations = [
		{ name: "ROSE_ILLUSTRATION", asset: ROSE_ILLUSTRATION },
		{ name: "SUN_ILLUSTRATION", asset: SUN_ILLUSTRATION },
		{ name: "MOON_ILLUSTRATION", asset: MOON_ILLUSTRATION },
	];

	for (const { name, asset } of illustrations) {
		it(`${name} has valid structure`, () => {
			expect(asset.path.d.length).toBeGreaterThan(0);
			expect(asset.path.viewBox).toMatch(/^\d+ \d+ \d+ \d+$/);
			expect(asset.widthMm).toBeGreaterThan(0);
			expect(asset.heightMm).toBeGreaterThan(0);
			expect(["top-right", "bottom-left", "bottom-right"]).toContain(
				asset.position,
			);
		});
	}

	it("ROSE_ILLUSTRATION is positioned bottom-right", () => {
		expect(ROSE_ILLUSTRATION.position).toBe("bottom-right");
	});

	it("SUN_ILLUSTRATION is positioned top-right", () => {
		expect(SUN_ILLUSTRATION.position).toBe("top-right");
	});

	it("MOON_ILLUSTRATION is positioned top-right", () => {
		expect(MOON_ILLUSTRATION.position).toBe("top-right");
	});
});
