<script lang="ts">
	import ProductCard from '$lib/Components/ProductCard.svelte';
	import { env } from '$env/dynamic/public';

	let { data } = $props();

	const base = env.PUBLIC_ASSET_BASE_URL || '';
	const product = data.product;
	const variants = data.variants;

	// ─── Image state ──────────────────────────────────────────────────────────
	let activeMain = $state<string>(product.mainImagePath);
	let activeGallery = $state<string[]>([]); // ← empty, selectColor fills this
	let activeThumb = $state<string>(product.mainImagePath);
	let activeColor = $state<string | null>(null); // ← null, selectColor sets this

	// Single source of truth — selectColor always keeps activeGallery correct,
	// including on init. Just deduplicate here, no branching needed.
	let allThumbs = $derived([...new Set(activeGallery)]);

	function selectThumb(path: string) {
		activeThumb = path;
		activeMain = path;
	}

	function selectColor(colorName: string, hex: string, index: number) {
		const variant = variants[index]; // ← direct index lookup, no find()
		if (variant) {
			const gallery = (variant.galleryPaths ?? []) as string[];
			const mainAlreadyInGallery = gallery.includes(variant.mainImagePath);
			activeGallery = mainAlreadyInGallery ? gallery : [variant.mainImagePath, ...gallery];
			activeMain = variant.mainImagePath;
			activeThumb = variant.mainImagePath;
		}
		activeColor = hex;
	}

	// Initialise with first color on load
	const firstColor = product.colors?.[0];
	if (firstColor) {
		selectColor(firstColor.name, firstColor.hex, 0);
	}

	// ─── UI state ─────────────────────────────────────────────────────────────
	let showSpecs = $state(true);

	// ─── Helpers ──────────────────────────────────────────────────────────────
	const stockLabel = product.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock';

	const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? '';
	const whatsappMsg = product.whatsappMsg
		? encodeURIComponent(product.whatsappMsg)
		: encodeURIComponent(`Hi, I'm interested in ${product.name}`);
	const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

	function img(path: string) {
		return `${base}/${path}`;
	}

	let activeColorName = $derived(
		product.colors?.find((c: any) => c.hex === activeColor)?.name ?? ''
	);

	const badgeConfig: Record<string, { label: string; cls: string }> = {
		new: { label: 'New', cls: 'bg-primary text-white' },
		'on-sale': { label: 'Sale', cls: 'bg-danger text-white' },
		demanding: { label: 'Hot', cls: 'bg-[#f59e0b] text-white' }
	};
</script>

<!-- ─── Main Product Section ──────────────────────────────────────────────── -->
<section
	class="mx-auto flex min-h-[70vh] w-[90%] min-w-[300px] flex-col-reverse gap-4 pb-6 md:min-h-[85vh] md:w-[80%] md:min-w-[1125px] md:flex-row md:pt-4"
>
	<!-- ── Left: Info ───────────────────────────────────────────────────────── -->
	<div class="flex flex-col justify-between gap-4 p-3 md:w-[45%] md:gap-4">
		<!-- Top info block -->
		<div class="border-b-surface flex w-full flex-col gap-4 border-b pb-4 md:w-[65%]">
			<!-- Mobile/tablet: colors above name -->
			{#if product.colors && product.colors.length > 0}
				<div class="flex flex-col gap-1 md:hidden">
					<div class="flex items-center gap-2">
						<h3 class="text-sm font-medium">Color</h3>
						<h3 class="text-sm">- {activeColorName}</h3>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						{#each product.colors as color, i}
							<button
								class="h-5 w-5 rounded-full border-2 transition-all hover:scale-110 {activeColor ===
								color.hex
									? 'border-copy shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-copy)]'
									: 'border-black/10'}"
								style="background-color: {color.hex};"
								title={color.name}
								onclick={() => selectColor(color.name, color.hex, i)}
								aria-label="Select {color.name}"
							></button>
						{/each}
					</div>
				</div>
			{/if}

			<h1 class="text-xl font-semibold sm:text-2xl md:text-3xl">{product.name}</h1>

			<!-- Price -->
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-center">
					<span class="icon-[bi--currency-rupee] -ml-1 h-[18px] w-[18px]"></span>
					{#if product.discountPrice}
						<span class="text-sm font-semibold tracking-wider sm:text-base md:text-lg">
							{product.discountPrice.toLocaleString('en-IN')}
						</span>
					{:else}
						<span class="text-sm tracking-wider sm:text-base md:text-lg">
							{product.price.toLocaleString('en-IN')}
						</span>
					{/if}
				</div>
				{#if product.discountPrice}
					<span class="text-copy-light text-xs line-through"
						>₹{product.price.toLocaleString('en-IN')}</span
					>
					<span class="text-primary text-xs font-semibold">
						{Math.round((1 - product.discountPrice / product.price) * 100)}% off
					</span>
				{/if}
			</div>

			<!-- Badge -->
			{#if product.badgeTag && badgeConfig[product.badgeTag]}
				<span
					class="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wider uppercase {badgeConfig[
						product.badgeTag
					].cls}"
				>
					{badgeConfig[product.badgeTag].label}
				</span>
			{/if}

			<!-- Desktop: colors in info col -->
			{#if product.colors && product.colors.length > 0}
				<div class="hidden flex-col gap-2 md:flex">
					<div class="flex items-center gap-2">
						<h3 class="text-sm font-medium">Color</h3>
						<h3 class="text-sm">- {activeColorName}</h3>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						{#each product.colors as color, i}
							<button
								class="h-5 w-5 rounded-full border-2 transition-all hover:scale-110 {activeColor ===
								color.hex
									? 'border-copy shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-copy)]'
									: 'border-black/10'}"
								style="background-color: {color.hex};"
								title={color.name}
								onclick={() => selectColor(color.name, color.hex, i)}
								aria-label="Select {color.name}"
							></button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Discount note -->
			<!-- <div class="text-link flex cursor-pointer items-center gap-1">
				<h2 class="text-sm">Get 2% discount on early booking</h2>
				<span class="icon-[ic--round-plus]"></span>
			</div> -->
		</div>

		<!-- Middle: offers + delivery + stock -->
		<div class="flex w-full flex-col gap-2 md:w-[65%]">
			<!-- Offers -->
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="icon-[arcticons--offerup] h-6 w-6"></span>
					<h3 class="text-sm font-semibold">Offers:</h3>
				</div>
				<div class="flex flex-col pl-8 text-sm">
					{#if product.offers && product.offers.length > 0}
						{#each product.offers as offer}
							<span>{offer}</span>
						{/each}
					{:else}
						<p>No offers available</p>
					{/if}
				</div>
			</div>

			<!-- Delivery -->
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="icon-[material-symbols-light--delivery-truck-speed-outline-rounded] h-6 w-6"
					></span>
					<h3 class="text-sm font-semibold">Delivery:</h3>
				</div>
				<div class="flex flex-col pl-8 text-sm">
					<span>Free shipping</span>
					<div class="text-link flex cursor-pointer items-center gap-1">
						<span class="text-link">Check location availability</span>
						<span class="icon-[ic--round-plus]"></span>
					</div>
				</div>
			</div>

			<!-- Stock -->
			<div class="flex items-center gap-2">
				<span class="icon-[material-symbols-light--inventory-rounded] h-6 w-6"></span>
				<h3 class="text-sm font-semibold">Availability:</h3>
				<span class="text-sm {product.stockStatus === 'in_stock' ? 'text-link' : 'text-danger'}">
					{stockLabel}
				</span>
			</div>
		</div>

		<!-- Bottom: CTA buttons -->
		<div class="flex w-full flex-col gap-2 md:w-[65%]">
			<a
				href={whatsappUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="border-primary bg-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 tracking-wider text-black sm:px-4 md:tracking-widest"
			>
				<span class="icon-[ri--whatsapp-line] h-5 w-5"></span>
				Enquire Now
			</a>
			<button
				class="bg-surface-hover flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 tracking-wider sm:px-4 md:tracking-widest"
				onclick={() => navigator.share?.({ title: product.name, url: window.location.href })}
			>
				<span class="icon-[solar--share-bold] h-5 w-5"></span>
				Share
			</button>
		</div>
	</div>

	<!-- ── Right: Images ────────────────────────────────────────────────────── -->
	<div
		class="flex h-full w-full flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center md:h-auto md:w-[55%] md:flex-col md:justify-between"
	>
		<!-- Main image -->
		<div class="flex flex-1 items-center justify-center sm:flex-initial">
			<img
				class="h-[300px] object-contain transition-opacity duration-200"
				src={img(activeMain)}
				alt={product.name}
			/>
		</div>

		<!-- Thumbnail strip -->
		<div
			class="preview-img-box flex w-full justify-center gap-4 sm:flex-col sm:items-end md:flex-row"
		>
			{#each allThumbs as thumb}
				<button
					class="preview-img h-16 w-16 overflow-hidden rounded-lg border-2 p-1 transition-all sm:h-20 sm:w-20"
					style="border-color: {activeThumb === thumb
						? 'var(--color-strong)'
						: 'var(--color-subtle)'};"
					onclick={() => selectThumb(thumb)}
					aria-label="View image"
				>
					<img src={img(thumb)} alt="" class="h-full w-full object-contain" />
				</button>
			{/each}

			<!-- Placeholder slots if fewer than 4 thumbs (keeps layout stable)
			{#each Array(Math.max(0, 4 - allThumbs.length)) as _}
				<div class="preview-img h-16 w-16 rounded-lg sm:h-20 sm:w-20"></div>
			{/each} -->
		</div>
	</div>
</section>

<!-- ─── Product Information ───────────────────────────────────────────────── -->
<section
	class="mx-auto mb-6 flex w-[90%] min-w-[300px] flex-col gap-6 p-3 md:w-[80%] md:min-w-[1125px]"
>
	<div class="product-info flex w-full items-center justify-between border border-x-0">
		<h1 class="text-2xl font-semibold">Product Information</h1>
		<button
			class="flex cursor-pointer items-center justify-center"
			onclick={() => (showSpecs = !showSpecs)}
			aria-expanded={showSpecs}
		>
			<div class="flex items-center transition-all">
				{#if showSpecs}
					<span class="icon-[ri--arrow-up-s-line] h-8 w-8"></span>
				{:else}
					<span class="icon-[ri--arrow-down-s-line] h-8 w-8"></span>
				{/if}
			</div>
		</button>
	</div>

	{#if showSpecs}
		<div class="border-b-surface w-full border-b pb-6">
			<div class="product-info-field border-b-surface border-b">
				<h1 class="text-lg font-medium md:w-[20%]">Description</h1>
				<p class="text-justify text-sm tracking-wide md:w-[80%]">{product.description}</p>
			</div>

			<div class="product-info-field border-b-surface border-b">
				<h1 class="text-lg font-medium md:w-[20%]">Model</h1>
				<span class="text-justify text-sm tracking-wide md:w-[80%]">{product.name}</span>
			</div>

			<div class="product-info-field border-b-surface border-b">
				<h1 class="text-lg font-medium md:w-[20%]">Brand</h1>
				<span class="text-justify text-sm tracking-wide md:w-[80%]">{product.brand}</span>
			</div>

			{#if product.inTheBox && product.inTheBox.length > 0}
				<div class="product-info-field border-b-surface border-b">
					<h1 class="text-lg font-medium md:w-[20%]">What's In The Box</h1>
					<span class="flex items-center text-justify text-sm tracking-wide md:w-[80%]">
						{product.inTheBox.join(', ')}.
					</span>
				</div>
			{/if}

			{#if product.specifications && product.specifications.length > 0}
				<div class="flex flex-col gap-3 p-3 md:flex-row md:gap-6">
					<h1 class="text-lg font-medium md:w-[20%]">Specifications</h1>
					<div class="specification text-justify text-sm tracking-wide md:w-[80%]">
						{#each product.specifications as spec}
							<p class="p-1 pl-0">{spec.label} : {spec.value}</p>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</section>

<!-- ─── Similar Products ──────────────────────────────────────────────────── -->
{#await data.streamed.similarProducts}
	<section class="mx-auto mb-12 w-[90%] md:w-[80%] md:min-w-[1125px]">
		<div class="flex w-full items-center justify-center p-3">
			<h1 class="text-2xl font-semibold tracking-wider sm:text-3xl">You Might Also Enjoy</h1>
		</div>
		<div class="product-section mb-10 grid h-auto gap-4">
			{#each Array(3) as _}
				<div
					class="h-[400px] animate-pulse rounded-lg"
					style="background: linear-gradient(to bottom, #dcd8cd80 0%, #dcd8cde1 60%, #dcd8cd80 100%);"
				></div>
			{/each}
		</div>
	</section>
{:then similarProducts}
	{#if similarProducts.length > 0}
		<section
			class="mx-auto mb-12 flex w-[90%] min-w-[300px] flex-col gap-6 p-3 md:w-[80%] md:min-w-[1125px]"
		>
			<div class="flex w-full items-center justify-center p-3">
				<h1 class="text-2xl font-semibold tracking-wider sm:text-3xl">You Might Also Enjoy</h1>
			</div>
			<div class="product-section mb-10 grid h-auto gap-4">
				{#each similarProducts as p}
					<ProductCard product={p} />
				{/each}
			</div>
		</section>
	{/if}
{/await}

<style>
	.preview-img {
		background: var(--color-surface);
		border: 1px solid var(--color-subtle);
		cursor: pointer;
	}

	.product-info {
		border-color: var(--color-surface);
		padding: 0.75rem 1rem;
		border-radius: 0.25rem;
	}

	.product-info-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 0.75rem;
	}

	@media (min-width: 768px) {
		.product-info-field {
			flex-direction: row;
			gap: 1.5rem;
			align-items: flex-start;
		}
	}

	.product-section {
		grid-template-columns: repeat(1, 1fr);
	}

	@media (min-width: 640px) {
		.product-section {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) {
		.product-section {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
