# Step-by-Step Implementation Guide for Svelte Block System

This guide outlines an incremental approach to building the dynamic block rendering system, allowing for testing and verification at each stage.

## Phase 1: Basic Block & Layout Rendering (Static Data)

**Goal:** Get a single, simple block type rendering within a single, simple layout, using hardcoded data in a Svelte page.

1.  **Create Core Directories:**
    *   `src/lib/components/blocks/block_layouts/`
    *   `src/lib/components/blocks/block_types/`
    *   `src/lib/components/layouts/` (if you want to keep `Grid.svelte`, `Flex.svelte` separate)

2.  **Create `src/lib/components/layouts/Grid.svelte` (Optional basic layout primitive):**
    *   If you want to use it as a building block.
    *   Keep it simple: props for `columns`, `rows`, `gap`.

3.  **Create `SingleColumn.svelte` Layout (`src/lib/components/block_layouts/SingleColumn.svelte`):**
    *   **`<script>`:**
        *   Define `metadata` with `id: 'singleColumn'`, `name: 'Single Column'`, and `slots: [{ id: 'main', name: 'Main Content' }]`.
        *   Define `$props()`: `let { main }: { main: Snippet } = $props();`
    *   **Template:**
        *   A simple `<div>` that renders the `main` snippet: `{@render main()}`.
    *   **`<style>`:** Basic styling for the single column (e.g., max-width, margin auto).

4.  **Create `TextBlock.svelte` Block Type (`src/lib/components/blocks/block_types/TextBlock.svelte`):**
    *   **`<script>`:**
        *   Define `$props()`: `let { text }: { text: string } = $props();`
    *   **Template:**
        *   A `<div>` or `<p>` that renders `{@html text}`.

5.  **Create `BlocksRendererProps.ts` (`src/lib/components/blocks/BlocksRendererProps.ts`):**
    *   Define the `BlockData`, `LayoutSlot`, `LayoutMetadata`, and `BlocksRendererComponentProps` interfaces as outlined in the `architecture-overview.md`.

6.  **Create `BlocksRenderer.svelte` (`src/lib/components/blocks/BlocksRenderer.svelte`):**
    *   **`<script>`:**
        *   Import types from `BlocksRendererProps.ts`.
        *   Implement `$props()` for `layoutId`, `blocksData`, `layoutMetadata`.
        *   Use `import.meta.glob` to load modules from `block_layouts` and `block_types`.
        *   Implement `onMount` to load the specific `LayoutCmpt` and `BlockCmpts` based on `layoutId` and `blocksData[].blockType`.
        *   Create `blocksBySlotTarget` reactive store.
    *   **Template:**
        *   `{#if LayoutCmpt && layoutMetadata ...}` condition.
        *   Define `{#snippet main_content()}` (to match `SingleColumn.svelte`'s slot ID).
            *   Inside, loop through `blocksBySlotTarget.main` and render `<svelte:component this={BlockCmpt} {...block.data} />`.
        *   Create `snippetPropsToPass` by mapping `layoutMetadata.slots[0].id` (which will be 'main') to `main_content`.
        *   Render `<svelte:component this={LayoutCmpt} {...snippetPropsToPass} />`.
    *   **Testing:** Start with only one `{#snippet main_content()}` and one `slotInfo.id === 'main'` in the prop mapping.

7.  **Create a Test Page (e.g., `src/routes/test-blocks/+page.svelte`):**
    *   **`<script>`:**
        *   Import `BlocksRenderer`.
        *   Hardcode `layoutId = 'singleColumn'`.
        *   Hardcode `blocksData`:
            ```javascript
            const blocksData = [
              { id: 'b1', blockType: 'TextBlock', slotTarget: 'main', data: { text: 'Hello World from TextBlock 1' } },
              { id: 'b2', blockType: 'TextBlock', slotTarget: 'main', data: { text: 'Another paragraph.' } }
            ];
            ```
        *   Hardcode `layoutMetadata` for `SingleColumn.svelte`:
            ```javascript
            const layoutMetadata = {
              id: 'singleColumn',
              slots: [{ id: 'main', name: 'Main Content' }]
            };
            ```
    *   **Template:**
        *   `<BlocksRenderer {layoutId} {blocksData} {layoutMetadata} />`
    *   **Run dev server and navigate to `/test-blocks`. Verify the two text blocks render in the single column.**

## Phase 2: Add a Second Layout and Second Block Type (Static Data)

**Goal:** Ensure the dynamic loading of layouts and blocks works with more than one option.

1.  **Create `TwoColumnEqual.svelte` Layout (`src/lib/components/block_layouts/TwoColumnEqual.svelte`):**
    *   **`<script>`:**
        *   `metadata`: `id: 'twoColumnEqual'`, `name: 'Two Column Equal'`, `slots: [{ id: 'left', name: 'Left Column' }, { id: 'right', name: 'Right Column' }]`.
        *   `$props()`: `let { left, right }: { left: Snippet, right: Snippet } = $props();`
    *   **Template:**
        *   A parent `div` with CSS Grid (`display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;`).
        *   Two child `div`s, one for `{@render left()}` and one for `{@render right()}`.

2.  **Create `ImageBlock.svelte` Block Type (`src/lib/components/blocks/block_types/ImageBlock.svelte`):**
    *   **`<script>`:**
        *   `$props()`: `let { src, alt }: { src: string, alt: string } = $props();`
    *   **Template:**
        *   `<img {src} {alt} style="width: 100%; height: auto;" />`

3.  **Update `BlocksRenderer.svelte`:**
    *   In the template, add `{#snippet left_content()}` and `{#snippet right_content()}`.
    *   Inside these, loop through `blocksBySlotTarget.left` and `blocksBySlotTarget.right` respectively, rendering the `BlockCmpt`.
    *   In the `snippetPropsToPass` logic, add `else if` conditions for `slotInfo.id === 'left'` (map to `left_content`) and `slotInfo.id === 'right'` (map to `right_content`).

4.  **Update Test Page (`src/routes/test-blocks/+page.svelte`):**
    *   Add a button or a way to switch between `layoutId = 'singleColumn'` and `layoutId = 'twoColumnEqual'`.
    *   When `twoColumnEqual` is selected:
        *   Update `layoutMetadata` accordingly.
        *   Update `blocksData` to include `TextBlock`s and `ImageBlock`s targeting `left` and `right` slots.
            ```javascript
            // Example for twoColumnEqual
            const twoColBlocksData = [
              { id: 'tc_b1', blockType: 'TextBlock', slotTarget: 'left', data: { text: 'Left column text.' } },
              { id: 'tc_b2', blockType: 'ImageBlock', slotTarget: 'right', data: { src: 'https://via.placeholder.com/300', alt: 'Placeholder' } }
            ];
            ```
    *   **Verify that both layouts render correctly with their respective blocks when switched.**

## Phase 3: Basic CMS Integration (`+page.server.ts` and `+page.svelte`)

**Goal:** Fetch basic page structure (layout and block data) from a mock CMS/GraphQL endpoint.

1.  **Set up a Mock GraphQL Endpoint (Optional but Recommended):**
    *   You can use a simple Node.js server with `express` and `apollo-server-express` or an online mock GraphQL API tool.
    *   Define a simple schema for a page that returns `layoutId`, `blocksData` (with `blockType`, `slotTarget`, `data`), and `layoutMetadata` (or at least the `slots` part).
    *   For now, the `data` for blocks can be simple (e.g., `text: "string"`).

2.  **Create Dynamic Route (`src/routes/[[...slug]]/`):**
    *   Create `+page.server.ts` and `+page.svelte`.

3.  **Implement `+page.server.ts`:**
    *   Import `LayoutMetadata` type.
    *   Implement `getAllLayoutsMetadata()` function to eagerly import metadata from `src/lib/components/block_layouts/*.svelte` using `import.meta.glob({ eager: true })`. This gives you the `slots` for each layout.
    *   In the `load` function:
        *   Fetch data from your (mock) GraphQL endpoint based on `params.slug`.
        *   The fetched data should include `layoutId` for each section and the `blocksData`.
        *   For each section, use `getAllLayoutsMetadata()` to find the corresponding `layoutMetadata` (specifically the `slots`) for its `layoutId`. Attach this to the section object.
        *   Return the `page` object with `sections`, where each section now has `layoutId`, `blocksData`, and `layoutMetadata`.

4.  **Implement `+page.svelte`:**
    *   Import `BlocksRenderer`.
    *   Get `page` data from `$props()`.
    *   Loop through `page.sections`. For each `section`, render:
        `<BlocksRenderer layoutId={section.layoutId} blocksData={section.blocks} layoutMetadata={section.layoutMetadata} />`
    *   Add basic error handling if `section.layoutMetadata` is missing.

5.  **Configure Payload CMS (Actual CMS Setup - Initial):**
    *   Create a "Pages" collection.
    *   Add a "Sections" field of type `array` or `blocks`.
    *   Inside "Sections", add:
        *   `layoutId`: Text field (for now, manually type `singleColumn` or `twoColumnEqual`).
        *   `blocks`: A `blocks` field type.
            *   Define two block types in Payload:
                *   `TextBlockPayload` (slug: `TextBlock`): with a `text` field.
                *   `ImageBlockPayload` (slug: `ImageBlock`): with `src` (text) and `alt` (text) fields.
            *   For each block within the `blocks` field in Payload, add a `slotTarget` text field (manually type `main`, `left`, or `right`).

6.  **Update `+page.server.ts` to Fetch from Actual Payload CMS:**
    *   Change the `fetch` call to point to your Payload GraphQL endpoint.
    *   Adapt the GraphQL query to match your Payload schema. Ensure you're fetching `layoutId`, and for each block: `blockType` (this will be Payload's block slug like `TextBlock`), `slotTarget`, and the block's specific data fields.
    *   Map Payload's block type slug (e.g., `TextBlock`) to your Svelte component name if they differ (though keeping them the same is simpler).

7.  **Testing:**
    *   Create a page in Payload CMS. Add a section, choose a `layoutId` (e.g., `twoColumnEqual`). Add a `TextBlock` to the `left` slotTarget and an `ImageBlock` to the `right` slotTarget.
    *   Navigate to that page's slug in your SvelteKit app. Verify it renders correctly.

## Phase 4: Build Step for CMS Layout/Slot Synchronization

**Goal:** Automate providing layout and slot information to Payload CMS.

1.  **Create a Build Script (e.g., `scripts/sync-layouts-to-cms.js`):**
    *   Use Node.js with `fast-glob` to find all `*.svelte` files in `src/lib/components/block_layouts/`.
    *   For each file:
        *   Read its content.
        *   Use a regex or a simple parser to extract the `export const metadata = {...}` object. (This can be tricky; a very structured comment block or a separate `.meta.json` file per layout might be more robust if parsing Svelte script tags is too complex).
        *   From the metadata, extract `id`, `name`, and `slots` array.
    *   Generate a JSON structure (e.g., an array of layout objects, or an object mapping `layoutId` to its metadata).
    *   **Option A (JSON file):** Write this JSON to `static/layout-manifest.json`.
        *   Payload CMS custom fields/hooks could potentially fetch this if the dev server makes it accessible or if it's deployed.
    *   **Option B (Push to Payload API):**
        *   Create a "Layout Definitions" global or collection in Payload CMS.
        *   Use Payload's Local API (or REST API if run from outside Payload context) to clear existing definitions and push the newly generated layout metadata.
        *   This is the more robust approach for deep integration.

2.  **Update Payload CMS Configuration:**
    *   **`layoutId` field (in Page Sections):** Change this from a text field to a `select` field.
        *   Its options should be populated dynamically by reading from the "Layout Definitions" global/collection (if using Option B) or by a custom hook that fetches/reads the `layout-manifest.json`.
    *   **`slotTarget` field (in Section's Blocks):** Change this to a `select` field.
        *   Its options should be *conditionally* populated based on the selected `layoutId` for the current section. This requires a custom Payload field or a hook that:
            1.  Gets the selected `layoutId`.
            2.  Looks up that `layoutId` in the "Layout Definitions" (or manifest).
            3.  Returns its `slots` array (`{id, name}`) as the options for `slotTarget`.

3.  **Update `+page.server.ts` (`getAllLayoutsMetadata`):**
    *   If you created `static/layout-manifest.json`, modify `getAllLayoutsMetadata` to fetch and parse this JSON file instead of using `import.meta.glob` at runtime (or use `import metadata from '$lib/generated/layout-manifest.json'` if you place it there and configure Vite/SvelteKit to handle JSON imports). This is more efficient for production.

4.  **Testing:**
    *   Run the build script. Verify the "Layout Definitions" are updated in Payload (or the JSON file is created).
    *   In Payload, when editing a Page section, check if the "Layout ID" select field shows your Svelte layouts.
    *   When a layout is selected, check if the "Slot Target" select field for blocks within that section correctly shows the snippet areas for the chosen layout.

## Phase 5: Refinements and Advanced Features

1.  **`allowedBlockTypes` Enforcement:**
    *   Modify `BlocksRenderer.svelte` or the logic that populates `snippetPropsToPass` to respect `layoutMetadata.slots[X].allowedBlockTypes` if present.
    *   In Payload, the `blocks` field (where you choose a block type like TextBlock, ImageBlock) could also be made dynamic. When a `slotTarget` is selected, filter the available block types for that slot based on `allowedBlockTypes` from the layout's metadata.

2.  **Article Layout (`ArticleLayout.svelte`):**
    *   Implement as per the "Composable Article" strategy in the architecture overview.
    *   Add its metadata to be picked up by the build script.

3.  **Error Handling and Loading States:**
    *   Improve `BlocksRenderer.svelte` with `<p>Loading layout...</p>`, `<p>Loading blocks...</p>`.
    *   Consider SvelteKit's `+loading.svelte` for page-level loading.
    *   Add checks in `+page.svelte` for when `page` data might be null or sections are empty.

4.  **Styling:**
    *   Ensure a consistent approach to styling layouts vs. block types.

5.  **Developer Experience:**
    *   Document the process for creating new layouts and block types.
    *   Ensure the build script for CMS sync is easy to run.

This step-by-step plan should help in tackling the implementation progressively. Remember to commit frequently and test at each significant step! 