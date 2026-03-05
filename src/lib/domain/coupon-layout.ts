import type { TextScaler } from "./text-scaler";
import type { IllustrationAsset } from "./theme-assets";
import { PT_TO_MM } from "./units";

const TITLE_BODY_GAP_MM = 2;
const ILLUSTRATION_GAP_MM = 2;

export interface CouponTextLayoutParams {
	readonly title: string;
	readonly text: string;
	readonly innerWidthMm: number;
	readonly innerHeightMm: number;
	readonly maxTitleFontSizePt: number;
	readonly maxBodyFontSizePt: number;
	readonly illustration: IllustrationAsset | undefined;
}

export interface TextBlockLayout {
	readonly lines: readonly string[];
	readonly fontSizePt: number;
	readonly offsetYMm: number;
	readonly fits: boolean;
}

export interface CouponTextLayoutResult {
	readonly title: TextBlockLayout | null;
	readonly body: TextBlockLayout;
}

export class CouponTextLayout {
	private readonly textScaler: TextScaler;
	private readonly titleFontName: string;
	private readonly bodyFontName: string;

	constructor(
		textScaler: TextScaler,
		titleFontName: string,
		bodyFontName: string,
	) {
		this.textScaler = textScaler;
		this.titleFontName = titleFontName;
		this.bodyFontName = bodyFontName;
	}

	compute(params: CouponTextLayoutParams): CouponTextLayoutResult {
		const adjustedParams = this.adjustForIllustration(params);
		if (adjustedParams.title.trim().length === 0) {
			return this.computeBodyOnly(adjustedParams);
		}
		return this.computeTitleAndBody(adjustedParams);
	}

	private adjustForIllustration(
		params: CouponTextLayoutParams,
	): CouponTextLayoutParams {
		if (params.illustration === undefined) {
			return params;
		}
		const illustrationWidthReduction =
			params.illustration.widthMm + ILLUSTRATION_GAP_MM;
		return {
			...params,
			innerWidthMm: params.innerWidthMm - illustrationWidthReduction,
		};
	}

	private computeBodyOnly(
		params: CouponTextLayoutParams,
	): CouponTextLayoutResult {
		const bodyResult = this.textScaler.computeFontSize({
			text: params.text,
			boxWidthMm: params.innerWidthMm,
			boxHeightMm: params.innerHeightMm,
			fontSizePt: params.maxBodyFontSizePt,
			fontName: this.bodyFontName,
		});

		const bodyHeightMm =
			bodyResult.lines.length *
			bodyResult.fontSizePt *
			PT_TO_MM *
			this.textScaler.lineHeightRatio;
		const offsetYMm = Math.max(0, (params.innerHeightMm - bodyHeightMm) / 2);

		return {
			title: null,
			body: {
				lines: bodyResult.lines,
				fontSizePt: bodyResult.fontSizePt,
				offsetYMm,
				fits: bodyResult.fits,
			},
		};
	}

	private computeTitleAndBody(
		params: CouponTextLayoutParams,
	): CouponTextLayoutResult {
		const titleResult = this.textScaler.computeFontSize({
			text: params.title,
			boxWidthMm: params.innerWidthMm,
			boxHeightMm: params.innerHeightMm,
			fontSizePt: params.maxTitleFontSizePt,
			fontName: this.titleFontName,
		});

		const titleLineHeightMm =
			titleResult.fontSizePt * PT_TO_MM * this.textScaler.lineHeightRatio;
		const titleBlockMm = titleResult.lines.length * titleLineHeightMm;
		const titleHeightWithGap = titleBlockMm + TITLE_BODY_GAP_MM;
		const bodyAvailableMm = Math.max(
			0,
			params.innerHeightMm - titleHeightWithGap,
		);

		const bodyResult = this.textScaler.computeFontSize({
			text: params.text,
			boxWidthMm: params.innerWidthMm,
			boxHeightMm: bodyAvailableMm,
			fontSizePt: params.maxBodyFontSizePt,
			fontName: this.bodyFontName,
		});

		const bodyLineHeightMm =
			bodyResult.fontSizePt * PT_TO_MM * this.textScaler.lineHeightRatio;
		const bodyBlockMm = bodyResult.lines.length * bodyLineHeightMm;
		const totalContentMm = titleBlockMm + TITLE_BODY_GAP_MM + bodyBlockMm;
		const verticalOffset = Math.max(
			0,
			(params.innerHeightMm - totalContentMm) / 2,
		);

		return {
			title: {
				lines: titleResult.lines,
				fontSizePt: titleResult.fontSizePt,
				offsetYMm: verticalOffset,
				fits: titleResult.fits,
			},
			body: {
				lines: bodyResult.lines,
				fontSizePt: bodyResult.fontSizePt,
				offsetYMm: verticalOffset + titleHeightWithGap,
				fits: bodyResult.fits,
			},
		};
	}
}
