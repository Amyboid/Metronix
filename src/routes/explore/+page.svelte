<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import ImgSlider from '$lib/ImgSlider.svelte';


	let buttons = [
		{ id: 'product', label: 'Browse by Product' },
		{ id: 'category', label: 'Browse by Category' }
	];
	let activeButton = $state('product');
	let productIcons = ['ac', 'chimney', 'fridge', 'oven', 'ro', 'speaker', 'fan', 'stove'];
	let categoryIcons = [
		'Consumer Electronics',
		'Home Appliances',
		'Kitchen Appliances',
		'SelfCare Appliances'
	];

	let showMore = $state(true);
	let productIconRow = $state(0);
	let categoryIconRow = $state(0);

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
	onMount(() => {
		updateSize();
		window.addEventListener('resize', updateSize);
		return () => window.removeEventListener('resize', updateSize);
	});

	let soundEssentials = [

		{
			src: 'ac'
		},
		{
			src: 'chimney'
		},
		{
			src: 'fridge'
		},
		{
			src: 'oven'
		}
	];
</script>

<section
	class="hero mt-5 mb-12 flex w-full min-w-80 flex-col bg-[var(--primary-background)] p-0 sm:mt-4 sm:mb-18 sm:p-4 md:p-6"
>
	<div
		class="hero-right flex h-[60%] w-full sm:h-full sm:w-[60%] sm:justify-center md:justify-end md:pr-12"
	>
		<!-- todo : shadow on images for desktop only  -->
		<div class="hero-img flex items-start sm:items-center">
			<picture>
				<source srcset="/assets/bg/d.jpg" media="(min-width: 768px)" />
				<img loading="lazy" src="/assets/bg/ii.jpg" class="" alt="" />
			</picture>
		</div>
	</div>
	<div
		class="hero-left flex h-[40%] w-full flex-col items-center p-6 sm:h-full sm:w-[40%] sm:items-baseline md:pl-12"
	>
		<h1
			class="mb-4 pb-1 text-center text-3xl font-bold tracking-widest sm:mb-4 sm:pt-0 sm:text-left sm:text-3xl md:mb-6 md:pr-24 md:text-4xl lg:text-5xl"
		>
			Connect. Stream. Enjoy.
		</h1>
		<h3 class="w-[80%] text-center text-sm tracking-wide sm:mb-6 sm:text-left md:pr-6 md:text-xl">
			Transform your living room into a cinematic paradise.
		</h3>
		<a class="mt-auto flex items-center text-sm tracking-wide sm:text-left md:text-xl" href="/">
			<p class="">Browse Samsung TVs</p>
			<span class="icon-[cil--arrow-right] ml-2 h-9 w-4 md:h-6 md:w-6"></span>
		</a>
	</div>
</section>
<section
	class="main-section flex w-full min-w-80 flex-col items-center gap-10 p-4 pt-0 sm:pt-0 md:p-6 md:pt-0 md:pr-12 md:pl-12"
>
	<h1 class="text-xl font-medium tracking-wide sm:text-2xl md:text-3xl md:tracking-wider">
		Find the perfect product for you.
	</h1>
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
							href={'/explore/' + productIcon}
							class="flex h-[160px] flex-col items-center gap-2 md:h-[192px]"
						>
							<div class="product-icon w-32 cursor-pointer p-9 md:w-40 md:p-12">
								<img src={'/search/product/' + productIcon + '.png'} alt={productIcon} srcset="" />
							</div>
							<p class="text-center text-xs md:text-sm">{productIcon}</p>
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
							href={'/explore/' + categoryIcon}
							class="flex h-[160px] flex-col items-center gap-2 md:h-[192px]"
						>
							<div class="category-icon w-32 cursor-pointer p-9 md:w-40 md:p-12">
								<img
									src={'/search/category/' + categoryIcon + '.png'}
									alt={categoryIcon}
									srcset=""
								/>
							</div>
							<p class="text-center text-xs md:text-sm">{categoryIcon}</p>
						</a>
					{/each}
				</div>
			{/if}
			<button
				class="show-more-btn flex h-10 w-full cursor-pointer items-center justify-center"
				onclick={() => (showMore = !showMore)}
			>
				<div class="relative -top-5">
					<p class="flex items-center gap-1">
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

	<section
		class="product-section w-[90%] h-auto flex flex-col items-center justify-center gap-10 md:w-[85%] "
	>
		<h1 class="w-full text-center text-2xl font-semibold tracking-wider md:text-3xl lg:text-4xl">
			Sound Essentials
		</h1>
		<ImgSlider images={soundEssentials} />
	</section>
</section>

<style> 

	.browse-by {
		grid-template-columns: repeat(2, 1fr);
	}
	.product-icon,
	.category-icon {
		border: 1px solid var(--primary-background);
		border-radius: 10%;
	}
	.show-less-product,
	.show-less-category {
		height: calc((var(--height) * 184px) - 24px);
	}
	/* .hero {
	} */
	/*
	.product-section {
		border: 10px solid plum;
		}
	.browse-by {
		border: 1px solid #a4dda0;
	} */

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

	/* .main-section {
		border: 5px solid plum;
	} */

	.hero {
		height: 70vh;
	}
	.hero-img {
		height: 100%;
		/* width: 100%; */
		overflow: hidden;
		/* border: 1px solid plum; */
	}

	@media only screen and (min-width: 640px) {
		/* sm */
		.hero {
			height: 50vh;
			flex-direction: row-reverse;
		}
		.hero-img {
			width: 80%;
			height: 100%;
			/* border: 1px solid plum; */
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
		/* md */

		.hero-img {
			width: 722px;
			height: 389px;
		}
		.hero {
			height: 60vh;
		}
		.show-less-product,
		.show-less-category {
			height: calc((var(--height) * 232px) - 40px);
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
		.browse-by {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
	}
</style>
