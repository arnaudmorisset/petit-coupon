<script lang="ts">
	import { AppContext } from "../stores/context";

	const { persistenceManager } = AppContext.current();

	function handleClick(): void {
		if (confirm("Start fresh? This will remove all coupons and reset the theme.")) {
			persistenceManager.clearSession();
		}
	}
</script>

<button class="clear-link" onclick={handleClick} type="button">
	Start a new batch
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
