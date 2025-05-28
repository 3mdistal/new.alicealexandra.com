<script lang="ts">
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

	// Use eager imports to load all components at build time
	const layoutModules = import.meta.glob<ComponentModule>(
		'$lib/components/block_layouts/*.svelte',
		{ eager: true }
	);
	const blockTypeModules = import.meta.glob<ComponentModule>(
		'$lib/components/blocks/block_types/*.svelte',
		{ eager: true }
	);

	// Reactive: Group blocks by their slot target
	let blocksBySlotTarget: BlocksBySlotTarget = $derived(
		blocksData.reduce((acc, block) => {
			if (!acc[block.slotTarget]) acc[block.slotTarget] = [];
			acc[block.slotTarget].push(block);
			return acc;
		}, {} as BlocksBySlotTarget)
	);

	// Load Layout Component - find it once and cache it
	function findLayoutComponent(id: string): typeof SvelteComponent | null {
		for (const [path, module] of Object.entries(layoutModules)) {
			const fileName = path.split('/').pop()?.replace('.svelte', '');
			if (fileName === id) {
				return module.default;
			}
		}
		return null;
	}

	// Load Block Type Components - find them once and cache them
	function findBlockComponents(neededTypes: Set<string>): Map<string, typeof SvelteComponent> {
		const components = new Map<string, typeof SvelteComponent>();
		
		for (const [path, module] of Object.entries(blockTypeModules)) {
			const fileName = path.split('/').pop()?.replace('.svelte', '');
			if (fileName && neededTypes.has(fileName)) {
				components.set(fileName, module.default);
			}
		}
		return components;
	}

	// Get the layout component
	let LayoutComponent = findLayoutComponent(layoutId);

	// Get needed block types
	let neededBlockTypes = new Set(blocksData.map((b) => b.blockType));
	let BlockComponents = findBlockComponents(neededBlockTypes);

	// Error checking
	let loadingError: string | null = $state(null);

	if (!LayoutComponent) {
		const availableLayouts = Object.keys(layoutModules).map(path => 
			path.split('/').pop()?.replace('.svelte', '')
		);
		loadingError = `Layout component "${layoutId}" not found. Available layouts: ${availableLayouts.join(', ')}`;
	} else {
		// Check if all needed block types were loaded
		for (const blockType of neededBlockTypes) {
			if (!BlockComponents.has(blockType)) {
				const availableBlockTypes = Object.keys(blockTypeModules).map(path => 
					path.split('/').pop()?.replace('.svelte', '')
				);
				loadingError = `Block type component "${blockType}" not found. Available block types: ${availableBlockTypes.join(', ')}`;
				break;
			}
		}
	}

	// Check if we can render
	let canRender = $derived(LayoutComponent && layoutMetadata && !loadingError && BlockComponents.size >= neededBlockTypes.size);
</script>

{#if loadingError}
	<div class="blocks-renderer-error">
		<p>Error loading components: {loadingError}</p>
	</div>
{:else if canRender && LayoutComponent && layoutMetadata}
	<!-- Define snippets for each slot -->
	{#snippet main_content()}
		{#if blocksBySlotTarget.main}
			{#each blocksBySlotTarget.main as block (block.id)}
				{@const BlockComponent = BlockComponents.get(block.blockType)}
				{#if BlockComponent}
					<BlockComponent {...block.data} />
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

	<!-- Render the layout component with the snippet props using modern Svelte 5 syntax -->
	<LayoutComponent {...snippetPropsToPass} />
{:else}
	<div class="blocks-renderer-error">
		<p>Unable to render: Missing layout metadata or components</p>
		<p>Debug: LayoutComponent={!!LayoutComponent}, layoutMetadata={!!layoutMetadata}, loadingError={loadingError}, BlockComponents.size={BlockComponents.size}, neededBlockTypes={neededBlockTypes.size}</p>
	</div>
{/if}

<style>
	.blocks-renderer-error {
		padding: 1rem;
		border-radius: 4px;
		margin: 1rem 0;
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