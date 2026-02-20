<script lang="ts">
	import type { Coupon } from "../domain/coupon";
	import type { CouponId } from "../domain/coupon-id";
	import { borderStyleToCss } from "../domain/border-style";
	import { AppContext } from "../stores/context";
	import SvgIllustration from "./SvgIllustration.svelte";
	import SvgOrnament from "./SvgOrnament.svelte";
	import SvgPattern from "./SvgPattern.svelte";

	interface Props {
		coupon: Coupon;
		onedit?: (id: CouponId, updates: Partial<Coupon>) => void;
	}

	const { coupon, onedit }: Props = $props();
	const { themeStore } = AppContext.current();
	const theme = $derived(themeStore.selectedTheme);

	let editing = $state(false);
	let editTitle = $state("");
	let editText = $state("");

	function startEdit(): void {
		if (!onedit) return;
		editing = true;
		editTitle = coupon.title;
		editText = coupon.text;
	}

	function saveEdit(): void {
		const trimmedTitle = editTitle.trim();
		const trimmedText = editText.trim();
		if (
			(trimmedTitle.length > 0 || trimmedText.length > 0) &&
			(trimmedTitle !== coupon.title || trimmedText !== coupon.text) &&
			onedit
		) {
			onedit(coupon.id, { title: trimmedTitle, text: trimmedText });
		}
		editing = false;
	}

	function cancelEdit(): void {
		editing = false;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			cancelEdit();
		}
	}
</script>

<div
	class="coupon-preview"
	style:--bg={theme.backgroundColor}
	style:--border-color={theme.borderColor}
	style:--border-width="{Math.max(1, theme.borderWidthMm * 2)}px"
	style:--border-style={borderStyleToCss(theme.borderStyle)}
	style:--border-radius="{theme.borderRadiusMm * 1.5}px"
	style:--padding="{theme.paddingMm * 1.5}px"
	style:--title-color={theme.titleColor}
	style:--text-color={theme.textColor}
>
	{#if theme.assets?.pattern}
		<SvgPattern pattern={theme.assets.pattern} color={theme.accentColor} id="preview-{coupon.id.value}" />
	{/if}

	{#if theme.assets?.cornerOrnament}
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="tl" color={theme.accentColor} />
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="tr" color={theme.accentColor} />
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="bl" color={theme.accentColor} />
		<SvgOrnament ornament={theme.assets.cornerOrnament} corner="br" color={theme.accentColor} />
	{/if}

	{#if theme.assets?.illustration}
		<SvgIllustration illustration={theme.assets.illustration} color={theme.accentColor} />
	{/if}

	{#if editing}
		<div class="coupon-edit-fields">
			<input
				class="coupon-edit-title"
				bind:value={editTitle}
				placeholder="Title (optional)"
				onkeydown={handleKeydown}
				aria-label="Edit coupon title"
			/>
			<textarea
				class="coupon-edit-text"
				bind:value={editText}
				placeholder="Coupon text..."
				onkeydown={handleKeydown}
				aria-label="Edit coupon text"
			></textarea>
			<div class="coupon-edit-actions">
				<button class="edit-save-btn" onclick={saveEdit} type="button">Save</button>
				<button class="edit-cancel-btn" onclick={cancelEdit} type="button">Cancel</button>
			</div>
		</div>
	{:else}
		<button
			class="coupon-text-btn"
			onclick={startEdit}
			type="button"
			disabled={!onedit}
		>
			<div class="coupon-content">
				{#if coupon.title.length > 0}
					<span class="coupon-title">{coupon.title}</span>
				{/if}
				{#if coupon.text.length > 0}
					<span class="coupon-text">{coupon.text}</span>
				{/if}
			</div>
		</button>
	{/if}
</div>

<style>
	.coupon-preview {
		position: relative;
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
		position: relative;
		z-index: 1;
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

	.coupon-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center;
		width: 100%;
	}

	.coupon-title {
		font-size: 16px;
		font-weight: 700;
		word-break: break-word;
		color: var(--title-color);
	}

	.coupon-text {
		font-size: 12px;
		font-weight: 400;
		word-break: break-word;
		color: var(--text-color);
	}

	.coupon-edit-fields {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.coupon-edit-title {
		width: 100%;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 4px;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		color: var(--title-color);
		background-color: var(--bg);
		font-family: inherit;
		box-sizing: border-box;
	}

	.coupon-edit-text {
		width: 100%;
		flex: 1;
		resize: none;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 4px;
		font-size: 12px;
		text-align: center;
		color: var(--text-color);
		background-color: var(--bg);
		font-family: inherit;
		box-sizing: border-box;
	}

	.coupon-edit-title:focus,
	.coupon-edit-text:focus {
		outline: 2px solid var(--ui-primary);
		outline-offset: -2px;
	}

	.coupon-edit-actions {
		display: flex;
		gap: 4px;
		justify-content: center;
	}

	.edit-save-btn,
	.edit-cancel-btn {
		font-size: 11px;
		padding: 2px 8px;
		border: 1px solid var(--ui-border);
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
	}

	.edit-save-btn:hover {
		background: var(--ui-save-bg);
		border-color: var(--ui-save-border);
	}

	.edit-cancel-btn:hover {
		background: var(--ui-danger-bg);
		border-color: var(--ui-danger-border);
	}
</style>
