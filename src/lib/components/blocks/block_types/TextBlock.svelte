<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();
</script>

<div class="text-block">
	{@html text}
</div>

<style>
	.text-block {
		/* Basic styling for text blocks */
		line-height: 1.6;
	}
</style> 