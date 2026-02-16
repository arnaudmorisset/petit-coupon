export class PageFormat {
	static readonly A4 = new PageFormat(210, 297);

	readonly widthMm: number;
	readonly heightMm: number;

	private constructor(widthMm: number, heightMm: number) {
		this.widthMm = widthMm;
		this.heightMm = heightMm;
	}
}
