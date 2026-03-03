export class Locale {
	static readonly EN = new Locale("en");
	static readonly FR = new Locale("fr");
	static readonly DEFAULT = Locale.EN;

	private static readonly ALL: readonly Locale[] = [Locale.EN, Locale.FR];

	readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static resolve(value: string | undefined): Locale {
		return Locale.ALL.find((l) => l.value === value) ?? Locale.DEFAULT;
	}
}
