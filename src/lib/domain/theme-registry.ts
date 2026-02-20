import type { Theme, ThemeCategory } from "./theme";

export class ThemeRegistry {
	readonly themes: readonly Theme[];
	private readonly defaultTheme: Theme;

	constructor(themes: readonly Theme[]) {
		const first = themes[0];
		if (first === undefined) {
			throw new Error("ThemeRegistry requires at least one theme");
		}

		const ids = new Set(themes.map((t) => t.id));
		if (ids.size !== themes.length) {
			throw new Error("ThemeRegistry requires unique theme IDs");
		}

		this.themes = themes;
		this.defaultTheme = first;
	}

	getAll(): readonly Theme[] {
		return this.themes;
	}

	getDefault(): Theme {
		return this.defaultTheme;
	}

	getById(id: string): Theme {
		const theme = this.themes.find((t) => t.id === id);
		if (!theme) {
			throw new Error(`Theme not found: ${id}`);
		}
		return theme;
	}

	getByCategory(category: ThemeCategory): readonly Theme[] {
		return this.themes.filter((t) => t.category === category);
	}
}
