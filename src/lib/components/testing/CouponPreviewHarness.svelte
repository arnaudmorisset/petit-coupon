<script lang="ts">
	import type { ComponentProps } from "svelte";
	import type { CouponStore } from "../../stores/coupon-store.svelte";
	import type { ThemeStore } from "../../stores/theme-store.svelte";
	import ContextProvider from "./ContextProvider.svelte";
	import CouponPreview from "../CouponPreview.svelte";

	type PreviewProps = ComponentProps<typeof CouponPreview>;

	interface Props extends PreviewProps {
		couponStore: CouponStore;
		themeStore: ThemeStore;
	}

	const { couponStore, themeStore, ...previewProps }: Props = $props();
</script>

<ContextProvider {couponStore} {themeStore}>
	<CouponPreview {...previewProps} />
</ContextProvider>
