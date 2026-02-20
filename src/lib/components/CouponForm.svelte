<script lang="ts">
	import { Coupon } from "../domain/coupon";
	import { AppContext } from "../stores/context";

	const { couponStore: store } = AppContext.current();

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
			aria-label="Coupon title"
		/>
		<textarea
			class="coupon-input"
			bind:value={text}
			placeholder="Enter coupon text..."
			rows="2"
			aria-label="Coupon text"
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
		border: 1px solid var(--ui-border);
		border-radius: 8px;
		font-size: 14px;
		font-family: inherit;
		font-weight: 600;
		min-height: 40px;
	}

	.coupon-title-input:focus {
		outline: 2px solid var(--ui-primary);
		outline-offset: -1px;
		border-color: var(--ui-primary);
	}

	.coupon-input {
		padding: 8px 12px;
		border: 1px solid var(--ui-border);
		border-radius: 8px;
		font-size: 14px;
		font-family: inherit;
		resize: vertical;
		min-height: 40px;
	}

	.coupon-input:focus {
		outline: 2px solid var(--ui-primary);
		outline-offset: -1px;
		border-color: var(--ui-primary);
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
