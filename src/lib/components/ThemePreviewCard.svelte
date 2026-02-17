<script lang="ts">
	import type { Theme } from "../domain/theme";

	interface Props {
		theme: Theme;
		isSelected: boolean;
		onselect: () => void;
	}

	const { theme, isSelected, onselect }: Props = $props();

	function borderStyleCss(style: string): string {
		if (style === "double") return "double";
		if (style === "dashed") return "dashed";
		return "solid";
	}
</script>

<button
	class="theme-card"
	class:selected={isSelected}
	onclick={onselect}
	type="button"
	style:--preview-bg={theme.backgroundColor}
	style:--preview-border-color={theme.borderColor}
	style:--preview-border-width="{Math.max(1, theme.borderWidthMm * 2)}px"
	style:--preview-border-style={borderStyleCss(theme.borderStyle)}
	style:--preview-border-radius="{theme.borderRadiusMm * 1.5}px"
	style:--preview-title-color={theme.titleColor}
>
	<div class="preview">
		<span class="preview-text">Abc</span>
	</div>
	<span class="theme-name">{theme.name}</span>
	<span class="theme-desc">{theme.description}</span>
</button>

<style>
	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 10px;
		border: 2px solid transparent;
		border-radius: 8px;
		background: none;
		cursor: pointer;
		transition: border-color 0.15s;
		min-width: 100px;
	}

	.theme-card:hover {
		border-color: #cbd5e1;
	}

	.theme-card.selected {
		border-color: #3b82f6;
	}

	.preview {
		width: 80px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--preview-bg);
		border-color: var(--preview-border-color);
		border-width: var(--preview-border-width);
		border-style: var(--preview-border-style);
		border-radius: var(--preview-border-radius);
	}

	.preview-text {
		font-size: 16px;
		font-weight: 600;
		color: var(--preview-title-color);
	}

	.theme-name {
		font-size: 13px;
		font-weight: 600;
		color: #1e293b;
	}

	.theme-desc {
		font-size: 11px;
		color: #64748b;
	}
</style>
