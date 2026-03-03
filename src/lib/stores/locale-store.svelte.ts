import { locale } from "svelte-i18n";
import { Locale } from "../domain/locale";

export class LocaleStore {
	currentLocale: Locale = $state(Locale.DEFAULT);

	setLocale(lang: Locale): void {
		this.currentLocale = lang;
		locale.set(lang.value);
		if (typeof document !== "undefined") {
			document.documentElement.lang = lang.value;
		}
	}

	toggle(): void {
		this.setLocale(this.currentLocale === Locale.EN ? Locale.FR : Locale.EN);
	}
}
