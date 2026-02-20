<script lang="ts">
	import type { OrnamentAsset } from "../domain/theme-assets";

	type Corner = "tl" | "tr" | "bl" | "br";

	interface Props {
		ornament: OrnamentAsset;
		corner: Corner;
		color: string;
	}

	const { ornament, corner, color }: Props = $props();

	const rotation = $derived(
		corner === "tl" ? 0
		: corner === "tr" ? 90
		: corner === "bl" ? 270
		: 180
	);

	const position = $derived({
		top: corner === "tl" || corner === "tr" ? "0" : "auto",
		bottom: corner === "bl" || corner === "br" ? "0" : "auto",
		left: corner === "tl" || corner === "bl" ? "0" : "auto",
		right: corner === "tr" || corner === "br" ? "0" : "auto",
	});

	const transformOrigin = $derived(
		corner === "tl" ? "top left"
		: corner === "tr" ? "top right"
		: corner === "bl" ? "bottom left"
		: "bottom right"
	);
</script>

<svg
	class="svg-ornament"
	viewBox={ornament.path.viewBox}
	style:top={position.top}
	style:bottom={position.bottom}
	style:left={position.left}
	style:right={position.right}
	style:transform="rotate({rotation}deg)"
	style:transform-origin={transformOrigin}
>
	<path d={ornament.path.d} fill={color} />
</svg>

<style>
	.svg-ornament {
		position: absolute;
		width: 25%;
		height: 25%;
		pointer-events: none;
		overflow: visible;
	}
</style>
