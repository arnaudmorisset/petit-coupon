export class Margins {
	readonly topMm: number;
	readonly rightMm: number;
	readonly bottomMm: number;
	readonly leftMm: number;

	constructor(
		topMm: number,
		rightMm: number,
		bottomMm: number,
		leftMm: number,
	) {
		this.topMm = topMm;
		this.rightMm = rightMm;
		this.bottomMm = bottomMm;
		this.leftMm = leftMm;
	}
}
