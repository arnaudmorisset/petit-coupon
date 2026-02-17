import { FontRegistry, type FontSource } from "./font-registry";
import {
	DANCING_SCRIPT_REGULAR,
	NUNITO_REGULAR,
	SPACE_GROTESK_REGULAR,
} from "./fonts/font-data";

const FONT_SOURCES: readonly FontSource[] = [
	{
		name: "DancingScript",
		style: "normal",
		weight: "normal",
		base64: DANCING_SCRIPT_REGULAR,
	},
	{
		name: "Nunito",
		style: "normal",
		weight: "normal",
		base64: NUNITO_REGULAR,
	},
	{
		name: "SpaceGrotesk",
		style: "normal",
		weight: "normal",
		base64: SPACE_GROTESK_REGULAR,
	},
];

export const APP_FONT_REGISTRY = new FontRegistry(FONT_SOURCES);
