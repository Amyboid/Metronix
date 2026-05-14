<script lang="ts">
	import { onMount } from 'svelte';
	import ProductSlider from './section-templates/ProductSlider.svelte';
	// import LongBanner from './LongBanner.svelte';
	import SkeletonRenderer from './SkeletonRenderer.svelte';

	// Get the blueprint (ID and Template Type) from the +page.svelte loop
	let { sectionBlueprint } = $props();
	console.log('section blueprint inside LazySection:', sectionBlueprint);

	// The data we fetch from the API
	let sectionData = $state<any | null>(null);
	let isLoading = $state(false);
	let container: HTMLElement;

	onMount(() => {
		// Create the observer
		const observer = new IntersectionObserver(
			async (entries) => {
				const entry = entries[0];

				// Trigger if the container is within 250px of the viewport
				// and we haven't started loading yet
				if (entry.isIntersecting && !sectionData && !isLoading) {
					isLoading = true;

					try {
						const response = await fetch(`/api/sections?id=${sectionBlueprint.id}`);
						if (response.ok) {
							sectionData = await response.json();
						}
					} catch (error) {
						console.error(`Error loading section ${sectionBlueprint.id}:`, error);
					} finally {
						isLoading = false;
					}
				}
			},
			{
				// rootMargin of 250px means it starts fetching
				// before the user actually reaches the section
				rootMargin: '250px'
			}
		);

		if (container) {
			observer.observe(container);
		}

		// Cleanup observer when component is destroyed
		return () => observer.disconnect();
	});
</script>

<div bind:this={container} class="min-h-25 w-full">
	{#if sectionData}
		{#if sectionBlueprint.templateSlug === 'product-slider'}
			<ProductSlider
				heading={sectionData.config.heading ?? 'Default Title'}
				products={sectionData.data ?? []}
				ctaLink={sectionData.config.ctaLink ?? '/'}
			/>
			<!-- {:else if sectionBlueprint.templateSlug === 'long-banner'}
            <LongBanner 
                title={sectionData.config.title}
                imagePath={sectionData.config.imagePath}
                ctaLink={sectionData.config.ctaLink}
            /> -->
		{/if}
	{:else}
		<SkeletonRenderer templateSlug={sectionBlueprint.templateSlug} />
	{/if}
</div>

<style>
	/* Small buffer to ensure the observer has a target to watch */
	div {
		transition: opacity 0.4s ease-in-out;
	}
</style>
