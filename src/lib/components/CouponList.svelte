<script lang="ts">
	import type { Coupon } from "../domain/coupon";
	import type { CouponId } from "../domain/coupon-id";
	import { AppContext } from "../stores/context";
	import CouponPreview from "./CouponPreview.svelte";

	const { couponStore: store } = AppContext.current();

	function handleRemove(id: CouponId): void {
		store.remove(id);
	}

	function handleEdit(id: CouponId, updates: Partial<Coupon>): void {
		store.editCoupon(id, updates);
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
	<ul class="coupon-grid">
		{#each store.coupons as coupon, index (coupon.id.value)}
			<li class="coupon-cell">
				<CouponPreview
					{coupon}
					{index}
					total={store.coupons.length}
					onedit={handleEdit}
					onremove={() => handleRemove(coupon.id)}
					onmoveup={() => handleMoveUp(coupon.id)}
					onmovedown={() => handleMoveDown(coupon.id)}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.empty-message {
		color: var(--ui-text-muted);
		font-style: italic;
	}

	.coupon-grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 10px;
	}

	.coupon-cell {
		min-width: 0;
	}
</style>
