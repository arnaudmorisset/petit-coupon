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

<form class="coupon-form" onsubmit={handleSubmit}>
	<textarea
		class="coupon-input"
		bind:value={text}
		placeholder="Enter coupon text..."
		rows="2"
	></textarea>
	<button class="add-btn" type="submit" disabled={text.trim().length === 0}>
		Add
	</button>
</form>

<style>
	.coupon-form {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		justify-content: center;
		max-width: 500px;
		margin: 0 auto;
	}

	.coupon-input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 14px;
		font-family: inherit;
		resize: vertical;
		min-height: 40px;
	}

	.coupon-input:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -1px;
		border-color: #3b82f6;
	}

	.add-btn {
		padding: 8px 20px;
		white-space: nowrap;
		min-height: 40px;
	}

	@media (max-width: 640px) {
		.coupon-form {
			flex-direction: column;
			align-items: stretch;
		}

		.add-btn {
			width: 100%;
		}
	}
</style>
