<script lang="ts">
	import type { ThemeStore } from "../stores/theme-store.svelte";
	import ThemePreviewCard from "./ThemePreviewCard.svelte";

	interface Props {
		themeStore: ThemeStore;
	}

	const { themeStore }: Props = $props();
</script>

<div class="theme-picker">
	{#each themeStore.allThemes as theme (theme.id)}
		<ThemePreviewCard
			{theme}
			isSelected={themeStore.selectedTheme.id === theme.id}
			onselect={() => themeStore.selectTheme(theme.id)}
		/>
	{/each}
</div>

<style>
	.theme-picker {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
