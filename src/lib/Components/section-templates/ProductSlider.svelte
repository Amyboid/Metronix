<script lang="ts">
    import ImgSlider from '../ImgSlider.svelte';

    let { heading, products, ctaLink } = $props<{
        heading: string;
        products: any[]; 
        ctaLink: string;
    }>();
    console.log("products: ", products);
    
</script>

<section class="z-10 mb-10 flex h-auto w-[90%] flex-col items-center justify-center gap-10 md:w-[85%] mx-auto">
    <h1 class="w-full text-center text-xl font-semibold tracking-wider sm:text-2xl md:text-3xl lg:text-4xl">
        {heading}
    </h1>

    <ImgSlider images={products} />

    <a data-sveltekit-reload class="-mt-1 flex items-center tracking-wide sm:text-left" href={ctaLink}>
        <p class="text-link hover:underline">Shop All <span class="lowercase">{heading}</span></p>
        <span class="icon-[cil--arrow-right] ml-2 h-4 w-4 text-link"></span>
    </a>
</section>