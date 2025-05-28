<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteComponent, Snippet } from 'svelte';
	import type {
		BlockData,
		LayoutMetadata,
		BlocksRendererComponentProps,
		ComponentModule,
		BlocksBySlotTarget,
		SnippetProps
	} from './BlocksRendererProps.js';

	let { layoutId, blocksData, layoutMetadata }: BlocksRendererComponentProps = $props();

	const layoutModules = import.meta.glob<ComponentModule>(
		'$lib/components/block_layouts/*.svelte'
	);
	const blockTypeModules = import.meta.glob<ComponentModule>(
		'$lib/components/blocks/block_types/*.svelte'
	);

	let LayoutCmpt: typeof SvelteComponent | null = $state(null);
	const BlockCmpts = new Map<string, typeof SvelteComponent>();
	let isLoading = $state(true);
	let loadingError = $state<string | null>(null);

	// Reactive: Group blocks by their slot target
	let blocksBySlotTarget: BlocksBySlotTarget = $derived(
		blocksData.reduce((acc, block) => {
			if (!acc[block.slotTarget]) acc[block.slotTarget] = [];
			acc[block.slotTarget].push(block);
			return acc;
		}, {} as BlocksBySlotTarget)
	);

	onMount(async () => {
		try {
			isLoading = true;
			loadingError = null;

			// Load Layout Component
			let layoutFound = false;
			for (const [path, loadModule] of Object.entries(layoutModules)) {
				const name = path.split('/').pop()?.replace('.svelte', '');
				if (name === layoutId) {
					const module = (await loadModule()) as ComponentModule;
					LayoutCmpt = module.default;
					layoutFound = true;
					break;
				}
			}

			if (!layoutFound) {
				throw new Error(`Layout component "${layoutId}" not found`);
			}

			// Load Block Type Components
			const neededBlockTypes = new Set(blocksData.map((b) => b.blockType));
			for (const [path, loadModule] of Object.entries(blockTypeModules)) {
				const name = path.split('/').pop()?.replace('.svelte', '');
				if (name && neededBlockTypes.has(name)) {
					const module = (await loadModule()) as ComponentModule;
					BlockCmpts.set(name, module.default);
				}
			}

			// Check if all needed block types were loaded
			for (const blockType of neededBlockTypes) {
				if (!BlockCmpts.has(blockType)) {
					throw new Error(`Block type component "${blockType}" not found`);
				}
			}

			isLoading = false;
		} catch (error) {
			loadingError = error instanceof Error ? error.message : 'Unknown error occurred';
			isLoading = false;
		}
	});

	// Check if we have all required data and components loaded
	let canRender = $derived(
		LayoutCmpt &&
			layoutMetadata &&
			!isLoading &&
			!loadingError &&
			BlockCmpts.size >= new Set(blocksData.map((b) => b.blockType)).size
	);
</script>

{#if loadingError}
	<div class="blocks-renderer-error">
		<p>Error loading components: {loadingError}</p>
	</div>
{:else if isLoading}
	<div class="blocks-renderer-loading">
		<p>Loading layout and components...</p>
	</div>
{:else if canRender && LayoutCmpt && layoutMetadata}
	<!-- Define snippets for each slot -->
	{#snippet main_content()}
		{#if blocksBySlotTarget.main}
			{#each blocksBySlotTarget.main as block (block.id)}
				{@const BlockComponent = BlockCmpts.get(block.blockType)}
				{#if BlockComponent}
					<svelte:component this={BlockComponent} {...block.data} />
				{:else}
					<div class="block-error">Block type "{block.blockType}" not loaded</div>
				{/if}
			{/each}
		{/if}
	{/snippet}

	<!-- Build snippet props object dynamically based on layout metadata -->
	{@const snippetPropsToPass = (() => {
		const props: SnippetProps = {};
		for (const slotInfo of layoutMetadata.slots) {
			if (slotInfo.id === 'main') {
				props.main = main_content;
			}
			// Add more slot mappings here as we add more layouts
		}
		return props;
	})()}

	<!-- Render the layout component with the snippet props -->
	<svelte:component this={LayoutCmpt} {...snippetPropsToPass} />
{:else}
	<div class="blocks-renderer-error">
		<p>Unable to render: Missing layout metadata or components</p>
	</div>
{/if}

<style>
	.blocks-renderer-loading,
	.blocks-renderer-error {
		padding: 1rem;
		border-radius: 4px;
		margin: 1rem 0;
	}

	.blocks-renderer-loading {
		background-color: #f0f9ff;
		border: 1px solid #0ea5e9;
		color: #0c4a6e;
	}

	.blocks-renderer-error {
		background-color: #fef2f2;
		border: 1px solid #ef4444;
		color: #991b1b;
	}

	.block-error {
		background-color: #fef2f2;
		border: 1px solid #ef4444;
		color: #991b1b;
		padding: 0.5rem;
		border-radius: 4px;
		margin: 0.5rem 0;
	}
</style> 