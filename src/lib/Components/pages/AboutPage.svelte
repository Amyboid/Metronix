<script>
	import { onMount } from 'svelte';
	import { initAdminMode } from './adminMode';

	let { content: previewContent } = $props();
	const c = previewContent ?? {};

	onMount(() => {
		initAdminMode('about');
	});
</script>

<header class="section-header mt-1 flex h-24 w-full items-center pl-6 sm:h-30 md:mt-0 md:pl-[8%]">
	<h1 data-editable="page_heading" class="text-lg font-semibold md:text-xl">{c.page_heading}</h1>
</header>

<section class="mt-8 flex flex-col items-center justify-center gap-6 p-6 md:mt-12 md:w-[65%] md:p-8">
	{#if c.content}
		<p data-editable="content" class="text-sm text-copy sm:text-base leading-relaxed">
			{c.content}
		</p>
	{:else}
		<p class="text-sm text-copy-light italic">
			Content coming soon. Use the admin preview to add content.
		</p>
	{/if}
</section>

<style>
	.section-header {
		border-bottom: 1px solid var(--color-surface);
		border-top: 1px solid var(--color-surface);
		background-color: #dcd8cd36;
	}
</style>
