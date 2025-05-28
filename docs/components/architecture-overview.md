# Svelte Dynamic Block Rendering System - Architecture Overview

## 1. Core Concept: Layout Components + Block Renderer

The system will be based on individual Svelte components defining specific layouts. These layout components will use Svelte Snippets to define areas where content blocks can be rendered. A central `BlocksRenderer` component will dynamically load a chosen layout and populate its snippet areas with block components based on data fetched from the CMS.

## 2. Directory Structure

We'll organize our components like this:

```
src/
├── lib/
│   ├── components/
│   │   ├── blocks/
│   │   │   ├── BlocksRenderer.svelte      // The main component to render layouts + blocks
│   │   │   ├── BlocksRendererProps.ts     // TypeScript interfaces for BlocksRenderer
│   │   │   ├── block_types/             // Svelte components for each *type* of block (TextBlock, ImageBlock, etc.)
│   │   │   │   ├── TextBlock.svelte
│   │   │   │   ├── ImageBlock.svelte
│   │   │   │   └── ...
│   │   ├── layouts/                     // Generic, reusable layout primitives (e.g., Grid.svelte, Flex.svelte).
│   │   │                                // These are building blocks, not CMS-selectable page section layouts.
│   │   │   ├── Grid.svelte
│   │   │   ├── Flex.svelte
│   │   └── block_layouts/               // Svelte components for predefined CMS-selectable page section layouts.
│   │       │                            // These define semantic arrangements and use components from `layouts/` or raw CSS.
│   │       ├── SingleColumn.svelte
│   │       ├── TwoColumnEqual.svelte
│   │       ├── HeroWithSidebar.svelte
│   │       └── ...
└── routes/
    └── [[...slug]]/                     // Example: Catch-all route for dynamic pages
        ├── +page.svelte
        └── +page.server.ts              // To fetch page data from CMS via GraphQL
```

## 3. Layout Components (`src/lib/components/block_layouts/`)

*   **Responsibility:** Define the HTML structure and styling for a specific arrangement of content. They use exported Svelte Snippet props (declared via `$props()`) to define where blocks will be placed.
*   **Structure:**
    *   Each layout is a `.svelte` file (e.g., `TwoColumnEqual.svelte`).
    *   They use standard Svelte, potentially importing components from `src/lib/components/layouts/` (like `Grid.svelte`) or using raw CSS Grid/Flexbox.
    *   They declare snippet props using Svelte 5's `$props()` rune.

*   **Metadata (Exported from each layout component's `<script>` tag):**
    ```svelte
    <!-- src/lib/components/block_layouts/HeroWithSidebar.svelte -->
    <script lang="ts">
      import type { Snippet } from 'svelte';

      // Component Metadata
      export const metadata = {
        id: 'heroWithSidebar', // Unique identifier, matches CMS value
        name: 'Hero with Sidebar', // User-friendly name for CMS
        description: 'A large hero image or content area with a smaller sidebar.',
        // "slots" here is for CMS terminology. These correspond to Snippet props.
        slots: [
          { id: 'hero', name: 'Hero Area', allowedBlockTypes: ['ImageBlock', 'RichTextBlock'] },
          { id: 'sidebar', name: 'Sidebar Content', allowedBlockTypes: ['CallToActionBlock', 'LinksListBlock'] }
        ],
        // Optional:
        // minBlocks: 2,
        // maxBlocks: 2,
        // previewImageUrl: '/images/layouts/hero_sidebar_preview.png'
      };

      // Component Props (Snippets)
      type Props = {
        hero: Snippet; // Snippet for the hero area
        sidebar: Snippet; // Snippet for the sidebar
      };
      let { hero, sidebar }: Props = $props();
    </script>

    <div class="hero-section">
      {@render hero()}
    </div>
    <aside class="sidebar-section">
      {@render sidebar()}
    </aside>

    <style>
      /* Layout-specific styles */
      .hero-section { grid-area: hero; /* example */ }
      .sidebar-section { grid-area: sidebar; /* example */ }
      /* Add display: grid definitions if this layout uses CSS grid directly */
    </style>
    ```
    *   `id`: A machine-readable ID used for dynamic importing and matching with CMS data.
    *   `name`: Human-readable name for display in the CMS.
    *   `slots`: An array describing each snippet area for CMS purposes.
        *   `id`: Corresponds to the snippet prop name in the Svelte component (e.g., `hero`).
        *   `name`: Human-readable name for the snippet area in the CMS.
        *   `allowedBlockTypes`: (Optional but recommended) Array of block type IDs that can be placed in this snippet area.

## 4. Block Type Components (`src/lib/components/blocks/block_types/`)

*   **Responsibility:** Render a single piece of content (e.g., a paragraph of text, an image, a call to action).
*   **Structure:**
    *   Each block type is a `.svelte` file (e.g., `TextBlock.svelte`, `ImageBlock.svelte`).
    *   They receive their specific data as props, defined using `$props()`.

    ```svelte
    <!-- src/lib/components/blocks/block_types/TextBlock.svelte -->
    <script lang="ts">
      type Props = {
        content: string; // Or a more complex object for rich text
        // ... other props specific to TextBlock
      };
      let { content }: Props = $props();
    </script>

    <div>
      {@html content}
    </div>
    ```

## 5. `BlocksRenderer.svelte` Component

*   **Responsibility:**
    1.  Receive `layoutId`, `blocksData`, and `layoutMetadata` as props.
    2.  Dynamically import the specified layout component and necessary block type components using `import.meta.glob`.
    3.  Group `blocksData` by their `slotTarget`.
    4.  Define Svelte snippets within its template for each snippet area specified in `layoutMetadata.slots`. Each defined snippet will render the blocks assigned to its corresponding `slotTarget`.
    5.  Render the dynamically loaded layout component, passing the defined snippets as props.

*   **Props Interface (Example: `src/lib/components/blocks/BlocksRendererProps.ts`):**
    ```typescript
    import type { SvelteComponent, Snippet } from 'svelte';

    export interface BlockData {
      id: string;
      blockType: string;
      slotTarget: string; // Corresponds to a snippet prop name on the LayoutComponent
      data: any;
    }

    export interface LayoutSlot {
      id: string; // Name of the snippet prop on the LayoutComponent (e.g., 'hero')
      name: string; // User-friendly name for CMS
    }

    export interface LayoutMetadata {
      id: string;
      slots: LayoutSlot[];
    }

    // Type for the props of BlocksRenderer.svelte itself
    export type BlocksRendererComponentProps = {
      layoutId: string;
      blocksData: BlockData[];
      layoutMetadata?: LayoutMetadata; // Essential for knowing which snippets to pass
    };
    ```

*   **Implementation Sketch:**
    ```svelte
    <!-- src/lib/components/blocks/BlocksRenderer.svelte -->
    <script lang="ts">
      import { onMount, SvelteComponent } from 'svelte';
      import type { Snippet } from 'svelte';
      // Assuming props interface is in a separate file as shown above
      import type { BlockData, LayoutMetadata, BlocksRendererComponentProps } from './BlocksRendererProps';

      let { layoutId, blocksData, layoutMetadata }: BlocksRendererComponentProps = $props();

      const layoutModules = import.meta.glob<Record<string, any>>(
        '$lib/components/block_layouts/*.svelte'
      );
      const blockTypeModules = import.meta.glob<Record<string, any>>(
        '$lib/components/blocks/block_types/*.svelte'
      );

      let LayoutCmpt: typeof SvelteComponent | null = null;
      const BlockCmpts = new Map<string, typeof SvelteComponent>();
      let blocksBySlotTarget: Record<string, BlockData[]> = {};

      $: {
        blocksBySlotTarget = blocksData.reduce((acc, block) => {
          if (!acc[block.slotTarget]) acc[block.slotTarget] = [];
          acc[block.slotTarget].push(block);
          return acc;
        }, {} as Record<string, BlockData[]>);
      }

      onMount(async () => {
        // Load Layout Component
        for (const [path, loadModule] of Object.entries(layoutModules)) {
          const name = path.split('/').pop()?.replace('.svelte', '');
          if (name === layoutId) {
            LayoutCmpt = (await loadModule() as any).default;
            break;
          }
        }

        // Load Block Type Components
        const neededBlockTypes = new Set(blocksData.map(b => b.blockType));
        for (const [path, loadModule] of Object.entries(blockTypeModules)) {
          const name = path.split('/').pop()?.replace('.svelte', '');
          if (name && neededBlockTypes.has(name)) {
            BlockCmpts.set(name, (await loadModule() as any).default);
          }
        }
      });
    </script>

    {#if LayoutCmpt && layoutMetadata && BlockCmpts.size >= new Set(blocksData.map(b => b.blockType)).size}
      <!--
        The following structure dynamically creates snippet props for the LayoutCmpt.
        It relies on `layoutMetadata.slots` to know which snippet props the LayoutCmpt expects.
        Each snippet (`hero_content`, `sidebar_content`, etc.) is defined here in BlocksRenderer
        and then passed to the <svelte:component this={LayoutCmpt} ... />.
      -->

      {#snippet hero_content()}
        {#if blocksBySlotTarget.hero}
          {#each blocksBySlotTarget.hero as block (block.id)}
            {@const BlockComponent = BlockCmpts.get(block.blockType)}
            {#if BlockComponent}
              <svelte:component this={BlockComponent} {...block.data} />
            {/if}
          {/each}
        {/if}
      {/snippet}

      {#snippet sidebar_content()}
        {#if blocksBySlotTarget.sidebar}
          {#each blocksBySlotTarget.sidebar as block (block.id)}
            {@const BlockComponent = BlockCmpts.get(block.blockType)}
            {#if BlockComponent}
              <svelte:component this={BlockComponent} {...block.data} />
            {/if}
          {/each}
        {/if}
      {/snippet}

      <!-- Add more {#snippet ...} blocks here for other common/known snippet names -->
      <!-- E.g., main_content, left_column, right_column, etc. -->
      {#snippet main_content()} <!-- Example for SingleColumn layout -->
        {#if blocksBySlotTarget.main}
          {#each blocksBySlotTarget.main as block (block.id)}
            {@const BlockComponent = BlockCmpts.get(block.blockType)}
            {#if BlockComponent} <svelte:component this={BlockComponent} {...block.data} /> {/if}
          {/each}
        {/if}
      {/snippet}

      {@const snippetPropsToPass: Record<string, Snippet> = {}}
      {#each layoutMetadata.slots as slotInfo}
        {#if slotInfo.id === 'hero'}
          {@const _ = snippetPropsToPass.hero = hero_content}
        {:else if slotInfo.id === 'sidebar'}
          {@const _ = snippetPropsToPass.sidebar = sidebar_content}
        {:else if slotInfo.id === 'main'} <!-- Example for SingleColumn -->
          {@const _ = snippetPropsToPass.main = main_content}
        <!-- Add more else if conditions for other snippet IDs defined above -->
        {/if}
      {/each}

      <svelte:component this={LayoutCmpt} {...snippetPropsToPass} />

    {:else if !LayoutCmpt || !layoutMetadata}
      <p>Loading layout ({layoutId})...</p>
    {:else}
      <p>Loading block components...</p>
    {/if}
    ```

## 6. CMS Integration (Payload CMS + GraphQL)

*   **Payload CMS Setup:**
    *   **Page Collection:** Your "Pages" collection in Payload will contain a field (e.g., `sections` of type `array` or `blocks`).
    *   Each item/block in `sections` represents a content section on the page and would have:
        *   `layoutId`: A select field storing the `id` of the Svelte `block_layout` component (e.g., "heroWithSidebar"). This list of options in Payload should be kept in sync with your available Svelte layouts (see Step 8).
        *   `blocks`: An array/blocks field containing the actual content blocks for this section. Each content block item would have:
            *   `blockType`: The ID of the Svelte block type component (e.g., "TextBlock", "ImageBlock").
            *   `slotTarget`: A select field storing the `id` of the snippet prop on the chosen `layoutId` where this block should render (e.g., "hero", "sidebar"). The options for this field in Payload should dynamically update based on the selected `layoutId` by querying the Svelte layout's `metadata.slots` (see Step 8).
            *   `data`: Fields specific to the `blockType` (e.g., text content, image reference).

*   **GraphQL Schema:** Your GraphQL API should reflect this. A query for a page might include:
    ```graphql
    query GetPage($slug: String!) {
      Pages(where: { slug: { equals: $slug } }) {
        docs {
          title
          sections { # This is an array field in Payload
            layoutId # e.g., "heroWithSidebar"
            # The 'blocks' field from Payload for this section
            blocks { # This is also an array/blocks field in Payload
              id # CMS instance ID of the block
              blockType # e.g., "TextBlock" from Payload's block type slug
              slotTarget # e.g., "hero"
              data { # Fields vary based on blockType
                ... on TextBlockFields {
                  text
                }
                ... on ImageBlockFields {
                  imageUrl
                  altText
                }
                # ... other block type fragments
              }
            }
          }
        }
      }
    }
    ```

## 7. SvelteKit Page Rendering (`+page.server.ts` and `+page.svelte`)

*   **`+page.server.ts`:**
    *   Fetches page data from Payload CMS via GraphQL.
    *   Crucially, it must also fetch or have access to the `metadata` for each `layoutId` used on the page. This metadata (especially `metadata.slots` defining the expected snippet prop names) is needed by `BlocksRenderer.svelte`. This can be achieved by:
        1.  Having your GraphQL API return the layout metadata alongside the page data.
        2.  Importing all layout components' metadata directly in `+page.server.ts` (e.g., using `import.meta.glob` eagerly, or from a generated manifest file during the build step outlined in Step 8).
    *   Transforms the response into the structure needed by `+page.svelte`.

    ```typescript
    // src/routes/[[...slug]]/+page.server.ts
    import type { PageServerLoad } from './$types';
    // Assuming BlocksRendererProps.ts is in the same directory or accessible path
    import type { LayoutMetadata } from '$lib/components/blocks/BlocksRendererProps';

    // This is a placeholder for how you might get all layout metadata.
    // Ideally, this is generated at build time or fetched efficiently.
    async function getAllLayoutsMetadata(): Promise<Record<string, LayoutMetadata>> {
      const modules = import.meta.glob<{ metadata: LayoutMetadata }>('$lib/components/block_layouts/*.svelte', { eager: true });
      const metadata: Record<string, LayoutMetadata> = {};
      for (const path in modules) {
        const layoutId = path.split('/').pop()?.replace('.svelte', '');
        if (layoutId && modules[path].metadata) {
          metadata[layoutId] = modules[path].metadata;
        }
      }
      return metadata;
    }

    export const load: PageServerLoad = async ({ params, fetch }) => {
      const pageSlug = params.slug?.join('/') || 'home'; // Default to 'home' or your landing page slug
      // Your GraphQL query (ensure it fetches layoutId for each section)
      const gqlQuery = `... your GraphQL query ...`; // Placeholder for actual query

      const response = await fetch('YOUR_PAYLOAD_CMS_GRAPHQL_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: gqlQuery, variables: { slug: pageSlug } }),
      });

      if (!response.ok) throw new Error(`Failed to fetch page: ${response.statusText}`);
      const jsonResponse = await response.json();
      // Adjust the next line based on your actual GraphQL response structure for a single page
      const pageDoc = jsonResponse.data.Pages?.docs?.[0]; 

      if (!pageDoc) {
        // Handle page not found, perhaps by throwing a 404 error
        // import { error } from '@sveltejs/kit';
        // throw error(404, 'Page not found');
        return { page: null }; // Or appropriate error handling
      }

      const allLayoutsMeta = await getAllLayoutsMetadata();

      const processedSections = pageDoc.sections?.map((section: any) => ({
        ...section,
        layoutMetadata: allLayoutsMeta[section.layoutId] || null // Attach metadata
      })) || [];

      return {
        page: { ...pageDoc, sections: processedSections },
      };
    };
    ```

*   **`+page.svelte`:**
    *   Receives page data including augmented sections with `layoutMetadata`.
    *   For each section, uses `BlocksRenderer.svelte`.
    ```svelte
    <!-- src/routes/[[...slug]]/+page.svelte -->
    <script lang="ts">
      import type { PageData } from './$types';
      import BlocksRenderer from '$lib/components/blocks/BlocksRenderer.svelte';
      // Define a more specific type for your page and section data if possible
      // import type { YourPageType } from '$lib/types'; // Example

      type Props = { data: PageData }; // PageData is auto-generated by SvelteKit
      let { data }: Props = $props();
      const page = data.page; // `page` will have the structure returned by your load function
    </script>

    {#if page}
      <h1>{page.title}</h1>

      {#if page.sections && page.sections.length > 0}
        {#each page.sections as section (section.id || section.layoutId + Math.random())}
          <div class="page-section">
            {#if section.layoutMetadata}
              <BlocksRenderer
                layoutId={section.layoutId}
                blocksData={section.blocks}
                layoutMetadata={section.layoutMetadata}
              />
            {:else}
              <p>Error: Layout metadata missing for layout "{section.layoutId}". Section ID: {section.id || 'N/A'}</p>
            {/if}
          </div>
        {/each}
      {:else}
        <p>This page has no sections defined.</p>
      {/if}
    {:else}
      <p>Page not found or error in loading page data.</p>
    {/if}
    ```

## 8. Advanced: Dynamic Snippet Options in CMS (Build Step)

**Agreed approach:**
*   During your build process (or via a dedicated script run manually/on deploy):
    *   Use `import.meta.glob` with `eager: true` (or a similar mechanism like `fast-glob` in a Node.js script) to find all `*.svelte` files in `src/lib/components/block_layouts/`.
    *   For each file, parse its `<script>` tag to extract the exported `metadata` object (specifically `id` and `slots`).
    *   Generate a JSON structure mapping each `layoutId` to its `metadata` (or at least its `id` and `slots` array: `[{id: "hero", name: "Hero Area"}, ...]`).
    *   This JSON can be:
        *   Written to a static file (e.g., `static/layout-manifest.json` or `src/lib/generated/layout-manifest.json`) that can be imported by `+page.server.ts` or fetched by Payload CMS's custom fields if accessible via URL.
        *   Pushed to a specific collection or global in Payload CMS via its API. Payload custom fields can then read from this internal source.
*   This allows Payload's UI for the `slotTarget` field (when assigning a block to a snippet area) to dynamically show relevant snippet area names based on the selected "Section Layout" (`layoutId`), improving the CMS user experience.

## 9. Key Considerations & Iterations

*   **Article Content Strategy (Composable Article):** For articles, adopt a "Composable Article" approach. This means:
    *   Define an `ArticleLayout.svelte` in `src/lib/components/block_layouts/`.
    *   This layout would have specific snippet areas like `titleSnippet`, `mainContentSnippet`, `authorBioSnippet`, `metadataSnippet`, etc.
    *   CMS users would then populate these snippet areas with fundamental block types like `HeadingBlock`, `TextBlock` (for paragraphs), `ImageBlock`, `QuoteBlock`, etc.
    *   The overall styling of `ArticleLayout.svelte` and the individual block types would create the desired readable article experience. This offers flexibility in content structure.
    *   The `allowedBlockTypes` in `ArticleLayout.svelte`'s metadata can guide users to select appropriate blocks for an article context.
*   **Error Handling & Loading States:** Implement robust error boundaries and loading UI (e.g., skeletons) within `BlocksRenderer.svelte` (e.g., for when `LayoutCmpt` or `BlockCmpts` are loading, or if `layoutMetadata` is missing). SvelteKit's `+loading.svelte` or data streaming (`defer`) could be relevant for the overall page loading experience.
*   **Styling:** Maintain a consistent styling strategy. Layout components (`block_layouts`) are primarily responsible for the spatial arrangement of snippet areas. Block type components (`block_types`) style their own content.
*   **Developer Experience:** Aim for ease in creating new `block_layout` and `block_type` components. Clear conventions for metadata structure and component props are key. The build step for CMS sync (Step 8) is crucial for a good DX with Payload.
*   **`BlocksRenderer.svelte` Snippet Management:** The current approach in `BlocksRenderer.svelte` uses explicitly named `{#snippet}` blocks (e.g., `hero_content`, `sidebar_content`). This list needs to be maintained and cover all snippet `id`s used across all your layouts. If you have many unique snippet `id`s, this section of `BlocksRenderer.svelte` could grow. Consider if a more abstract or programmatic way to map `layoutMetadata.slots` to these defined snippets is needed, though explicit `{#snippet}` blocks are the most direct Svelte 5 feature for this.

This plan provides a solid foundation. The interaction between the Svelte frontend and the Payload CMS backend (specifically how layout choices and block-to-snippet assignments are made and stored, informed by the build step) is the most crucial part to get right for a smooth content editing experience.