<script lang="ts">
	import type { IllustrationAsset } from "../domain/theme-assets";

	interface Props {
		illustration: IllustrationAsset;
		color: string;
	}

	const { illustration, color }: Props = $props();

	const positionStyles = $derived(
		illustration.position === "top-right"
			? { top: "4%", right: "4%", bottom: "auto", left: "auto" }
		: illustration.position === "bottom-left"
			? { top: "auto", right: "auto", bottom: "4%", left: "4%" }
		: { top: "auto", right: "4%", bottom: "4%", left: "auto" }
	);
</script>

<svg
	class="svg-illustration"
	viewBox={illustration.path.viewBox}
	style:top={positionStyles.top}
	style:right={positionStyles.right}
	style:bottom={positionStyles.bottom}
	style:left={positionStyles.left}
>
	<path d={illustration.path.d} fill={color} />
</svg>

<style>
	.svg-illustration {
		position: absolute;
		width: 30%;
		height: 40%;
		pointer-events: none;
		opacity: 0.3;
		overflow: visible;
	}
</style>
