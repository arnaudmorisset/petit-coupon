<script lang="ts">
	import type { CouponStore } from "../../stores/coupon-store.svelte";
	import type { StatusStore } from "../../stores/status-store.svelte";
	import type { ThemeStore } from "../../stores/theme-store.svelte";
	import ContextProvider from "./ContextProvider.svelte";
	import ClearButton from "../ClearButton.svelte";

	interface Props {
		couponStore: CouponStore;
		themeStore: ThemeStore;
		statusStore?: StatusStore | undefined;
	}

	const { couponStore, themeStore, statusStore }: Props = $props();
</script>

<ContextProvider {couponStore} {themeStore} {statusStore}>
	<ClearButton />
</ContextProvider>
