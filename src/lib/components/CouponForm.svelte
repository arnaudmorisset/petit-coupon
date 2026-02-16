<script lang="ts">
	import type { CouponStore } from "../stores/coupon-store.svelte";

	interface Props {
		store: CouponStore;
	}

	const { store }: Props = $props();

	let text = $state("");

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		const trimmed = text.trim();
		if (trimmed.length === 0) {
			return;
		}
		store.add(trimmed);
		text = "";
	}
</script>

<form onsubmit={handleSubmit}>
	<input
		type="text"
		bind:value={text}
		placeholder="Enter coupon text..."
	/>
	<button type="submit" disabled={text.trim().length === 0}>
		Add
	</button>
</form>
