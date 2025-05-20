<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, columns = 12, rows = 1, gap = 16 }: { children: Snippet; columns?: number; rows?: number; gap?: number } = $props();
</script>

<div style="--columns: {columns}; --rows: {rows}; --gap: {gap}">
    {@render children()}
</div>

<style>
    div {
        display: grid;
        grid-template-columns: repeat(var(--columns), 1fr);
        grid-template-rows: repeat(var(--rows), 1fr);
        /* TODO: Make gap dynamic size */
        gap: var(--gap);
    }
</style>