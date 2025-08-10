<script lang="ts">
	import { enhance } from '$app/forms';
	import { getContext, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { ProductType } from '$lib/models/ProductModel';

	interface AdminProductFormProps {
		form?: any;
		initialProductData?: ProductType | null;
		closeForm: () => void;
	}
	let { form, initialProductData, closeForm }: AdminProductFormProps = $props();
	let productImageInput = $state();
	let submissionMessage: string | null = $state(null);
	let submissionError: string | null = $state(null); 
	let imagePreviewUrl = $state(
		initialProductData ? 'src/lib/assets/' + initialProductData.src + '.png' : null
	);
	let selectedFile: File | null = $state(null);
	let productName = $state(initialProductData?.name || 'Test Product Name');
	let productPrice: number | undefined = $state(initialProductData?.price || 99.99);
	let productCategory = $state(initialProductData?.category || 'consumer-electronics');
	let productType = $state(initialProductData?.productType || 'tv');
	let productBrand = $state(initialProductData?.brand || 'LG');
	let productDescription = $state(
		initialProductData?.description ||
			'This is a default description for a test product. It is highly versatile and durable.'
	);
	let productInStock: number | undefined = $state(initialProductData?.inStock || 100);
	// Convert array to string for textarea, then trim and join for consistency
	let itemInTheBox = $state(
		initialProductData?.inTheBox.toString().split(',').join(', ') || 'Product unit, Charger, Manual'
	);

	let productOffers = $state<string[]>(
		initialProductData?.offers ? [...initialProductData.offers] : ['']
	);
	let specifications = $state<{ label: string; value: string }[]>(
		initialProductData?.specifications
			? initialProductData.specifications.map((spec) => ({ ...spec }))
			: [{ label: '', value: '' }]
	);

	function addSpecification() {
		specifications = [...specifications, { label: '', value: '' }];
	}

	function removeSpecification(index: number) {
		specifications = specifications.filter((_, i) => i !== index);
	}

	function addOffer() {
		productOffers = [...productOffers, ''];
	}

	function removeOffer(index: number) {
		productOffers = productOffers.filter((_, i) => i !== index);
	}

	const categories = [
		'home-appliances',
		'consumer-electronics',
		'kitchen-appliances',
		'self-care-appliances'
	];
	const brands = [
		'Sony',
		'Samsung',
		'LG',
		'Panasonic',
		'Bose',
		'JBL',
		'Philips',
		'Whirlpool',
		'Bosch',
		'Haier',
		'Godrej',
		'Hitachi',
		'Daikin',
		'Voltas',
		'Lloyd',
		'Blue Star',
		'Prestige',
		'Bajaj',
		'Havells',
		'Usha',
		'Kent RO',
		'Hindware'
	];

	const productTypesMapedWithCategory: { [key: string]: string[] } = {
		'home-appliances': ['ac', 'fridge', 'fan', 'washing-machine'],
		'consumer-electronics': ['tv', 'speaker'],
		'kitchen-appliances': ['chimney', 'oven', 'ro', 'stove', 'mixer'],
		'self-care-appliances': ['dryer', 'straightener']
	};

	// update productTypes based on productCategory
	let productTypes = $derived(
		productCategory ? productTypesMapedWithCategory[productCategory] : []
	);

	// Helper function to capitalize the first letter for display
	function capitalize(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
	}

	function handleImagePreview(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}

			selectedFile = input.files[0];
			if (selectedFile) {
				imagePreviewUrl = URL.createObjectURL(selectedFile);
			}
		}
	}
	function handleClearImage() {
		// ts-ignore
		productImageInput.value = null;
		imagePreviewUrl = null;
		selectedFile = null;
	}

	$effect(() => {
		submissionError = null;
	});
	onDestroy(() => {
		console.log('component has been destroyed');
	});
</script>

<div
	class="overlay fixed top-0 left-0 z-100 flex flex-col items-center overflow-x-hidden p-4 py-12 md:p-12"
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 100 }}
>
	<div
		class="product-form-container bg-primary-background relative max-w-full rounded-lg p-6 pt-12 md:min-w-[700px] md:px-20 md:pt-20"
	>
		<button
			class="absolute top-4 right-4 flex cursor-pointer items-center rounded-md bg-[#d1cbbd] p-2 transition-all duration-200 ease-in hover:bg-[#c7bfae] md:top-6 md:right-6 md:p-2"
			onclick={closeForm}
			aria-label="cancel"
		>
			<span class="icon-[ix--cancel] h-4 w-4 sm:h-5 sm:w-5"></span>
		</button>
		{#if !submissionMessage}
			<form
				action={initialProductData ? `?/update` : `?/create`}
				method="post"
				use:enhance={({ formData }) => {
					formData.append('offers', JSON.stringify(productOffers));
					formData.append('specifications', JSON.stringify(specifications));
					if (initialProductData) {
						formData.append('product_id', initialProductData._id as string);
						formData.append('imageSrc', initialProductData.src as string);
					}

					return async ({ result, update }) => {
						if (result.type == 'success') {
							submissionMessage = result.data?.message as string;
							// setTimeout(() => {
							// 	closeForm();
							// }, 300);
						}
						if (result.type == 'failure') {
							if (result.status === 400) {
								submissionError = result.data?.message as string;
							} else {
								submissionMessage = result.data?.message as string;
							}
						}
						await update();
					};
				}}
				enctype="multipart/form-data"
				class="flex flex-col gap-4"
			>
				{#if submissionError}
					<div class="text-red-500">
						<p>{submissionError}</p>
					</div>
				{/if}
				<div>
					<label for="name">Product Name</label>
					<input type="text" id="name" name="name" bind:value={productName} />
				</div>

				<div>
					<label for="productImage">Upload Image</label>
					<div class="flex flex-col items-center">
						<input
							type="file"
							id="productImage"
							name="productImage"
							accept=".png"
							required={initialProductData ? false : true}
							onchange={handleImagePreview}
							bind:this={productImageInput}
						/>
						{#if imagePreviewUrl}
							<div
								class="my-3 flex h-[250px] w-[300px] items-center justify-center rounded-lg bg-[#d1cbbd] p-4 sm:h-[300px] md:w-[350px]"
							>
								<img class="h-[90%] object-contain" src={imagePreviewUrl} alt="" />
							</div>
						{/if}

						<!-- clear image button -->
						{#if selectedFile || imagePreviewUrl}
							<button
								class="mt-1 ml-auto flex cursor-pointer items-center gap-1 rounded-lg bg-[#d1cbbd] p-1 px-2 text-xs text-[#6d6d6d] transition-all duration-200 ease-in hover:bg-[#c7bfae] md:text-sm"
								type="button"
								onclick={handleClearImage}>Clear Image</button
							>
						{/if}
					</div>
				</div>

				<div>
					<label for="price">Price</label>
					<input type="number" id="price" name="price" step="0.01" bind:value={productPrice} />
				</div>

				<div>
					<label for="category">Category</label>
					<select id="category" name="category" bind:value={productCategory}>
						<option value="">Choose a Category</option>
						{#each categories as category}
							<option value={category}> {capitalize(category)}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="brand">Brand</label>
					<select id="brand" name="brand" bind:value={productBrand}>
						<option value="">Choose a Brand</option>
						{#each brands as brand}
							<option value={brand}>{capitalize(brand)}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="productType">Product Type</label>
					<select id="productType" name="productType" bind:value={productType}>
						<option value="">Choose product type</option>
						{#each productTypes as type}
							<option value={type}>{capitalize(type)}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="description">Description</label>
					<textarea
						id="description"
						name="description"
						rows="5"
						cols="40"
						bind:value={productDescription}
					></textarea>
				</div>

				<div>
					<label for="inStock">In Stock Quantity</label>
					<input type="number" id="inStock" name="inStock" bind:value={productInStock} min="0" />
				</div>

				<div class="">
					<span class="w-full text-base md:text-lg">Specifications</span>
					<div class="flex items-center gap-2 rounded-lg text-xs text-[#6d6d6d]">
						<span class="icon-[simple-line-icons--info] h-3 w-3"></span>
						<span>Enter as "Label: Value" pairs.</span>
					</div>

					<div class="flex w-full flex-col gap-3">
						{#each specifications as spec, index (index)}
							<div class="flex items-end gap-2 text-xs md:text-sm">
								<div class="flex w-1/2 flex-col gap-1">
									<span>Label:</span>
									<input
										type="text"
										id="spec-label-{index}"
										name="specifications[{index}].label"
										bind:value={spec.label}
										required
									/>
								</div>
								<div class="flex w-1/2 flex-col gap-1">
									<span>Value:</span>
									<input
										type="text"
										id="spec-value-{index}"
										name="specifications[{index}].value"
										bind:value={spec.value}
										required
									/>
								</div>

								{#if specifications.length > 1}
									<button
										class="cursor-pointer"
										type="button"
										onclick={() => removeSpecification(index)}
										aria-label="remove"
									>
										<span
											class="icon-[material-symbols--delete-outline-rounded] h-5 w-5 text-[#6d6d6d]"
										></span>
									</button>
								{/if}
							</div>
						{/each}
					</div>
					<button
						class="mt-1 ml-auto flex cursor-pointer items-center gap-1 rounded-lg bg-[#d1cbbd] p-1 px-2 text-xs text-[#6d6d6d] transition-all duration-200 ease-in hover:bg-[#c7bfae] md:text-sm"
						type="button"
						onclick={addSpecification}><span class="icon-[ic--round-plus]"></span> Add new</button
					>
				</div>

				<div class="">
					<label for="inTheBox" class="">Items In The Box</label>
					<div class="flex items-center gap-2 rounded-lg text-xs text-[#6d6d6d]">
						<span class="icon-[simple-line-icons--info] h-3 w-3"></span>
						<span>Enter items, one per line or comma-separated.</span>
					</div>

					<textarea id="inTheBox" name="inTheBox" bind:value={itemInTheBox} rows="5" cols="40"
					></textarea>
				</div>

				<div>
					<label for="offers">Offers</label>
					<div class="flex items-center gap-2 rounded-lg text-xs text-[#6d6d6d]">
						<span class="icon-[simple-line-icons--info] h-3 w-3"></span>
						<span>Enter offers, one per line or comma-separated.</span>
					</div>
					<div class=" flex flex-col gap-2">
						{#each productOffers as offers, i (i)}
							<div class="flex items-end gap-2">
								<input
									type="text"
									id="offers-{i}"
									name="offers-{i}"
									bind:value={productOffers[i]}
									required
								/>

								<button
									class="cursor-pointer"
									type="button"
									onclick={() => removeOffer(i)}
									aria-label="remove"
								>
									<span
										class="icon-[material-symbols--delete-outline-rounded] h-5 w-5 text-[#6d6d6d]"
									></span>
								</button>
							</div>
						{/each}
					</div>

					<button
						class="mt-1 ml-auto flex cursor-pointer items-center gap-1 rounded-lg bg-[#d1cbbd] p-1 px-2 text-xs text-[#6d6d6d] transition-all duration-200 ease-in hover:bg-[#c7bfae] md:text-sm"
						type="button"
						onclick={addOffer}><span class="icon-[ic--round-plus]"></span> Add new</button
					>
				</div>
				<button
					type="submit"
					class="mt-2 w-full cursor-pointer rounded-lg bg-[#d1cbbd] p-3 text-sm transition-all duration-200 ease-in hover:bg-[#c7bfae] md:p-4 md:text-base"
					>{initialProductData ? 'Update Product' : 'Add Product'}</button
				>
			</form>
		{:else}
			<div class="rounded-lg bg-[#e6e3db] p-2 text-center text-sm capitalize">
				{submissionMessage}
			</div>
		{/if}
	</div>
</div>

<style>
	.overlay {
		width: 100vw;
		height: 100vh;
		background: #30303080;
	}

	form > div {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	label {
		font-size: var(--text-base);
		line-height: var(--tw-leading, var(--text-base--line-height));
		text-transform: capitalize;
	}
	input,
	textarea,
	select {
		background: #e6e3db;
		width: 100%;
		padding: 12px;
		border-radius: var(--radius-lg);
		outline: none;
		font-size: var(--text-xs);
		line-height: var(--tw-leading, var(--text-xs--line-height));
		resize: none;
		border: 1px solid transparent;
		transition: all 0.2s ease;
		color: #6d6d6d;
	}

	textarea:focus,
	input:focus {
		border: 1px solid #6d6d6d;
	}
	select > option {
		padding: 12px;
	}

	@media only screen and (min-width: 768px) {
		label {
			font-size: var(--text-lg);
			line-height: var(--tw-leading, var(--text-lg--line-height));
		}

		input,
		textarea,
		select {
			font-size: var(--text-sm);
			line-height: var(--tw-leading, var(--text-sm--line-height));
		}
	}
</style>
