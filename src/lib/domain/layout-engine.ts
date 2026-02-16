import { GridPosition } from "./grid-position";
import type { LayoutConfig } from "./layout-config";

export interface GridSpec {
	readonly cols: number;
	readonly rows: number;
	readonly couponsPerPage: number;
}

export class LayoutEngine {
	readonly config: LayoutConfig;

	constructor(config: LayoutConfig) {
		this.config = config;
	}

	computeGrid(): GridSpec {
		const usableWidth =
			this.config.pageFormat.widthMm -
			this.config.margins.leftMm -
			this.config.margins.rightMm;
		const usableHeight =
			this.config.pageFormat.heightMm -
			this.config.margins.topMm -
			this.config.margins.bottomMm;

		const cols = Math.floor(
			(usableWidth + this.config.gutterMm) /
				(this.config.couponDimensions.widthMm + this.config.gutterMm),
		);
		const rows = Math.floor(
			(usableHeight + this.config.gutterMm) /
				(this.config.couponDimensions.heightMm + this.config.gutterMm),
		);

		return { cols, rows, couponsPerPage: cols * rows };
	}

	computePositions(couponCount: number): readonly GridPosition[] {
		const grid = this.computeGrid();

		if (grid.couponsPerPage === 0) {
			return [];
		}

		const positions: GridPosition[] = [];

		for (let i = 0; i < couponCount; i++) {
			const page = Math.floor(i / grid.couponsPerPage);
			const indexOnPage = i % grid.couponsPerPage;
			const row = Math.floor(indexOnPage / grid.cols);
			const col = indexOnPage % grid.cols;
			const xMm =
				this.config.margins.leftMm +
				col * (this.config.couponDimensions.widthMm + this.config.gutterMm);
			const yMm =
				this.config.margins.topMm +
				row * (this.config.couponDimensions.heightMm + this.config.gutterMm);

			positions.push(new GridPosition(page, row, col, xMm, yMm));
		}

		return positions;
	}

	computePageCount(couponCount: number): number {
		if (couponCount === 0) {
			return 0;
		}

		const grid = this.computeGrid();

		if (grid.couponsPerPage === 0) {
			return 0;
		}

		return Math.ceil(couponCount / grid.couponsPerPage);
	}
}
