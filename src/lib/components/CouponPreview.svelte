<script lang="ts">
	import type { Coupon } from "../domain/coupon";
	import type { CouponId } from "../domain/coupon-id";
	import type { Theme } from "../domain/theme";

	interface Props {
		coupon: Coupon;
		theme: Theme;
		onedit?: (id: CouponId, newText: string) => void;
	}

	const { coupon, theme, onedit }: Props = $props();

	let editing = $state(false);
	let editText = $state("");

	function borderStyleCss(style: string): string {
		if (style === "double") return "double";
		if (style === "dashed") return "dashed";
		return "solid";
	}

	function startEdit(): void {
		if (!onedit) return;
		editing = true;
		editText = coupon.text;
	}

	function saveEdit(): void {
		const trimmed = editText.trim();
		if (trimmed.length > 0 && trimmed !== coupon.text && onedit) {
			onedit(coupon.id, trimmed);
		}
		editing = false;
	}

	function cancelEdit(): void {
		editing = false;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			event.preventDefault();
			saveEdit();
		} else if (event.key === "Escape") {
			cancelEdit();
		}
	}
</script>

<div
	class="coupon-preview"
	style:--bg={theme.backgroundColor}
	style:--border-color={theme.borderColor}
	style:--border-width="{Math.max(1, theme.borderWidthMm * 2)}px"
	style:--border-style={borderStyleCss(theme.borderStyle)}
	style:--border-radius="{theme.borderRadiusMm * 1.5}px"
	style:--padding="{theme.paddingMm * 1.5}px"
	style:--title-color={theme.titleColor}
	style:--text-color={theme.textColor}
>
	{#if editing}
		<textarea
			class="coupon-edit"
			bind:value={editText}
			onblur={saveEdit}
			onkeydown={handleKeydown}
		></textarea>
	{:else}
		<button
			class="coupon-text-btn"
			onclick={startEdit}
			type="button"
			disabled={!onedit}
		>
			<span class="coupon-text">{coupon.text}</span>
		</button>
	{/if}
</div>

<style>
	.coupon-preview {
		aspect-ratio: 90 / 55;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		max-width: 270px;
		width: 100%;
		background-color: var(--bg);
		border-color: var(--border-color);
		border-width: var(--border-width);
		border-style: var(--border-style);
		border-radius: var(--border-radius);
		padding: var(--padding);
		overflow: hidden;
	}

	.coupon-text-btn {
		all: unset;
		cursor: pointer;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.coupon-text-btn:disabled {
		cursor: default;
	}

	.coupon-text {
		font-size: 14px;
		font-weight: 600;
		word-break: break-word;
		color: var(--title-color);
	}

	.coupon-edit {
		width: 100%;
		height: 100%;
		resize: none;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 4px;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		color: var(--title-color);
		background-color: var(--bg);
		font-family: inherit;
	}

	.coupon-edit:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}
</style>
