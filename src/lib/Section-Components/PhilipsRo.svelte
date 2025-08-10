<section class="homepage-section dark-bg-section relative">
	<h1
		class="home-philips-logo-text home-grid-logo-text text-center text-7xl font-extrabold sm:text-7xl"
	>
		PHILIPS
	</h1>
	<div class="grid-child-bottom-section flex w-full flex-col gap-4 sm:flex-row sm:gap-6">
		<div class="philips-ro-img relative z-10 flex justify-center items-center sm:flex h-[55%] md:h-[auto]">
			<div class="ro-img-shadow absolute z-10"></div>
			<enhanced:img
				class="z-30 h-full"
				src="$lib/assets/homePageImg/philips-ro.png"
				alt="philips-white-ro"
				loading="lazy"
			/>
		</div>
		<div class="z-10 flex flex-col items-center text-[var(--primary-background)] h-[45%] md:h-[auto]">
			<h1 class="z-30 text-3xl font-semibold tracking-wider sm:text-4xl md:text-4xl">
				Water Purifier
			</h1>
			<div class="z-30 mt-1 flex items-center text-sm sm:text-xl md:text-lg">
				<span class="mr-2">Wellness in every drop.</span>
			</div>
			<a data-sveltekit-preload-data="off" data-sveltekit-reload href="/products/ro">
				<button
					class="visit-btn-light mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
					>Visit Now</button
				>
			</a>
		</div>
	</div>
</section>

<style>
	@import url('./styles.css');

	.visit-btn-light {
		border: 1px solid var(--primary-background);
		color: var(--primary-background);
	}
	.dark-bg-section {
		background-color: black;
		color: white;
	}

	.grid-child-bottom-section {
		align-items: center;
		justify-content: center;
		margin-top: -40px; 
	}

	.philips-ro-img {
		width: 170px;
	}
	.philips-ro-img img {
		filter: brightness(90%);
	}
	.ro-img-shadow {
		left: 50%;
		top: 80%;
		width: 80%;
		transform: translate(-50%, -80%);
		box-shadow: 0px 40px 100px 15px rgba(255, 255, 255, 0.438);
	}
	.home-grid-logo-text {
		margin-top: 24px;
		user-select: none;
	}

	.home-philips-logo-text {
		color: #dcd8cd98;
	}

	@media only screen and (min-width: 640px) {
		.grid-child-bottom-section {
			margin-bottom: 64px;
			padding: 0 16px;
		}
		.philips-ro-img {
			width: 220px;
		}
		.ro-img-shadow {
			box-shadow: 0px 40px 100px 15px rgba(255, 255, 255, 0.77);
		}
		.home-grid-logo-text {
			width: 70%;
		}
	}

	@media only screen and (min-width: 768px) {
		.home-grid-logo-text {
			width: 90%;
		}

		.philips-ro-img {
			width: 200px;
		}
	}
</style>
