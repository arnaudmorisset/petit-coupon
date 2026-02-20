<script lang="ts">
	import { CouponDimensions } from "../domain/coupon-dimensions";
	import { LayoutConfig } from "../domain/layout-config";
	import { LayoutEngine } from "../domain/layout-engine";
	import { Margins } from "../domain/margins";
	import { PageFormat } from "../domain/page-format";
	import type { Theme } from "../domain/theme";
	import { CouponAssetRenderer } from "../pdf/coupon-asset-renderer";
	import { DownloadService } from "../pdf/download-service";
	import { APP_FONT_REGISTRY } from "../pdf/fonts";
	import { JsPdfCouponRenderer } from "../pdf/jspdf-renderer";
	import { SvgPathRenderer } from "../pdf/svg-path-renderer";
	import type { CouponStore } from "../stores/coupon-store.svelte";

	interface Props {
		store: CouponStore;
		theme: Theme;
	}

	const { store, theme }: Props = $props();

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

	function handleDownload(): void {
		const blob = renderer.render(store.coupons, layout, theme, APP_FONT_REGISTRY);
		downloadService.download(blob, "petit-coupon.pdf");
	}
</script>

<button onclick={handleDownload} disabled={store.isEmpty}>
	Download PDF
</button>
