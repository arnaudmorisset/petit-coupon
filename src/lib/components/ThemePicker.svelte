<script lang="ts">
	import { AppContext } from "../stores/context";
	import ThemePreviewCard from "./ThemePreviewCard.svelte";

	const { themeStore } = AppContext.current();
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
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}

	@media (max-width: 768px) {
		.theme-picker {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
