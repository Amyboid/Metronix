<section class="homepage-section washing-machine-section">
	<div class="mt-6 flex w-full flex-col items-center sm:mt-10">
		<h1 class="text-3xl font-semibold tracking-wider sm:text-5xl md:text-6xl">Washing Machines</h1>
		<div class="mt-2 flex items-center gap-1 text-sm sm:text-xl">
			<span> Fully Automated & Budget Friendly </span>
		</div>
		<a href="/products/washing-machine"> 
			<button
			class="visit-btn-dark mt-6 flex cursor-pointer items-center justify-center rounded-lg p-2 tracking-wider sm:mt-10 sm:pr-4 sm:pl-4 md:tracking-widest"
			>Visit Now</button
			>
		</a>
		
	</div>
	<div class="wash-machine-img mt-16">
		<img src="/assets/homePageImg/wash-machine.png" alt="washing-machine" loading="lazy" />
	</div>
</section>

<style>
	@import url('./styles.css');

	.visit-btn-dark {
		border: 1px solid black;
		color: black;
	}

	.washing-machine-section {
		background: var(--primary-gradient);
	}
	.wash-machine-img {
		width: 250px;
	}

	@media only screen and (min-width: 640px) {
		.wash-machine-img {
			width: 400px;
		}
	}

	@media only screen and (min-width: 768px) {
		.wash-machine-img {
			margin-top: 50px;
			width: 500px;
		}
	}
</style>
