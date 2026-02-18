<script lang="ts">
	import type { CouponDimensions } from "../domain/coupon-dimensions";
	import type { PageData } from "../domain/sheet-preview-data";
	import type { Theme } from "../domain/theme";
	import type { PageFormat } from "../domain/page-format";

	interface Props {
		page: PageData;
		theme: Theme;
		couponDimensions: CouponDimensions;
		pageFormat: PageFormat;
	}

	const { page, theme, couponDimensions, pageFormat }: Props = $props();

	function borderStyleCss(style: string): string {
		if (style === "double") return "double";
		if (style === "dashed") return "dashed";
		return "solid";
	}
</script>

<div class="sheet-page">
	<div class="page-label">Page {page.pageNumber + 1}</div>
	<div
		class="page-surface"
		style:--page-aspect="{pageFormat.widthMm} / {pageFormat.heightMm}"
	>
		{#each page.entries as entry (entry.coupon.id.value)}
			<div
				class="coupon-cell"
				style:--left="{(entry.position.xMm / pageFormat.widthMm) * 100}%"
				style:--top="{(entry.position.yMm / pageFormat.heightMm) * 100}%"
				style:--width="{(couponDimensions.widthMm / pageFormat.widthMm) * 100}%"
				style:--height="{(couponDimensions.heightMm / pageFormat.heightMm) * 100}%"
				style:--bg={theme.backgroundColor}
				style:--border-color={theme.borderColor}
				style:--border-width="{Math.max(1, theme.borderWidthMm * 1.5)}px"
				style:--border-style={borderStyleCss(theme.borderStyle)}
				style:--border-radius="{theme.borderRadiusMm}px"
				style:--title-color={theme.titleColor}
			>
				<span class="coupon-label">{entry.coupon.text}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.sheet-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.page-label {
		font-size: 12px;
		color: #64748b;
		font-weight: 500;
	}

	.page-surface {
		position: relative;
		width: 100%;
		aspect-ratio: var(--page-aspect);
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.coupon-cell {
		position: absolute;
		left: var(--left);
		top: var(--top);
		width: var(--width);
		height: var(--height);
		background-color: var(--bg);
		border-color: var(--border-color);
		border-width: var(--border-width);
		border-style: var(--border-style);
		border-radius: var(--border-radius);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: hidden;
		padding: 2px;
		box-sizing: border-box;
	}

	.coupon-label {
		font-size: clamp(6px, 1.5vw, 11px);
		font-weight: 600;
		color: var(--title-color);
		word-break: break-word;
		line-height: 1.2;
	}
</style>
