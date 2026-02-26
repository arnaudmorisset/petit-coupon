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
		index: number;
		total: number;
		onedit?: (id: CouponId, updates: Partial<Coupon>) => void;
		onremove?: () => void;
		onmoveup?: () => void;
		onmovedown?: () => void;
	}

	const { coupon, index, total, onedit, onremove, onmoveup, onmovedown }: Props = $props();
	const { themeStore } = AppContext.current();
	const theme = $derived(themeStore.selectedTheme);

	const isFirst = $derived(index === 0);
	const isLast = $derived(index === total - 1);

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
	{#if onremove}
		<button
			class="remove-btn"
			onclick={(e) => { e.stopPropagation(); onremove(); }}
			type="button"
			aria-label="Remove coupon"
		>&times;</button>
	{/if}

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
				<button class="edit-done-btn" onclick={saveEdit} type="button">Done</button>
			</div>
			{#if onmoveup || onmovedown}
				<div class="reorder-controls">
					<button class="reorder-btn" onclick={onmoveup} disabled={isFirst}
						type="button" aria-label="Move coupon up">&#8593;</button>
					<button class="reorder-btn" onclick={onmovedown} disabled={isLast}
						type="button" aria-label="Move coupon down">&#8595;</button>
				</div>
			{/if}
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
		width: 100%;
		box-sizing: border-box;
		background-color: var(--bg);
		border-color: var(--border-color);
		border-width: var(--border-width);
		border-style: var(--border-style);
		border-radius: var(--border-radius);
		padding: var(--padding);
		overflow: hidden;
	}

	.remove-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		z-index: 2;
		width: 22px;
		height: 22px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--text-color);
		font-size: 14px;
		line-height: 1;
		cursor: pointer;
		opacity: 0.15;
		transition: opacity 0.15s ease, background-color 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (hover: hover) {
		.remove-btn { opacity: 0; }
		.coupon-preview:hover .remove-btn { opacity: 0.7; }
	}

	.remove-btn:focus-visible { opacity: 0.7; }
	.remove-btn:hover { background: var(--ui-danger-bg); color: var(--ui-danger-text); }

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
		border: none;
		border-bottom: 1px solid var(--border-color);
		border-radius: 0;
		padding: 4px;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		color: var(--title-color);
		background-color: transparent;
		font-family: inherit;
		box-sizing: border-box;
	}

	.coupon-edit-text {
		width: 100%;
		flex: 1;
		resize: none;
		border: none;
		border-bottom: 1px solid var(--border-color);
		border-radius: 0;
		padding: 4px;
		font-size: 12px;
		text-align: center;
		color: var(--text-color);
		background-color: transparent;
		font-family: inherit;
		box-sizing: border-box;
	}

	.coupon-edit-title:focus,
	.coupon-edit-text:focus {
		outline: none;
		border-bottom-color: var(--ui-primary);
	}

	.coupon-edit-actions {
		display: flex;
		gap: 4px;
		justify-content: center;
	}

	.edit-done-btn {
		font-size: 11px;
		padding: 2px 8px;
		border: 1px solid var(--ui-border);
		border-radius: 4px;
		background: var(--ui-card-bg);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.edit-done-btn:hover {
		background: var(--ui-save-bg);
		border-color: var(--ui-save-border);
	}

	.reorder-controls {
		display: flex;
		gap: 4px;
		justify-content: center;
	}

	.reorder-btn {
		font-size: 12px;
		padding: 1px 6px;
		border: 1px solid var(--ui-border);
		border-radius: 4px;
		background: var(--ui-card-bg);
		cursor: pointer;
		color: var(--ui-text-secondary);
		min-width: 24px;
		min-height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.reorder-btn:hover:not(:disabled) {
		background: var(--ui-bg-hover);
		border-color: var(--ui-border-focus);
	}

	.reorder-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	@media (max-width: 768px) {
		.remove-btn {
			width: 32px;
			height: 32px;
			font-size: 18px;
			opacity: 0.3;
		}

		.edit-done-btn {
			padding: 6px 14px;
			font-size: 13px;
		}

		.reorder-btn {
			min-height: 32px;
			min-width: 32px;
			font-size: 16px;
		}
	}

	@media (max-width: 480px) {
		.coupon-title {
			font-size: 14px;
		}

		.coupon-text {
			font-size: 11px;
		}

		.coupon-edit-title {
			font-size: 13px;
		}

		.coupon-edit-text {
			font-size: 11px;
		}
	}
</style>
