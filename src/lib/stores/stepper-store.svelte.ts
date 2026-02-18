import type { CouponStore } from "./coupon-store.svelte";

const MIN_STEP = 1;
const MAX_STEP = 3;

export class StepperStore {
	private readonly couponStore: CouponStore;
	currentStep: number = $state(1);

	constructor(couponStore: CouponStore) {
		this.couponStore = couponStore;
	}

	get canGoNext(): boolean {
		if (this.currentStep >= MAX_STEP) {
			return false;
		}
		if (this.currentStep === 2 && this.couponStore.isEmpty) {
			return false;
		}
		return true;
	}

	get canGoBack(): boolean {
		return this.currentStep > MIN_STEP;
	}

	goNext(): void {
		if (this.canGoNext) {
			this.currentStep++;
		}
	}

	goBack(): void {
		if (this.canGoBack) {
			this.currentStep--;
		}
	}

	goTo(step: number): void {
		if (step < MIN_STEP || step > MAX_STEP) {
			return;
		}
		if (step === 3 && this.couponStore.isEmpty) {
			return;
		}
		this.currentStep = step;
	}
}
