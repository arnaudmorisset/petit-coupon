import { jsPDF } from "jspdf";
import type { Coupon } from "../domain/coupon";
import type { LayoutEngine } from "../domain/layout-engine";
import type { Theme } from "../domain/theme";
import type { FontRegistry } from "./font-registry";
import type { CouponRenderer } from "./renderer";

const CROP_MARK_LENGTH_MM = 3;
const CROP_MARK_OFFSET_MM = 1;

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
	): void {
		if (!coupon) {
			return;
		}

		// Background
		doc.setFillColor(theme.backgroundColor);
		doc.setDrawColor(theme.borderColor);
		doc.setLineWidth(theme.borderWidthMm);

		this.drawBorder(doc, x, y, width, height, theme);

		// Title
		this.setFont(doc, theme.titleFontFamily, fontRegistry);
		doc.setTextColor(theme.titleColor);
		doc.setFontSize(14);

		const textX = x + width / 2;
		const textY = y + theme.paddingMm + 6;
		doc.text(coupon.text, textX, textY, {
			align: "center",
			baseline: "middle",
		});

		// Body (subtitle area)
		this.setFont(doc, theme.fontFamily, fontRegistry);
		doc.setTextColor(theme.textColor);
		doc.setFontSize(10);

		const bodyY = y + height / 2 + 4;
		doc.text("Petit Coupon", textX, bodyY, {
			align: "center",
			baseline: "middle",
		});
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
