export class SuggestionCatalog {
	private static readonly KEYS: readonly string[] = [
		"breakfastInBed",
		"massage",
		"movieNight",
		"homeCookedDinner",
		"dayWithoutChores",
		"surpriseDate",
		"unlimitedCuddles",
		"shoppingSpree",
	];

	readonly keys: readonly string[];

	constructor() {
		this.keys = SuggestionCatalog.KEYS;
	}
}
