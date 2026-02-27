import { getContext, setContext } from "svelte";
import type { CouponStore } from "./coupon-store.svelte";
import type { PersistenceManager } from "./persistence-manager.svelte";
import type { ThemeStore } from "./theme-store.svelte";

const STORES_KEY = Symbol("app-stores");

export class AppContext {
	readonly couponStore: CouponStore;
	readonly themeStore: ThemeStore;
	readonly persistenceManager: PersistenceManager;

	constructor(
		couponStore: CouponStore,
		themeStore: ThemeStore,
		persistenceManager: PersistenceManager,
	) {
		this.couponStore = couponStore;
		this.themeStore = themeStore;
		this.persistenceManager = persistenceManager;
	}

	provide(): void {
		setContext(STORES_KEY, this);
	}

	static current(): AppContext {
		return getContext<AppContext>(STORES_KEY);
	}
}
