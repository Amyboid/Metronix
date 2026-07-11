<script lang="ts">
	import { env } from '$env/dynamic/public';
	import ProductCard from '../ProductCard.svelte';
	const base = env.PUBLIC_ASSET_BASE_URL || '';

	let {
		sectionHeading = '',
		leftMode = 'batch',
		leftProductSlug = '',
		leftHeading = '',
		leftSubheading = '',
		leftLinkTo = '',
		leftLinkValue = '',
		leftCtaText = '',
		leftCtaLink = '',
		leftImage = '',
		leftMobileImage = '',
		rightMode = 'batch',
		rightProductSlug = '',
		rightHeading = '',
		rightSubheading = '',
		rightLinkTo = '',
		rightLinkValue = '',
		rightCtaText = '',
		rightCtaLink = '',
		rightImage = '',
		rightMobileImage = '',
		leftProduct = null,
		rightProduct = null
	}: {
		sectionHeading?: string;
		leftMode?: string;
		leftProductSlug?: string;
		leftHeading?: string;
		leftSubheading?: string;
		leftLinkTo?: string;
		leftLinkValue?: string;
		leftCtaText?: string;
		leftCtaLink?: string;
		leftImage?: string;
		leftMobileImage?: string;
		rightMode?: string;
		rightProductSlug?: string;
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

	function img(path: string) {
		return `${base}/${path}`;
	}
</script>

<section
	class="z-10 mx-auto md:mb-10 flex h-auto w-full flex-col items-center justify-center gap-10 p-0 md:w-[85%] md:p-6 md:px-12 md:pt-0"
>
	{#if sectionHeading}
		<h2
			class="w-full text-center text-xl font-semibold tracking-wider sm:text-2xl md:text-3xl lg:text-4xl"
		>
			{sectionHeading}
		</h2>
	{/if}
	<div class="md:min-w-300 md:h-card-tall grid w-full grid-cols-1 gap-4 md:gap-2 md:grid-cols-3">
		<!-- Left Column -->
		<div class="h-card sm:h-card-tall flex min-w-0 flex-col gap-4 md:col-span-1">
			{#if leftMode === 'single' && leftProduct}
				<a href={leftCtaLink || '#'} class="block h-full w-full">
					<ProductCard product={leftProduct} />
				</a>
			{:else if leftMode === 'batch'}
				{#if leftImage}
					<div
						class="bg-surface relative flex h-full min-h-0 w-full flex-col gap-6 overflow-hidden px-2 pt-10 pb-5 sm:p-8 sm:pt-16 md:rounded-lg"
					>
						<div
							class="flex shrink-0 flex-col items-center-safe justify-center-safe gap-1 px-4 sm:gap-2 md:gap-3"
						>
							{#if leftHeading}
								<h3 class="line-clamp-2 text-center text-xl font-semibold text-black sm:text-3xl">
									{leftHeading}
								</h3>
							{/if}
							{#if leftSubheading}
								<p
									class="line-clamp-2 text-center text-sm font-normal text-balance text-black sm:w-[60%] md:w-auto"
								>
									{leftSubheading}
								</p>
							{/if}
							{#if leftCtaLink && leftCtaText}
								<a
									data-sveltekit-reload
									class="mt-2 flex items-center tracking-wide sm:text-left"
									href={leftCtaLink}
								>
									<p class="text-link text-sm first-letter:uppercase hover:underline">
										{leftCtaText}
									</p>
									<span class="icon-[cil--arrow-right] text-link ml-2 h-4 w-4"></span>
								</a>
							{/if}
						</div>
						<picture class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
							{#if leftMobileImage}
								<source class="" media="(max-width: 768px)" srcset={img(leftMobileImage)} />
							{/if}
							<img
								src={img(leftImage)}
								alt={leftHeading}
								class="h-full object-cover md:h-auto md:w-full"
								loading="lazy"
							/>
						</picture>
					</div>
				{:else}
					<div
						class="bg-surface border-subtle text-copy-light flex h-full min-h-48 items-center justify-center rounded-lg border text-xs"
					>
						No image
					</div>
				{/if}
			{:else}
				<div
					class="bg-surface border-subtle text-copy-light flex h-full min-h-48 items-center justify-center rounded-lg border text-xs"
				>
					Configure left column
				</div>
			{/if}
		</div>

		<!-- Right Column -->
		<div class="h-card sm:h-card-tall flex min-w-0 flex-col gap-4 md:col-span-2">
			{#if rightMode === 'single' && rightProduct}
				<a href={rightCtaLink || '#'} class="block h-full w-full">
					<ProductCard product={rightProduct} />
				</a>
			{:else if rightMode === 'batch'}
				{#if rightImage}
					<div
						class="bg-surface relative flex h-full min-h-0 w-full flex-col gap-6 overflow-hidden px-2 pt-10 pb-5 sm:pt-16 sm:pb-8 md:rounded-lg"
					>
						<div
							class="flex shrink-0 flex-col items-center-safe justify-center-safe gap-1 px-4 sm:gap-2 md:gap-3"
						>
							{#if rightHeading}
								<h3
									class="line-clamp-2 text-center text-xl font-semibold text-black sm:text-3xl lg:text-4xl"
								>
									{rightHeading}
								</h3>
							{/if}
							{#if rightSubheading}
								<p
									class="line-clamp-2 text-center text-sm font-normal text-balance text-black sm:w-[60%] md:text-base lg:w-[40%]"
								>
									{rightSubheading}
								</p>
							{/if}
							{#if rightCtaLink && rightCtaText}
								<a
									data-sveltekit-reload
									class="mt-2 flex items-center tracking-wide sm:text-left"
									href={rightCtaLink}
								>
									<p class="text-link text-sm first-letter:uppercase hover:underline md:text-base">
										{rightCtaText}
									</p>
									<span class="icon-[cil--arrow-right] text-link ml-2 h-4 w-4"></span>
								</a>
							{/if}
						</div>
						<picture class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
							{#if rightMobileImage}
								<source class="" media="(max-width: 768px)" srcset={img(rightMobileImage)} />
							{/if}
							<img
								src={img(rightImage)}
								alt={rightHeading}
								class="h-full object-cover"
								loading="lazy"
							/>
						</picture>
					</div>
				{:else}
					<div
						class="bg-surface border-subtle text-copy-light flex h-full min-h-48 items-center justify-center rounded-lg border text-xs"
					>
						No image
					</div>
				{/if}
			{:else}
				<div
					class="bg-surface border-subtle text-copy-light flex h-full min-h-48 items-center justify-center rounded-lg border text-xs"
				>
					Configure right column
				</div>
			{/if}
		</div>
	</div>
</section>
