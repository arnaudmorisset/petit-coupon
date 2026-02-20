import { GState } from "jspdf";
import type { PatternAsset, SvgPathData } from "../domain/theme-assets";
import type { PdfDrawingContext } from "./pdf-drawing-context";

export interface DrawPathParams {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly fillColor: string;
	readonly strokeColor?: string;
}

export interface TiledPatternParams {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly color: string;
}

interface ParsedCommand {
	readonly command: string;
	readonly args: readonly number[];
}

function arg(args: readonly number[], index: number): number {
	return args[index] ?? 0;
}

export class SvgPathRenderer {
	drawPath(
		doc: PdfDrawingContext,
		pathData: SvgPathData,
		params: DrawPathParams,
	): void {
		const commands = this.parsePath(pathData.d);
		if (commands.length === 0) {
			return;
		}

		const viewBox = this.parseViewBox(pathData.viewBox);
		const scaleX = params.width / viewBox.width;
		const scaleY = params.height / viewBox.height;

		doc.setFillColor(params.fillColor);
		if (params.strokeColor !== undefined) {
			doc.setDrawColor(params.strokeColor);
		}

		let curX = 0;
		let curY = 0;

		for (const cmd of commands) {
			const result = this.executeCommand(
				doc,
				cmd,
				params.x,
				params.y,
				scaleX,
				scaleY,
				curX,
				curY,
			);
			curX = result.x;
			curY = result.y;
		}

		if (params.strokeColor !== undefined) {
			doc.fillStroke();
		} else {
			doc.fill();
		}
	}

	drawTiledPattern(
		doc: PdfDrawingContext,
		pattern: PatternAsset,
		params: TiledPatternParams,
	): void {
		doc.saveGraphicsState();
		doc.setGState(new GState({ opacity: pattern.opacity }));

		doc.rect(params.x, params.y, params.width, params.height);
		doc.clip();
		doc.discardPath();

		const cols = Math.ceil(params.width / pattern.tileWidthMm);
		const rows = Math.ceil(params.height / pattern.tileHeightMm);

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const tileX = params.x + col * pattern.tileWidthMm;
				const tileY = params.y + row * pattern.tileHeightMm;

				this.drawPath(doc, pattern.path, {
					x: tileX,
					y: tileY,
					width: pattern.tileWidthMm,
					height: pattern.tileHeightMm,
					fillColor: params.color,
				});
			}
		}

		doc.restoreGraphicsState();
	}

	private executeCommand(
		doc: PdfDrawingContext,
		cmd: ParsedCommand,
		offsetX: number,
		offsetY: number,
		scaleX: number,
		scaleY: number,
		curX: number,
		curY: number,
	): { x: number; y: number } {
		const a = cmd.args;
		switch (cmd.command) {
			case "M": {
				const x = arg(a, 0) * scaleX + offsetX;
				const y = arg(a, 1) * scaleY + offsetY;
				doc.moveTo(x, y);
				return { x: arg(a, 0), y: arg(a, 1) };
			}
			case "m": {
				const nx = curX + arg(a, 0);
				const ny = curY + arg(a, 1);
				doc.moveTo(nx * scaleX + offsetX, ny * scaleY + offsetY);
				return { x: nx, y: ny };
			}
			case "L": {
				const x = arg(a, 0) * scaleX + offsetX;
				const y = arg(a, 1) * scaleY + offsetY;
				doc.lineTo(x, y);
				return { x: arg(a, 0), y: arg(a, 1) };
			}
			case "l": {
				const nx = curX + arg(a, 0);
				const ny = curY + arg(a, 1);
				doc.lineTo(nx * scaleX + offsetX, ny * scaleY + offsetY);
				return { x: nx, y: ny };
			}
			case "C": {
				doc.curveTo(
					arg(a, 0) * scaleX + offsetX,
					arg(a, 1) * scaleY + offsetY,
					arg(a, 2) * scaleX + offsetX,
					arg(a, 3) * scaleY + offsetY,
					arg(a, 4) * scaleX + offsetX,
					arg(a, 5) * scaleY + offsetY,
				);
				return { x: arg(a, 4), y: arg(a, 5) };
			}
			case "c": {
				doc.curveTo(
					(curX + arg(a, 0)) * scaleX + offsetX,
					(curY + arg(a, 1)) * scaleY + offsetY,
					(curX + arg(a, 2)) * scaleX + offsetX,
					(curY + arg(a, 3)) * scaleY + offsetY,
					(curX + arg(a, 4)) * scaleX + offsetX,
					(curY + arg(a, 5)) * scaleY + offsetY,
				);
				return { x: curX + arg(a, 4), y: curY + arg(a, 5) };
			}
			case "Q": {
				this.quadraticToCubic(
					doc,
					curX,
					curY,
					arg(a, 0),
					arg(a, 1),
					arg(a, 2),
					arg(a, 3),
					offsetX,
					offsetY,
					scaleX,
					scaleY,
				);
				return { x: arg(a, 2), y: arg(a, 3) };
			}
			case "q": {
				this.quadraticToCubic(
					doc,
					curX,
					curY,
					curX + arg(a, 0),
					curY + arg(a, 1),
					curX + arg(a, 2),
					curY + arg(a, 3),
					offsetX,
					offsetY,
					scaleX,
					scaleY,
				);
				return { x: curX + arg(a, 2), y: curY + arg(a, 3) };
			}
			case "a":
			case "A": {
				const isRelative = cmd.command === "a";
				const endX = isRelative ? curX + arg(a, 5) : arg(a, 5);
				const endY = isRelative ? curY + arg(a, 6) : arg(a, 6);
				doc.lineTo(endX * scaleX + offsetX, endY * scaleY + offsetY);
				return { x: endX, y: endY };
			}
			case "Z":
			case "z": {
				doc.close();
				return { x: curX, y: curY };
			}
			default:
				return { x: curX, y: curY };
		}
	}

	private quadraticToCubic(
		doc: PdfDrawingContext,
		x0: number,
		y0: number,
		qx: number,
		qy: number,
		x: number,
		y: number,
		offsetX: number,
		offsetY: number,
		scaleX: number,
		scaleY: number,
	): void {
		const cp1x = x0 + (2 / 3) * (qx - x0);
		const cp1y = y0 + (2 / 3) * (qy - y0);
		const cp2x = x + (2 / 3) * (qx - x);
		const cp2y = y + (2 / 3) * (qy - y);

		doc.curveTo(
			cp1x * scaleX + offsetX,
			cp1y * scaleY + offsetY,
			cp2x * scaleX + offsetX,
			cp2y * scaleY + offsetY,
			x * scaleX + offsetX,
			y * scaleY + offsetY,
		);
	}

	private parseViewBox(viewBox: string): {
		width: number;
		height: number;
	} {
		const parts = viewBox.split(" ").map(Number);
		return { width: parts[2] ?? 1, height: parts[3] ?? 1 };
	}

	private parsePath(d: string): ParsedCommand[] {
		if (d.trim().length === 0) {
			return [];
		}

		const commands: ParsedCommand[] = [];
		const tokens = d.match(/[MmLlCcQqAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)/g);
		if (tokens === null) {
			return [];
		}

		let i = 0;
		while (i < tokens.length) {
			const token = tokens[i];
			if (token !== undefined && /^[MmLlCcQqAaZz]$/.test(token)) {
				const argCount = this.getArgCount(token);
				const args: number[] = [];
				for (let j = 0; j < argCount && i + 1 + j < tokens.length; j++) {
					args.push(Number(tokens[i + 1 + j]));
				}
				commands.push({ command: token, args });
				i += 1 + argCount;
			} else {
				i++;
			}
		}

		return commands;
	}

	private getArgCount(command: string): number {
		switch (command.toUpperCase()) {
			case "M":
			case "L":
				return 2;
			case "C":
				return 6;
			case "Q":
				return 4;
			case "A":
				return 7;
			case "Z":
				return 0;
			default:
				return 0;
		}
	}
}
