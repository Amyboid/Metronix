<script>
	import ProductCard from '$lib/Components/ProductCard.svelte';
	import { fetchProductsFiltered } from '$lib/data/products.js';
	import { getImagePath } from '$lib/utils/imageImports';
 
	let { data } = $props();
	let items = $state(data.items);
	let currentPage = $state(1);
	let isLoading = $state(false);
	let errorLoadingMore = $state(); 

	const totalProducts = $derived(data.totalProducts);
	const totalPages = $derived(data.totalPages);
	const currentLimit = $derived(data.limit);
	const productType = $derived(data.productType);

	const filterType = $derived(data.filterType);
	const filterValue = $derived(data.filterValue);

	async function loadMore() {
		if (currentPage >= totalPages || isLoading) {
			return;
		}

		isLoading = true;
		errorLoadingMore = null;
		try {
			const nextPage = currentPage + 1;
			const response = await fetchProductsFiltered(
				fetch,
				filterType,
				filterValue,
				nextPage,
				currentLimit,
				undefined,
				true
			);

			items = [...items, ...response.products];
			currentPage = nextPage;
		} catch (err) {
			console.error('Failed to load more products:', err);
			errorLoadingMore = 'Failed to load more products. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<section
	class="hero mb-6 flex w-full min-w-80 flex-col bg-[var(--primary-background)] pt-2 sm:mb-12 sm:flex-row md:p-0"
>
	<div
		class="hero-left z-10 flex h-[30%] w-full flex-col items-center justify-center p-2 sm:h-full sm:w-[40%] sm:items-baseline sm:pb-4 sm:pl-6 md:p-8 md:pl-[8%]"
	>
		<h1
			class="mb-4 pb-1 text-center text-2xl font-bold tracking-widest sm:mb-4 sm:pt-0 sm:text-left sm:text-3xl md:mb-6 md:pr-24 md:text-5xl"
		>
			{data.banner?.msg}
		</h1>

		<a
			class="flex items-center text-base tracking-wide text-blue-700 sm:text-left md:text-xl"
			href={'#' + data.productType}
		>
			<p class="text-sm hover:underline sm:text-base">Find Your {data.productType} today</p>
			<span class="icon-[cil--arrow-right] ml-2 h-9 w-4 md:h-6 md:w-6"></span>
		</a>
	</div>
	<div
		class="hero-right z-20 flex h-[70%] w-full justify-center sm:h-full sm:w-[60%] sm:pr-6 md:justify-end md:pr-[8%]"
	>
		<div
			class="hero-img flex items-center justify-center p-3 sm:items-center sm:pb-10 md:justify-end md:p-0"
		>
			{#if data.banner}
				<enhanced:img
					class="w-[500px] md:w-[650px]"
					src={getImagePath(data.banner.src)}
					alt={data.banner.src}
				></enhanced:img>
			{/if}
		</div>
	</div>
</section>

<header
	id={data.productType}
	class="section-header mb-12 flex h-12 w-[90%] items-center sm:h-14 md:w-[85%]"
>
	<h1 class="text-base font-semibold md:text-lg">
		Find perfect {data.productType} for you.
	</h1>
</header>

<section class="product-section mb-12 grid h-auto w-[90%] gap-2 md:w-[85%]">
	{#each items as item (item._id)}
		<ProductCard product={item} />
	{/each}
</section>

<div class="load-more-container relative mb-12 w-[90%] text-center md:w-[85%]">
	{#if errorLoadingMore}
		<p class="mb-4 text-red-500">{errorLoadingMore}</p>
	{/if}

	{#if currentPage < totalPages}
		<button
			onclick={loadMore}
			disabled={isLoading}
			class="load-more-section-msg absolute flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:pr-4 sm:pl-4 md:tracking-widest"
		>
			{#if isLoading}
				<p class="text-gray-400">Loading...</p>
			{:else}
				<p class="flex items-center gap-1">
					Load more
					<span class="icon-[ri--arrow-down-s-line] -mb-1"></span>
				</p>
			{/if}
		</button>
	{:else if totalProducts > 0}
		<div class="load-more-section-msg absolute w-full p-2 text-gray-400 sm:pr-4 sm:pl-4">
			You've reached the end of the products!
		</div>
	{:else}
		<p class="load-more-section-msg absolute p-2 text-gray-400 sm:pr-4 sm:pl-4">
			No products found for this item.
		</p>
	{/if}
</div>

<style>
	.hero-right {
		background: linear-gradient(to bottom, #dcd8cd 0%, #efefef 100%);
	}

	.hero {
		height: 75vh;
	}
	.hero-img {
		height: 100%;
		overflow: hidden;
	}
	.section-header {
		border-bottom: 1px solid var(--primary-background);
	}

	.product-section {
		grid-template-columns: repeat(1, 1fr);
		place-content: center;
	}

	.load-more-section-msg {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--neutral);
	}

	.load-more-section-msg:disabled {
		cursor: not-allowed;
	}

	@media only screen and (min-width: 640px) {
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
		.load-more-container {
			border-top: 1px solid var(--primary-background);
		}
	}

	@media only screen and (min-width: 768px) {
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
	}
</style>
