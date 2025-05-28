<script lang="ts">
	import BlocksRenderer from '$lib/components/blocks/BlocksRenderer.svelte';
	import type { BlockData, LayoutMetadata } from '$lib/components/blocks/BlocksRendererProps.js';

	// Hardcoded layout ID
	const layoutId = 'singleColumn';

	// Hardcoded blocks data
	const blocksData: BlockData[] = [
		{
			id: 'b1',
			blockType: 'TextBlock',
			slotTarget: 'main',
			data: { text: '<h2>Hello World from TextBlock 1</h2><p>This is the first text block in our single column layout.</p>' }
		},
		{
			id: 'b2',
			blockType: 'TextBlock',
			slotTarget: 'main',
			data: { text: '<p>Another paragraph from TextBlock 2. This demonstrates multiple blocks in the same slot.</p>' }
		}
	];

	// Hardcoded layout metadata for SingleColumn
	const layoutMetadata: LayoutMetadata = {
		id: 'singleColumn',
		name: 'Single Column',
		description: 'A simple single column layout for content.',
		slots: [{ id: 'main', name: 'Main Content' }]
	};
</script>

<svelte:head>
	<title>Test Blocks - Phase 1</title>
</svelte:head>

<main>
	<div class="page-header">
		<h1>Block System Test - Phase 1</h1>
		<p>Testing basic block and layout rendering with static data.</p>
		<p><strong>Layout:</strong> {layoutMetadata.name}</p>
		<p><strong>Blocks:</strong> {blocksData.length} TextBlocks in the main slot</p>
	</div>

	<div class="test-section">
		<h2>Rendered Output:</h2>
		<div class="renderer-container">
			<BlocksRenderer {layoutId} {blocksData} {layoutMetadata} />
		</div>
	</div>

	<div class="debug-section">
		<h2>Debug Information:</h2>
		<details>
			<summary>Layout Metadata</summary>
			<pre>{JSON.stringify(layoutMetadata, null, 2)}</pre>
		</details>
		<details>
			<summary>Blocks Data</summary>
			<pre>{JSON.stringify(blocksData, null, 2)}</pre>
		</details>
	</div>
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		background-color: #f8fafc;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		border: 1px solid #e2e8f0;
	}

	.page-header h1 {
		margin: 0 0 0.5rem 0;
		color: #1e293b;
	}

	.page-header p {
		margin: 0.25rem 0;
		color: #64748b;
	}

	.test-section {
		margin-bottom: 2rem;
	}

	.test-section h2 {
		margin-bottom: 1rem;
		color: #1e293b;
	}

	.renderer-container {
		border: 2px dashed #cbd5e1;
		border-radius: 8px;
		padding: 1rem;
		background-color: #ffffff;
	}

	.debug-section {
		background-color: #f1f5f9;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.debug-section h2 {
		margin: 0 0 1rem 0;
		color: #1e293b;
	}

	.debug-section details {
		margin-bottom: 1rem;
	}

	.debug-section summary {
		cursor: pointer;
		font-weight: 600;
		color: #475569;
		padding: 0.5rem;
		background-color: #e2e8f0;
		border-radius: 4px;
	}

	.debug-section summary:hover {
		background-color: #cbd5e1;
	}

	.debug-section pre {
		background-color: #1e293b;
		color: #f1f5f9;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
	}
</style> 