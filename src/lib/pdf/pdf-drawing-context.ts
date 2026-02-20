export interface PdfDrawingContext {
	moveTo(x: number, y: number): unknown;
	lineTo(x: number, y: number): unknown;
	curveTo(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		x3: number,
		y3: number,
	): unknown;
	close(): unknown;
	fill(): unknown;
	fillStroke(): unknown;
	setFillColor(color: string): unknown;
	setDrawColor(color: string): unknown;
	saveGraphicsState(): unknown;
	restoreGraphicsState(): unknown;
	setGState(gState: unknown): unknown;
	rect(x: number, y: number, w: number, h: number): unknown;
	clip(): unknown;
	discardPath(): unknown;
}
