<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import ProductCard from './ProductCard.svelte';

	const publicAssetBaseUrl = env.PUBLIC_ASSET_BASE_URL || '';
	let { images = [] } = $props();

	let perPage = $state(1);
	let currentIndex = $state(0);

	function updatePerPage() {
		const width = window.innerWidth;
		if (width >= 768) perPage = 3;
		else if (width >= 640) perPage = 2;
		else perPage = 1;

		currentIndex = 0;
	}

	onMount(() => {
		updatePerPage();
		window.addEventListener('resize', updatePerPage);
		return () => window.removeEventListener('resize', updatePerPage);
	});

	let totalPages = $derived(Math.ceil(images.length / perPage));

	function nextImg() {
		if (currentIndex < totalPages - 1) currentIndex++;
	}

	function prevImg() {
		if (currentIndex > 0) currentIndex--;
	}

	let showRightButton = $derived(currentIndex < totalPages - 1);
	let showLeftButton = $derived(currentIndex > 0);
</script>

<div class="relative mb-10 flex w-full items-center justify-center">
	<div class="flex w-full overflow-hidden">
		<div
			class="flex w-full transition-transform duration-500 ease-in-out"
			style:transform="translateX(-{currentIndex * 100}%)"
		>
			{#each images as product}
				<div class="img-slider-img-box h-card w-full sm:rounded-lg sm:pr-1 sm:pl-1">
					<ProductCard {product} />
				</div>
			{/each}
		</div>
	</div>

	{#if showLeftButton}
		<button
			class="img-slider-btn absolute left-2 sm:left-3 md:left-4 bg-subtle/70 backdrop-blur-xs"
			onclick={prevImg}
			aria-label="img-slider-btn-left"
		>
			<span class="icon-[ri--arrow-left-s-line]"></span>
		</button>
	{/if}

	{#if showRightButton}
		<button
			class="img-slider-btn absolute right-2 sm:right-3 md:right-4 bg-subtle/70 backdrop-blur-xs"
			onclick={nextImg}
			aria-label="img-slider-btn-right"
		>
			<span class="icon-[ri--arrow-right-s-line]"></span>
		</button>
	{/if}

	<div class="img-slider-dot absolute bottom-0 flex items-center justify-center">
		{#each Array(totalPages) as _, index}
			<button
				class="img-slider-dot-btn flex cursor-pointer items-center justify-center"
				onclick={() => (currentIndex = index)}
			>
				{#if currentIndex === index}
					<span class="icon-[fluent-mdl2--location-dot] text-copy"></span>
				{:else}
					<span class="icon-[fluent-mdl2--location-dot] text-copy-light"></span>
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
	}

	/* Widths strictly matching your layout */
	.img-slider-img-box {
		width: 100%;
	}
	@media only screen and (min-width: 640px) {
		.img-slider-img-box {
			width: 50%;
		}
	}
	@media only screen and (min-width: 768px) {
		.img-slider-img-box {
			width: 33.333%;
		}
	}

	.img-slider-btn {
		padding: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: 8px;
		top: 50%;
		transform: translateY(-50%);
		transition: background-color 200ms ease-in-out;
		z-index: 20;
	}

	.img-slider-btn:hover {
		background-color: var(--color-subtle-hover);
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
		width: 24px;
		height: 24px;
	}

	@media only screen and (min-width: 640px) {
		.img-slider-btn span {
			width: 30px;
			height: 30px;
		}
	}
	@media only screen and (min-width: 768px) {
		.img-slider-btn span {
			width: 35px;
			height: 35px;
		}
	}
</style>
