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
		desktopImagePath = '',
		mobileImagePath = '',
	}: {
		sectionHeading?: string;
		bannerHeading?: string;
		bannerSubheading?: string;
		linkTo?: string;
		linkValue?: string;
		ctaText?: string;
		ctaLink?: string;
		desktopImagePath?: string;
		mobileImagePath?: string;
	} = $props();

	const autoCtaLink = $derived('/products/' + (linkValue ?? ''));
	const displayCtaLink = $derived(ctaLink || autoCtaLink);

	function img(path: string) {
		return `${base}/${path}`;
	}
</script>

<section class="long-banner mb-10 px-4 md:px-[8%]">
	{#if sectionHeading}
		<h2 class="text-center text-xl font-bold text-gray-900 mb-4">{sectionHeading}</h2>
	{/if}

	{#if desktopImagePath}
		<div class="relative rounded-2xl overflow-hidden">
			<picture>
				{#if mobileImagePath}
					<source media="(max-width: 768px)" srcset={img(mobileImagePath)} />
				{/if}
				<img src={img(desktopImagePath)} alt={bannerHeading} class="w-full h-64 md:h-80 object-cover" loading="lazy" />
			</picture>

			<div class="long-banner-content">
				{#if bannerHeading}
					<h3 class="long-banner-heading">{bannerHeading}</h3>
				{/if}
				{#if bannerSubheading}
					<p class="long-banner-subheading">{bannerSubheading}</p>
				{/if}
				{#if displayCtaLink && ctaText}
					<a href={displayCtaLink} class="long-banner-cta">{ctaText}</a>
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.long-banner-content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 2rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%);
	}
	.long-banner-heading {
		font-size: 1.75rem;
		font-weight: 700;
		color: #fff;
		margin: 0 0 0.5rem;
		line-height: 1.2;
	}
	.long-banner-subheading {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.85);
		margin: 0 0 1rem;
	}
	.long-banner-cta {
		display: inline-block;
		padding: 0.6rem 1.5rem;
		background: var(--color-primary, #0bacc5);
		color: #fff;
		border-radius: 0.5rem;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		transition: opacity 0.2s;
		width: fit-content;
	}
	.long-banner-cta:hover { opacity: 0.85; }
	@media (max-width: 768px) {
		.long-banner-heading { font-size: 1.25rem; }
		.long-banner-subheading { font-size: 0.875rem; }
	}
</style>
