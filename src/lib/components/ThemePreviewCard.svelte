<script lang="ts">
	import type { Theme } from "../domain/theme";
	import SvgPattern from "./SvgPattern.svelte";

	interface Props {
		theme: Theme;
		isSelected: boolean;
		onselect: () => void;
	}

	const { theme, isSelected, onselect }: Props = $props();
</script>

<button
	class="theme-card"
	class:selected={isSelected}
	onclick={onselect}
	type="button"
	aria-label="Select {theme.name} theme"
	aria-pressed={isSelected}
	style:--preview-bg={theme.backgroundColor}
	style:--preview-accent={theme.accentColor}
	style:--preview-text-color={theme.textColor}
	style:--preview-border-color={theme.borderColor}
>
	<div class="theme-card-preview">
		{#if theme.assets?.pattern}
			<SvgPattern pattern={theme.assets.pattern} color={theme.accentColor} id="theme-{theme.id}" />
		{/if}

		<span class="theme-card-sample">Abc</span>
	</div>
	<span class="theme-card-desc">{theme.description}</span>
</button>

<style>
	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		font-family: inherit;
	}

	.theme-card-preview {
		width: 100%;
		aspect-ratio: 1.6;
		background-color: var(--preview-bg);
		border: 2px solid var(--ui-card-border);
		border-radius: 10px;
		padding: 16px 8px 10px;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		box-sizing: border-box;
	}

	.theme-card.selected .theme-card-preview {
		border: 2.5px solid var(--preview-border-color);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--preview-border-color) 12%, transparent);
	}

	.theme-card:hover:not(.selected) .theme-card-preview {
		border-color: var(--ui-border-hover);
	}

	.theme-card-sample {
		position: relative;
		z-index: 1;
		font-size: 16px;
		font-weight: 700;
		color: var(--preview-text-color);
	}

	.theme-card-desc {
		font-size: 10px;
		margin-top: 6px;
		color: color-mix(in srgb, var(--preview-text-color) 60%, transparent);
	}
</style>
