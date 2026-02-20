import { describe, expect, it, vi } from "vitest";
import type { PatternAsset, SvgPathData } from "../domain/theme-assets";
import type { PdfDrawingContext } from "./pdf-drawing-context";
import { SvgPathRenderer } from "./svg-path-renderer";

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

describe("SvgPathRenderer", () => {
	const renderer = new SvgPathRenderer();

	describe("drawPath", () => {
		it("translates M and L commands with scale and offset", () => {
			const doc = createMockDoc();
			const pathData: SvgPathData = {
				d: "M 0 0 L 10 0 L 10 10 Z",
				viewBox: "0 0 10 10",
			};

			renderer.drawPath(doc, pathData, {
				x: 5,
				y: 10,
				width: 20,
				height: 20,
				fillColor: "#ff0000",
			});

			expect(doc.setFillColor).toHaveBeenCalledWith("#ff0000");
			expect(doc.moveTo).toHaveBeenCalledWith(5, 10);
			expect(doc.lineTo).toHaveBeenCalledWith(25, 10);
			expect(doc.lineTo).toHaveBeenCalledWith(25, 30);
			expect(doc.close).toHaveBeenCalled();
			expect(doc.fill).toHaveBeenCalled();
		});

		it("handles relative commands (m, l, c)", () => {
			const doc = createMockDoc();
			const pathData: SvgPathData = {
				d: "M 0 0 l 10 0 l 0 10",
				viewBox: "0 0 10 10",
			};

			renderer.drawPath(doc, pathData, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fillColor: "#000000",
			});

			expect(doc.moveTo).toHaveBeenCalledWith(0, 0);
			expect(doc.lineTo).toHaveBeenCalledWith(10, 0);
			expect(doc.lineTo).toHaveBeenCalledWith(10, 10);
		});

		it("translates C (cubic bezier) commands", () => {
			const doc = createMockDoc();
			const pathData: SvgPathData = {
				d: "M 0 0 C 5 0 10 5 10 10",
				viewBox: "0 0 10 10",
			};

			renderer.drawPath(doc, pathData, {
				x: 0,
				y: 0,
				width: 20,
				height: 20,
				fillColor: "#000000",
			});

			expect(doc.moveTo).toHaveBeenCalledWith(0, 0);
			expect(doc.curveTo).toHaveBeenCalledWith(10, 0, 20, 10, 20, 20);
		});

		it("draws stroke when strokeColor is provided", () => {
			const doc = createMockDoc();
			const pathData: SvgPathData = {
				d: "M 0 0 L 10 10",
				viewBox: "0 0 10 10",
			};

			renderer.drawPath(doc, pathData, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fillColor: "#000000",
				strokeColor: "#ff0000",
			});

			expect(doc.setDrawColor).toHaveBeenCalledWith("#ff0000");
			expect(doc.fillStroke).toHaveBeenCalled();
			expect(doc.fill).not.toHaveBeenCalled();
		});

		it("does nothing for empty path string", () => {
			const doc = createMockDoc();
			const pathData: SvgPathData = { d: "", viewBox: "0 0 10 10" };

			renderer.drawPath(doc, pathData, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fillColor: "#000000",
			});

			expect(doc.moveTo).not.toHaveBeenCalled();
			expect(doc.lineTo).not.toHaveBeenCalled();
			expect(doc.fill).not.toHaveBeenCalled();
		});

		it("handles multiple subpaths (multiple M commands)", () => {
			const doc = createMockDoc();
			const pathData: SvgPathData = {
				d: "M 0 0 L 5 5 M 10 10 L 5 5",
				viewBox: "0 0 10 10",
			};

			renderer.drawPath(doc, pathData, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				fillColor: "#000000",
			});

			expect(doc.moveTo).toHaveBeenCalledTimes(2);
			expect(doc.lineTo).toHaveBeenCalledTimes(2);
		});
	});

	describe("drawTiledPattern", () => {
		it("saves and restores graphics state", () => {
			const doc = createMockDoc();
			const pattern: PatternAsset = {
				path: { d: "M 0 0 L 10 0 L 10 10 Z", viewBox: "0 0 10 10" },
				tileWidthMm: 5,
				tileHeightMm: 5,
				opacity: 0.1,
			};

			renderer.drawTiledPattern(doc, pattern, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				color: "#000000",
			});

			expect(doc.saveGraphicsState).toHaveBeenCalled();
			expect(doc.restoreGraphicsState).toHaveBeenCalled();
		});

		it("sets opacity via GState", () => {
			const doc = createMockDoc();
			const pattern: PatternAsset = {
				path: { d: "M 0 0 L 10 10", viewBox: "0 0 10 10" },
				tileWidthMm: 5,
				tileHeightMm: 5,
				opacity: 0.08,
			};

			renderer.drawTiledPattern(doc, pattern, {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				color: "#000000",
			});

			expect(doc.setGState).toHaveBeenCalled();
		});

		it("tiles the pattern across the bounds", () => {
			const doc = createMockDoc();
			const pattern: PatternAsset = {
				path: { d: "M 5 0 L 10 10 L 0 10 Z", viewBox: "0 0 10 10" },
				tileWidthMm: 5,
				tileHeightMm: 5,
				opacity: 0.1,
			};

			renderer.drawTiledPattern(doc, pattern, {
				x: 0,
				y: 0,
				width: 15,
				height: 10,
				color: "#000000",
			});

			// 15/5 = 3 cols, 10/5 = 2 rows → 6 tiles → 6 moveTo calls (one per tile path)
			const moveToMock = doc.moveTo;
			expect(
				vi.isMockFunction(moveToMock) && moveToMock.mock.calls.length,
			).toBe(6);
		});

		it("clips to the pattern bounds", () => {
			const doc = createMockDoc();
			const pattern: PatternAsset = {
				path: { d: "M 0 0 L 10 10", viewBox: "0 0 10 10" },
				tileWidthMm: 5,
				tileHeightMm: 5,
				opacity: 0.1,
			};

			renderer.drawTiledPattern(doc, pattern, {
				x: 10,
				y: 20,
				width: 30,
				height: 40,
				color: "#000000",
			});

			expect(doc.rect).toHaveBeenCalledWith(10, 20, 30, 40);
			expect(doc.clip).toHaveBeenCalled();
			expect(doc.discardPath).toHaveBeenCalled();
		});
	});
});
