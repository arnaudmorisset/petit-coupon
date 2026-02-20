<script lang="ts">
	interface Props {
		onclear: () => void;
	}

	const { onclear }: Props = $props();

	function handleClick(): void {
		if (confirm("Start fresh? This will remove all coupons and reset the theme.")) {
			onclear();
		}
	}
</script>

<button class="clear-btn" onclick={handleClick} type="button">
	Start fresh
</button>

<style>
	.clear-btn {
		font-size: 12px;
		padding: 4px 12px;
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		color: var(--ui-text-muted);
	}

	.clear-btn:hover {
		background: var(--ui-danger-bg);
		color: var(--ui-danger-text);
		border-color: var(--ui-danger-border);
	}
</style>
