<section class="homepage-section light-bg-section relative">
	<h1 class="home-grid-logo-text text-center text-6xl font-extrabold sm:text-7xl">KUTCHINA</h1>
	<div class="grid-child-bottom-section flex w-full flex-col gap-5 sm:flex-row sm:gap-0">
		<div class="kutchina-chimney-img relative z-10 items-center sm:flex justify-center h-[55%] md:h-[auto]">
			<img
				class="z-30"
				src="/assets/homePageImg/kutchina-chimney.png"
				alt="kutchina-chimney"
				loading="lazy"
			/>
		</div>
		<div class="z-10 flex flex-col items-center h-[45%] md:h-[auto]">
			<h1 class="z-30 text-center text-3xl font-semibold tracking-wider">Kutchina chimney</h1>
			<div class="z-30 mt-1 flex items-center text-sm sm:text-lg">
				<span class="mr-2 text-center">Breathe Easy, Cook Freely.</span>
			</div>
			<a href="/products/chimney"> 
				<button
				class="visit-btn-dark mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
				>Visit Now</button
				>
			</a>
		</div>
	</div>
</section>

<style>
	@import url('./styles.css');
	.visit-btn-dark {
		border: 1px solid black;
		color: black;
	}
	.light-bg-section {
		background-color: var(--primary-background);
		color: black;
	}
	.grid-child-bottom-section {
		align-items: center;
		justify-content: center;
		margin-top: -40px;
		padding-bottom: 64px;
	}

	.home-grid-logo-text {
		margin-top: 24px;
		user-select: none;
	}

	.kutchina-chimney-img {
		width: 300px;
	}

	@media only screen and (min-width: 640px) {
		.grid-child-bottom-section {
			margin-bottom: 64px;
			padding: 0 16px;
		}

		.home-grid-logo-text {
			width: 70%;
		}

		.kutchina-chimney-img {
			width: 400px;
		}
	}

	@media only screen and (min-width: 768px) {
		.home-grid-logo-text {
			width: 90%;
		}

		.kutchina-chimney-img {
			width: 370px;
		}
	}
</style>
