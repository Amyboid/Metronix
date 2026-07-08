<script lang="ts">
	import { onMount } from 'svelte';
	import ProductSlider from './section-templates/ProductSlider.svelte';
	import LongBanner from './section-templates/LongBanner.svelte';
	import TwoColumnGrid from './section-templates/TwoColumnGrid.svelte';
	import ProductHighlight from './section-templates/ProductHighlight.svelte';
	import GenericSection from './section-templates/GenericSection.svelte';
	import SkeletonRenderer from './SkeletonRenderer.svelte';

	let { sectionBlueprint } = $props();
	let sectionData = $state<any | null>(null);
	let isLoading = $state(false);
	let container: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			async (entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && !sectionData && !isLoading) {
					isLoading = true;
					try {
						const response = await fetch(`/api/sections?id=${sectionBlueprint.id}`);
						if (response.ok) sectionData = await response.json();
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
	{#if sectionBlueprint.isActive === false}
	{:else if sectionData}
		{#if sectionBlueprint.templateSlug === 'product-slider'}
			<ProductSlider
				sectionHeading={sectionData.config.sectionHeading ?? ''}
				products={sectionData.data ?? []}
				ctaText={sectionData.config.ctaText ?? ''}
				linkTo={sectionData.config.linkTo ?? ''}
				linkValue={sectionData.config.linkValue ?? ''}
			/>
		{:else if sectionBlueprint.templateSlug === 'long-banner'}
			<LongBanner
				sectionHeading={sectionData.config.sectionHeading ?? ''}
				bannerHeading={sectionData.config.bannerHeading ?? ''}
				bannerSubheading={sectionData.config.bannerSubheading ?? ''}
				linkTo={sectionData.config.linkTo ?? ''}
				linkValue={sectionData.config.linkValue ?? ''}
				ctaText={sectionData.config.ctaText ?? ''}
				ctaLink={sectionData.config.ctaLink ?? ''}
				desktopImagePath={sectionData.config.desktopImagePath ?? ''}
				mobileImagePath={sectionData.config.mobileImagePath ?? ''}
			/>
		{:else if sectionBlueprint.templateSlug === 'two-column-grid'}
			<TwoColumnGrid
				sectionHeading={sectionData.config.sectionHeading ?? ''}
				leftMode={sectionData.config.leftMode ?? 'batch'}
				leftProductName={sectionData.config.leftProductName ?? ''}
				leftHeading={sectionData.config.leftHeading ?? ''}
				leftSubheading={sectionData.config.leftSubheading ?? ''}
				leftLinkTo={sectionData.config.leftLinkTo ?? ''}
				leftLinkValue={sectionData.config.leftLinkValue ?? ''}
				leftCtaText={sectionData.config.leftCtaText ?? ''}
				leftCtaLink={sectionData.config.leftCtaLink ?? ''}
				leftImage={sectionData.config.leftImage ?? ''}
				leftMobileImage={sectionData.config.leftMobileImage ?? ''}
				leftProduct={sectionData.leftProduct ?? null}
				rightMode={sectionData.config.rightMode ?? 'batch'}
				rightProductName={sectionData.config.rightProductName ?? ''}
				rightHeading={sectionData.config.rightHeading ?? ''}
				rightSubheading={sectionData.config.rightSubheading ?? ''}
				rightLinkTo={sectionData.config.rightLinkTo ?? ''}
				rightLinkValue={sectionData.config.rightLinkValue ?? ''}
				rightCtaText={sectionData.config.rightCtaText ?? ''}
				rightCtaLink={sectionData.config.rightCtaLink ?? ''}
				rightImage={sectionData.config.rightImage ?? ''}
				rightMobileImage={sectionData.config.rightMobileImage ?? ''}
				rightProduct={sectionData.rightProduct ?? null}
			/>
		{:else if sectionBlueprint.templateSlug === 'product-highlight'}
			<ProductHighlight
				sectionHeading={sectionData.config.sectionHeading ?? ''}
				bannerHeading={sectionData.config.bannerHeading ?? ''}
				bannerSubheading={sectionData.config.bannerSubheading ?? ''}
				linkTo={sectionData.config.linkTo ?? ''}
				linkValue={sectionData.config.linkValue ?? ''}
				ctaText={sectionData.config.ctaText ?? ''}
				ctaLink={sectionData.config.ctaLink ?? ''}
				background={sectionData.config.background ?? ''}
				mobileBackground={sectionData.config.mobileBackground ?? ''}
			/>
		{:else}
			<GenericSection config={sectionData.config ?? {}} schemaDefinition={sectionData.schemaDefinition ?? []} />
		{/if}
	{:else}
		<SkeletonRenderer templateSlug={sectionBlueprint.templateSlug} />
	{/if}
</div>

<style>
	div { transition: opacity 0.4s ease-in-out; }
</style>
