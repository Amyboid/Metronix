<script>
	import ProductCard from '$lib/Components/ProductCard.svelte';
	import { getImagePath } from '$lib/utils/imageImports';
	import { error } from '@sveltejs/kit';
	let { data } = $props();
	const product = data.item;
	const similarProducts = data.similarProducts;

	export const load = () => {
		error(404, 'Page Not Found\nhello');
	};

	let showMore = $state(true);
</script>

<section
	class="flex min-h-[70vh] w-[90%] min-w-[300px] flex-col-reverse gap-4 pb-6 md:min-h-[85vh] md:w-[80%] md:min-w-[1125px] md:flex-row md:pt-4"
>
	<div class="flex flex-col justify-between gap-4 p-3 md:w-[45%] md:gap-4">
		<div
			class="flex w-full flex-col gap-4 border-b border-b-[var(--primary-background)] pb-4 md:w-[65%]"
		>
			<h1 class="text-xl font-semibold sm:text-2xl md:text-3xl">{product.name}</h1>
			<div class="flex items-center">
				<span class="icon-[bi--currency-rupee] -ml-1 h-[18px] w-[18px]"></span>
				<span
					class="flex items-center justify-between text-sm tracking-wider sm:text-base md:text-lg"
				>
					{product?.price}
				</span>
			</div>
			<div class="flex cursor-pointer items-center gap-1 text-blue-700">
				<h2 class="">Get 2% discount on early booking</h2>
				<span class="icon-[ic--round-plus]"></span>
			</div>
		</div>

		<div class="flex w-full flex-col gap-2 md:w-[65%]">
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="icon-[arcticons--offerup] h-6 w-6"></span>
					<h3 class="text-sm font-semibold">Offers:</h3>
				</div>
				<div class="flex flex-col pl-8 text-sm">
					{#if product.offers}
						{#each product.offers as offer}
							<span>{offer}</span>
						{/each}
					{:else}
						<p>No offers available</p>
					{/if}
				</div>
			</div>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="icon-[material-symbols-light--delivery-truck-speed-outline-rounded] h-6 w-6"
					></span>
					<h3 class="text-sm font-semibold">Delivery:</h3>
				</div>
				<div class="flex flex-col pl-8 text-sm">
					<span>Free shipping</span>
					<div class="flex cursor-pointer items-center gap-1 text-blue-700">
						<span class="text-blue-700">Check location availability</span>
						<span class="icon-[ic--round-plus]"></span>
					</div>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<span class="icon-[material-symbols-light--inventory-rounded] h-6 w-6"></span>
				<h3 class="text-sm font-semibold">In Stock:</h3>
				<h4 class="text-sm">
					{product.inStock}
				</h4>
			</div>
		</div>

		<div class="flex w-full flex-col gap-2 md:w-[65%]">
			<button
				class="flex w-full cursor-pointer items-center justify-center rounded-lg border-[var(--accent)] bg-[var(--accent)] p-2 tracking-wider sm:pr-4 sm:pl-4 md:tracking-widest"
				>Enquire Now</button
			>
			<button
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--primary-background)] p-2 tracking-wider sm:pr-4 sm:pl-4 md:tracking-widest"
			>
				<span class="icon-[solar--share-bold] h-5 w-5"></span>
				Share</button
			>
		</div>
	</div>

	<div
		class="flex h-full w-full flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center md:h-auto md:w-[55%] md:flex-col md:justify-between"
	>
		<enhanced:img
			class="h-[300px] object-contain"
			src={getImagePath(product?.src)}
			alt={product?.name}
		/>
		<div
			class="preview-img-box flex w-full justify-between gap-4 sm:flex-col sm:items-end md:flex-row md:justify-center"
		>
			<div class="preview-img h-16 w-16 rounded-lg sm:h-20 sm:w-20"></div>
			<div class="preview-img h-16 w-16 rounded-lg sm:h-20 sm:w-20"></div>
			<div class="preview-img h-16 w-16 rounded-lg sm:h-20 sm:w-20"></div>
			<div class="preview-img h-16 w-16 rounded-lg sm:h-20 sm:w-20"></div>
		</div>
	</div>
</section>

<section class="mb-6 flex w-[90%] min-w-[300px] flex-col gap-6 p-3 md:w-[80%] md:min-w-[1125px]">
	<div class="product-info flex w-full items-center justify-between border">
		<h1 class="text-2xl font-semibold">Product Information</h1>
		<button
			class="flex cursor-pointer items-center justify-center"
			onclick={() => (showMore = !showMore)}
		>
			<div class="flex items-center transition-all">
				{#if showMore}
					<span class="icon-[ri--arrow-down-s-line] h-8 w-8"></span>
				{:else}
					<span class="icon-[ri--arrow-up-s-line] h-8 w-8"></span>
				{/if}
			</div>
		</button>
	</div>

	<div class="w-full border-b border-b-[var(--primary-background)] pb-6">
		<div class="product-info-field border-b border-b-[var(--primary-background)]">
			<h1 class="text-lg font-medium md:w-[20%]">Description</h1>
			<container class="text-justify text-sm tracking-wide md:w-[80%]"
				>{product.description}</container
			>
		</div>
		<div class="product-info-field border-b border-b-[var(--primary-background)]">
			<h1 class="text-lg font-medium md:w-[20%]">Model</h1>
			<container class="text-justify text-sm tracking-wide md:w-[80%]">{product.name}</container>
		</div>
		<div class="product-info-field border-b border-b-[var(--primary-background)]">
			<h1 class="text-lg font-medium md:w-[20%]">Brand</h1>
			<container class="text-justify text-sm tracking-wide md:w-[80%]">{product.brand}</container>
		</div>
		<div class="product-info-field border-b border-b-[var(--primary-background)]">
			<h1 class="text-lg font-medium md:w-[20%]">What's In The Box</h1>
			<container class="flex items-center text-justify text-sm tracking-wide md:w-[80%]">
				{product.inTheBox.join(', ')}.
			</container>
		</div>
		<div class="flex flex-col gap-3 p-3 md:flex-row md:gap-6">
			<h1 class="text-lg font-medium md:w-[20%]">Specifications</h1>
			<container class="specification text-justify text-sm tracking-wide md:w-[80%]">
				{#each product.specifications as label}
					<p class="p-1 pl-0">{label.label} : {label.value}</p>
				{/each}
			</container>
		</div>
	</div>
</section>

{#if similarProducts.length !== 0}
	<section class="mb-12 flex w-[90%] min-w-[300px] flex-col gap-6 p-3 md:w-[80%] md:min-w-[1125px]">
		<div class="flex w-full items-center justify-center p-3">
			<h1 class="text-2xl font-semibold tracking-wider sm:text-3xl">You Might Also Enjoy</h1>
		</div>

		<div class="product-section mb-10 grid h-auto gap-4">
			{#each similarProducts as similarProduct}
				<ProductCard product={similarProduct} />
			{/each}
		</div>
	</section>
{/if}

<style> 
	.preview-img {
		background-color: var(--primary-background);
		/* background-color: var(--accent); */
	}
	container:not(.specification) {
		display: flex;
		align-items: center;
	}
	.product-info {
		padding: 24px 0;
		border-left: 1px;
		border-right: 1px;
		border-color: var(--primary-background);
	}
	.product-info-field {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		gap: 0.75rem;
	}

	.product-section {
		grid-template-columns: repeat(1, 1fr);
		place-content: center;
	}

	@media only screen and (min-width: 640px) {
		.product-section {
			grid-template-columns: repeat(2, 1fr);
			place-content: center;
		}
	}

	@media (min-width: 768px) {
		.product-info-field {
			flex-direction: row;
			gap: 1.5rem;
		}
		.product-section {
			grid-template-columns: repeat(3, 1fr);
			place-content: center;
		}
	}
</style>
