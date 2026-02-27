import type { IdGenerator } from "../../domain/id-generator";
import { ThemeRegistry } from "../../domain/theme-registry";
import { ALL_THEMES } from "../../domain/themes";
import { CouponStore } from "../../stores/coupon-store.svelte";
import { ThemeStore } from "../../stores/theme-store.svelte";

class SequentialIdGenerator implements IdGenerator {
	private counter = 0;

	generate(): string {
		this.counter++;
		return `test-id-${String(this.counter)}`;
	}
}

export class TestStores {
	readonly couponStore: CouponStore;
	readonly themeStore: ThemeStore;

	constructor() {
		const registry = new ThemeRegistry(ALL_THEMES);
		this.couponStore = new CouponStore(new SequentialIdGenerator());
		this.themeStore = new ThemeStore(registry);
	}
}
