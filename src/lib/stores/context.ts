import { getContext, setContext } from "svelte";
import type { CouponStore } from "./coupon-store.svelte";
import type { StepperStore } from "./stepper-store.svelte";
import type { ThemeStore } from "./theme-store.svelte";

const STORES_KEY = Symbol("app-stores");

export class AppContext {
	readonly couponStore: CouponStore;
	readonly themeStore: ThemeStore;
	readonly stepperStore: StepperStore;

	constructor(
		couponStore: CouponStore,
		themeStore: ThemeStore,
		stepperStore: StepperStore,
	) {
		this.couponStore = couponStore;
		this.themeStore = themeStore;
		this.stepperStore = stepperStore;
	}

	provide(): void {
		setContext(STORES_KEY, this);
	}

	static current(): AppContext {
		return getContext<AppContext>(STORES_KEY);
	}
}
