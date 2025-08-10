<script>
	// @ts-nocheck

	import { fade, fly } from 'svelte/transition';
	import ImgSlider from '$lib/Components/ImgSlider.svelte';
	import { getImagePath } from '$lib/utils/imageImports';
	import { fetchSearchResult } from '$lib/data/products';
	let { data } = $props();
	const { entertainmentEssentials, selfCareEssentials, kitchenEssentials } = data;

	let debounceTimer;
	let searchQuery = $state('');
	let isFocused = $state(false);
	let searchinput = $state();
	let clearSearch = () => {
		searchQuery = '';
		if (searchinput) {
			searchinput.focus();
		}
	};

	let buttons = [
		{ id: 'product', label: 'Browse by Product' },
		{ id: 'category', label: 'Browse by Category' }
	];
	let activeButton = $state('product');
	let productIcons = [
		'ac',
		'chimney',
		'fridge',
		'oven',
		'ro',
		'speaker',
		'fan',
		'stove',
		'tv',
		'washing-machine'
	];
	let categoryIcons = [
		'Consumer-Electronics',
		'Home-Appliances',
		'Kitchen-Appliances',
		'Self-Care-Appliances'
	];

	let productData = [
		{
			heading: 'Entertainment Essentials',
			images: entertainmentEssentials.length > 2 ? entertainmentEssentials : null,
			msg: 'entertainment essentials',
			link: 'consumer-electronics'
		},
		{
			heading: 'Self-Care Essentials',
			images: selfCareEssentials.length > 2 ? selfCareEssentials : null,
			msg: 'self-care essentials',
			link: 'self-care-appliances'
		},
		{
			heading: 'Kitchen Essentials',
			images: kitchenEssentials.length > 2 ? kitchenEssentials : null,
			msg: 'kitchen essentials',
			link: 'kitchen-appliances'
		}
	];

	let showMore = $state(true);
	let productIconRow = $state(0);
	let categoryIconRow = $state(0);
	let searchResult = $state([]);
	let dummyResult = $state([]);
	function handleSearch() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			if (searchQuery) {
				searchResult = await fetchSearchResult(fetch, searchQuery);
			}
		}, 500);
	}

	// Function to update size based on window width
	function updateSize() {
		const width = window.innerWidth;
		if (width >= 1024) {
			productIconRow = Math.ceil(productIcons.length / 4);
			categoryIconRow = Math.ceil(categoryIcons.length / 4);
		} else if (width >= 768) {
			productIconRow = Math.ceil(productIcons.length / 3);
			categoryIconRow = Math.ceil(categoryIcons.length / 3);
		} else if (width >= 640) {
			productIconRow = Math.ceil(productIcons.length / 3);
			categoryIconRow = Math.ceil(categoryIcons.length / 3);
		} else {
			productIconRow = Math.ceil(productIcons.length / 2);
			categoryIconRow = Math.ceil(categoryIcons.length / 2);
		}
	}

	// Update size on window resize
	$effect(() => {
		updateSize();
		window.addEventListener('resize', updateSize);
		return () => window.removeEventListener('resize', updateSize);
	});
</script>

<section
	class="hero mb-12 flex w-full min-w-80 flex-col bg-[var(--primary-background)] pt-4 sm:p-0 sm:mb-18 sm:flex-row md:p-0"
>
	<div
		class="hero-left z-20 flex h-[40%] w-full flex-col items-center justify-center sm:h-full sm:w-[40%] sm:items-baseline sm:pb-4 sm:pl-6 md:p-8 md:pl-[8%]"
	>
		<h1
			class="mb-4 pb-1 text-center text-3xl font-bold tracking-widest sm:mb-4 sm:pt-0 sm:text-left sm:text-3xl md:mb-6 md:pr-24 md:text-5xl"
		>
			Product at your fingertips.
		</h1>
		<h3
			class="mb-1 w-[80%] text-center text-base tracking-wide sm:mb-6 sm:text-left md:pr-6 md:text-xl"
		>
			Get washing machine, Samsung tv, fridge and many more.
		</h3>
		<a
			class="flex items-center text-base tracking-wide text-blue-700 sm:text-left md:text-xl"
			href="/products/fridge"
		>
			<p class="text-sm hover:underline sm:text-base">Shop godrej refrigerator</p>
			<span class="icon-[cil--arrow-right] ml-2 h-9 w-4 md:h-6 md:w-6"></span>
		</a>
	</div>
	<div
		class="hero-right z-10 flex h-[60%] w-full justify-center sm:h-full sm:w-[60%] sm:pr-6 md:justify-end md:pr-[8%]"
	>
		<!-- todo : shadow on images for desktop only  -->
		<div
			class="hero-img flex items-end justify-center sm:items-center sm:pb-10 md:justify-end md:p-0"
		>
			<enhanced:img
				class="w-[500px] md:w-[650px]"
				loading="lazy"
				src="$lib/assets/bg/big2.png"
				alt="products-img"
			/>
		</div>
	</div>
</section>
<section
	class="main-section flex w-full min-w-80 flex-col items-center gap-10 p-4 pt-0 sm:pt-0 md:p-6 md:px-12 md:pt-0"
>
	<section
		class="find-product-section mb-2 flex w-[328px] flex-col items-center gap-4 sm:mb-8 sm:w-[395px] md:w-[520px]"
	>
		{#if isFocused}
			<button
				onclick={() => (isFocused = false)}
				aria-label="blur-background"
				class="blur-background absolute top-0 left-0 z-40 h-full w-full"
			>
			</button>
		{/if}
		<h1
			class="m-2 text-center text-xl font-medium tracking-wide sm:text-2xl md:text-3xl md:tracking-wider"
		>
			Find the perfect product for you.
		</h1>

		<!-- search box -->
		<div class="search-box relative z-50 flex w-full flex-col items-center">
			<div class="relative flex w-full items-center justify-center">
				<button
					aria-label="search"
					class="absolute left-7 flex h-full items-center sm:left-3.5 md:left-4"
				>
					<span
						class="icon-[basil--search-outline] h-6 w-6 cursor-pointer sm:h-7 sm:w-7 lg:h-8 lg:w-8"
					></span>
				</button>
				<input
					class="search-input h-[55px] w-[90%] rounded-lg bg-[var(--neutral)] text-base outline-none focus:bg-[var(--neutral)] sm:h-[55px] sm:w-full md:h-[60px] {searchQuery &&
					isFocused
						? 'remove-border'
						: 'block'}"
					type="text"
					aria-label="search for product"
					placeholder="Search for product"
					bind:this={searchinput}
					bind:value={searchQuery}
					oninput={handleSearch}
					onfocus={() => (isFocused = true)}
				/>
				{#if searchQuery}
					<button
						aria-label="clear-search"
						class="absolute right-7 flex h-full items-center sm:right-3.5 md:right-4"
						onclick={clearSearch}
					>
						<span class="icon-[mdi--clear] h-4 w-4 cursor-pointer md:h-5 md:w-5"></span>
					</button>
				{/if}
			</div>
			<!-- search results  -->

			{#if searchQuery && isFocused}
				<div
					class="search-result absolute top-[55px] w-[90%] overflow-scroll bg-[var(--neutral)] sm:w-full md:top-[60px]"
				>
					<p class="p-2 pl-3 text-xs text-[#9d9d9d] sm:text-sm md:p-3 md:text-sm">Search Results</p>
					<!-- search results -->
					<ul class="search-results mb-4">
						{#if searchResult}
							{#each searchResult as item}
								<a href={'/products/cart/' + item.src}>
									<li
										class="flex cursor-pointer items-center gap-2 p-2 pr-3 pl-3 text-xs transition-all hover:bg-[var(--primary-background)] hover:underline sm:text-sm md:pr-4 md:pl-4 md:text-sm"
									>
										<span class="icon-[basil--search-outline] h-3 w-3 md:h-4 md:w-4"
										></span>{item.name}
									</li>
								</a>
							{/each}
						{:else}
							jii
						{/if}
					</ul>
				</div>
			{/if}
		</div>
	</section>
	<section class="w-[90%] md:w-[85%]">
		<ul class="product-nav flex w-full items-center justify-center gap-20">
			{#each buttons as button}
				<li>
					<button
						onclick={() => {
							activeButton = button.id;
							showMore = true;
						}}
						class="nav-btn {activeButton === button.id ? 'active' : ''}"
					>
						{button.label}
					</button>
				</li>
			{/each}
		</ul>
		<div class="flex w-full flex-col items-center justify-center gap-10 pt-10 pb-10">
			{#if activeButton === 'product'}
				<div
					in:fade
					class="browse-by grid gap-6 overflow-hidden transition-all duration-500 ease-in-out md:gap-10 {showMore
						? 'h-[344px] sm:h-[160px] md:h-[192px]'
						: 'show-less-product'}"
					style="--height: {productIconRow};"
				>
					{#each productIcons as productIcon}
						<a
							data-sveltekit-reload
							href={'/products/' + productIcon}
							class="flex h-[160px] flex-col items-center gap-2 md:h-[192px]"
						>
							<div class="product-icon w-32 cursor-pointer p-9 md:w-40 md:p-12">
								<enhanced:img
									src={getImagePath('search/product/' + productIcon)}
									alt={productIcon}
								/>
							</div>
							<p class="text-center text-xs md:text-sm">{productIcon.split('-').join(' ')}</p>
						</a>
					{/each}
				</div>
			{/if}
			{#if activeButton === 'category'}
				<div
					in:fade
					class="browse-by grid gap-6 overflow-hidden transition-all duration-500 ease-in-out md:gap-10 {showMore
						? 'h-[344px] sm:h-[160px] md:h-[192px]'
						: 'show-less-category'}"
					style="--height: {categoryIconRow};"
				>
					{#each categoryIcons as categoryIcon}
						<a
							href={'/products/category/' + categoryIcon.toLowerCase()}
							class="flex h-[160px] flex-col items-center gap-2 md:h-[192px]"
						>
							<div class="category-icon h-32 w-32 cursor-pointer p-9 md:h-40 md:w-40 md:p-12">
								<enhanced:img
									src={getImagePath('search/category/' + categoryIcon)}
									alt={categoryIcon}
								/>
							</div>
							<p class="text-center text-xs md:text-sm">{categoryIcon.replaceAll('-', ' ')}</p>
						</a>
					{/each}
				</div>
			{/if}
			<button
				class="show-more-btn flex h-10 w-full cursor-pointer items-center justify-center"
				onclick={() => (showMore = !showMore)}
			>
				<div class="relative -top-5">
					<p class="flex items-center gap-1 text-blue-700">
						Show
						{#if showMore}
							more
							<span class="icon-[ri--arrow-down-s-line] -mb-1"></span>
						{:else}
							less
							<span class="icon-[ri--arrow-up-s-line] -mb-1"></span>
						{/if}
					</p>
				</div>
			</button>
		</div>
	</section>

	{#each productData as product}
		{#if product.images}
			<section
				class="z-10 mb-10 flex h-auto w-[90%] flex-col items-center justify-center gap-10 md:w-[85%]"
			>
				<h1
					class="w-full text-center text-xl font-semibold tracking-wider sm:text-2xl md:text-3xl lg:text-4xl"
				>
					{product.heading}
				</h1>
				<ImgSlider images={product.images} />
				<a
					class="-mt-1 flex items-center tracking-wide sm:text-left"
					href={'/products/category/' + product.link}
				>
					<p class="text-blue-700 hover:underline">shop all {product.msg}</p>
					<span class="icon-[cil--arrow-right] ml-2 h-4 w-4 text-blue-700"></span>
				</a>
			</section>
		{/if}
	{/each}
</section>

<style>
	.search-input {
		border: 1px solid black;
		padding: 8px 48px;
	}
	.remove-border {
		border: 0;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.hero-right {
		background: linear-gradient(to bottom, #dcd8cd 0%, #efefef 100%);
	}
	.find-product-section input:focus {
		border-color: #1447e6;
	}
	.search-result {
		box-shadow: 0 4px 4px -4px rgba(0, 0, 0, 0.758);
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	.blur-background {
		background-color: #dcd8cd80;
	}
	.browse-by {
		grid-template-columns: repeat(2, 1fr);
	}
	.product-icon,
	.category-icon {
		border: 1px solid var(--primary-background);
		border-radius: 8px;
	}
	.show-less-product,
	.show-less-category {
		height: calc((var(--height) * 184px) - 24px);
	}

	.product-nav {
		border-bottom: 1px solid var(--primary-background);
	}
	.show-more-btn {
		border-top: 1px solid var(--primary-background);
	}
	.show-more-btn div {
		padding: 0 10px;
		background-color: var(--neutral);
	}
	.nav-btn {
		position: relative;
		cursor: pointer;
		padding: 10px 0;
		margin: 5px 0;
	}

	.nav-btn.active::after {
		content: '';
		position: absolute;
		left: 50%;
		width: calc(100% + 2px);
		transform: translateX(-50%);

		bottom: -5px;
		border-bottom: 1px solid black;
		cursor: pointer;
	}

	.hero {
		height: 70vh;
	}
	.hero-img {
		height: 100%; 
		overflow: hidden; 
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

		.find-product-section input {
			padding: 8px 56px;
			border-width: 2px;
		}

		.browse-by {
			grid-template-columns: repeat(3, 1fr);
		}
		.show-less-product,
		.show-less-category {
			height: calc((var(--height) * 184px) - 24px);
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
		/* .hero-right {
			background: linear-gradient(to left, #dcd8cd 0%, #dcd8cd 50%, #efefef 100%); 
			background: white;
		} */
		.find-product-section input {
			padding: 8px 64px;
		}

		.show-less-product,
		.show-less-category {
			height: calc((var(--height) * 232px) - 40px);
		}
	}
	@media only screen and (min-width: 1024px) {
		.browse-by {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
	}
</style>
