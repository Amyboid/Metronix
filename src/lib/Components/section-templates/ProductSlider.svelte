<script lang="ts">
    import ImgSlider from '../ImgSlider.svelte';

    let { sectionHeading, products, ctaText, linkTo, linkValue } = $props<{
        sectionHeading: string;
        products: any[];
        ctaText?: string;
        linkTo?: string;
        linkValue?: string;
    }>();
console.log("Prod: ", products);

    const ctaLink = $derived('/products/' + (linkValue ?? ''));
    const displayText = $derived(ctaText || 'Shop All');
</script>

<section class=" p-4 pt-0 sm:pt-0 md:p-6 md:px-12 md:pt-0 w-[90%] md:w-[85%] z-10 mb-10 flex h-auto flex-col items-center justify-center gap-10 md:w-[85%] mx-auto">
    <h1 class="w-full text-center text-xl font-semibold tracking-wider sm:text-2xl md:text-3xl lg:text-4xl">
        {sectionHeading}
    </h1>

    <ImgSlider images={products} />

    <a data-sveltekit-reload class="-mt-1 flex items-center tracking-wide sm:text-left" href={ctaLink}>
        <p class="text-link hover:underline">{displayText}</p>
        <span class="icon-[cil--arrow-right] ml-2 h-4 w-4 text-link"></span>
    </a>
</section>
