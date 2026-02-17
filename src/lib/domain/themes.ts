import type { Theme } from "./theme";
import { ThemeRegistry } from "./theme-registry";

export const CLASSIC_THEME: Theme = {
	id: "classic",
	name: "Classic",
	description: "Clean and elegant",
	category: "minimal",
	backgroundColor: "#ffffff",
	borderColor: "#333333",
	textColor: "#333333",
	titleColor: "#333333",
	accentColor: "#999999",
	fontFamily: "Times",
	titleFontFamily: "Times",
	borderWidthMm: 0.5,
	borderRadiusMm: 2,
	borderStyle: "solid",
	paddingMm: 4,
};

export const ROMANTIC_THEME: Theme = {
	id: "romantic",
	name: "Romantic",
	description: "Warm and intimate",
	category: "romantic",
	backgroundColor: "#fff0f3",
	borderColor: "#c4687a",
	textColor: "#5c2434",
	titleColor: "#9b3a54",
	accentColor: "#e8a0b0",
	fontFamily: "DancingScript",
	titleFontFamily: "DancingScript",
	borderWidthMm: 0.4,
	borderRadiusMm: 4,
	borderStyle: "dashed",
	paddingMm: 5,
};

export const SUNSHINE_THEME: Theme = {
	id: "sunshine",
	name: "Sunshine",
	description: "Bright and cheerful",
	category: "friendly",
	backgroundColor: "#fffbeb",
	borderColor: "#d97706",
	textColor: "#78350f",
	titleColor: "#92400e",
	accentColor: "#fbbf24",
	fontFamily: "Nunito",
	titleFontFamily: "Nunito",
	borderWidthMm: 1,
	borderRadiusMm: 6,
	borderStyle: "solid",
	paddingMm: 5,
};

export const MIDNIGHT_THEME: Theme = {
	id: "midnight",
	name: "Midnight",
	description: "Bold and modern",
	category: "playful",
	backgroundColor: "#1e293b",
	borderColor: "#94a3b8",
	textColor: "#e2e8f0",
	titleColor: "#38bdf8",
	accentColor: "#38bdf8",
	fontFamily: "SpaceGrotesk",
	titleFontFamily: "SpaceGrotesk",
	borderWidthMm: 0.6,
	borderRadiusMm: 1,
	borderStyle: "double",
	paddingMm: 4,
};

export const ALL_THEMES: readonly Theme[] = [
	CLASSIC_THEME,
	ROMANTIC_THEME,
	SUNSHINE_THEME,
	MIDNIGHT_THEME,
];

export const THEME_REGISTRY = new ThemeRegistry(ALL_THEMES);
