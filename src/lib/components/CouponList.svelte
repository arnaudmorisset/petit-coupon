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

	function handleEdit(id: CouponId, newText: string): void {
		store.editCoupon(id, newText);
	}

	function handleMoveUp(id: CouponId): void {
		store.moveCoupon(id, "up");
	}

	function handleMoveDown(id: CouponId): void {
		store.moveCoupon(id, "down");
	}
</script>

{#if store.isEmpty}
	<p class="empty-message">No coupons yet. Add one above!</p>
{:else}
	<ul class="coupon-list">
		{#each store.coupons as coupon, index (coupon.id.value)}
			<li class="coupon-item">
				<div class="reorder-controls">
					<button
						class="reorder-btn"
						onclick={() => handleMoveUp(coupon.id)}
						disabled={index === 0}
						type="button"
						aria-label="Move up"
					>&#8593;</button>
					<button
						class="reorder-btn"
						onclick={() => handleMoveDown(coupon.id)}
						disabled={index === store.coupons.length - 1}
						type="button"
						aria-label="Move down"
					>&#8595;</button>
				</div>
				<CouponPreview {coupon} {theme} onedit={handleEdit} />
				<button class="remove-btn" onclick={() => handleRemove(coupon.id)}>Remove</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.empty-message {
		color: #64748b;
		font-style: italic;
	}

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

	.reorder-controls {
		display: flex;
		gap: 4px;
	}

	.reorder-btn {
		font-size: 14px;
		padding: 2px 10px;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		color: #475569;
		min-width: 36px;
		min-height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.reorder-btn:hover:not(:disabled) {
		background: #f1f5f9;
		border-color: #94a3b8;
	}

	.reorder-btn:disabled {
		opacity: 0.3;
		cursor: default;
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

	@media (max-width: 640px) {
		.coupon-list {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
