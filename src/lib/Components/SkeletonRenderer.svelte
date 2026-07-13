<script lang="ts">
	import { sectionRegistry } from '$lib/sectionRegistry';

	let { templateSlug } = $props();

	const Skeleton = $derived(
		sectionRegistry.find(t => t.slug === templateSlug)?.skeleton
	);
</script>

{#if Skeleton}
	<Skeleton />
{:else}
	<div class="px-4 md:px-[8%] my-10">
		<div class="w-full h-40 rounded-xl bg-surface"></div>
	</div>
{/if}
