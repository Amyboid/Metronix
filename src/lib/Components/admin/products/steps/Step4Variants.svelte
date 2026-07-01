<script lang="ts">
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

	$effect(() => {
		while (fileState.length < data.variants.length) {
			fileState.push({ hasNewMain: false, newGalleryCount: 0 });
		}
		while (fileState.length > data.variants.length) {
			fileState.pop();
		}
	});
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
				<div class="flex flex-col gap-3">
					<!-- Color inputs -->
					<div class="flex items-end gap-3">
						<label class="flex flex-1 flex-col gap-[5px]">
							<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
								Color Name <span class="text-danger">*</span>
							</span>
							<input
								class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
								bind:value={variant.colorName}
								placeholder="e.g. Phantom Black"
							/>
						</label>
						<label class="flex flex-col gap-[5px]">
							<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Hex</span>
							<div class="flex items-center gap-2">
								<input
									type="color"
									class="h-[34px] w-[34px] cursor-pointer rounded-md border border-subtle p-0"
									bind:value={variant.hex}
								/>
								<input
									class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-[90px] box-border focus:border-primary"
									bind:value={variant.hex}
									placeholder="#000000"
								/>
							</div>
						</label>
					</div>

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
