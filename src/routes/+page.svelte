<script>
	import { itemCategory1 } from '$lib/itemData';
</script>

<section
	class="main-section flex w-full min-w-80 flex-col items-center gap-20 p-4 md:p-6 md:pr-12 md:pl-12"
>
	<section class="hero w-[90%] md:w-[85%]"><h1>Hero section</h1></section>
	<section class="items z-10 flex w-[90%] md:w-[85%] flex-col gap-20">
		{#each itemCategory1 as itemCategory}
			<div class="item-category flex flex-col gap-10">
				<header>
					<button
						aria-label="explore-item"
						class="explore-item relative flex items-center p-1 text-sm font-bold tracking-wider md:text-base md:tracking-widest"
					>
						<a href={'/explore/' + itemCategory.categoryName}>
							Explore {itemCategory.categoryName.toUpperCase()}
						</a>
						<span class="icon-[cil--arrow-right] ml-4 h-5 w-5 md:h-6 md:w-6"></span></button
					>
				</header>
				<container class="item-container grid gap-6">
					{#each itemCategory.items as item}
						<div class="item relative flex flex-col">
							<div class="item-image bg-transparent">
								<img
									class=""
									loading="lazy"
									src={'/assets/' + itemCategory.categoryName + '/' + item.img + '.png'}
									alt=""
								/>
							</div>
							<div class="item-data flex flex-col justify-between">
								<div class="flex items-center">
									<span class="icon-[bi--currency-rupee] -ml-1 h-4 w-4"></span>
									<h1 class="flex items-center justify-between text-base font-bold">
										{item.price}
									</h1>
								</div>
								<div class="flex items-center justify-between">
									<p class="text-sm font-semibold tracking-wider text-green-700">
										Save Upto {item.discount}%
									</p>
									<p class="item-brand z-10 text-sm font-bold tracking-widest capitalize">
										{item.brand}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</container>
			</div>
		{/each}
	</section>

	<a class="explore-more relative z-10 mt-10 flex items-center justify-center p-2 font-bold tracking-wider md:tracking-widest"
		href="/explore">
		Explore More
		<span class="icon-[cil--arrow-right] ml-2 h-5 w-5 md:h-6 md:w-6"></span>
	</a>

	<div class="social-media flex items-center gap-6">
		<span class="icon-[ri--twitter-x-line] h-5 w-5 md:h-6 md:w-6"></span>
		<span class="icon-[uim--facebook-f] h-5 w-5 md:h-6 md:w-6"></span>
		<span class="icon-[simple-icons--onlyfans] h-5 w-5 md:h-6 md:w-6"></span>
		<span class="icon-[fa--instagram] h-5 w-5 md:h-6 md:w-6"></span>
	</div>
</section>

<!-- </main> -->

<style>
	/* .main-section,
  .hero,
  .items {
    border: 2px solid plum;
  } */

	.hero {
		height: 40vh;
		/* box-shadow: 1px 1px 0.2px 1px var(--accent); */
	}
	.items {
		/* border: 1px solid purple; */
	}
	.item {
		/* border: 1px solid purple; */
		/* box-shadow: 1px 1px 0.2px 1px var(--primary); */
		padding: 10px;
		width: 250px;
		height: 325px;
	}
	.item-image {
		/* background-color: #d4d2cc; */
		/* background-color: #e2ded1;  */
		background-color: var(--primary-background);
		height: 80%;
		width: 100%;
		padding: 1.5rem;
		display: flex;
		justify-content: center;
		transition: all 0.3s;
		/* border: 1px solid purple; */
		/* filter: blur(0.5px); */
	}
	.item-image img {
		height: 100%;
	}

	.item-data {
		height: 20%;
		padding-top: 0.5rem;
	}

	/* .item-brand,
  .item-data > * {
    border: 1px solid purple;
  } */

	.explore-item::after {
		position: absolute;
		right: 1rem;
		bottom: 0;
		content: '';
		width: 4rem;
		height: 100%;
		background: var(--accent);
		transition: all 0.2s;
		z-index: -1;
	}

	.item-container {
		grid-template-columns: repeat(1, 1fr);
		align-items: end;
		place-items: center;
	}

	.explore-more::after {
		position: absolute;
		right: 1.5rem;
		bottom: 0;
		content: '';
		width: calc(100% - 1.5rem);
		height: 100%;
		background: var(--accent);
		transition: all 0.2s;
		z-index: -1;
	}
	.social-media span {
		transition: all 0.2s;
	}
	.social-media span:hover {
		color: var(--accent);
	}

	@media only screen and (min-width: 640px) {
		/* sm */
		.item-container {
			grid-template-columns: repeat(2, 1fr);
		}
		.hero {
			height: 70vh;
		}
	}

	@media only screen and (min-width: 768px) {
		/* md */
		.hero {
			height: 100vh;
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
		.item-container {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
		.item-container {
			grid-template-columns: repeat(4, 1fr);
		}
		.items {
			width: 90%;
		}
	}
</style>
