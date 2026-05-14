<script lang="ts">
    // We mimic the layout structure of ProductSlider and ImgSlider combined
</script>

<section class="z-10 mb-10 flex h-auto w-[90%] flex-col items-center justify-center gap-10 md:w-[85%] mx-auto">
    <div class="h-10 w-64 rounded-lg bg-surface"></div>

    <div class="relative mb-10 flex w-full items-center justify-center">
        <div class="flex w-full overflow-hidden rounded-lg gap-2 sm:gap-0">
            {#each Array(3) as _, i}
                <div class="img-slider-img-box h-full rounded-lg {i > 0 ? 'hidden sm:block' : 'block'}">
                    <div class="img-slider-img flex h-100 w-full flex-col items-center justify-center gap-10 rounded-lg px-5">
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    /* Exact match of your ImgSlider styles */
    .img-slider-img-box {
        flex-shrink: 0;
        flex-grow: 0;
        width: 100%; /* Mobile default */
    }

    .img-slider-img {
        /* Matching your exact background gradient */
        background: var(--color-surface);
    }

    /* Responsive logic matching your media queries */
    @media only screen and (min-width: 640px) {
        .img-slider-img-box {
            width: calc(100% / 2);
        }
    }
    @media only screen and (min-width: 768px) {
        .img-slider-img-box {
            width: calc(100% / 3);
        }
    }
</style>