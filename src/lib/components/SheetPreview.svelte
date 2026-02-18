<script lang="ts">
	import type { Coupon } from "../domain/coupon";
	import { CouponDimensions } from "../domain/coupon-dimensions";
	import { LayoutConfig } from "../domain/layout-config";
	import { LayoutEngine } from "../domain/layout-engine";
	import { Margins } from "../domain/margins";
	import { PageFormat } from "../domain/page-format";
	import { SheetPreviewData } from "../domain/sheet-preview-data";
	import type { Theme } from "../domain/theme";
	import SheetPage from "./SheetPage.svelte";

	interface Props {
		coupons: readonly Coupon[];
		theme: Theme;
	}

	const { coupons, theme }: Props = $props();

	const layout = new LayoutEngine(
		new LayoutConfig(
			PageFormat.A4,
			new Margins(10, 10, 10, 10),
			new CouponDimensions(90, 55),
			4,
		),
	);

	const positions = $derived(layout.computePositions(coupons.length));
	const previewData = $derived(new SheetPreviewData(coupons, positions));
	const pages = $derived(previewData.getPages());
</script>

{#if coupons.length === 0}
	<p class="empty-state">Add some coupons to see a preview of your sheet.</p>
{:else}
	<div class="sheet-preview">
		{#each pages as page (page.pageNumber)}
			<SheetPage
				{page}
				{theme}
				couponDimensions={layout.config.couponDimensions}
				pageFormat={layout.config.pageFormat}
			/>
		{/each}
	</div>
{/if}

<style>
	.empty-state {
		color: #64748b;
		font-style: italic;
		text-align: center;
	}

	.sheet-preview {
		display: flex;
		flex-direction: column;
		gap: 24px;
		align-items: center;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}
</style>
