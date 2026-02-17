<script lang="ts">
	import type { CouponId } from "../domain/coupon-id";
	import type { Theme } from "../domain/theme";
	import type { CouponStore } from "../stores/coupon-store.svelte";
	import CouponPreview from "./CouponPreview.svelte";

	interface Props {
		store: CouponStore;
		theme: Theme;
	}

	const { store, theme }: Props = $props();

	function handleRemove(id: CouponId): void {
		store.remove(id);
	}
</script>

{#if store.isEmpty}
	<p>No coupons yet. Add one above!</p>
{:else}
	<ul class="coupon-list">
		{#each store.coupons as coupon (coupon.id.value)}
			<li class="coupon-item">
				<CouponPreview {coupon} {theme} />
				<button class="remove-btn" onclick={() => handleRemove(coupon.id)}>Remove</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.coupon-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: center;
	}

	.coupon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.remove-btn {
		font-size: 12px;
		padding: 4px 10px;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		color: #64748b;
	}

	.remove-btn:hover {
		background: #fee2e2;
		color: #dc2626;
		border-color: #fca5a5;
	}
</style>
