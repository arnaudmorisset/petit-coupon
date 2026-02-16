export class GridPosition {
	readonly page: number;
	readonly row: number;
	readonly col: number;
	readonly xMm: number;
	readonly yMm: number;

	constructor(
		page: number,
		row: number,
		col: number,
		xMm: number,
		yMm: number,
	) {
		this.page = page;
		this.row = row;
		this.col = col;
		this.xMm = xMm;
		this.yMm = yMm;
	}
}
