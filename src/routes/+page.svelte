<script>
	import { itemCategory1 } from '$lib/itemData';
</script>

<section
	class="main-section flex w-full min-w-80 flex-col items-center gap-4 overflow-x-hidden"
>
	<!-- fridge -->
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
			<button
				class="visit-btn mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
				>Visit Now</button
			>
		</div>
		<h1 class="home-haier-logo-text mt-4 text-8xl font-extrabold sm:hidden">Haier</h1>
		<div class="frige-img relative z-10 sm:mt-16">
			<img class="z-30" src="/assets/homeImg/refrigerator.png" alt="haier-refrigerator" loading="lazy"/>
		</div>
	</section>
	<section class="homepage-section oven-section">
		<div class="relative z-10 mt-6 flex flex-col items-center sm:mt-10">
			<h1
				class="home-lg-logo-text z-20 mt-3 hidden font-extrabold sm:absolute sm:block sm:text-9xl"
			>
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
			<button
				class="visit-btn mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
				>Visit Now</button
			>
		</div>
		<h1 class="home-lg-logo-text mt-4 text-8xl font-extrabold sm:hidden">LG</h1>
		<div class="oven-img relative z-10 mt-auto mb-6 sm:mb-5">
			<div class="oven-img-shadow absolute z-20"></div>
			<img class="z-30" src="/assets/homeImg/big-lg-oven.png" alt="lg-oven" loading="lazy"/>
		</div>
	</section>

	<!-- washing machine -->
	<section class="homepage-section washing-machine-section">
		<div class="mt-6 flex w-full flex-col items-center sm:mt-10">
			<h1 class="text-3xl font-semibold tracking-wider sm:text-5xl md:text-6xl">
				Washing Machines
			</h1>
			<div class="mt-2 flex items-center gap-1 text-sm sm:text-xl">
				<span> Fully Automated & Budget Friendly </span>
			</div>
			<button
				class="visit-btn mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
				>Visit Now</button
			>
		</div>
		<div class="wash-machine-img mt-16">
			<img src="/assets/homeImg/wash-machine.png" alt="washing-machine" loading="lazy" />
		</div>
	</section>

	<!-- grid section -->

	<section class="homepage-grid-section grid w-full gap-4">
		<!-- philips ro -->
		<section class="homepage-section philips-ro-section relative">
			<h1 class="home-philips-logo-text text-center text-7xl font-extrabold sm:text-9xl">
				PHILIPS
			</h1>
			<div class="philips-ro-bottom-section flex w-full flex-col sm:flex-row">
				<div class="philips-ro-img relative z-10 items-center sm:flex">
					<div class="ro-img-shadow absolute z-10"></div>
					<img class="z-30" src="/assets/homeImg/philips-ro.png" alt="philips-white-ro" loading="lazy" />
				</div>
				<div class="short-description z-10 flex flex-col items-center">
					<h1 class="z-30 text-3xl font-semibold tracking-wider sm:text-4xl md:text-4xl">
						Water Purifier
					</h1>
					<div class="z-30 mt-1 flex items-center text-sm sm:text-xl md:text-lg">
						<span class="mr-2">Wellness in every drop.</span>
					</div>
					<button
						class="visit-btn visit-btn-dark mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
						>Visit Now</button
					>
				</div>
			</div>
		</section>
		<section class="homepage-section">1a</section>
		<section class="homepage-section">1a</section>
		<section class="homepage-section">1a</section>
	</section>

	<div class="social-media flex items-center gap-6">
		<span class="icon-[ri--twitter-x-line] h-5 w-5 md:h-6 md:w-6"></span>
		<span class="icon-[uim--facebook-f] h-5 w-5 md:h-6 md:w-6"></span>
		<span class="icon-[simple-icons--onlyfans] h-5 w-5 md:h-6 md:w-6"></span>
		<span class="icon-[fa--instagram] h-5 w-5 md:h-6 md:w-6"></span>
	</div>
</section>

<!-- </main> -->

<style>
	.homepage-section { 
		width: 100%;
		padding: 24px;
		padding-bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		overflow: hidden;
		height: 60vh;
		cursor: pointer;
	}

	.oven-section {
		background: var(--primary-background-gradient);
	}

	/* mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2  */
	.visit-btn {
		border: 1px solid black;
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

	.washing-machine-section {
		background: var(--primary-gradient);
	}
	.wash-machine-img {
		width: 250px;
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

	.homepage-grid-section {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
	}

	.visit-btn-dark {
		border-color: var(--primary-background);
		color: var(--primary-background);
	}
	.philips-ro-section {
		background-color: black;
		color: white;
	}
	.philips-ro-bottom-section {
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-top: -24px;
		padding-bottom: 64px;
	}
	.philips-ro-img {
		width: 170px;
	}
	.philips-ro-img img{
		filter: brightness(90%);
	}
	.ro-img-shadow {
		left: 50%;
		top: 80%;
		width: 80%;
		transform: translate(-50%, -80%);
		box-shadow: 0px 40px 100px 15px rgba(255, 255, 255, 0.438);
	}

	.home-philips-logo-text {
		margin-top: 24px;
		user-select: none;
		color: black;
		/* text-shadow:
			-1px -1px 0 #0bacc564,
			1px 1px 0 #0bacc564; */

		text-shadow:
			-1px -1px 0 #eddea44d,
			1px 1px 0 #eddea44d;
	}
	.social-media span {
		transition: all 0.2s;
	}
	.social-media span:hover {
		color: var(--accent);
	}

	@media only screen and (min-width: 640px) {
		/* sm */
		.oven-section {
			background: var(--primary-background);
		}
		.homepage-section {
			height: 80vh;
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
		.wash-machine-img {
			width: 400px;
		}
		.home-haier-logo-text {
			top: -20%;
			text-shadow:
				-2px -2px 0 #f1efe961,
				2px 2px 0 #f1efe961;
		}
		.frige-img {
			width: 400px;
		}
		.philips-ro-bottom-section {
			margin-bottom: 64px;
			padding: 0 16px;
			gap: 24px;
		}
		.philips-ro-img {
			width: 220px;
		}
		.ro-img-shadow {
			box-shadow: 0px 40px 100px 15px rgba(255, 255, 255, 0.77);
		}

		.home-philips-logo-text {
			width: 70%;

			text-shadow:
				-2px -2px 0 #eddea44d,
				2px 2px 0 #eddea44d;
		}
	}

	@media only screen and (min-width: 768px) {
		/* md */
		.homepage-section {
			height: 75vh;
		}
		.oven-img {
			width: 700px;
			margin-top: 50px;
		}

		.home-lg-logo-text,
		.home-haier-logo-text {
			font-size: 10rem;
		}
		.wash-machine-img {
			margin-top: 50px;
			width: 500px;
		}
		.frige-img {
			margin-top: 50px;
			width: 500px;
		}
		.homepage-grid-section {
			padding: 0 16px;
			grid-template-columns: repeat(2, minmax(580px, 1fr));
		}

		.philips-ro-bottom-section {
			margin-bottom: 64px;
			padding: 0 16px;
			gap: 24px;
		}
		.philips-ro-img {
			width: 200px;
		}
		.home-philips-logo-text {
			width: 90%;
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
	}
</style>
