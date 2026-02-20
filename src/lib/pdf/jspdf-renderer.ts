import { jsPDF } from "jspdf";
import type { Coupon } from "../domain/coupon";
import { CouponTextLayout } from "../domain/coupon-layout";
import type { GridPosition } from "../domain/grid-position";
import type { LayoutEngine } from "../domain/layout-engine";
import { TextScaler } from "../domain/text-scaler";
import type { Theme } from "../domain/theme";
import type { CouponAssetRenderer } from "./coupon-asset-renderer";
import type { FontRegistry } from "./font-registry";
import type { CouponRenderer } from "./renderer";
import { JsPdfTextMeasurer } from "./text-measurer";

interface CouponPlacement {
	readonly coupon: Coupon;
	readonly position: GridPosition;
}

export class RenderError extends Error {
	constructor(message: string, cause: unknown) {
		super(message);
		this.name = "RenderError";
		this.cause = cause;
	}
}

const CROP_MARK_LENGTH_MM = 3;
const CROP_MARK_OFFSET_MM = 1;
const TITLE_FONT_SIZE_PT = 14;
const BODY_FONT_SIZE_PT = 10;
const MIN_FONT_SIZE_PT = 6;
const LINE_HEIGHT_RATIO = 1.3;
const PT_TO_MM = 25.4 / 72;

export class JsPdfCouponRenderer implements CouponRenderer {
	private readonly assetRenderer: CouponAssetRenderer | null;

	constructor(assetRenderer?: CouponAssetRenderer) {
		this.assetRenderer = assetRenderer ?? null;
	}
	render(
		coupons: readonly Coupon[],
		layout: LayoutEngine,
		theme: Theme,
		fontRegistry: FontRegistry,
	): Blob {
		try {
			return this.generatePdf(coupons, layout, theme, fontRegistry);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown render failure";
			throw new RenderError(`PDF generation failed: ${message}`, error);
		}
	}

	private generatePdf(
		coupons: readonly Coupon[],
		layout: LayoutEngine,
		theme: Theme,
		fontRegistry: FontRegistry,
	): Blob {
		const config = layout.config;
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		});

		fontRegistry.registerAll(doc);

		if (coupons.length === 0) {
			return doc.output("blob");
		}

		const placements = this.buildPlacements(coupons, layout);
		const pageCount = layout.computePageCount(coupons.length);
		const couponWidth = config.couponDimensions.widthMm;
		const couponHeight = config.couponDimensions.heightMm;

		const measurer = new JsPdfTextMeasurer(doc);
		const textScaler = new TextScaler(
			MIN_FONT_SIZE_PT,
			LINE_HEIGHT_RATIO,
			measurer,
		);

		const titleFontName = this.resolveFontName(
			theme.titleFontFamily,
			fontRegistry,
		);
		const bodyFontName = this.resolveFontName(theme.fontFamily, fontRegistry);
		const couponLayout = new CouponTextLayout(
			textScaler,
			titleFontName,
			bodyFontName,
		);

		for (let page = 0; page < pageCount; page++) {
			if (page > 0) {
				doc.addPage();
			}

			for (const { coupon, position } of placements.filter(
				(p) => p.position.page === page,
			)) {
				this.drawCoupon(
					doc,
					coupon,
					position.xMm,
					position.yMm,
					couponWidth,
					couponHeight,
					theme,
					fontRegistry,
					couponLayout,
				);

				this.drawCropMarks(
					doc,
					position.xMm,
					position.yMm,
					couponWidth,
					couponHeight,
					theme,
				);
			}
		}

		return doc.output("blob");
	}

	private buildPlacements(
		coupons: readonly Coupon[],
		layout: LayoutEngine,
	): readonly CouponPlacement[] {
		const positions = layout.computePositions(coupons.length);
		return coupons.map((coupon, i) => {
			const position = positions[i];
			if (position === undefined) {
				throw new Error(`Missing position for coupon at index ${String(i)}`);
			}
			return { coupon, position };
		});
	}

	private drawCoupon(
		doc: jsPDF,
		coupon: Coupon,
		x: number,
		y: number,
		width: number,
		height: number,
		theme: Theme,
		fontRegistry: FontRegistry,
		couponLayout: CouponTextLayout,
	): void {
		// Background
		doc.setFillColor(theme.backgroundColor);
		doc.setDrawColor(theme.borderColor);
		doc.setLineWidth(theme.borderWidthMm);

		this.drawBorder(doc, x, y, width, height, theme);

		// Draw decorative assets (patterns, ornaments, illustrations)
		if (this.assetRenderer !== null) {
			this.assetRenderer.renderAssets(
				doc,
				theme.assets,
				{ x, y, width, height },
				theme,
			);
		}

		// Compute text area
		const textAreaWidth = width - 2 * theme.paddingMm;
		const textAreaHeight = height - 2 * theme.paddingMm;

		const layoutResult = couponLayout.compute({
			title: coupon.title,
			text: coupon.text,
			innerWidthMm: textAreaWidth,
			innerHeightMm: textAreaHeight,
			maxTitleFontSizePt: TITLE_FONT_SIZE_PT,
			maxBodyFontSizePt: BODY_FONT_SIZE_PT,
			illustration: theme.assets?.illustration ?? undefined,
		});

		const contentX = x + width / 2;
		const contentY = y + theme.paddingMm;

		// Draw title if present
		if (layoutResult.title) {
			this.setFont(doc, theme.titleFontFamily, fontRegistry);
			doc.setTextColor(theme.titleColor);
			doc.setFontSize(layoutResult.title.fontSizePt);

			for (let i = 0; i < layoutResult.title.lines.length; i++) {
				const line = layoutResult.title.lines[i];
				if (line === undefined) {
					continue;
				}
				const lineY =
					contentY +
					layoutResult.title.offsetYMm +
					i * layoutResult.title.fontSizePt * PT_TO_MM * LINE_HEIGHT_RATIO +
					(layoutResult.title.fontSizePt * PT_TO_MM * LINE_HEIGHT_RATIO) / 2;
				doc.text(line, contentX, lineY, {
					align: "center",
					baseline: "middle",
				});
			}
		}

		// Draw body
		this.setFont(doc, theme.fontFamily, fontRegistry);
		doc.setTextColor(theme.textColor);
		doc.setFontSize(layoutResult.body.fontSizePt);

		for (let i = 0; i < layoutResult.body.lines.length; i++) {
			const line = layoutResult.body.lines[i];
			if (line === undefined) {
				continue;
			}
			const lineY =
				contentY +
				layoutResult.body.offsetYMm +
				i * layoutResult.body.fontSizePt * PT_TO_MM * LINE_HEIGHT_RATIO +
				(layoutResult.body.fontSizePt * PT_TO_MM * LINE_HEIGHT_RATIO) / 2;
			doc.text(line, contentX, lineY, {
				align: "center",
				baseline: "middle",
			});
		}
	}

	private resolveFontName(
		fontFamily: string,
		fontRegistry: FontRegistry,
	): string {
		if (fontRegistry.isBuiltIn(fontFamily) || fontRegistry.has(fontFamily)) {
			return fontFamily;
		}
		return "Helvetica";
	}

	private drawBorder(
		doc: jsPDF,
		x: number,
		y: number,
		width: number,
		height: number,
		theme: Theme,
	): void {
		switch (theme.borderStyle) {
			case "dashed":
				doc.setLineDashPattern([2, 2], 0);
				doc.roundedRect(
					x,
					y,
					width,
					height,
					theme.borderRadiusMm,
					theme.borderRadiusMm,
					"FD",
				);
				doc.setLineDashPattern([], 0);
				break;

			case "double": {
				doc.roundedRect(
					x,
					y,
					width,
					height,
					theme.borderRadiusMm,
					theme.borderRadiusMm,
					"FD",
				);
				const inset = theme.borderWidthMm + 0.5;
				doc.setFillColor(theme.backgroundColor);
				doc.roundedRect(
					x + inset,
					y + inset,
					width - inset * 2,
					height - inset * 2,
					Math.max(0, theme.borderRadiusMm - inset),
					Math.max(0, theme.borderRadiusMm - inset),
					"FD",
				);
				break;
			}

			default:
				doc.roundedRect(
					x,
					y,
					width,
					height,
					theme.borderRadiusMm,
					theme.borderRadiusMm,
					"FD",
				);
				break;
		}
	}

	private setFont(
		doc: jsPDF,
		fontFamily: string,
		fontRegistry: FontRegistry,
	): void {
		if (fontRegistry.isBuiltIn(fontFamily) || fontRegistry.has(fontFamily)) {
			doc.setFont(fontFamily, "normal");
		} else {
			doc.setFont("Helvetica", "normal");
		}
	}

	private drawCropMarks(
		doc: jsPDF,
		x: number,
		y: number,
		width: number,
		height: number,
		theme: Theme,
	): void {
		doc.setDrawColor(theme.accentColor);
		doc.setLineWidth(0.1);
		doc.setLineDashPattern([], 0);

		const corners = [
			{ cx: x, cy: y, dx: -1, dy: -1 },
			{ cx: x + width, cy: y, dx: 1, dy: -1 },
			{ cx: x, cy: y + height, dx: -1, dy: 1 },
			{ cx: x + width, cy: y + height, dx: 1, dy: 1 },
		];

		for (const { cx, cy, dx, dy } of corners) {
			doc.line(
				cx + dx * CROP_MARK_OFFSET_MM,
				cy,
				cx + dx * (CROP_MARK_OFFSET_MM + CROP_MARK_LENGTH_MM),
				cy,
			);
			doc.line(
				cx,
				cy + dy * CROP_MARK_OFFSET_MM,
				cx,
				cy + dy * (CROP_MARK_OFFSET_MM + CROP_MARK_LENGTH_MM),
			);
		}
	}
}
