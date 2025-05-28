<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutMetadata } from '../blocks/BlocksRendererProps.js';

	// Component Metadata
	export const metadata: LayoutMetadata = {
		id: 'singleColumn',
		name: 'Single Column',
		description: 'A simple single column layout for content.',
		slots: [{ id: 'main', name: 'Main Content' }]
	};

	// Component Props (Snippets)
	interface Props {
		main: Snippet; // Snippet for the main content area
	}

	let { main }: Props = $props();
</script>

<div class="single-column">
	{@render main()}
</div>

<style>
	.single-column {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}
</style> 