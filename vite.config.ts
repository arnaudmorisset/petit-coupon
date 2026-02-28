import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// jsPDF optionally imports html2canvas, dompurify, and canvg for features
// this project does not use (.html() and .addSvgAsImage()). Stubbing them
// out removes ~224 KB raw / ~56 KB gzip from the production bundle.
const UNUSED_JSPDF_DEPS = ["html2canvas", "dompurify", "canvg"];
const emptyModule = path.resolve(
	import.meta.dirname,
	"src/lib/empty-module.ts",
);

// https://vite.dev/config/
export default defineConfig({
	base: "/petit-coupon/",
	plugins: [svelte()],
	resolve: {
		alias: Object.fromEntries(
			UNUSED_JSPDF_DEPS.map((dep) => [dep, emptyModule]),
		),
	},
});
