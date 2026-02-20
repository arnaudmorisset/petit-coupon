<script lang="ts">
	import { AppContext } from "../stores/context";

	const { persistenceManager, stepperStore } = AppContext.current();

	function handleClick(): void {
		if (confirm("Start fresh? This will remove all coupons and reset the theme.")) {
			persistenceManager.clearSession();
			stepperStore.goTo(1);
		}
	}
</script>

<button class="clear-link" onclick={handleClick} type="button">
	Start a new batch
</button>

<style>
	.clear-link {
		all: unset;
		font-size: 13px;
		color: inherit;
		opacity: 0.6;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.clear-link:hover {
		opacity: 1;
	}
</style>
