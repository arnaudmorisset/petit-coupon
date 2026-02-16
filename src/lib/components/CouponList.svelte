<script lang="ts">
	import type { CouponId } from "../domain/coupon-id";
	import type { CouponStore } from "../stores/coupon-store.svelte";

	interface Props {
		store: CouponStore;
	}

	const { store }: Props = $props();

	function handleRemove(id: CouponId): void {
		store.remove(id);
	}
</script>

{#if store.isEmpty}
	<p>No coupons yet. Add one above!</p>
{:else}
	<ul>
		{#each store.coupons as coupon (coupon.id.value)}
			<li>
				<span>{coupon.text}</span>
				<button onclick={() => handleRemove(coupon.id)}>Remove</button>
			</li>
		{/each}
	</ul>
{/if}
