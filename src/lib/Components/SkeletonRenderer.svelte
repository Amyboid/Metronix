<script lang="ts">
	import SliderSkeleton from "./skeletons/SliderSkeleton.svelte";
	import LongBannerSkeleton from "./skeletons/LongBannerSkeleton.svelte";
	import TwoColumnGridSkeleton from "./skeletons/TwoColumnGridSkeleton.svelte";
	import ProductHighlightSkeleton from "./skeletons/ProductHighlightSkeleton.svelte";

	let { templateSlug } = $props();
</script>

{#if templateSlug === 'product-slider'}
	<SliderSkeleton />
{:else if templateSlug === 'long-banner'}
	<LongBannerSkeleton />
{:else if templateSlug === 'two-column-grid'}
	<TwoColumnGridSkeleton />
{:else if templateSlug === 'product-highlight'}
	<ProductHighlightSkeleton />
{:else}
	<div class="px-4 md:px-[8%] my-10">
		<div class="w-full h-40 rounded-xl bg-surface shimmer"></div>
	</div>
{/if}

<style>
	.shimmer {
		background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
