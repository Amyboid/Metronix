<script lang="ts">
	import { tick } from 'svelte';

	let {
		data = $bindable()
	}: {
		data: any;
	} = $props();

	let touched = $state<Record<string, boolean>>({});

	async function addOffer() {
		data.offers = [...data.offers, ''];
		await tick();
		const inputs = document.querySelectorAll<HTMLInputElement>('.offer-input');
		inputs[inputs.length - 1]?.focus();
	}

	function removeOffer(index: number) {
		data.offers = data.offers.filter((_: string, i: number) => i !== index);
	}

	function updateOffer(index: number, value: string) {
		data.offers = data.offers.map((o: string, i: number) => (i === index ? value : o));
	}

	function formatPrice(p: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 0
		}).format(p);
	}
</script>

<div class="mx-auto max-w-[640px]">
	<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0 mb-5">Pricing</h2>

	<div class="flex flex-col gap-5">
		<!-- Price -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Price (INR) <span class="text-danger">*</span>
			</span>
			<input
				type="number"
				min="0"
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {touched.price && (!data.price || data.price <= 0)
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.price}
				oninput={() => (touched.price = true)}
				placeholder="Enter price"
			/>
			{#if data.price && data.price > 0}
				<span class="text-[12px] text-copy-light">{formatPrice(data.price)}</span>
			{/if}
		</label>

		<!-- Discount Price -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Discount Price</span>
			<input
				type="number"
				min="0"
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {data.discountPrice && data.price && data.discountPrice >= data.price
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.discountPrice}
				placeholder="Leave empty if no discount"
			/>
			{#if data.discountPrice && data.price}
				{#if data.discountPrice >= data.price}
					<span class="text-[12px] text-danger">Discount must be less than price</span>
				{:else}
					<span class="text-[12px] text-copy-light">
						{formatPrice(data.discountPrice)} — {Math.round(((data.price - data.discountPrice) / data.price) * 100)}% off
					</span>
				{/if}
			{/if}
		</label>

		<!-- Offers -->
		<div class="flex flex-col gap-[5px]">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Offers</span>
				<button
					class="text-primary hover:text-primary/80 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium transition-colors"
					onclick={addOffer}
				>
					+ Add offer
				</button>
			</div>

			{#if data.offers.length === 0}
				<p class="text-[12px] text-copy-light m-0">No offers added</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each data.offers as offer, i}
						<div class="flex items-center gap-2">
							<input
								class="offer-input font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors flex-1 box-border focus:border-primary"
								value={offer}
								oninput={(e) => updateOffer(i, (e.target as HTMLInputElement).value)}
								placeholder="e.g. Free delivery on orders above ₹999"
							/>
							<button
								class="text-copy-light hover:text-danger cursor-pointer border-none bg-transparent p-1 transition-colors"
								onclick={() => removeOffer(i)}
								aria-label="Remove offer"
							>
								<span class="icon-[lucide--x] h-3.5 w-3.5"></span>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- WhatsApp Message -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">WhatsApp Message</span>
			<textarea
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border min-h-[80px] resize-y focus:border-primary"
				bind:value={data.whatsappMsg}
				placeholder="Pre-filled enquiry message for WhatsApp"
				rows="3"
			></textarea>
		</label>
	</div>
</div>
