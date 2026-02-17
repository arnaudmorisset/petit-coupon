<script lang="ts">
	import type { Coupon } from "../domain/coupon";
	import type { Theme } from "../domain/theme";

	interface Props {
		coupon: Coupon;
		theme: Theme;
	}

	const { coupon, theme }: Props = $props();

	function borderStyleCss(style: string): string {
		if (style === "double") return "double";
		if (style === "dashed") return "dashed";
		return "solid";
	}
</script>

<div
	class="coupon-preview"
	style:--bg={theme.backgroundColor}
	style:--border-color={theme.borderColor}
	style:--border-width="{Math.max(1, theme.borderWidthMm * 2)}px"
	style:--border-style={borderStyleCss(theme.borderStyle)}
	style:--border-radius="{theme.borderRadiusMm * 1.5}px"
	style:--padding="{theme.paddingMm * 1.5}px"
	style:--title-color={theme.titleColor}
>
	<span class="coupon-text">{coupon.text}</span>
</div>

<style>
	.coupon-preview {
		aspect-ratio: 90 / 55;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		max-width: 270px;
		width: 100%;
		background-color: var(--bg);
		border-color: var(--border-color);
		border-width: var(--border-width);
		border-style: var(--border-style);
		border-radius: var(--border-radius);
		padding: var(--padding);
	}

	.coupon-text {
		font-size: 14px;
		font-weight: 600;
		word-break: break-word;
		color: var(--title-color);
	}
</style>
