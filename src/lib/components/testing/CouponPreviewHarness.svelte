<script lang="ts">
	import type { ComponentProps } from "svelte";
	import type { CouponStore } from "../../stores/coupon-store.svelte";
	import type { StatusStore } from "../../stores/status-store.svelte";
	import type { ThemeStore } from "../../stores/theme-store.svelte";
	import ContextProvider from "./ContextProvider.svelte";
	import CouponPreview from "../CouponPreview.svelte";

	type PreviewProps = ComponentProps<typeof CouponPreview>;

	interface Props extends PreviewProps {
		couponStore: CouponStore;
		themeStore: ThemeStore;
		statusStore?: StatusStore | undefined;
	}

	const { couponStore, themeStore, statusStore, ...previewProps }: Props = $props();
</script>

<ContextProvider {couponStore} {themeStore} {statusStore}>
	<CouponPreview {...previewProps} />
</ContextProvider>
