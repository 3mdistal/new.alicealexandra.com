<script lang="ts">
	import { observeIntersection, type IntersectionThresholdPreset, type IntersectionRootMarginPreset } from '$lib/utils/observe-intersection';
	import type { Snippet } from 'svelte';

	let {
		children,
		duration = 1000,
		delay = 0,
		thresholdPreset, // Optional: will use default from observeIntersection if not provided
		rootMarginPreset // Optional: will use default from observeIntersection if not provided
	}: {
		children: Snippet;
		duration?: number;
		delay?: number;
		thresholdPreset?: IntersectionThresholdPreset;
		rootMarginPreset?: IntersectionRootMarginPreset;
	} = $props();

	let div: HTMLDivElement;
	let isVisible = $state(false);

	function handleIntersection(entries: IntersectionObserverEntry[]) {
		const entry = entries[0];
		if (entry.isIntersecting) {
			isVisible = true;
		}
	}

	$effect(() => {
		if (div) {
			const { disconnect } = observeIntersection(
				div,
				handleIntersection,
				{ thresholdPreset, rootMarginPreset }
			);
			return () => disconnect();
		}
	});
</script>

<div bind:this={div} style="--duration: {duration}ms; --delay: {delay}ms; opacity: {isVisible ? 1 : 0};">
	{@render children()}
</div>

<style>
	div {
		animation: fadeIn var(--duration) ease-in-out var(--delay) forwards;
		opacity: 0;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>