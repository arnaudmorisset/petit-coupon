<script lang="ts">
	import { CouponDimensions } from "../domain/coupon-dimensions";
	import { LayoutConfig } from "../domain/layout-config";
	import { LayoutEngine } from "../domain/layout-engine";
	import { Margins } from "../domain/margins";
	import { PageFormat } from "../domain/page-format";
	import { CouponAssetRenderer } from "../pdf/coupon-asset-renderer";
	import { DownloadService } from "../pdf/download-service";
	import { APP_FONT_REGISTRY } from "../pdf/fonts";
	import { JsPdfCouponRenderer } from "../pdf/jspdf-renderer";
	import { SvgPathRenderer } from "../pdf/svg-path-renderer";
	import { AppContext } from "../stores/context";

	const { couponStore: store, themeStore } = AppContext.current();

	const assetRenderer = new CouponAssetRenderer(new SvgPathRenderer());
	const renderer = new JsPdfCouponRenderer(assetRenderer);
	const downloadService = new DownloadService();
	const layout = new LayoutEngine(
		new LayoutConfig(
			PageFormat.A4,
			new Margins(10, 10, 10, 10),
			new CouponDimensions(90, 55),
			4,
		),
	);

	let generating = $state(false);
	let error = $state("");

	function handleDownload(): void {
		generating = true;
		error = "";
		try {
			const blob = renderer.render(store.coupons, layout, themeStore.selectedTheme, APP_FONT_REGISTRY);
			downloadService.download(blob, "petit-coupon.pdf");
		} catch (e) {
			error = e instanceof Error ? e.message : "PDF generation failed";
		} finally {
			generating = false;
		}
	}
</script>

<button onclick={handleDownload} disabled={store.isEmpty || generating}>
	{generating ? "Generating..." : "Download PDF"}
</button>
{#if error.length > 0}
	<p class="download-error" role="alert">{error}</p>
{/if}

<style>
	.download-error {
		color: var(--ui-danger-text);
		font-size: 13px;
		margin: 8px 0 0;
	}
</style>
