<script lang="ts">
	import { CouponDimensions } from "../domain/coupon-dimensions";
	import { LayoutConfig } from "../domain/layout-config";
	import { LayoutEngine } from "../domain/layout-engine";
	import { Margins } from "../domain/margins";
	import { PageFormat } from "../domain/page-format";
	import { DEFAULT_THEME } from "../domain/theme";
	import { DownloadService } from "../pdf/download-service";
	import { JsPdfCouponRenderer } from "../pdf/jspdf-renderer";
	import type { CouponStore } from "../stores/coupon-store.svelte";

	interface Props {
		store: CouponStore;
	}

	const { store }: Props = $props();

	const renderer = new JsPdfCouponRenderer();
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
		const blob = renderer.render(store.coupons, layout, DEFAULT_THEME);
		downloadService.download(blob, "petit-coupon.pdf");
	}
</script>

<button onclick={handleDownload} disabled={store.isEmpty}>
	Download PDF
</button>
