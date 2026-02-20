import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import type { IdGenerator } from "../domain/id-generator";
import { CouponStore } from "./coupon-store.svelte";
import { StepperStore } from "./stepper-store.svelte";

class FixedIdGenerator implements IdGenerator {
	private counter = 0;

	generate(): string {
		this.counter++;
		return `id-${String(this.counter)}`;
	}
}

function createStores(): {
	couponStore: CouponStore;
	stepper: StepperStore;
} {
	const couponStore = new CouponStore(new FixedIdGenerator());
	const stepper = new StepperStore(couponStore);
	return { couponStore, stepper };
}

function addCoupon(store: CouponStore): void {
	store.add(new Coupon(new CouponId("c1"), "Test coupon"));
}

describe("StepperStore", () => {
	it("starts at step 1", () => {
		const { stepper } = createStores();
		expect(stepper.currentStep).toBe(1);
	});

	it("can go forward from step 1", () => {
		const { stepper } = createStores();
		expect(stepper.canGoNext).toBe(true);
	});

	it("cannot go back from step 1", () => {
		const { stepper } = createStores();
		expect(stepper.canGoBack).toBe(false);
	});

	it("advances to step 2", () => {
		const { stepper } = createStores();
		stepper.goNext();
		expect(stepper.currentStep).toBe(2);
	});

	it("goes back from step 2 to step 1", () => {
		const { stepper } = createStores();
		stepper.goNext();
		stepper.goBack();
		expect(stepper.currentStep).toBe(1);
	});

	it("cannot advance to step 3 without coupons", () => {
		const { stepper } = createStores();
		stepper.goNext(); // step 2
		expect(stepper.canGoNext).toBe(false);
	});

	it("can advance to step 3 with coupons", () => {
		const { couponStore, stepper } = createStores();
		addCoupon(couponStore);
		stepper.goNext(); // step 2
		expect(stepper.canGoNext).toBe(true);
		stepper.goNext(); // step 3
		expect(stepper.currentStep).toBe(3);
	});

	it("cannot advance past step 3", () => {
		const { couponStore, stepper } = createStores();
		addCoupon(couponStore);
		stepper.goNext(); // step 2
		stepper.goNext(); // step 3
		expect(stepper.canGoNext).toBe(false);
		stepper.goNext(); // should stay at 3
		expect(stepper.currentStep).toBe(3);
	});

	it("goTo navigates to valid step", () => {
		const { stepper } = createStores();
		stepper.goTo(2);
		expect(stepper.currentStep).toBe(2);
	});

	it("goTo ignores out-of-range steps", () => {
		const { stepper } = createStores();
		stepper.goTo(0);
		expect(stepper.currentStep).toBe(1);
		stepper.goTo(4);
		expect(stepper.currentStep).toBe(1);
	});

	it("goTo step 3 blocked without coupons", () => {
		const { stepper } = createStores();
		stepper.goTo(3);
		expect(stepper.currentStep).toBe(1);
	});

	it("goTo step 3 allowed with coupons", () => {
		const { couponStore, stepper } = createStores();
		addCoupon(couponStore);
		stepper.goTo(3);
		expect(stepper.currentStep).toBe(3);
	});
});
