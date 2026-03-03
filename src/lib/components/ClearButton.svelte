<script lang="ts">
	import { t } from "svelte-i18n";
	import { AppContext } from "../stores/context";

	const { persistenceManager } = AppContext.current();

	function handleClick(): void {
		if (confirm($t('confirm.startFresh'))) {
			persistenceManager.clearSession();
		}
	}
</script>

<button class="clear-link" onclick={handleClick} type="button">
	{$t('actions.startFresh')}
</button>

<style>
	.clear-link {
		all: unset;
		font-size: 12px;
		color: var(--ui-text-ghost);
		cursor: pointer;
		text-align: center;
		display: block;
		transition: color 0.15s ease;
	}

	.clear-link:hover {
		color: var(--ui-text-muted);
	}

	@media (max-width: 768px) {
		.clear-link {
			padding: 8px;
			font-size: 13px;
		}
	}
</style>
