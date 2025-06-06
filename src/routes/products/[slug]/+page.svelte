<script>
	import ProductCard from '$lib/Components/ProductCard.svelte';

	let { data } = $props();
</script>

<section
	class="hero mb-6 flex w-full min-w-80 flex-col bg-[var(--primary-background)] p-0 sm:flex-row md:p-0"
>
	<div
		class="hero-left z-20 flex h-[40%] w-full flex-col items-center justify-center sm:h-full sm:w-[40%] sm:items-baseline sm:pb-4 sm:pl-6 md:p-8 md:pl-[8%]"
	>
		<h1
			class="mb-4 pb-1 text-center text-3xl font-bold tracking-widest sm:mb-4 sm:pt-0 sm:text-left sm:text-3xl md:mb-6 md:pr-24 md:text-5xl"
		>
			{data.banner?.msg}
		</h1>

		<a
			class="flex items-center text-base tracking-wide text-blue-700 sm:text-left md:text-xl"
			href="/#"
		>
			<p class="text-sm hover:underline sm:text-base">Find Your {data.productType} today</p>
			<span class="icon-[cil--arrow-right] ml-2 h-9 w-4 md:h-6 md:w-6"></span>
		</a>
	</div>
	<div
		class="hero-right z-10 flex h-[60%] w-full justify-center sm:h-full sm:w-[60%] sm:pr-6 md:justify-end md:pr-[8%]"
	>
		<div
			class="hero-img flex items-end justify-center sm:items-center sm:pb-10 md:justify-end md:p-0"
		>
			<picture>
				<source srcset={'/assets/' + data.banner?.src + '.png'} media="(min-width: 768px)" />
				<img
					class="w-[500px] md:w-[650px]"
					loading="lazy"
					src={'/assets/' + data.banner?.src + '.png'}
					alt="products-img"
				/>
			</picture>
		</div>
	</div>
</section>

<header class="section-header w-full mb-6 flex items-center pl-[5%] md:pl-[7%] h-12 sm:h-14">
	<h1 class="text-base md:text-lg font-semibold">
		Find perfect {data.productType} for you.
	</h1>
</header>

<section class="product-section mb-10 grid h-auto w-[90%] gap-4 md:w-[85%]">
	{#each data.items as item}
		<ProductCard product={item} />
	{/each}
</section>

<style>
	.hero-right {
		background: linear-gradient(to bottom, #dcd8cd 0%, #efefef 100%);
	}

	.hero {
		height: 70vh;
	}
	.hero-img {
		height: 100%;
		overflow: hidden;
	}
.section-header{
	/* background: var(--primary-background); */
	border-top: 1px solid var(--primary-background);
	border-bottom: 1px solid var(--primary-background);
}

	.product-section {
		grid-template-columns: repeat(1, 1fr);
		place-content: center;
	}

	@media only screen and (min-width: 640px) {
		/* sm */
		.hero {
			height: 50vh;
		}
		.hero-right {
			background: linear-gradient(to right, #dcd8cd 0%, #efefef 100%);
		}
		.hero-img {
			width: 100%;
			height: 100%;
			/* border: 1px solid plum; */
		}
		.product-section {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media only screen and (min-width: 768px) {
		/* md */

		.hero {
			height: 60vh;
			max-height: 422px;
		}
		.hero-img {
			width: 722px;
			height: 100%;
		}
		.product-section {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
	}
</style>
