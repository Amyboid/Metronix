<script lang="ts">
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';

	let { form } = $props();
	let showForm: { show: boolean } = getContext('showForm');
	let specifications = $state<{ label: string; value: string }[]>([{ label: '', value: '' }]);

	function handleShowForm() {
		showForm.show = !showForm.show;
	}
	function addSpecification() {
		specifications.push({ label: '', value: '' });
	}

	function removeSpecification(index: number) {
		specifications.splice(index, 1);
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

	// update productTypes based on selectedCategory
	let selectedCategory = $state('');
	let productTypes = $derived(
		selectedCategory ? productTypesMapedWithCategory[selectedCategory] : []
	);

	// Helper function to capitalize the first letter for display
	function capitalize(str: string): string {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
	}
</script>

<div
	class="overlay fixed top-0 z-100 flex flex-col items-center overflow-x-hidden p-4 py-12 md:p-12"
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 100 }}
>
	<div
		class="product-form-container bg-primary-background relative max-w-full rounded-lg p-6 pt-12 md:min-w-[700px] md:px-20 md:pt-20"
	>
		<button
			class="absolute top-4 right-4 flex cursor-pointer items-center rounded-md bg-[#d1cbbd] p-1 md:top-6 md:right-6 md:p-2"
			onclick={handleShowForm}
			aria-label="cancel"
		>
			<span class="icon-[ix--cancel] h-4 w-4 sm:h-5 sm:w-5"></span>
		</button>

		<form
			action="?/create"
			method="post"
			use:enhance
			enctype="multipart/form-data"
			class="flex flex-col gap-4"
		>
			{#if form?.message}
				<div class="text-red-500">
					<p>{form.message}</p>
				</div>
			{/if}
			<div>
				<label for="name">Product Name</label>
				<input type="text" id="name" name="name" />
			</div>

			<div>
				<label for="productImage">Upload Image</label>
				<input type="file" id="productImage" name="productImage" accept=".png" />
			</div>

			<div>
				<label for="price">Price</label>
				<input type="number" id="price" name="price" step="0.01" />
			</div>

			<div>
				<label for="category">Category</label>
				<select id="category" name="category" bind:value={selectedCategory}>
					<option value="">Choose a Category</option>
					{#each categories as category}
						<option value={category}> {capitalize(category)}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="brand">Brand</label>
				<select id="brand" name="brand">
					<option value="">Choose a Brand</option>
					{#each brands as brand}
						<option value={brand}>{capitalize(brand)}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="productType">Product Type</label>
				<select id="productType" name="productType">
					<option value="">Choose product type</option>
					{#each productTypes as type}
						<option value={type}>{capitalize(type)}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="description">Description</label>
				<textarea id="description" name="description" rows="5" cols="40"></textarea>
			</div>

			<div>
				<label for="inStock">In Stock Quantity</label>
				<input type="number" id="inStock" name="inStock" min="0" />
			</div>

			<div class="">
				<span class="w-full text-base md:text-lg">Specifications</span>
				<div class="flex items-center gap-2 rounded-lg text-xs text-[#6d6d6d]">
					<span class="icon-[simple-line-icons--info] h-3 w-3"></span>
					<span>Enter as "Label: Value" pairs.</span>
				</div>

				<div class="w-full">
					{#each specifications as spec, index}
						<div class="flex items-end gap-2 text-xs md:text-sm">
							<div class="flex flex-col gap-1 w-1/2">
								<span>Label:</span>
								<input
									type="text"
									id="spec-label-{index}"
									name="specifications[{index}].label"
									bind:value={spec.label}
									required
								/>
							</div>
							<div class="flex flex-col gap-1 w-1/2">
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
					class="mt-1 ml-auto flex cursor-pointer items-center gap-1 rounded-lg transition-all duration-200 ease-in bg-[#d1cbbd] hover:bg-[#c7bfae] p-1 px-2 text-xs text-[#6d6d6d] md:text-sm"
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

				<textarea id="inTheBox" name="inTheBox" rows="5" cols="40"></textarea>
			</div>

			<div>
				<label for="offers">Offers</label>
				<div class="flex items-center gap-2 rounded-lg text-xs text-[#6d6d6d]">
					<span class="icon-[simple-line-icons--info] h-3 w-3"></span>
					<span>Enter offers, one per line or comma-separated.</span>
				</div>
				<textarea id="offers" name="offers" rows="5" cols="40"></textarea>
			</div>
			<button
				type="submit"
				class="mt-2 w-full cursor-pointer rounded-lg bg-[#d1cbbd] transition-all duration-200 ease-in hover:bg-[#c7bfae] p-3 md:p-4 text-sm md:text-base"
				>Add Product</button
			>
		</form>
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
		background: hsl(42, 18%, 88%);
		width: 100%;
		padding: 12px;
		border-radius: var(--radius-lg);
		outline: none;
		font-size: var(--text-xs);
		line-height: var(--tw-leading, var(--text-xs--line-height));
		resize: none;
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}
 
	textarea:focus,
	input:focus {
		border: 1px solid #6d6d6d;
	}
	select > option {
		padding: 12px;
	}

	@media only screen and (min-width: 640px) {
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
