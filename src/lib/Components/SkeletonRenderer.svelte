<script lang="ts">
	import SliderSkeleton from "./skeletons/SliderSkeleton.svelte";

    let { templateSlug } = $props();
</script>

{#if templateSlug === 'product-slider'}
    <SliderSkeleton></SliderSkeleton>
{:else if templateSlug === 'long-banner'}
    <div class="px-4 md:px-[8%] my-10">
        <!-- <div class="h-[450px] w-full rounded-3xl bg-gray-200/50 animate-shimmer"></div> -->
    </div>

{:else}
    <!-- <div class="h-40 w-full bg-gray-100 animate-shimmer"></div> -->
{/if}