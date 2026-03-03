import { describe, expect, it } from "vitest";
import { Locale } from "../domain/locale";
import { LocaleStore } from "./locale-store.svelte";

describe("LocaleStore", () => {
	it("defaults to English", () => {
		const store = new LocaleStore();
		expect(store.currentLocale).toBe(Locale.EN);
	});

	it("sets locale to French", () => {
		const store = new LocaleStore();
		store.setLocale(Locale.FR);
		expect(store.currentLocale).toBe(Locale.FR);
	});

	it("sets locale back to English", () => {
		const store = new LocaleStore();
		store.setLocale(Locale.FR);
		store.setLocale(Locale.EN);
		expect(store.currentLocale).toBe(Locale.EN);
	});

	it("toggles from English to French", () => {
		const store = new LocaleStore();
		store.toggle();
		expect(store.currentLocale).toBe(Locale.FR);
	});

	it("toggles from French to English", () => {
		const store = new LocaleStore();
		store.setLocale(Locale.FR);
		store.toggle();
		expect(store.currentLocale).toBe(Locale.EN);
	});
});
