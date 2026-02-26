<script lang="ts">
	import { Coupon } from "../domain/coupon";
	import { COUPON_SUGGESTIONS } from "../domain/suggestions";
	import { AppContext } from "../stores/context";

	const { couponStore: store, themeStore } = AppContext.current();
	const theme = $derived(themeStore.selectedTheme);

	let title = $state("");
	let text = $state("");
	let titleRef = $state<HTMLInputElement | undefined>(undefined);
	let bodyRef = $state<HTMLInputElement | undefined>(undefined);

	const canAdd = $derived(title.trim().length > 0 || text.trim().length > 0);

	function handleAdd(): void {
		if (!canAdd) {
			return;
		}
		store.add(new Coupon(store.nextId(), text.trim(), title.trim()));
		title = "";
		text = "";
		titleRef?.focus();
	}

	function handleTitleKeydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			e.preventDefault();
			bodyRef?.focus();
		}
	}

	function handleBodyKeydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAdd();
		}
	}

	function handleSuggestion(suggestion: string): void {
		store.add(new Coupon(store.nextId(), suggestion, ""));
	}
</script>

<div class="form" style:--add-bg={theme.borderColor} style:--chip-hover-bg={theme.accentColor} style:--chip-hover-border={theme.borderColor}>
	<input
		class="title-input"
		type="text"
		placeholder="Title (optional)"
		aria-label="Coupon title"
		bind:this={titleRef}
		bind:value={title}
		onkeydown={handleTitleKeydown}
	/>

	<div class="body-row">
		<input
			class="body-input"
			type="text"
			placeholder="e.g. One breakfast in bed"
			aria-label="Coupon text"
			bind:this={bodyRef}
			bind:value={text}
			onkeydown={handleBodyKeydown}
		/>
		<button
			class="add-button"
			aria-label="Add coupon"
			onclick={handleAdd}
			disabled={!canAdd}
		>+</button>
	</div>

	<div class="suggestions">
		<span class="suggestions-label">Ideas</span>
		<div class="suggestions-list">
			{#each COUPON_SUGGESTIONS as suggestion}
				<button
					class="suggestion-chip"
					aria-label="Add coupon: {suggestion}"
					onclick={() => handleSuggestion(suggestion)}
				>{suggestion}</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 500px;
		margin: 0 auto;
	}

	.title-input,
	.body-input {
		width: 100%;
		padding: 10px 14px;
		border-radius: 8px;
		border: 1px solid var(--ui-border);
		font-family: inherit;
		font-size: 14px;
		outline: none;
		box-sizing: border-box;
	}

	.title-input {
		font-weight: 600;
	}

	.title-input:focus,
	.body-input:focus {
		border-color: var(--ui-border-focus);
	}

	.body-row {
		display: flex;
		gap: 8px;
	}

	.body-input {
		flex: 1;
	}

	.add-button {
		padding: 10px 18px;
		border-radius: 8px;
		border: none;
		font-size: 18px;
		font-weight: 700;
		line-height: 1;
		color: white;
		cursor: pointer;
		background: var(--add-bg);
		transition: all 0.15s ease;
	}

	.add-button:disabled {
		background: var(--ui-border);
		cursor: default;
	}

	.suggestions {
		margin-top: 6px;
	}

	.suggestions-label {
		display: block;
		font-family: inherit;
		font-size: 10px;
		font-weight: 600;
		color: var(--ui-text-faint);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 8px;
	}

	.suggestions-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.suggestion-chip {
		padding: 5px 12px;
		border-radius: 20px;
		border: 1px solid var(--ui-border);
		background: var(--ui-bg-subtle);
		font-family: inherit;
		font-size: 12px;
		color: var(--ui-text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.suggestion-chip:hover {
		background: var(--chip-hover-bg);
		border-color: var(--chip-hover-border);
	}

	@media (max-width: 768px) {
		.suggestion-chip {
			padding: 8px 14px;
			font-size: 13px;
		}
	}

	@media (max-width: 480px) {
		.body-row {
			flex-direction: column;
		}

		.add-button {
			width: 100%;
			padding: 12px;
		}

		.title-input,
		.body-input {
			font-size: 16px;
		}
	}
</style>
