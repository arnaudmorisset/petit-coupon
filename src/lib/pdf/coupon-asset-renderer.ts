import type { Theme } from "../domain/theme";
import type {
	PatternAsset,
	SvgPathData,
	ThemeAssets,
} from "../domain/theme-assets";
import type { PdfDrawingContext } from "./pdf-drawing-context";
import type { DrawPathParams, TiledPatternParams } from "./svg-path-renderer";

export interface PathRenderer {
	drawPath(
		doc: PdfDrawingContext,
		pathData: SvgPathData,
		params: DrawPathParams,
	): void;
	drawTiledPattern(
		doc: PdfDrawingContext,
		pattern: PatternAsset,
		params: TiledPatternParams,
	): void;
}

export interface CouponBounds {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
}

export class CouponAssetRenderer {
	private readonly pathRenderer: PathRenderer;

	constructor(pathRenderer: PathRenderer) {
		this.pathRenderer = pathRenderer;
	}

	renderAssets(
		doc: PdfDrawingContext,
		assets: ThemeAssets | undefined,
		bounds: CouponBounds,
		theme: Theme,
	): void {
		if (assets === undefined) {
			return;
		}

		if (assets.pattern !== null) {
			this.drawPattern(doc, assets, bounds, theme);
		}

		if (assets.cornerOrnament !== null) {
			this.drawCornerOrnaments(doc, assets, bounds, theme);
		}

		if (assets.illustration !== null) {
			this.drawIllustration(doc, assets, bounds, theme);
		}
	}

	private drawPattern(
		doc: PdfDrawingContext,
		assets: ThemeAssets,
		bounds: CouponBounds,
		theme: Theme,
	): void {
		if (assets.pattern === null) {
			return;
		}
		this.pathRenderer.drawTiledPattern(doc, assets.pattern, {
			x: bounds.x,
			y: bounds.y,
			width: bounds.width,
			height: bounds.height,
			color: theme.accentColor,
		});
	}

	private drawCornerOrnaments(
		doc: PdfDrawingContext,
		assets: ThemeAssets,
		bounds: CouponBounds,
		theme: Theme,
	): void {
		if (assets.cornerOrnament === null) {
			return;
		}
		const ornament = assets.cornerOrnament;
		const w = ornament.widthMm;
		const h = ornament.heightMm;

		// Top-left (as-is)
		this.pathRenderer.drawPath(doc, ornament.path, {
			x: bounds.x,
			y: bounds.y,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});

		// Top-right (mirrored horizontally)
		doc.saveGraphicsState();
		this.pathRenderer.drawPath(doc, ornament.path, {
			x: bounds.x + bounds.width - w,
			y: bounds.y,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});
		doc.restoreGraphicsState();

		// Bottom-left (mirrored vertically)
		doc.saveGraphicsState();
		this.pathRenderer.drawPath(doc, ornament.path, {
			x: bounds.x,
			y: bounds.y + bounds.height - h,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});
		doc.restoreGraphicsState();

		// Bottom-right (mirrored both)
		doc.saveGraphicsState();
		this.pathRenderer.drawPath(doc, ornament.path, {
			x: bounds.x + bounds.width - w,
			y: bounds.y + bounds.height - h,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});
		doc.restoreGraphicsState();
	}

	private drawIllustration(
		doc: PdfDrawingContext,
		assets: ThemeAssets,
		bounds: CouponBounds,
		theme: Theme,
	): void {
		if (assets.illustration === null) {
			return;
		}
		const illust = assets.illustration;
		const { x, y } = this.computeIllustrationPosition(illust, bounds);

		this.pathRenderer.drawPath(doc, illust.path, {
			x,
			y,
			width: illust.widthMm,
			height: illust.heightMm,
			fillColor: theme.accentColor,
		});
	}

	private computeIllustrationPosition(
		illust: { widthMm: number; heightMm: number; position: string },
		bounds: CouponBounds,
	): { x: number; y: number } {
		switch (illust.position) {
			case "top-right":
				return {
					x: bounds.x + bounds.width - illust.widthMm,
					y: bounds.y,
				};
			case "bottom-left":
				return {
					x: bounds.x,
					y: bounds.y + bounds.height - illust.heightMm,
				};
			case "bottom-right":
				return {
					x: bounds.x + bounds.width - illust.widthMm,
					y: bounds.y + bounds.height - illust.heightMm,
				};
			default:
				return {
					x: bounds.x + bounds.width - illust.widthMm,
					y: bounds.y,
				};
		}
	}
}
