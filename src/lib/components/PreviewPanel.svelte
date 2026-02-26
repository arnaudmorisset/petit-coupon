<script lang="ts">
	import { AppContext } from "../stores/context";
	import PreviewCoupon from "./PreviewCoupon.svelte";
	import SheetPreview from "./SheetPreview.svelte";

	interface Props {
		showSheet: boolean;
	}

	const { showSheet }: Props = $props();
	const { couponStore, themeStore } = AppContext.current();
</script>

{#if couponStore.isEmpty}
	<div class="empty-state">
		<div class="empty-icon">&#9986;</div>
		<p class="empty-text">Your coupons will appear here</p>
	</div>
{:else if showSheet}
	<SheetPreview />
{:else}
	<div class="preview-stack">
		{#each couponStore.coupons.slice(0, 4) as coupon (coupon.id.value)}
			<PreviewCoupon {coupon} theme={themeStore.selectedTheme} />
		{/each}
		{#if couponStore.coupons.length > 4}
			<p class="more-count">
				+{couponStore.coupons.length - 4} more coupon{couponStore.coupons.length - 4 > 1 ? 's' : ''}
			</p>
		{/if}
	</div>
{/if}

<style>
	.empty-state {
		text-align: center;
		padding: 40px 20px;
	}

	.empty-icon {
		font-size: 40px;
		color: var(--ui-border);
	}

	.empty-text {
		font-size: 13px;
		color: var(--ui-text-disabled);
		margin: 8px 0 0;
	}

	.preview-stack {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.more-count {
		font-size: 12px;
		color: var(--ui-text-muted);
		text-align: center;
		margin: 0;
	}
</style>
