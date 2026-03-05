import { GState } from "jspdf";
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
		// Match CSS preview: ornaments are 25% of coupon dimensions
		const w = bounds.width * 0.25;
		const h = bounds.height * 0.25;

		// Top-left (as-is, rotation 0°)
		this.pathRenderer.drawPath(doc, ornament.path, {
			x: bounds.x,
			y: bounds.y,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});

		// Top-right (rotation 90° = mirror the path horizontally)
		this.pathRenderer.drawPath(doc, this.mirrorPathH(ornament.path), {
			x: bounds.x + bounds.width - w,
			y: bounds.y,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});

		// Bottom-left (rotation 270° = mirror the path vertically)
		this.pathRenderer.drawPath(doc, this.mirrorPathV(ornament.path), {
			x: bounds.x,
			y: bounds.y + bounds.height - h,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});

		// Bottom-right (rotation 180° = mirror both)
		this.pathRenderer.drawPath(doc, this.mirrorPathHV(ornament.path), {
			x: bounds.x + bounds.width - w,
			y: bounds.y + bounds.height - h,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});
	}

	private mirrorPathH(path: SvgPathData): SvgPathData {
		const parts = path.viewBox.split(" ").map(Number);
		const vbW = parts[2] ?? 1;
		return {
			d: this.transformPathCoords(
				path.d,
				(x) => vbW - x,
				(y) => y,
			),
			viewBox: path.viewBox,
		};
	}

	private mirrorPathV(path: SvgPathData): SvgPathData {
		const parts = path.viewBox.split(" ").map(Number);
		const vbH = parts[3] ?? 1;
		return {
			d: this.transformPathCoords(
				path.d,
				(x) => x,
				(y) => vbH - y,
			),
			viewBox: path.viewBox,
		};
	}

	private mirrorPathHV(path: SvgPathData): SvgPathData {
		const parts = path.viewBox.split(" ").map(Number);
		const vbW = parts[2] ?? 1;
		const vbH = parts[3] ?? 1;
		return {
			d: this.transformPathCoords(
				path.d,
				(x) => vbW - x,
				(y) => vbH - y,
			),
			viewBox: path.viewBox,
		};
	}

	private transformPathCoords(
		d: string,
		tx: (x: number) => number,
		ty: (y: number) => number,
	): string {
		const tokens = d.match(/[MmLlCcQqAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)/g) ?? [];
		const result: string[] = [];
		let i = 0;

		while (i < tokens.length) {
			const token = tokens[i] ?? "";
			if (/^[Zz]$/.test(token)) {
				result.push(token);
				i++;
				continue;
			}
			if (/^[MmLlCcQqAa]$/.test(token)) {
				const isRelative = token === token.toLowerCase();
				const cmd = token.toUpperCase();
				result.push(token);
				i++;

				if (isRelative) {
					// For relative commands, mirror direction (negate coords that change)
					const argCount = this.cmdArgCount(cmd);
					for (let j = 0; j < argCount && i < tokens.length; j++) {
						const val = Number(tokens[i]);
						if (cmd === "A") {
							// A: rx ry xrot largeArc sweep dx dy
							if (j === 5) {
								result.push(String(-val)); // dx
							} else if (j === 6) {
								result.push(String(-val)); // dy
							} else if (j === 4) {
								// flip sweep flag for mirroring
								result.push(String(val === 0 ? 1 : 0));
							} else {
								result.push(String(val));
							}
						} else if (j % 2 === 0) {
							// x coordinate — negate if tx mirrors
							const mirrored = tx(1) === 1 ? val : -val;
							result.push(String(mirrored));
						} else {
							// y coordinate — negate if ty mirrors
							const mirrored = ty(1) === 1 ? val : -val;
							result.push(String(mirrored));
						}
						i++;
					}
				} else {
					// Absolute commands — transform coordinates directly
					const argCount = this.cmdArgCount(cmd);
					for (let j = 0; j < argCount && i < tokens.length; j++) {
						const val = Number(tokens[i]);
						if (cmd === "A") {
							if (j === 5) {
								result.push(String(tx(val)));
							} else if (j === 6) {
								result.push(String(ty(val)));
							} else if (j === 4) {
								result.push(String(val === 0 ? 1 : 0));
							} else {
								result.push(String(val));
							}
						} else if (j % 2 === 0) {
							result.push(String(tx(val)));
						} else {
							result.push(String(ty(val)));
						}
						i++;
					}
				}
			} else {
				result.push(token);
				i++;
			}
		}

		return result.join(" ");
	}

	private cmdArgCount(cmd: string): number {
		switch (cmd) {
			case "M":
			case "L":
				return 2;
			case "C":
				return 6;
			case "Q":
				return 4;
			case "A":
				return 7;
			default:
				return 0;
		}
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
		// Match CSS preview: illustrations are 30% width, 40% height
		const w = bounds.width * 0.3;
		const h = bounds.height * 0.4;
		const inset = bounds.width * 0.04; // 4% inset like CSS
		const { x, y } = this.computeIllustrationPosition(
			illust.position,
			bounds,
			w,
			h,
			inset,
		);

		// Match CSS preview: opacity 0.3
		doc.saveGraphicsState();
		doc.setGState(new GState({ opacity: 0.3 }));

		this.pathRenderer.drawPath(doc, illust.path, {
			x,
			y,
			width: w,
			height: h,
			fillColor: theme.accentColor,
		});

		doc.restoreGraphicsState();
	}

	private computeIllustrationPosition(
		position: string,
		bounds: CouponBounds,
		w: number,
		h: number,
		inset: number,
	): { x: number; y: number } {
		switch (position) {
			case "top-right":
				return {
					x: bounds.x + bounds.width - w - inset,
					y: bounds.y + inset,
				};
			case "bottom-left":
				return {
					x: bounds.x + inset,
					y: bounds.y + bounds.height - h - inset,
				};
			case "bottom-right":
				return {
					x: bounds.x + bounds.width - w - inset,
					y: bounds.y + bounds.height - h - inset,
				};
			default:
				return {
					x: bounds.x + bounds.width - w - inset,
					y: bounds.y + inset,
				};
		}
	}
}
