import type { jsPDF } from "jspdf";

export interface FontSource {
	readonly name: string;
	readonly style: "normal" | "italic";
	readonly weight: "normal" | "bold";
	readonly base64: string;
}

const BUILT_IN_FONTS = new Set(["Helvetica", "Times", "Courier"]);

export class FontRegistry {
	private readonly fonts: readonly FontSource[];

	constructor(fonts: readonly FontSource[]) {
		this.fonts = fonts;
	}

	has(name: string): boolean {
		return this.fonts.some((f) => f.name === name);
	}

	isBuiltIn(name: string): boolean {
		return BUILT_IN_FONTS.has(name);
	}

	registerAll(doc: jsPDF): void {
		for (const font of this.fonts) {
			const filename = `${font.name}.ttf`;
			doc.addFileToVFS(filename, font.base64);
			doc.addFont(filename, font.name, font.style, font.weight);
		}
	}
}
