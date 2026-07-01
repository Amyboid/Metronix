<script lang="ts">
	import { tick } from 'svelte';

	let {
		data = $bindable()
	}: {
		data: any;
	} = $props();

	async function addSpecification() {
		data.specifications = [...data.specifications, { label: '', value: '' }];
		await tick();
		const inputs = document.querySelectorAll<HTMLInputElement>('.spec-input');
		inputs[inputs.length - 2]?.focus();
	}

	function removeSpecification(index: number) {
		data.specifications = data.specifications.filter((_: any, i: number) => i !== index);
	}

	function updateSpecLabel(index: number, value: string) {
		data.specifications = data.specifications.map((s: any, i: number) =>
			i === index ? { ...s, label: value } : s
		);
	}

	function updateSpecValue(index: number, value: string) {
		data.specifications = data.specifications.map((s: any, i: number) =>
			i === index ? { ...s, value: value } : s
		);
	}

	async function addInTheBox() {
		data.inTheBox = [...data.inTheBox, ''];
		await tick();
		const inputs = document.querySelectorAll<HTMLInputElement>('.box-input');
		inputs[inputs.length - 1]?.focus();
	}

	function removeInTheBox(index: number) {
		data.inTheBox = data.inTheBox.filter((_: string, i: number) => i !== index);
	}

	function updateInTheBox(index: number, value: string) {
		data.inTheBox = data.inTheBox.map((item: string, i: number) => (i === index ? value : item));
	}
</script>

<div class="mx-auto max-w-[640px]">
	<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0 mb-5">Details</h2>

	<div class="flex flex-col gap-6">
		<!-- Specifications -->
		<div class="flex flex-col gap-[5px]">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Specifications</span>
				<button
					class="text-primary hover:text-primary/80 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium transition-colors"
					onclick={addSpecification}
				>
					+ Add row
				</button>
			</div>

			{#if data.specifications.length === 0}
				<p class="text-[12px] text-copy-light m-0">No specifications added</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each data.specifications as spec, i}
						<div class="flex items-center gap-2">
							<input
								class="spec-input font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors flex-1 box-border focus:border-primary"
								value={spec.label}
								oninput={(e) => updateSpecLabel(i, (e.target as HTMLInputElement).value)}
								placeholder="Label"
							/>
							<input
								class="spec-input font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors flex-1 box-border focus:border-primary"
								value={spec.value}
								oninput={(e) => updateSpecValue(i, (e.target as HTMLInputElement).value)}
								placeholder="Value"
							/>
							<button
								class="text-copy-light hover:text-danger cursor-pointer border-none bg-transparent p-1 transition-colors"
								onclick={() => removeSpecification(i)}
								aria-label="Remove specification"
							>
								<span class="icon-[lucide--x] h-3.5 w-3.5"></span>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- In The Box -->
		<div class="flex flex-col gap-[5px]">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">In The Box</span>
				<button
					class="text-primary hover:text-primary/80 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium transition-colors"
					onclick={addInTheBox}
				>
					+ Add item
				</button>
			</div>

			{#if data.inTheBox.length === 0}
				<p class="text-[12px] text-copy-light m-0">No items added</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each data.inTheBox as item, i}
						<div class="flex items-center gap-2">
							<input
								class="box-input font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors flex-1 box-border focus:border-primary"
								value={item}
								oninput={(e) => updateInTheBox(i, (e.target as HTMLInputElement).value)}
								placeholder="e.g. Handset, Charger, Cable"
							/>
							<button
								class="text-copy-light hover:text-danger cursor-pointer border-none bg-transparent p-1 transition-colors"
								onclick={() => removeInTheBox(i)}
								aria-label="Remove item"
							>
								<span class="icon-[lucide--x] h-3.5 w-3.5"></span>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Stock Status -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Stock Status</span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
				bind:value={data.stockStatus}
			>
				<option value="in_stock">In Stock</option>
				<option value="out_of_stock">Out of Stock</option>
			</select>
		</label>

		<!-- Is Hero Toggle -->
		<div class="flex items-center justify-between rounded-lg border border-subtle bg-surface p-3.5">
			<div>
				<p class="text-[13px] font-medium text-[#1a1a1a] m-0">Hero Product</p>
				<p class="text-[12px] text-copy-light m-0 mt-0.5">
					Mark this product for hero banner use
				</p>
			</div>
			<button
				class="relative h-5 w-9 cursor-pointer rounded-full border-none transition-colors {data.isHero
					? 'bg-primary'
					: 'bg-canvas'}"
				onclick={() => (data.isHero = !data.isHero)}
				aria-label={data.isHero ? 'Disable hero' : 'Enable hero'}
			>
				<span
					class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform {data.isHero
						? 'translate-x-4'
						: ''}"
				></span>
			</button>
		</div>
	</div>
</div>
