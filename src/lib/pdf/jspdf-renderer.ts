import { jsPDF } from "jspdf";
import type { Coupon } from "../domain/coupon";
import type { LayoutEngine } from "../domain/layout-engine";
import { TextScaler } from "../domain/text-scaler";
import type { Theme } from "../domain/theme";
import type { FontRegistry } from "./font-registry";
import type { CouponRenderer } from "./renderer";
import { JsPdfTextMeasurer } from "./text-measurer";

const CROP_MARK_LENGTH_MM = 3;
const CROP_MARK_OFFSET_MM = 1;
const TITLE_FONT_SIZE_PT = 14;
const MIN_FONT_SIZE_PT = 6;
const LINE_HEIGHT_RATIO = 1.3;
const PT_TO_MM = 25.4 / 72;

export class JsPdfCouponRenderer implements CouponRenderer {
	render(
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

		const positions = layout.computePositions(coupons.length);
		const pageCount = layout.computePageCount(coupons.length);
		const couponWidth = config.couponDimensions.widthMm;
		const couponHeight = config.couponDimensions.heightMm;

		const measurer = new JsPdfTextMeasurer(doc);
		const textScaler = new TextScaler(
			MIN_FONT_SIZE_PT,
			LINE_HEIGHT_RATIO,
			measurer,
		);

		for (let page = 0; page < pageCount; page++) {
			if (page > 0) {
				doc.addPage();
			}

			const pagePositions = positions.filter((p) => p.page === page);

			for (const pos of pagePositions) {
				this.drawCoupon(
					doc,
					coupons[positions.indexOf(pos)],
					pos.xMm,
					pos.yMm,
					couponWidth,
					couponHeight,
					theme,
					fontRegistry,
					textScaler,
				);

				this.drawCropMarks(
					doc,
					pos.xMm,
					pos.yMm,
					couponWidth,
					couponHeight,
					theme,
				);
			}
		}

		return doc.output("blob");
	}

	private drawCoupon(
		doc: jsPDF,
		coupon: Coupon | undefined,
		x: number,
		y: number,
		width: number,
		height: number,
		theme: Theme,
		fontRegistry: FontRegistry,
		textScaler: TextScaler,
	): void {
		if (!coupon) {
			return;
		}

		// Background
		doc.setFillColor(theme.backgroundColor);
		doc.setDrawColor(theme.borderColor);
		doc.setLineWidth(theme.borderWidthMm);

		this.drawBorder(doc, x, y, width, height, theme);

		// Compute text area
		const textAreaWidth = width - 2 * theme.paddingMm;
		const textAreaHeight = height - 2 * theme.paddingMm;

		// Title line reservation
		const titleHeightMm = TITLE_FONT_SIZE_PT * PT_TO_MM * LINE_HEIGHT_RATIO;
		const bodyAreaHeight = textAreaHeight - titleHeightMm;

		// Title
		const titleFontName = this.resolveFontName(
			theme.titleFontFamily,
			fontRegistry,
		);
		this.setFont(doc, theme.titleFontFamily, fontRegistry);
		doc.setTextColor(theme.titleColor);
		doc.setFontSize(TITLE_FONT_SIZE_PT);

		// Scale title text
		const titleResult = textScaler.computeFontSize({
			text: coupon.text,
			boxWidthMm: textAreaWidth,
			boxHeightMm: titleHeightMm,
			fontSizePt: TITLE_FONT_SIZE_PT,
			fontName: titleFontName,
		});

		const titleY = y + theme.paddingMm + titleHeightMm / 2;
		doc.setFontSize(titleResult.fontSizePt);

		for (let i = 0; i < titleResult.lines.length; i++) {
			const line = titleResult.lines[i];
			if (line === undefined) {
				continue;
			}
			const lineY =
				titleY + i * titleResult.fontSizePt * PT_TO_MM * LINE_HEIGHT_RATIO;
			doc.text(line, x + width / 2, lineY, {
				align: "center",
				baseline: "middle",
			});
		}

		// Body (subtitle area)
		const bodyFontName = this.resolveFontName(theme.fontFamily, fontRegistry);
		this.setFont(doc, theme.fontFamily, fontRegistry);
		doc.setTextColor(theme.textColor);

		const bodyResult = textScaler.computeFontSize({
			text: "Petit Coupon",
			boxWidthMm: textAreaWidth,
			boxHeightMm: bodyAreaHeight,
			fontSizePt: 10,
			fontName: bodyFontName,
		});

		doc.setFontSize(bodyResult.fontSizePt);
		const bodyStartY = y + theme.paddingMm + titleHeightMm + bodyAreaHeight / 2;

		for (let i = 0; i < bodyResult.lines.length; i++) {
			const line = bodyResult.lines[i];
			if (line === undefined) {
				continue;
			}
			const lineY =
				bodyStartY + i * bodyResult.fontSizePt * PT_TO_MM * LINE_HEIGHT_RATIO;
			doc.text(line, x + width / 2, lineY, {
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
