<script lang="ts">
	import { env } from '$env/dynamic/public';
	const base = env.PUBLIC_ASSET_BASE_URL || '';

	let {
		sectionHeading = '',
		bannerHeading = '',
		bannerSubheading = '',
		linkTo = '',
		linkValue = '',
		ctaText = '',
		ctaLink = '',
		background = '',
		mobileBackground = '',
	}: {
		sectionHeading?: string;
		bannerHeading?: string;
		bannerSubheading?: string;
		linkTo?: string;
		linkValue?: string;
		ctaText?: string;
		ctaLink?: string;
		background?: string;
		mobileBackground?: string;
	} = $props();

	const autoCtaLink = $derived('/products/' + (linkValue ?? ''));
	const displayCtaLink = $derived(ctaLink || autoCtaLink);

	function img(path: string) { return `${base}/${path}`; }
</script>

<section class="product-highlight mb-10 px-4 md:px-[8%]">
	{#if sectionHeading}
		<h2 class="text-center text-xl font-bold text-gray-900 mb-4">{sectionHeading}</h2>
	{/if}

	<div class="relative rounded-2xl overflow-hidden">
		{#if background}
			<picture>
				{#if mobileBackground}
					<source media="(max-width: 768px)" srcset={img(mobileBackground)} />
				{/if}
				<img src={img(background)} alt={bannerHeading} class="w-full h-64 md:h-80 object-cover" loading="lazy" />
			</picture>
		{:else}
			<div class="w-full h-64 md:h-80 bg-gradient-to-br from-primary/10 to-brand/10"></div>
		{/if}

		<div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black/50 to-transparent">
			{#if bannerHeading}
				<h3 class="text-2xl md:text-3xl font-bold text-white mb-2">{bannerHeading}</h3>
			{/if}
			{#if bannerSubheading}
				<p class="text-sm md:text-base text-white/80 mb-4">{bannerSubheading}</p>
			{/if}
			{#if displayCtaLink && ctaText}
				<a href={displayCtaLink} class="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">{ctaText}</a>
			{/if}
		</div>
	</div>
</section>
