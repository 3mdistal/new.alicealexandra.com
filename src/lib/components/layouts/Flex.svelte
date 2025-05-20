<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, direction = 'row', justify = 'start', align = 'start', gap = 16 }: { children: Snippet; direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'; justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'; align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'; gap?: number } = $props();
</script>

<div style="--direction: {direction}; --justify: {justify}; --align: {align}; --gap: {gap}">
    {@render children()}
</div>

<style>
    div {
        display: flex;
        flex-direction: var(--direction);
        justify-content: var(--justify);
        align-items: var(--align);
        gap: var(--gap);
    }
</style>