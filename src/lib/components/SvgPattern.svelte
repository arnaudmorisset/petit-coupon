<script lang="ts">
	import type { PatternAsset } from "../domain/theme-assets";

	interface Props {
		pattern: PatternAsset;
		color: string;
		id: string;
	}

	const { pattern, color, id }: Props = $props();

	const viewBoxParts = $derived(pattern.path.viewBox.split(" ").map(Number));
	const tileW = $derived(viewBoxParts[2]);
	const tileH = $derived(viewBoxParts[3]);
	const patternId = $derived(`pattern-${id}`);
</script>

<svg
	class="svg-pattern"
	style:opacity={pattern.opacity}
>
	<defs>
		<pattern
			id={patternId}
			patternUnits="userSpaceOnUse"
			width={tileW}
			height={tileH}
		>
			<path d={pattern.path.d} fill={color} />
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill="url(#{patternId})" />
</svg>

<style>
	.svg-pattern {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
