import type { BorderStyle } from "./theme";

const BORDER_STYLE_CSS: Record<BorderStyle, string> = {
	double: "double",
	dashed: "dashed",
	solid: "solid",
};

export function borderStyleToCss(style: BorderStyle): string {
	return BORDER_STYLE_CSS[style];
}
