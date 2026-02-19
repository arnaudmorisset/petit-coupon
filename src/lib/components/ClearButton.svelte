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
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		color: #64748b;
	}

	.clear-btn:hover {
		background: #fee2e2;
		color: #dc2626;
		border-color: #fca5a5;
	}
</style>
