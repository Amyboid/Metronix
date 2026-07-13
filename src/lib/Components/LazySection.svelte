<script lang="ts">
	import { onMount } from 'svelte';
	import { sectionRegistry } from '$lib/sectionRegistry';
	import GenericSection from './section-templates/GenericSection.svelte';

	let { sectionBlueprint } = $props();
	console.log("Section blueprint: ", sectionBlueprint);

	let sectionData = $state<any | null>(null);
	let isLoading = $state(false);
	let container: HTMLElement;

	const template = $derived(
		sectionRegistry.find(t => t.slug === sectionBlueprint.templateSlug)
	);
	const Component = $derived(template?.component);
	const Skeleton = $derived(template?.skeleton);

	onMount(() => {
		const observer = new IntersectionObserver(
			async (entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && !sectionData && !isLoading) {
					isLoading = true;
					try {
						const response = await fetch(`/api/sections?id=${sectionBlueprint.id}`);
						if (response.ok) sectionData = await response.json();
						console.log("Section Data: ",sectionData);

					} catch (error) {
						console.error(`Error loading section ${sectionBlueprint.id}:`, error);
					} finally { isLoading = false; }
				}
			},
			{ rootMargin: '250px' }
		);
		if (container) observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<div bind:this={container} class="min-h-25 w-full">
	{#if sectionBlueprint.isActive !== false}
		{#if sectionData}
			{#if Component}
				<Component {...sectionData.config} data={sectionData.data} />
			{:else}
				<GenericSection config={sectionData.config ?? {}} schemaDefinition={sectionData.schemaDefinition ?? []} />
			{/if}
		{:else if Skeleton}
			<Skeleton />
		{:else}
			<div class="px-4 md:px-[8%] my-10">
				<div class="w-full h-40 rounded-xl bg-surface"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	div { transition: opacity 0.4s ease-in-out; }
</style>
