<script lang="ts">
	import { env } from '$env/dynamic/public';
	import ImgSlider from '../ImgSlider.svelte';
	const base = env.PUBLIC_ASSET_BASE_URL || '';

	let {
		sectionHeading = '',
		leftMode = 'batch',
		leftProductName = '',
		leftHeading = '',
		leftSubheading = '',
		leftLinkTo = '',
		leftLinkValue = '',
		leftCtaText = '',
		leftCtaLink = '',
		leftImage = '',
		leftMobileImage = '',
		rightMode = 'batch',
		rightProductName = '',
		rightHeading = '',
		rightSubheading = '',
		rightLinkTo = '',
		rightLinkValue = '',
		rightCtaText = '',
		rightCtaLink = '',
		rightImage = '',
		rightMobileImage = '',
		leftProduct = null,
		rightProduct = null,
	}: {
		sectionHeading?: string;
		leftMode?: string;
		leftProductName?: string;
		leftHeading?: string;
		leftSubheading?: string;
		leftLinkTo?: string;
		leftLinkValue?: string;
		leftCtaText?: string;
		leftCtaLink?: string;
		leftImage?: string;
		leftMobileImage?: string;
		rightMode?: string;
		rightProductName?: string;
		rightHeading?: string;
		rightSubheading?: string;
		rightLinkTo?: string;
		rightLinkValue?: string;
		rightCtaText?: string;
		rightCtaLink?: string;
		rightImage?: string;
		rightMobileImage?: string;
		leftProduct?: any;
		rightProduct?: any;
	} = $props();

	function img(path: string) { return `${base}/${path}`; }
	function autoLink(linkTo: string, linkValue: string) { return '/products/' + (linkValue ?? ''); }
</script>

<section class="two-col-grid mb-10 px-4 md:px-[8%]">
	{#if sectionHeading}
		<h2 class="text-center text-xl font-bold text-gray-900 mb-6">{sectionHeading}</h2>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Left Column -->
		<div class="flex flex-col gap-4">
			{#if leftMode === 'single' && leftProduct}
				<a href="/products/details/{leftProduct.slug}" class="group block">
					<div class="aspect-square rounded-xl overflow-hidden bg-surface border border-subtle">
						{#if leftProduct.mainImagePath}
							<img src={img(leftProduct.mainImagePath)} alt={leftProduct.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
						{:else}
							<div class="w-full h-full flex items-center justify-center text-copy-light text-xs">No image</div>
						{/if}
					</div>
					<p class="mt-2 text-sm font-medium text-copy truncate">{leftProduct.name}</p>
					<p class="text-sm text-primary font-bold">₹{leftProduct.price?.toLocaleString('en-IN')}</p>
				</a>
			{:else if leftMode === 'batch'}
				{#if leftImage}
					<div class="relative rounded-xl overflow-hidden">
						<picture>
							{#if leftMobileImage}
								<source media="(max-width: 768px)" srcset={img(leftMobileImage)} />
							{/if}
							<img src={img(leftImage)} alt={leftHeading} class="w-full h-48 object-cover" loading="lazy" />
						</picture>
						<div class="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 to-transparent rounded-xl">
							{#if leftHeading}
								<h3 class="text-lg font-bold text-white mb-1">{leftHeading}</h3>
							{/if}
							{#if leftSubheading}
								<p class="text-sm text-white/80 mb-2">{leftSubheading}</p>
							{/if}
							{#if leftCtaLink && leftCtaText}
								<a href={leftCtaLink} class="inline-block px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">{leftCtaText}</a>
							{/if}
						</div>
					</div>
				{:else}
					<div class="h-48 rounded-xl bg-surface border border-subtle flex items-center justify-center text-copy-light text-xs">No image</div>
				{/if}
			{:else}
				<div class="h-48 rounded-xl bg-surface border border-subtle flex items-center justify-center text-copy-light text-xs">Configure left column</div>
			{/if}
		</div>

		<!-- Right Column -->
		<div class="flex flex-col gap-4">
			{#if rightMode === 'single' && rightProduct}
				<a href="/products/details/{rightProduct.slug}" class="group block">
					<div class="aspect-square rounded-xl overflow-hidden bg-surface border border-subtle">
						{#if rightProduct.mainImagePath}
							<img src={img(rightProduct.mainImagePath)} alt={rightProduct.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
						{:else}
							<div class="w-full h-full flex items-center justify-center text-copy-light text-xs">No image</div>
						{/if}
					</div>
					<p class="mt-2 text-sm font-medium text-copy truncate">{rightProduct.name}</p>
					<p class="text-sm text-primary font-bold">₹{rightProduct.price?.toLocaleString('en-IN')}</p>
				</a>
			{:else if rightMode === 'batch'}
				{#if rightImage}
					<div class="relative rounded-xl overflow-hidden">
						<picture>
							{#if rightMobileImage}
								<source media="(max-width: 768px)" srcset={img(rightMobileImage)} />
							{/if}
							<img src={img(rightImage)} alt={rightHeading} class="w-full h-48 object-cover" loading="lazy" />
						</picture>
						<div class="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 to-transparent rounded-xl">
							{#if rightHeading}
								<h3 class="text-lg font-bold text-white mb-1">{rightHeading}</h3>
							{/if}
							{#if rightSubheading}
								<p class="text-sm text-white/80 mb-2">{rightSubheading}</p>
							{/if}
							{#if rightCtaLink && rightCtaText}
								<a href={rightCtaLink} class="inline-block px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">{rightCtaText}</a>
							{/if}
						</div>
					</div>
				{:else}
					<div class="h-48 rounded-xl bg-surface border border-subtle flex items-center justify-center text-copy-light text-xs">No image</div>
				{/if}
			{:else}
				<div class="h-48 rounded-xl bg-surface border border-subtle flex items-center justify-center text-copy-light text-xs">Configure right column</div>
			{/if}
		</div>
	</div>
</section>
