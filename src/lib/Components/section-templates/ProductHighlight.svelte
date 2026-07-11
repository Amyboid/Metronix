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
		mobileBackground = ''
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

	function img(path: string) {
		return `${base}/${path}`;
	}
</script>

<section
	class="z-10 mx-auto mb-4 md:mb-10 flex h-auto w-full flex-col items-center justify-center gap-10 p-0 md:w-[85%] md:p-6 md:px-12 md:pt-0"
>
	{#if sectionHeading}
		<h2 class="mb-4 text-center text-xl font-bold text-gray-900">{sectionHeading}</h2>
	{/if}

	<div class="md:h-card w-full md:min-w-300">
		{#if background}
			<div
				class="bg-surface relative flex h-full min-h-0 w-full flex-col gap-6 overflow-hidden px-2 pt-10 pb-5 sm:pt-16 sm:pb-8 md:rounded-lg"
			>
				<div
					class="flex shrink-0 flex-col items-center-safe justify-center-safe gap-1 px-4 sm:gap-2 md:gap-3"
				>
					{#if bannerHeading}
						<h3
							class="line-clamp-2 text-center text-xl font-semibold text-black sm:text-3xl lg:text-4xl"
						>
							{bannerHeading}
						</h3>
					{/if}
					{#if bannerSubheading}
						<p
							class="line-clamp-2 text-center text-sm font-normal text-balance text-black sm:w-[60%] md:text-base lg:w-[40%]"
						>
							{bannerSubheading}
						</p>
					{/if}
					{#if displayCtaLink && ctaText}
						<a
							data-sveltekit-reload
							class="mt-2 flex items-center tracking-wide sm:text-left"
							href={displayCtaLink}
						>
							<p class="text-link text-sm first-letter:uppercase hover:underline md:text-base">
								{ctaText}
							</p>
							<span class="icon-[cil--arrow-right] text-link ml-2 h-4 w-4"></span>
						</a>
					{/if}
				</div>
				<picture class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
					{#if mobileBackground}
						<source class="" media="(max-width: 768px)" srcset={img(mobileBackground)} />
					{/if}
					<img
						src={img(background)}
						alt={bannerHeading}
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
	</div>
</section>
