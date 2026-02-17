import type { Theme } from "../domain/theme";
import { DEFAULT_THEME } from "../domain/theme";
import type { ThemeRegistry } from "../domain/theme-registry";

export class ThemeStore {
	private readonly registry: ThemeRegistry;
	selectedTheme: Theme = $state(DEFAULT_THEME);

	constructor(registry: ThemeRegistry) {
		this.registry = registry;
		this.selectedTheme = registry.getDefault();
	}

	get allThemes(): readonly Theme[] {
		return this.registry.getAll();
	}

	selectTheme(id: string): void {
		this.selectedTheme = this.registry.getById(id);
	}
}
