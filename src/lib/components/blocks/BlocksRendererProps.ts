import type { SvelteComponent, Snippet } from 'svelte';

export interface BlockData {
	id: string;
	blockType: string;
	slotTarget: string; // Corresponds to a snippet prop name on the LayoutComponent
	data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface LayoutSlot {
	id: string; // Name of the snippet prop on the LayoutComponent (e.g., 'hero')
	name: string; // User-friendly name for CMS
	allowedBlockTypes?: string[]; // Optional: Array of block type IDs that can be placed in this slot
}

export interface LayoutMetadata {
	id: string;
	name: string;
	description?: string;
	slots: LayoutSlot[];
	// Optional future properties:
	// minBlocks?: number;
	// maxBlocks?: number;
	// previewImageUrl?: string;
}

// Type for the props of BlocksRenderer.svelte itself
export interface BlocksRendererComponentProps {
	layoutId: string;
	blocksData: BlockData[];
	layoutMetadata?: LayoutMetadata; // Essential for knowing which snippets to pass
}

// Helper type for dynamic component loading
export type ComponentModule = {
	default: typeof SvelteComponent;
	metadata?: LayoutMetadata;
};

// Type for the blocks grouped by slot target
export type BlocksBySlotTarget = Record<string, BlockData[]>;

// Type for snippet props that get passed to layout components
export type SnippetProps = Record<string, Snippet>; 