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
		mobileImagePath = ''
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

<section class="z-10 mx-auto mb-4 md:mb-10 flex h-auto w-full flex-col items-center justify-center gap-10">
	{#if sectionHeading}
		<h1
			class="w-full text-center text-xl font-semibold tracking-wider sm:text-2xl md:text-3xl lg:text-4xl"
		>
			{sectionHeading}
		</h1>
	{/if}
	<section class="h-full w-full py-10 bg-surface">
		{#if desktopImagePath}
			<div
				class="h-card relative z-10 mx-auto flex sm:h-auto w-[90%] flex-col items-center justify-between sm:justify-center-safe gap-10 lg:gap-16 overflow-hidden sm:flex-row md:w-[85%]"
			>
				<div class="flex flex-col gap-1 md:gap-2 md:w-[24%]">
					{#if bannerHeading}
						<h3 class="font-semibold text-sm sm:text-base">{bannerHeading}</h3>
					{/if}
					{#if bannerSubheading}
						<p class="text-black text-xl sm:text-2xl lg:text-4xl font-semibold">{bannerSubheading}</p>
					{/if}
					{#if displayCtaLink && ctaText}
						<a
							data-sveltekit-reload
							class="mt-2 flex items-center tracking-wide sm:text-left"
							href={displayCtaLink}
						>
							<p class="first-letter:uppercase text-sm md:text-base text-link hover:underline">{ctaText}</p>
							<span class="icon-[cil--arrow-right] text-link ml-2 h-4 w-4"></span>
						</a>
					{/if}
				</div>
				<div></div>
				<picture class="md:w-130">
					{#if mobileImagePath}
						<source media="(max-width: 768px)" srcset={img(mobileImagePath)} />
					{/if}
					<img
						src={img(desktopImagePath)}
						alt={bannerHeading}
						class="w-full object-cover sm:h-auto"
						loading="lazy"
					/>
				</picture>
			</div>
		{/if}
	</section>
</section>

<style>
	/* .long-banner-content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 2rem;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.65) 0%,
			rgba(0, 0, 0, 0.1) 60%,
			transparent 100%
		);
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
	.long-banner-cta:hover {
		opacity: 0.85;
	}
	@media (max-width: 768px) {
		.long-banner-heading {
			font-size: 1.25rem;
		}
		.long-banner-subheading {
			font-size: 0.875rem;
		}
	} */
</style>
