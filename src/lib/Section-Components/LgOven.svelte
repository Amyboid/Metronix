<section class="homepage-section oven-section">
	<div class="relative z-10 mt-6 flex flex-col items-center sm:mt-10">
		<h1 class="home-lg-logo-text z-20 mt-3 hidden font-extrabold sm:absolute sm:block sm:text-9xl">
			LG
		</h1>
		<h1 class="z-30 text-3xl font-semibold tracking-wider sm:text-5xl md:text-6xl">
			Microwave ovens
		</h1>
		<div class="z-30 mt-1 flex items-center text-sm sm:text-xl md:text-2xl">
			<span class="mr-2"> Starting at </span>
			<span class="icon-[bi--currency-rupee] h-4 w-4 sm:ml-1 md:h-5 md:w-5"></span>
			<span class=""> 12,000 </span>
		</div>
		<a href="/products/oven"> 
			<button
			class="visit-btn-dark mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
			>Visit Now</button
			>
		</a>
	</div>
	<h1 class="home-lg-logo-text mt-4 text-8xl font-extrabold sm:hidden">LG</h1>
	<div class="oven-img relative z-10 mt-auto mb-6 sm:mb-5">
		<div class="oven-img-shadow absolute z-20"></div>
		<enhanced:img class="z-30" src="$lib/assets/homePageImg/big-lg-oven.png" alt="lg-oven" loading="lazy" />
	</div>
</section>

<style>
	@import url('./styles.css');

	.oven-section {
		background: var(--primary-background-gradient);
	}

	/* mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2  */
	.visit-btn-dark {
		border: 1px solid black;
		color: black;
	}
	.home-lg-logo-text {
		user-select: none;
		color: var(--primary-background);
		text-shadow:
			-1px -1px 0 var(--neutral),
			1px 1px 0 var(--neutral);
	}
	.oven-img {
		width: 270px;
	}
	.oven-img-shadow {
		bottom: 3px;
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		height: 15px;
		box-shadow: 0px 8px 10px -5px black;
	}

	@media only screen and (min-width: 640px) {
		

		.oven-section {
			background: var(--primary-background);
		}
		.oven-img {
			width: 400px;
		}
		.oven-img-shadow {
			bottom: 4px;
		}
		.home-lg-logo-text {
			top: -20%;
			text-shadow:
				-2px -2px 0 var(--neutral),
				2px 2px 0 var(--neutral);
		}
	}

	@media only screen and (min-width: 768px) {
		.oven-img {
			width: 700px;
			margin-top: 50px;
		}
	}
</style>
