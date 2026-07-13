<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import HaierFridge from '$lib/Section-Components/HaierFridge.svelte';
	import KutchinaChimney from '$lib/Section-Components/KutchinaChimney.svelte';
	import LgOven from '$lib/Section-Components/LgOven.svelte';
	import PhilipsRo from '$lib/Section-Components/PhilipsRo.svelte';
	import SamsungTv from '$lib/Section-Components/SamsungTv.svelte';
	import VoltasAc from '$lib/Section-Components/VoltasAc.svelte';
	import WashMacine from '$lib/Section-Components/WashMacine.svelte';
	import { getImagePath } from '$lib/utils/imageImports';
	import { initAdminMode } from './adminMode';

	let { content: previewContent, imagekitUrl = '' } = $props();
	const c = previewContent ?? {};

	function ikSrc(path: string | null | undefined) {
		if (!path) return '';
		if (path.startsWith('http')) return path;
		if (!imagekitUrl) return path;
		const base = imagekitUrl.replace(/\/$/, '');
		const clean = path.replace(/^\//, '');
		return `${base}/${clean}`;
	}

	onMount(() => {
		initAdminMode('home');
	});

	let brands = [
		'SAMSUNG',
		'Haier',
		'LG',
		'godrej',
		'whirlpool',
		'VOLTAS',
		'DAIKIN',
		'BLUESTAR',
		'Aquagaurd',
		'PHILIPS',
		'KUTCHINA',
		'hindware',
		'SONY',
		'INTeX',
		'Crompton',
		'BAJAJ'
	];
</script>

<!-- hero section -->
<section
	style="--hero-bg: url('{ikSrc(c.hero_image || 'assets/page-contents/home/hero-bg.jpg')}')"
	class="hero relative mb-4 flex w-full min-w-80 flex-col overflow-hidden p-0 md:flex-row-reverse"
>
	<img
		class="absolute top-10 right-10 z-10 h-20 w-20 sm:h-30 sm:w-30 md:left-10 md:h-40 md:w-40"
		src={ikSrc('assets/page-contents/home/gurantee-tag.png')}
		alt="gurantee-tag"
	/>

	<div
		class="hero-left flex h-[50%] w-full flex-col items-center justify-end sm:h-[50%] md:h-full md:w-[50%]"
	>
		<div
			class="hero-left-top hidden h-[50%] flex-col items-center justify-center p-6 md:flex lg:gap-1"
		>
			<span data-editable="hero_heading" class="w-[70%] tracking-wide md:text-3xl lg:text-4xl">
				{c.hero_heading}
			</span>
			<span data-editable="hero_subheading" class="w-[70%] tracking-wide md:text-4xl lg:text-5xl">
				<span class="text-surface font-bold">Electronics</span> product
			</span>
		</div>
		<div class="hero-left-bottom hidden h-[50%] flex-col p-6 md:flex md:py-7">
			<div class="w-full justify-center md:flex md:gap-8 lg:gap-32">
				<div class="flex flex-col">
					<span class="text-sm">Upto</span>
					<span class="font-bold md:text-4xl lg:text-5xl">70% <br /> OFF!</span>
				</div>
				<div class="flex items-end justify-end gap-2">
					<span class="bold-zero font-bold">0</span>
					<span class="down-pay flex flex-col">
						down <br />
						<span class="font-bold">payment</span>
					</span>
				</div>
			</div>
			<div class="mt-auto w-full flex-col items-center justify-between gap-6 md:flex lg:gap-1">
				<span class="text-xl md:text-base"> All bank credit and debit card accepted </span>
				<a class="text-2xl font-bold underline" data-sveltekit-reload href="/products/"
					>View all products</a
				>
			</div>
		</div>

		<div class="flex h-[50%] flex-col items-center justify-center gap-1 p-6 md:hidden">
			<span class="w-full text-center text-xl tracking-wide sm:w-[50%] sm:text-3xl">
				{c.hero_heading}
			</span>
			<span class="w-full text-center text-3xl tracking-wide sm:w-[50%] sm:text-4xl">
				<span class="font-bold">Electronics</span> product
			</span>
		</div>
	</div>
	<div
		class="hero-right relative flex h-[50%] w-full flex-col justify-center p-4 pt-8 pb-8 sm:h-[50%] sm:pt-6 sm:pb-6 md:h-full md:w-[50%]"
	>
		<div class="text-neutral flex w-full justify-center gap-8 sm:gap-32 md:hidden">
			<div class="flex flex-col">
				<span class="text-brand text-sm sm:text-base">Upto</span>
				<span class="text-4xl font-bold sm:text-[3rem]">70% <br /> OFF!</span>
			</div>
			<div class="flex items-end justify-end gap-2">
				<span class="bold-zero font-bold">0</span>
				<span class="down-pay flex flex-col text-4xl">
					down <br />
					<span class="font-bold">payment</span>
				</span>
			</div>
		</div>
		<div
			class="text-neutral mt-auto flex w-full flex-col items-center justify-between gap-6 sm:gap-1 md:hidden"
		>
			<span class="text-base sm:text-base"> All bank credit and debit card accepted </span>
			<a
				class="text-brand text-xl font-bold underline sm:text-2xl"
				data-sveltekit-reload
				href="/products/">View all products</a
			>
		</div>
	</div>
</section>

<section
	class="my-5 flex h-auto w-full flex-col items-center justify-between gap-12 p-5 md:h-[70vh] md:gap-4"
>
	<div class="flex w-full flex-col items-center justify-center gap-1 sm:gap-2 md:w-[90%]">
		<h1 data-editable="brands_heading" class="text-center text-xl md:text-2xl">
			{c.brands_heading}
		</h1>
		<p
			data-editable="brands_description"
			class="text-copy w-[70%] p-2 text-center text-xs sm:p-4 sm:text-sm md:w-[50%]"
		>
			{c.brands_description}
		</p>
	</div>

	<div
		class="grid min-w-[333px] grid-cols-4 place-items-center gap-1 sm:grid-cols-5 sm:gap-2 md:grid-cols-8 md:gap-6"
	>
		{#each brands as brand, i (i)}
			<div
				class="hover:bg-surface-hover bg-surface border-subtle aspect-square w-20 rounded-sm border p-3 transition-all duration-200 md:w-24"
			>
				<img
					class="h-full w-full object-contain"
					src={ikSrc('assets/page-contents/brands/' + brand.toLocaleLowerCase() + '.png')}
					alt={brand.toLocaleLowerCase()}
				/>
			</div>
		{/each}
	</div>
</section>

<!-- meta electronics best sellers -->
<section
	class="best-sellers-section flex w-full min-w-80 flex-col items-center gap-3 overflow-x-hidden"
>
	<h1 data-editable="best_sellers_heading" class="mt-4 text-xl sm:text-2xl">
		{c.best_sellers_heading}
	</h1>
	<HaierFridge />
	<LgOven />
	<WashMacine />

	<section class="homepage-grid-section grid w-full gap-3 md:px-3">
		<VoltasAc />

		<PhilipsRo />

		<SamsungTv />

		<KutchinaChimney />
	</section>
</section>

<style>
	.hero {
		height: 70vh;
		background-image: var(--hero-bg);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.hero-right {
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
		backdrop-filter: blur(5px);
	}
	.bold-zero {
		font-size: 4.5rem;
		line-height: 0.8;
	}

	.homepage-grid-section {
		grid-template-columns: repeat(1, 1fr);
	}

	@media only screen and (min-width: 640px) {
		.hero {
			height: 80vh;
		}
		.hero-left > * {
			width: 100%;
		}
		.bold-zero {
			font-size: 6.5rem;
			line-height: 0.8;
			font-weight: bold;
		}
		.down-pay {
			font-size: 3rem;
		}
	}

	@media only screen and (min-width: 768px) {
		.hero {
			height: 80vh;
			max-height: 600px;
			background: none;
			min-width: 1024px;
		}
		.bold-zero {
			font-size: 6rem;
		}
		.down-pay {
			font-size: 2.25rem;
			line-height: normal;
		}
		.hero-left-top {
			background-color: #000;
			color: white;
		}
		.hero-left-bottom {
			background: var(--color-surface-hover);
		}
		.hero-right {
			background: linear-gradient(rgba(0, 0, 0, 0.136)), var(--hero-bg);
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
		}

		.homepage-grid-section {
			grid-template-columns: repeat(2, minmax(580px, 1fr));
		}
	}

	@media only screen and (min-width: 1024px) {
		.hero {
			min-width: 1124px;
		}
		.bold-zero {
			font-size: 7rem;
		}
		.down-pay {
			font-size: 3rem;
			line-height: normal;
		}
	}
</style>
