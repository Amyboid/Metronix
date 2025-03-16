<script>
	let buttons = [
		{ id: 'product', label: 'Browse by Product' },
		{ id: 'brand', label: 'Browse by Brand' }
	];
	let activeButton = $state('product');
	let productIcons = ['ac', 'chimney', 'fridge', 'oven', 'ro', 'speaker', 'tv', 'fan'];

	let showMore = $state(true);
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
	class="main-section flex w-full min-w-80 flex-col items-center gap-20 p-4 pt-0 sm:pt-0 md:p-6 md:pt-0 md:pr-12 md:pl-12"
>
	<h1 class="text-xl font-medium tracking-wide sm:text-2xl md:text-3xl md:tracking-wider">
		Find the perfect product for you.
	</h1>
	<section class="product-section w-[90%] md:w-[85%]">
		<ul class="product-nav flex w-full items-center justify-center gap-20">
			{#each buttons as button}
				<li>
					<button
						onclick={() => {
							activeButton = button.id;
						}}
						class="nav-btn {activeButton === button.id ? 'active' : ''}"
					>
						{button.label}
					</button>
				</li>
			{/each}
		</ul>

		<div class="products flex flex-col items-center justify-center pt-10 pb-6">
			{#if activeButton === 'product'}
				<div
					class="browse-by-product w-max gap-6 overflow-hidden md:gap-10 {showMore
						? 'h-[368px] md:h-[1000px]'
						: 'h-max'}"
				>
					{#each productIcons as productIcon}
						<a href={'/explore/' + productIcon} class="flex flex-col items-center gap-2">
							<div class="product-icon w-32 cursor-pointer p-9 md:w-40 md:p-12">
								<img src={'/search/product/' + productIcon + '.png'} alt="" srcset="" />
							</div>
							<p>{productIcon}</p>
						</a>
					{/each}
				</div>
			{/if}
			{#if activeButton === 'brand'}
				<div>brand</div>
			{/if}
			<button onclick={() => (showMore = !showMore)}>
				Show
				{#if showMore}
					more
				{:else}
					less
				{/if}
			</button>
		</div>
	</section>
</section>

<style>
	.browse-by-product {
		display: grid;
		place-items: center;
		grid-template-columns: repeat(2, 1fr); 
	}
	.product-icon {
		border: 1px solid var(--primary-background);
		border-radius: 10%;
	}
	.hero {
	}
	.hero > * {
		/* border: 1px solid plum; */
	}
	/* .hero-right, .hero-img{
		border: 1px solid plum;
	} */

	/* .product-section, */
	.product-section > * {
		/* border: 1px solid plum; */
	}
	.product-nav {
		border-bottom: 1px solid var(--primary-background);
	}

	.nav-btn {
		position: relative;
		cursor: pointer;
		padding: 10px 0;
		margin: 5px 0;
	}
	/* .nav-btn::after {
		border-bottom: 1px solid #00000002;
	} */
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

	.main-section {
		/* border: 5px solid plum; */
	}

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
		.browse-by-product {
			grid-template-columns: repeat(3, 1fr);
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
		.browse-by-product {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
	}
</style>
