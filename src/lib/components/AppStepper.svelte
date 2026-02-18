<script lang="ts">
	import type { CouponStore } from "../stores/coupon-store.svelte";
	import type { StepperStore } from "../stores/stepper-store.svelte";
	import type { ThemeStore } from "../stores/theme-store.svelte";
	import CouponForm from "./CouponForm.svelte";
	import CouponList from "./CouponList.svelte";
	import DownloadButton from "./DownloadButton.svelte";
	import SheetPreview from "./SheetPreview.svelte";
	import ThemePicker from "./ThemePicker.svelte";

	interface Props {
		store: CouponStore;
		themeStore: ThemeStore;
		stepperStore: StepperStore;
	}

	const { store, themeStore, stepperStore }: Props = $props();

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
			<ThemePicker {themeStore} />
		{:else if stepperStore.currentStep === 2}
			<h2 class="step-title">Create Coupons</h2>
			<CouponForm {store} />
			<p class="coupon-count">{store.count} coupon{store.count !== 1 ? 's' : ''}</p>
			<CouponList {store} theme={themeStore.selectedTheme} />
		{:else if stepperStore.currentStep === 3}
			<h2 class="step-title">Preview & Download</h2>
			<SheetPreview coupons={store.coupons} theme={themeStore.selectedTheme} />
			<div class="download-area">
				<DownloadButton {store} theme={themeStore.selectedTheme} />
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
		background-color: rgba(59, 130, 246, 0.08);
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
		border: 2px solid #cbd5e1;
		font-size: 14px;
		font-weight: 600;
		color: #64748b;
		transition: all 0.15s;
	}

	.step-indicator.active .step-number {
		background-color: #3b82f6;
		border-color: #3b82f6;
		color: #fff;
	}

	.step-indicator.completed .step-number {
		background-color: #10b981;
		border-color: #10b981;
		color: #fff;
	}

	.step-label {
		font-size: 11px;
		color: #64748b;
		font-weight: 500;
		white-space: nowrap;
	}

	.step-indicator.active .step-label {
		color: #3b82f6;
		font-weight: 600;
	}

	.step-connector {
		width: 40px;
		height: 2px;
		background-color: #e2e8f0;
		margin-bottom: 20px;
	}

	.step-connector.filled {
		background-color: #10b981;
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
		color: #64748b;
		margin: 8px 0;
	}

	.download-area {
		margin-top: 20px;
		display: flex;
		justify-content: center;
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
		border: 1px solid #e2e8f0;
		background: #fff;
		color: #475569;
		transition: all 0.15s;
		min-width: 100px;
	}

	.nav-btn:hover:not(:disabled) {
		background: #f8fafc;
		border-color: #94a3b8;
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.nav-btn-primary {
		background: #3b82f6;
		border-color: #3b82f6;
		color: #fff;
	}

	.nav-btn-primary:hover:not(:disabled) {
		background: #2563eb;
		border-color: #2563eb;
	}

	@media (max-width: 640px) {
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
		}

		.step-navigation {
			padding: 0 8px;
		}
	}
</style>
