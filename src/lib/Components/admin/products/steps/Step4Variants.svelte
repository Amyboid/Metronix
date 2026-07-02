<script lang="ts">
	import { onMount } from 'svelte';
	import VariantUploader from '../VariantUploader.svelte';

	let {
		data = $bindable(),
		ikEndpoint = '',
		addVariant,
		removeVariant,
		fileState = $bindable([])
	}: {
		data: any;
		ikEndpoint: string;
		addVariant: () => void;
		removeVariant: (index: number) => void;
		fileState?: { hasNewMain: boolean; newGalleryCount: number }[];
	} = $props();

	let uploaderRefs: (VariantUploader | undefined)[] = $state([]);
	let availableColors: { hex: string; name: string }[] = $state([]);

	// Track which variants are locked to an existing color
	let lockedVariants: Set<number> = $state(new Set());

	async function loadColors() {
		if (!data.brand || !data.productType) return;
		try {
			const params = new URLSearchParams({ brand: data.brand, productType: data.productType });
			const res = await fetch(`/api/admin/colors?${params}`);
			if (res.ok) {
				const d = await res.json();
				availableColors = (d.items ?? []).map((c: any) => ({ hex: c.hex, name: c.name }));
			}
		} catch { /* ignore */ }
	}

	$effect(() => {
		// Re-fetch colors when brand or product type changes
		if (data.brand && data.productType) {
			loadColors();
		}
	});

	$effect(() => {
		while (fileState.length < data.variants.length) {
			fileState.push({ hasNewMain: false, newGalleryCount: 0 });
		}
		while (fileState.length > data.variants.length) {
			fileState.pop();
		}
	});

	function selectExistingColor(variantIndex: number, hex: string) {
		const color = availableColors.find((c) => c.hex === hex);
		if (!color) return;
		data.variants[variantIndex].colorName = color.name;
		data.variants[variantIndex].hex = color.hex;
		lockedVariants.add(variantIndex);
		lockedVariants = new Set(lockedVariants); // trigger reactivity
	}

	function unlockVariant(variantIndex: number) {
		lockedVariants.delete(variantIndex);
		lockedVariants = new Set(lockedVariants);
	}

	function onColorNameInput(variantIndex: number, value: string) {
		data.variants[variantIndex].colorName = value;
		// If user types a name that matches an existing color, auto-fill hex
		const match = availableColors.find(
			(c) => c.name.toLowerCase() === value.toLowerCase()
		);
		if (match) {
			data.variants[variantIndex].hex = match.hex;
			lockedVariants.add(variantIndex);
			lockedVariants = new Set(lockedVariants);
		}
	}

	function onHexInput(variantIndex: number, value: string) {
		data.variants[variantIndex].hex = value;
		// If user picks a hex that matches an existing color, auto-fill name
		const match = availableColors.find(
			(c) => c.hex.toUpperCase() === value.toUpperCase()
		);
		if (match) {
			data.variants[variantIndex].colorName = match.name;
			lockedVariants.add(variantIndex);
			lockedVariants = new Set(lockedVariants);
		}
	}

	// Check if a color name+hex combo conflicts with existing DB colors
	function getColorError(variantIndex: number): string | null {
		const v = data.variants[variantIndex];
		if (!v.colorName.trim() || !v.hex) return null;

		// Check against existing DB colors: same name but different hex
		const nameMatch = availableColors.find(
			(c) => c.name.toLowerCase() === v.colorName.trim().toLowerCase()
		);
		if (nameMatch && nameMatch.hex.toUpperCase() !== v.hex.toUpperCase()) {
			return `Name "${v.colorName}" is already used with hex ${nameMatch.hex}`;
		}

		// Check against existing DB colors: same hex but different name
		const hexMatch = availableColors.find(
			(c) => c.hex.toUpperCase() === v.hex.toUpperCase()
		);
		if (hexMatch && hexMatch.name.toLowerCase() !== v.colorName.trim().toLowerCase()) {
			return `Hex ${v.hex} is already used with name "${hexMatch.name}"`;
		}

		return null;
	}
</script>

<div class="mx-auto max-w-[640px]">
	<div class="mb-5 flex items-center justify-between">
		<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0">Variants & Images</h2>
		<button
			class="text-primary hover:text-primary/80 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium transition-colors"
			onclick={addVariant}
		>
			+ Add Variant
		</button>
	</div>

	{#if data.variants.length === 0}
		<div
			class="border-subtle text-copy-light rounded-lg border border-dashed py-10 text-center text-[13px]"
		>
			<p class="m-0 mb-1">No variants added yet</p>
			<p class="m-0 text-[12px]">Each variant represents a color option with its own images</p>
			<button
				class="mt-3 font-inter border-primary text-primary hover:bg-primary/10 cursor-pointer rounded-[7px] border bg-transparent px-4 py-2 text-[13px] font-medium transition-colors"
				onclick={addVariant}
			>
				+ Add First Variant
			</button>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.variants as variant, i (i)}
				{@const isLocked = lockedVariants.has(i)}
				<div class="flex flex-col gap-3">
					<!-- Color name + hex inputs -->
					<div class="flex items-end gap-3">
						<label class="flex flex-1 flex-col gap-[5px]">
							<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
								Color Name <span class="text-danger">*</span>
							</span>
							<input
								class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
								value={variant.colorName}
								oninput={(e) => onColorNameInput(i, (e.target as HTMLInputElement).value)}
								placeholder="e.g. Phantom Black"
								disabled={isLocked}
							/>
						</label>
						<label class="flex flex-col gap-[5px]">
							<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Hex</span>
							<div class="flex items-center gap-2">
								<input
									type="color"
									class="h-[34px] w-[34px] cursor-pointer rounded-md border border-subtle p-0"
									value={variant.hex}
									oninput={(e) => onHexInput(i, (e.target as HTMLInputElement).value)}
									disabled={isLocked}
								/>
								<input
									class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-[90px] box-border focus:border-primary"
									value={variant.hex}
									oninput={(e) => onHexInput(i, (e.target as HTMLInputElement).value)}
									placeholder="#000000"
									disabled={isLocked}
								/>
							</div>
						</label>
						{#if isLocked}
							<button
								class="text-[11px] text-copy-light hover:text-danger cursor-pointer border-none bg-transparent p-0 transition-colors mb-[2px]"
								onclick={() => unlockVariant(i)}
							>
								Unlock
							</button>
						{/if}
					</div>

					<!-- Color error -->
					{#if getColorError(i)}
						<p class="text-[12px] text-danger m-0">{getColorError(i)}</p>
					{/if}

					<!-- Color suggestions -->
					{#if availableColors.length > 0}
						<div class="flex flex-col gap-1.5">
							<span class="text-[11px] text-copy-light">Existing colors — tap to select</span>
							<div class="flex flex-wrap gap-1.5">
								{#each availableColors as color (color.hex)}
									{@const isSelected = variant.hex.toUpperCase() === color.hex.toUpperCase()}
									<button
										class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] cursor-pointer transition-all {isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-subtle bg-transparent text-copy hover:bg-surface'}"
										onclick={() => selectExistingColor(i, color.hex)}
									>
										<span class="w-3 h-3 rounded-sm shrink-0 border border-black/10" style="background-color: {color.hex}"></span>
										{color.name}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Image uploader -->
					<VariantUploader
						bind:this={uploaderRefs[i]}
						bind:variant={data.variants[i]}
						index={i}
						canRemove={data.variants.length > 1}
						onremove={() => {
							uploaderRefs.splice(i, 1);
							removeVariant(i);
						}}
						onfileschange={(hasNewMain, newGalleryCount) => {
							fileState[i] = { hasNewMain, newGalleryCount };
						}}
						{ikEndpoint}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
