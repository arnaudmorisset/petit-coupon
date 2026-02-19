<script lang="ts">
	import { Coupon } from "../domain/coupon";
	import type { CouponStore } from "../stores/coupon-store.svelte";

	interface Props {
		store: CouponStore;
	}

	const { store }: Props = $props();

	let title = $state("");
	let text = $state("");

	const hasContent = $derived(title.trim().length > 0 || text.trim().length > 0);

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!hasContent) {
			return;
		}
		store.add(new Coupon(store.nextId(), text.trim(), title.trim()));
		title = "";
		text = "";
	}
</script>

<form class="coupon-form" onsubmit={handleSubmit}>
	<div class="coupon-fields">
		<input
			class="coupon-title-input"
			bind:value={title}
			placeholder="Title (optional)"
		/>
		<textarea
			class="coupon-input"
			bind:value={text}
			placeholder="Enter coupon text..."
			rows="2"
		></textarea>
	</div>
	<button class="add-btn" type="submit" disabled={!hasContent}>
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

	.coupon-fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.coupon-title-input {
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 14px;
		font-family: inherit;
		font-weight: 600;
		min-height: 40px;
	}

	.coupon-title-input:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -1px;
		border-color: #3b82f6;
	}

	.coupon-input {
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
