import { Locale } from "../domain/locale";
import type { AppStorage } from "../persistence/app-storage";
import type { SessionSerializer } from "../persistence/session-serializer";
import type { CouponStore } from "./coupon-store.svelte";
import type { LocaleStore } from "./locale-store.svelte";
import type { ThemeStore } from "./theme-store.svelte";

export class PersistenceManager {
	private readonly storage: AppStorage;
	private readonly serializer: SessionSerializer;
	private readonly couponStore: CouponStore;
	private readonly themeStore: ThemeStore;
	private readonly localeStore: LocaleStore;
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;
	private initialized = false;

	constructor(
		storage: AppStorage,
		serializer: SessionSerializer,
		couponStore: CouponStore,
		themeStore: ThemeStore,
		localeStore: LocaleStore,
	) {
		this.storage = storage;
		this.serializer = serializer;
		this.couponStore = couponStore;
		this.themeStore = themeStore;
		this.localeStore = localeStore;

		this.restore();
		this.setupAutoSave();
	}

	clearSession(): void {
		this.storage.clear();
		this.couponStore.loadCoupons([]);
		this.themeStore.selectTheme(this.themeStore.allThemes[0]?.id ?? "classic");
		this.localeStore.setLocale(Locale.DEFAULT);
	}

	private restore(): void {
		const data = this.storage.load();
		if (!data) {
			return;
		}

		const session = this.serializer.deserialize(data);
		this.themeStore.selectTheme(session.themeId);
		this.couponStore.loadCoupons(session.coupons);
		this.localeStore.setLocale(session.locale);
	}

	private setupAutoSave(): void {
		$effect(() => {
			const _coupons = this.couponStore.coupons;
			const _theme = this.themeStore.selectedTheme;
			const _locale = this.localeStore.currentLocale;

			if (!this.initialized) {
				this.initialized = true;
				return;
			}

			if (this.saveTimeout) {
				clearTimeout(this.saveTimeout);
			}

			this.saveTimeout = setTimeout(() => {
				const data = this.serializer.serialize(_theme.id, _coupons, _locale);
				this.storage.save(data);
			}, 300);

			return () => {
				if (this.saveTimeout) {
					clearTimeout(this.saveTimeout);
				}
			};
		});
	}
}
