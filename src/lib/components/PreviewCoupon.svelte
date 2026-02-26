<script lang="ts">
	import type { Coupon } from "../domain/coupon";
	import type { Theme } from "../domain/theme";
	import { borderStyleToCss } from "../domain/border-style";
	import SvgIllustration from "./SvgIllustration.svelte";
	import SvgOrnament from "./SvgOrnament.svelte";
	import SvgPattern from "./SvgPattern.svelte";

	interface Props {
		coupon: Coupon;
		theme: Theme;
	}

	const { coupon, theme }: Props = $props();
</script>

<div
	class="preview-coupon"
	style:--bg={theme.backgroundColor}
	style:--border-color={theme.borderColor}
	style:--border-width="{Math.max(1, theme.borderWidthMm * 2)}px"
	style:--border-style={borderStyleToCss(theme.borderStyle)}
	style:--border-radius="{theme.borderRadiusMm * 1.5}px"
	style:--padding="{theme.paddingMm * 1.5}px"
	style:--title-color={theme.titleColor}
	style:--text-color={theme.textColor}
>
	{#if theme.assets?.pattern}
		<SvgPattern pattern={theme.assets.pattern} color={theme.accentColor} id="panel-{coupon.id.value}" />
	{/if}

	{#if theme.assets?.cornerOrnament}
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="tl" color={theme.accentColor} />
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="tr" color={theme.accentColor} />
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="bl" color={theme.accentColor} />
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="br" color={theme.accentColor} />
	{/if}

	{#if theme.assets?.illustration}
		<SvgIllustration illustration={theme.assets.illustration} color={theme.accentColor} />
	{/if}

	<div class="preview-coupon-content">
		{#if coupon.title.length > 0}
			<span class="preview-coupon-title">{coupon.title}</span>
		{/if}
		{#if coupon.text.length > 0}
			<span class="preview-coupon-text">{coupon.text}</span>
		{/if}
	</div>
</div>

<style>
	.preview-coupon {
		position: relative;
		overflow: hidden;
		background-color: var(--bg);
		border-color: var(--border-color);
		border-width: var(--border-width);
		border-style: var(--border-style);
		border-radius: var(--border-radius);
		padding: 16px 20px;
		text-align: center;
		box-sizing: border-box;
	}

	.preview-coupon-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center;
	}

	.preview-coupon-title {
		font-size: 16px;
		font-weight: 700;
		word-break: break-word;
		color: var(--title-color);
		line-height: 1.2;
	}

	.preview-coupon-text {
		font-size: 13px;
		font-weight: 400;
		word-break: break-word;
		color: var(--text-color);
		opacity: 0.85;
		line-height: 1.4;
	}

	@media (max-width: 480px) {
		.preview-coupon {
			padding: 12px 14px;
		}

		.preview-coupon-title {
			font-size: 14px;
		}

		.preview-coupon-text {
			font-size: 12px;
		}
	}
</style>
