<script lang="ts">
	import { AppContext } from "../stores/context";
	import ClearButton from "./ClearButton.svelte";
	import CouponForm from "./CouponForm.svelte";
	import CouponList from "./CouponList.svelte";
	import DownloadButton from "./DownloadButton.svelte";
	import SheetPreview from "./SheetPreview.svelte";
	import ThemePicker from "./ThemePicker.svelte";

	const { couponStore: store, stepperStore } = AppContext.current();

	const steps = [
		{ number: 1, label: "Choose a Theme" },
		{ number: 2, label: "Create Coupons" },
		{ number: 3, label: "Preview & Download" },
	];
</script>

<div class="stepper">
	<nav class="step-indicators" aria-label="Progress">
		{#each steps as step (step.number)}
			<button
				class="step-indicator"
				class:active={stepperStore.currentStep === step.number}
				class:completed={stepperStore.currentStep > step.number}
				onclick={() => stepperStore.goTo(step.number)}
				disabled={step.number === 3 && store.isEmpty}
				type="button"
			>
				<span class="step-number">{step.number}</span>
				<span class="step-label">{step.label}</span>
			</button>
			{#if step.number < steps.length}
				<div class="step-connector" class:filled={stepperStore.currentStep > step.number}></div>
			{/if}
		{/each}
	</nav>

	<div class="step-content">
		{#if stepperStore.currentStep === 1}
			<h2 class="step-title">Choose a Theme</h2>
			<ThemePicker />
		{:else if stepperStore.currentStep === 2}
			<h2 class="step-title">Create Coupons</h2>
			<CouponForm />
			<p class="coupon-count">{store.count} coupon{store.count !== 1 ? 's' : ''}</p>
			<CouponList />
		{:else if stepperStore.currentStep === 3}
			<h2 class="step-title">Preview & Download</h2>
			<SheetPreview />
			<div class="download-area">
				<DownloadButton />
				<ClearButton />
			</div>
		{/if}
	</div>

	<div class="step-navigation">
		<button
			class="nav-btn"
			onclick={() => stepperStore.goBack()}
			disabled={!stepperStore.canGoBack}
			type="button"
		>Back</button>
		<button
			class="nav-btn nav-btn-primary"
			onclick={() => stepperStore.goNext()}
			disabled={!stepperStore.canGoNext}
			type="button"
		>Next</button>
	</div>
</div>

<style>
	.stepper {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
	}

	.step-indicators {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
	}

	.step-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px 12px;
		border-radius: 8px;
		transition: background-color 0.15s;
	}

	.step-indicator:hover:not(:disabled) {
		background-color: var(--ui-bg-hover);
	}

	.step-indicator:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid var(--ui-border-hover);
		font-size: 14px;
		font-weight: 600;
		color: var(--ui-text-muted);
		transition: all 0.15s;
	}

	.step-indicator.active .step-number {
		background-color: var(--ui-primary);
		border-color: var(--ui-primary);
		color: #fff;
	}

	.step-indicator.completed .step-number {
		background-color: var(--ui-success);
		border-color: var(--ui-success);
		color: #fff;
	}

	.step-label {
		font-size: 11px;
		color: var(--ui-text-muted);
		font-weight: 500;
		white-space: nowrap;
	}

	.step-indicator.active .step-label {
		color: var(--ui-primary);
		font-weight: 600;
	}

	.step-connector {
		width: 40px;
		height: 2px;
		background-color: var(--ui-border);
		margin-bottom: 20px;
	}

	.step-connector.filled {
		background-color: var(--ui-success);
	}

	.step-content {
		min-height: 200px;
	}

	.step-title {
		font-size: 1.4em;
		margin: 0 0 16px 0;
		color: inherit;
	}

	.coupon-count {
		font-size: 14px;
		color: var(--ui-text-muted);
		margin: 8px 0;
	}

	.download-area {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.step-navigation {
		display: flex;
		justify-content: center;
		gap: 12px;
		padding-top: 8px;
	}

	.nav-btn {
		padding: 10px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--ui-border);
		background: var(--ui-card-bg);
		color: var(--ui-text-secondary);
		transition: all 0.15s;
		min-width: 100px;
	}

	.nav-btn:hover:not(:disabled) {
		background: var(--ui-bg-subtle);
		border-color: var(--ui-border-focus);
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.nav-btn-primary {
		background: var(--ui-primary);
		border-color: var(--ui-primary);
		color: #fff;
	}

	.nav-btn-primary:hover:not(:disabled) {
		background: var(--ui-primary-hover);
		border-color: var(--ui-primary-hover);
	}

	@media (max-width: 768px) {
		.step-label {
			font-size: 10px;
		}

		.step-connector {
			width: 24px;
		}

		.step-indicator {
			padding: 8px 6px;
		}

		.nav-btn {
			flex: 1;
			min-width: 0;
			min-height: 44px;
		}

		.step-navigation {
			padding: 0 8px;
		}
	}

	@media (max-width: 480px) {
		.step-label {
			font-size: 9px;
		}

		.step-connector {
			width: 16px;
		}

		.step-indicator {
			padding: 6px 4px;
		}

		.step-number {
			width: 28px;
			height: 28px;
			font-size: 12px;
		}

		.step-title {
			font-size: 1.2em;
		}
	}
</style>
