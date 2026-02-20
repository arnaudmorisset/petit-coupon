import type { TextScaler } from "./text-scaler";
import type { IllustrationAsset } from "./theme-assets";

const PT_TO_MM = 25.4 / 72;
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

		return {
			title: null,
			body: {
				lines: bodyResult.lines,
				fontSizePt: bodyResult.fontSizePt,
				offsetYMm: 0,
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

		const lineHeightMm =
			titleResult.fontSizePt * PT_TO_MM * this.textScaler.lineHeightRatio;
		const titleHeightMm =
			titleResult.lines.length * lineHeightMm + TITLE_BODY_GAP_MM;
		const bodyHeightMm = Math.max(0, params.innerHeightMm - titleHeightMm);

		const bodyResult = this.textScaler.computeFontSize({
			text: params.text,
			boxWidthMm: params.innerWidthMm,
			boxHeightMm: bodyHeightMm,
			fontSizePt: params.maxBodyFontSizePt,
			fontName: this.bodyFontName,
		});

		return {
			title: {
				lines: titleResult.lines,
				fontSizePt: titleResult.fontSizePt,
				offsetYMm: 0,
				fits: titleResult.fits,
			},
			body: {
				lines: bodyResult.lines,
				fontSizePt: bodyResult.fontSizePt,
				offsetYMm: titleHeightMm,
				fits: bodyResult.fits,
			},
		};
	}
}
