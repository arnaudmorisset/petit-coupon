<script lang="ts">
	import type { CouponStore } from "../../stores/coupon-store.svelte";
	import type { ThemeStore } from "../../stores/theme-store.svelte";
	import ContextProvider from "./ContextProvider.svelte";
	import CouponList from "../CouponList.svelte";

	interface Props {
		couponStore: CouponStore;
		themeStore: ThemeStore;
	}

	const { couponStore, themeStore }: Props = $props();
</script>

<ContextProvider {couponStore} {themeStore}>
	<CouponList />
</ContextProvider>
