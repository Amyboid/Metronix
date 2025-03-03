<script>
</script>

<section
	class="hero mt-5 flex w-full min-w-80 flex-col bg-[var(--primary-background)] p-4 md:p-6 md:pr-12 md:pl-12"
>
	<div
		class="hero-left flex h-[40%] w-full flex-col items-center sm:h-full sm:w-[40%] sm:items-baseline sm:p-4"
	>
		<h1
			class="gradient-text mb-4 pt-5 pb-1 text-center text-3xl font-bold tracking-widest sm:mb-4 sm:pt-0 sm:text-left sm:text-3xl md:mb-6 md:pr-24 md:text-4xl lg:text-5xl"
		>
			Connect. Stream. Enjoy.
		</h1>
		<h3
			class="gradient-text w-[80%] text-center text-sm tracking-wide sm:mb-6 sm:text-left md:pr-6 md:text-xl"
		>
			Transform your living room into a cinematic paradise.
		</h3>
		<a
			class="mt-auto flex items-center text-sm tracking-wide sm:text-left md:text-xl"
			href="/"
		>
			<p class="">Browse Samsung TVs</p>
			<span class="icon-[cil--arrow-right] ml-2 h-9 w-4 md:h-6 md:w-6"></span>
		</a>
	</div>
	<div class="right h-[60%] w-full sm:h-full sm:w-[60%]"></div>
</section>
<section
	class="main-section flex w-full min-w-80 flex-col items-center gap-20 p-4 md:p-6 md:pr-12 md:pl-12"
>
<div>
	<img src="" alt="">
</div>
</section>

<style>
	.gradient-text {
		background: linear-gradient(30deg, black, var(--accent));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.hero > * {
		/* border: 1px solid plum; */
	}
	.main-section {
		/* border: 11px solid plum; */
	}

	.hero {
		height: 70vh;
	}

	@media only screen and (min-width: 640px) {
		/* sm */
		.hero {
			height: 50vh;
			flex-direction: row;
		}
	}

	@media only screen and (min-width: 768px) {
		/* md */
		.hero {
			height: 60vh;
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
	}
</style>
