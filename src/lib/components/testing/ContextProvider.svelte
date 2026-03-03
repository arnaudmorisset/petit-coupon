<script lang="ts">
	import type { Snippet } from "svelte";
	import { InMemoryStorage } from "../../persistence/in-memory-storage";
	import { SessionSerializer } from "../../persistence/session-serializer";
	import { THEME_REGISTRY } from "../../domain/themes";
	import { AppContext } from "../../stores/context";
	import type { CouponStore } from "../../stores/coupon-store.svelte";
	import { LocaleStore } from "../../stores/locale-store.svelte";
	import { PersistenceManager } from "../../stores/persistence-manager.svelte";
	import { StatusStore } from "../../stores/status-store.svelte";
	import type { ThemeStore } from "../../stores/theme-store.svelte";

	interface Props {
		couponStore: CouponStore;
		themeStore: ThemeStore;
		statusStore?: StatusStore | undefined;
		localeStore?: LocaleStore | undefined;
		children: Snippet;
	}

	const { couponStore, themeStore, statusStore = new StatusStore(), localeStore = new LocaleStore(), children }: Props = $props();

	const storage = new InMemoryStorage();
	const serializer = new SessionSerializer(THEME_REGISTRY);
	const persistenceManager = new PersistenceManager(storage, serializer, couponStore, themeStore, localeStore);

	const ctx = new AppContext(couponStore, themeStore, statusStore, persistenceManager, localeStore);
	ctx.provide();
</script>

{@render children()}
