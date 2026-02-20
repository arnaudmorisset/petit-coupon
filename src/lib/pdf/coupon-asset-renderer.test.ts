import { describe, expect, it, vi } from "vitest";
import { DEFAULT_THEME } from "../domain/theme";
import type { ThemeAssets } from "../domain/theme-assets";
import {
	CouponAssetRenderer,
	type PathRenderer,
} from "./coupon-asset-renderer";
import type { PdfDrawingContext } from "./pdf-drawing-context";

function createMockDoc(): PdfDrawingContext {
	return {
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		curveTo: vi.fn(),
		close: vi.fn(),
		fill: vi.fn(),
		fillStroke: vi.fn(),
		setFillColor: vi.fn(),
		setDrawColor: vi.fn(),
		saveGraphicsState: vi.fn(),
		restoreGraphicsState: vi.fn(),
		setGState: vi.fn(),
		rect: vi.fn(),
		clip: vi.fn(),
		discardPath: vi.fn(),
	};
}

function createMockPathRenderer(): PathRenderer {
	return {
		drawPath: vi.fn(),
		drawTiledPattern: vi.fn(),
	};
}

const stubTheme = {
	...DEFAULT_THEME,
	accentColor: "#999999",
};

const fullAssets: ThemeAssets = {
	pattern: {
		path: { d: "M 0 0 L 10 10", viewBox: "0 0 10 10" },
		tileWidthMm: 5,
		tileHeightMm: 5,
		opacity: 0.1,
	},
	cornerOrnament: {
		path: { d: "M 0 0 C 5 0 5 5 0 5", viewBox: "0 0 10 10" },
		widthMm: 6,
		heightMm: 6,
	},
	illustration: {
		path: { d: "M 10 0 L 0 10", viewBox: "0 0 20 20" },
		widthMm: 10,
		heightMm: 10,
		position: "top-right",
	},
};

describe("CouponAssetRenderer", () => {
	it("does nothing when assets is undefined", () => {
		const pathRenderer = createMockPathRenderer();
		const renderer = new CouponAssetRenderer(pathRenderer);
		const doc = createMockDoc();

		renderer.renderAssets(
			doc,
			undefined,
			{ x: 0, y: 0, width: 90, height: 55 },
			stubTheme,
		);

		expect(pathRenderer.drawPath).not.toHaveBeenCalled();
		expect(pathRenderer.drawTiledPattern).not.toHaveBeenCalled();
	});

	it("does nothing when all asset fields are null", () => {
		const pathRenderer = createMockPathRenderer();
		const renderer = new CouponAssetRenderer(pathRenderer);
		const doc = createMockDoc();
		const nullAssets: ThemeAssets = {
			pattern: null,
			cornerOrnament: null,
			illustration: null,
		};

		renderer.renderAssets(
			doc,
			nullAssets,
			{ x: 0, y: 0, width: 90, height: 55 },
			stubTheme,
		);

		expect(pathRenderer.drawPath).not.toHaveBeenCalled();
		expect(pathRenderer.drawTiledPattern).not.toHaveBeenCalled();
	});

	it("draws tiled pattern when pattern asset exists", () => {
		const pathRenderer = createMockPathRenderer();
		const renderer = new CouponAssetRenderer(pathRenderer);
		const doc = createMockDoc();
		const assets: ThemeAssets = {
			pattern: fullAssets.pattern,
			cornerOrnament: null,
			illustration: null,
		};

		renderer.renderAssets(
			doc,
			assets,
			{ x: 10, y: 20, width: 90, height: 55 },
			stubTheme,
		);

		expect(pathRenderer.drawTiledPattern).toHaveBeenCalledWith(
			doc,
			assets.pattern,
			{ x: 10, y: 20, width: 90, height: 55, color: "#999999" },
		);
	});

	it("draws corner ornaments at all 4 corners", () => {
		const pathRenderer = createMockPathRenderer();
		const renderer = new CouponAssetRenderer(pathRenderer);
		const doc = createMockDoc();
		const assets: ThemeAssets = {
			pattern: null,
			cornerOrnament: fullAssets.cornerOrnament,
			illustration: null,
		};

		renderer.renderAssets(
			doc,
			assets,
			{ x: 0, y: 0, width: 90, height: 55 },
			stubTheme,
		);

		expect(pathRenderer.drawPath).toHaveBeenCalledTimes(4);
	});

	it("draws illustration at the correct position", () => {
		const pathRenderer = createMockPathRenderer();
		const renderer = new CouponAssetRenderer(pathRenderer);
		const doc = createMockDoc();
		const assets: ThemeAssets = {
			pattern: null,
			cornerOrnament: null,
			illustration: fullAssets.illustration,
		};

		renderer.renderAssets(
			doc,
			assets,
			{ x: 10, y: 20, width: 90, height: 55 },
			stubTheme,
		);

		expect(pathRenderer.drawPath).toHaveBeenCalledTimes(1);
		// top-right: x = 10 + 90 - 10 = 90, y = 20
		expect(pathRenderer.drawPath).toHaveBeenCalledWith(
			doc,
			fullAssets.illustration?.path,
			expect.objectContaining({
				x: 90,
				y: 20,
				width: 10,
				height: 10,
				fillColor: "#999999",
			}),
		);
	});

	it("draws all assets in order when fully populated", () => {
		const pathRenderer = createMockPathRenderer();
		const renderer = new CouponAssetRenderer(pathRenderer);
		const doc = createMockDoc();

		renderer.renderAssets(
			doc,
			fullAssets,
			{ x: 0, y: 0, width: 90, height: 55 },
			stubTheme,
		);

		// 1 pattern call + 4 ornament calls + 1 illustration call
		expect(pathRenderer.drawTiledPattern).toHaveBeenCalledTimes(1);
		expect(pathRenderer.drawPath).toHaveBeenCalledTimes(5); // 4 corners + 1 illustration
	});
});
