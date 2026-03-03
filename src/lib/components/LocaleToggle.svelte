<script lang="ts">
	import { Locale } from "../domain/locale";
	import { AppContext } from "../stores/context";

	const { localeStore } = AppContext.current();

	const label = $derived(localeStore.currentLocale === Locale.EN ? "FR" : "EN");
</script>

<button
	class="locale-toggle"
	onclick={() => localeStore.toggle()}
	type="button"
	aria-label={localeStore.currentLocale === Locale.EN ? "Passer en français" : "Switch to English"}
>
	{label}
</button>

<style>
	.locale-toggle {
		background: none;
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 4px 10px;
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 11px;
		font-weight: 600;
		color: var(--ui-text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		letter-spacing: 0.5px;
	}

	.locale-toggle:hover {
		border-color: var(--ui-border-focus);
		color: var(--ui-text-primary);
	}
</style>
