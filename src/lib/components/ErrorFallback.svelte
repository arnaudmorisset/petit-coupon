<script lang="ts">
	interface Props {
		error: unknown
		reset: () => void
	}

	const { reset }: Props = $props()

	function handleReload(): void {
		window.location.reload()
	}
</script>

<div class="error-container" role="alert">
	<h1 class="error-title">Something went wrong</h1>
	<p class="error-message">
		An unexpected error occurred. You can try recovering or reload the page.
	</p>
	<div class="error-actions">
		<button class="error-btn error-btn-primary" onclick={reset} type="button"
			aria-label="Try to recover the application">
			Try again
		</button>
		<button class="error-btn error-btn-secondary" onclick={handleReload} type="button"
			aria-label="Reload the page">
			Reload page
		</button>
	</div>
</div>

<style>
	.error-container {
		max-width: 480px;
		margin: 80px auto;
		padding: 32px 24px;
		text-align: center;
	}

	.error-title {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 24px;
		font-weight: 400;
		color: var(--ui-text-primary);
		margin: 0 0 12px;
	}

	.error-message {
		font-size: 15px;
		color: var(--ui-text-secondary);
		margin: 0 0 24px;
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.error-btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
	}

	.error-btn-primary {
		background: var(--ui-primary);
		color: white;
	}

	.error-btn-primary:hover {
		background: var(--ui-primary-hover);
	}

	.error-btn-secondary {
		background: var(--ui-card-bg);
		color: var(--ui-text-secondary);
		border: 1px solid var(--ui-border);
	}

	.error-btn-secondary:hover {
		background: var(--ui-bg-hover);
	}
</style>
