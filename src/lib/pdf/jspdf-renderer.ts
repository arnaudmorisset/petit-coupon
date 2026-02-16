import { jsPDF } from "jspdf";
import type { Coupon } from "../domain/coupon";
import type { LayoutEngine } from "../domain/layout-engine";
import type { Theme } from "../domain/theme";
import type { CouponRenderer } from "./renderer";

const CROP_MARK_LENGTH_MM = 3;
const CROP_MARK_OFFSET_MM = 1;

export class JsPdfCouponRenderer implements CouponRenderer {
	render(coupons: readonly Coupon[], layout: LayoutEngine, theme: Theme): Blob {
		const config = layout.config;
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		});

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
				);

				this.drawCropMarks(doc, pos.xMm, pos.yMm, couponWidth, couponHeight);
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
	): void {
		if (!coupon) {
			return;
		}

		// Background
		doc.setFillColor(theme.backgroundColor);
		doc.setDrawColor(theme.borderColor);
		doc.setLineWidth(theme.borderWidthMm);
		doc.roundedRect(
			x,
			y,
			width,
			height,
			theme.borderRadiusMm,
			theme.borderRadiusMm,
			"FD",
		);

		// Text
		doc.setTextColor(theme.textColor);
		doc.setFont(theme.fontFamily, "normal");
		doc.setFontSize(12);

		const textX = x + width / 2;
		const textY = y + height / 2;
		doc.text(coupon.text, textX, textY, {
			align: "center",
			baseline: "middle",
		});
	}

	private drawCropMarks(
		doc: jsPDF,
		x: number,
		y: number,
		width: number,
		height: number,
	): void {
		doc.setDrawColor("#999999");
		doc.setLineWidth(0.1);

		const corners = [
			{ cx: x, cy: y, dx: -1, dy: -1 },
			{ cx: x + width, cy: y, dx: 1, dy: -1 },
			{ cx: x, cy: y + height, dx: -1, dy: 1 },
			{ cx: x + width, cy: y + height, dx: 1, dy: 1 },
		];

		for (const { cx, cy, dx, dy } of corners) {
			// Horizontal mark
			doc.line(
				cx + dx * CROP_MARK_OFFSET_MM,
				cy,
				cx + dx * (CROP_MARK_OFFSET_MM + CROP_MARK_LENGTH_MM),
				cy,
			);
			// Vertical mark
			doc.line(
				cx,
				cy + dy * CROP_MARK_OFFSET_MM,
				cx,
				cy + dy * (CROP_MARK_OFFSET_MM + CROP_MARK_LENGTH_MM),
			);
		}
	}
}
