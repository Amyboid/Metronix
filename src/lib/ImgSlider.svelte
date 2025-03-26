<script>
	let { images } = $props();
	let currentIndex = $state(0);

	function prevImg() {
		if (currentIndex == 0) currentIndex = images.length - 1;
		else currentIndex = currentIndex - 1;
	}
	function nextImg() {
		if (currentIndex == images.length - 1) currentIndex = 0;
		else currentIndex = currentIndex + 1;
	}
</script>

<div class="relative mb-5 flex h-80 w-full items-center justify-center">
	<div class="flex w-full overflow-hidden">
		{#each images as image}
			<img
				class="img-slider-img h-full w-full transition-transform duration-500 ease-in-out"
				style="translate: {-100 * currentIndex}%"
				src={'/search/product/' + image.src + '.png'}
				alt={image.src}
				srcset=""
			/>
		{/each}
	</div>
	<button class="img-slider-btn absolute left-0" onclick={prevImg} aria-label="previous image">
		<span class="icon-[ri--arrow-left-s-line]"></span>
	</button>
	<button class="img-slider-btn absolute right-0" onclick={nextImg} aria-label="next image">
		<span class="icon-[ri--arrow-right-s-line]"></span>
	</button>

	<div class="img-slider-dot absolute bottom-0 flex items-center justify-center">
		{#each images as _, index}
			<button class="img-slider-dot-btn" onclick={() => (currentIndex = index)}>
				{#if currentIndex === index}
					<span class="icon-[fluent-mdl2--location-dot]"></span>
				{:else}
					<span class="icon-[ph--dot-outline-thin]"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.img-slider-img {
		flex-shrink: 0;
		flex-grow: 0;
	}

	.img-slider-btn:hover > * {
		animation: squish 300ms ease-in-out;
		animation-iteration-count: 2;
	}
	.img-slider-btn {
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background-color: #dcd8cd76;
		backdrop-filter: blur(5px);
		border-radius: 10%;
		top: 50%;
		transform: translateY(-50%);
	}
	.img-slider-btn span {
		width: 30px;
		height: 30px;
	}

	.img-slider-dot {
		left: 50%;
		transform: translateX(-50%);
	}
	.img-slider-dot-btn {
		all: unset;
	}
	.img-slider-dot-btn > * {
		width: 30px;
		height: 30px;
		padding: 0;
	}
	@keyframes squish {
		50% {
			scale: 1.2 0.6;
		}
	}
</style>
