<section class="homepage-section fridge-section">
	<div class="relative z-10 mt-6 flex flex-col items-center sm:mt-10">
		<h1
			class="home-haier-logo-text z-20 mt-3 hidden font-extrabold sm:absolute sm:block sm:text-9xl"
		>
			Haier
		</h1>
		<h1 class="z-30 text-3xl font-semibold tracking-wider sm:text-5xl md:text-6xl">
			Haier Refrigerator
		</h1>
		<div class="z-30 mt-1 flex items-center text-sm sm:text-xl md:text-2xl">
			<span class="mr-2">Get Fresh Vegetables</span>
		</div>
		<a href="/products/fridge">
			<button
				class="visit-btn-dark mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
				>Visit Now</button
			>
		</a>
	</div>
	<h1 class="home-haier-logo-text mt-4 text-8xl font-extrabold sm:hidden">Haier</h1>
	<div class="frige-img relative z-10 sm:mt-16">
		<enhanced:img
			class="z-30"
			src="$lib/assets/homePageImg/refrigerator.png"
			alt="haier-refrigerator"
			loading="lazy"
		/>
	</div>
</section>

<style>
	@import url('./styles.css');

	.visit-btn-dark {
		border: 1px solid black;
		color: black;
	}

	.fridge-section {
		background: linear-gradient(to bottom, hsl(188, 89%, 41%) 60%, #098b9f);
	}
	.frige-img {
		width: 170px;
	}
	.home-haier-logo-text {
		margin-bottom: -40px;
		user-select: none;
		color: var(--accent);
		text-shadow:
			-1px -1px 0 #f1efe961,
			1px 1px 0 #f1efe961;
	}

	@media only screen and (min-width: 640px) {
		.home-haier-logo-text {
			top: -20%;
			text-shadow:
				-2px -2px 0 #f1efe961,
				2px 2px 0 #f1efe961;
		}
		.frige-img {
			width: 400px;
		}
	}

	@media only screen and (min-width: 768px) {
		.frige-img {
			margin-top: 50px;
			width: 500px;
		}
	}
</style>
