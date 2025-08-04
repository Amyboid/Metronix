<script>
	import { getImagePath } from '$lib/utils/imageImports';
	import { fade } from 'svelte/transition';

	let { images } = $props();
	let currentIndex = $state(0);
	console.log('images', images);

	function prevImg() {
		if (currentIndex == 0) currentIndex = images.length - 1;
		else currentIndex = currentIndex - 1;
	}
	function nextImg() {
		if (currentIndex == images.length - 1) currentIndex = 0;
		else currentIndex = currentIndex + 1;
	}
</script>

<div class="relative mb-10 flex w-full items-center justify-center">
	<div class="flex w-full overflow-hidden rounded-lg">
		{#each images as image}
			<div
				class="img-slider-img-box h-full w-full rounded-lg transition-transform duration-500 ease-in-out sm:pr-1 sm:pl-1"
				style="translate: {-100 * currentIndex}%"
			>
				<div
					class="img-slider-img flex h-[400px] w-full flex-col items-center justify-center gap-10 rounded-lg pr-5 pl-5 sm:h-[400px] md:h-[400px]"
				>
					<enhanced:img
						class="h-[200px] object-contain"
						src={getImagePath(image.src)}
						alt={image.name}
					/>
					<div class="flex flex-col items-center">
						<a
							class="min-h-16 text-center text-sm tracking-wider hover:underline md:text-base"
							href={'/products/cart/' + image.src}>{image.name}</a
						>
						<div class="flex items-center">
							<span class="icon-[bi--currency-rupee] -ml-1 h-[14px] w-[14px]"></span>
							<span class="flex items-center justify-between text-sm tracking-wider md:text-base">
								{image.price}
							</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<button
		class="img-slider-btn absolute left-2 sm:left-3 md:left-4"
		onclick={prevImg}
		aria-label="previous image"
	>
		<span class="icon-[ri--arrow-left-s-line]"></span>
	</button>
	<button
		class="img-slider-btn absolute right-2 sm:right-3 md:right-4"
		onclick={nextImg}
		aria-label="next image"
	>
		<span class="icon-[ri--arrow-right-s-line]"></span>
	</button>

	<!-- slider dots -->
	<div class="img-slider-dot absolute bottom-0 flex items-center justify-center">
		{#each images as _, index}
			<button
				in:fade
				class="img-slider-dot-btn flex items-center justify-center"
				onclick={() => (currentIndex = index)}
			>
				{#if currentIndex === index}
					<span in:fade class="icon-[fluent-mdl2--location-dot]"></span>
				{:else}
					<span class="icon-[bi--dot]"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.img-slider-img-box {
		flex-shrink: 0;
		flex-grow: 0;
		background-color: transparent;
		/* background: var(--primary-background-gradient); */
	}
	.img-slider-img {
		background: linear-gradient(to bottom, #dcd8cd80 0%, #dcd8cde1 60%, #dcd8cd80 100%);
		/* background: var(--primary-background); */
	}
	.img-slider-btn:hover > * {
		animation: squish 300ms ease-in-out;
	}
	.img-slider-btn {
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background-color: #b1afa786;
		backdrop-filter: blur(5px);
		border-radius: 8px;
		top: 50%;
		transform: translateY(-50%);
		transition: background-color 200ms ease-in-out;
	}
	.img-slider-btn:hover {
		background-color: #b1afa7c2;
	}
	.img-slider-btn span {
		width: 30px;
		height: 30px;
	}

	.img-slider-dot {
		left: 50%;
		transform: translateX(-50%);
		bottom: -40px;
	}

	.img-slider-dot-btn > * {
		width: 30px;
		height: 30px;
		color: #00000076;
	}
	@media only screen and (min-width: 640px) {
		.img-slider-img-box {
			width: calc(100% / 2);
		}
		.img-slider-btn span {
			width: 30px;
			height: 30px;
		}
	}
	@media only screen and (min-width: 768px) {
		.img-slider-img-box {
			width: calc(100% / 3);
		}
		.img-slider-btn span {
			width: 35px;
			height: 35px;
		}
	}
	@keyframes squish {
		50% {
			scale: 1.2 0.6;
		}
	}
</style>
