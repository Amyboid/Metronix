<script lang="ts">
	import { uploadToIK, ikUrl } from '$lib/utils/imagekit';

	let {
		variant = $bindable(),
		index,
		canRemove = true,
		onremove,
		onfileschange,
		ikEndpoint = ''
	}: {
		variant: {
			colorName: string;
			hex: string;
			mainImagePath: string;
			mainFileId?: string;
			galleryPaths: string[];
			galleryFileIds?: string[];
		};
		index: number;
		canRemove?: boolean;
		onremove?: () => void;
		onfileschange?: (hasNewMain: boolean, newGalleryCount: number) => void;
		ikEndpoint?: string;
	} = $props();

	let newMainFile: File | null = $state((variant as any)._pendingMainFile ?? null);
	let newMainPreview = $state((variant as any)._pendingMainFile ? URL.createObjectURL((variant as any)._pendingMainFile) : '');
	let newGalleryFiles: File[] = $state((variant as any)._pendingGalleryFiles ?? []);
	let newGalleryPreviews: string[] = $state(
		((variant as any)._pendingGalleryFiles as File[] | null)?.map((f: File) => URL.createObjectURL(f)) ?? []
	);

	let uploading = $state(false);
	let error = $state('');

	function thumb(path: string | null) {
		return ikUrl(path, ikEndpoint, 'w-128,h-128,fo-auto');
	}

	function selectMainImage(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (newMainPreview) URL.revokeObjectURL(newMainPreview);
		newMainFile = file;
		newMainPreview = URL.createObjectURL(file);
		variant.mainImagePath = '';
		variant.mainFileId = '';
		(variant as any)._pendingMainFile = file;
		input.value = '';
		onfileschange?.(true, newGalleryFiles.length);
	}

	function removeNewMainImage() {
		if (newMainPreview) URL.revokeObjectURL(newMainPreview);
		newMainFile = null;
		newMainPreview = '';
		(variant as any)._pendingMainFile = null;
		onfileschange?.(false, newGalleryFiles.length);
	}

	function selectGalleryImages(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files?.length) return;

		const existingCount = variant.galleryPaths.length;
		const remaining = 6 - existingCount - newGalleryFiles.length;
		const toAdd = Array.from(files).slice(0, remaining);

		newGalleryFiles = [...newGalleryFiles, ...toAdd];
		newGalleryPreviews = [
			...newGalleryPreviews,
			...toAdd.map((f) => URL.createObjectURL(f))
		];
		(variant as any)._pendingGalleryFiles = [...newGalleryFiles];
		input.value = '';
		onfileschange?.(!!newMainFile, newGalleryFiles.length);
	}

	function removeNewGalleryImage(idx: number) {
		if (newGalleryPreviews[idx]) URL.revokeObjectURL(newGalleryPreviews[idx]);
		newGalleryFiles = newGalleryFiles.filter((_: File, i: number) => i !== idx);
		newGalleryPreviews = newGalleryPreviews.filter((_: string, i: number) => i !== idx);
		(variant as any)._pendingGalleryFiles = newGalleryFiles.length ? [...newGalleryFiles] : null;
		onfileschange?.(!!newMainFile, newGalleryFiles.length);
	}

	function removeExistingGalleryImage(idx: number) {
		variant.galleryPaths = variant.galleryPaths.filter((_: string, i: number) => i !== idx);
		variant.galleryFileIds = (variant.galleryFileIds ?? []).filter(
			(_: string, i: number) => i !== idx
		);
		onfileschange?.(!!newMainFile, newGalleryFiles.length);
	}

	export async function save(): Promise<{
		mainImagePath: string;
		mainFileId: string;
		galleryPaths: string[];
		galleryFileIds: string[];
	}> {
		uploading = true;
		error = '';

		try {
			let mainImagePath = variant.mainImagePath;
			let mainFileId = variant.mainFileId ?? '';

			if (newMainFile) {
				const result = await uploadToIK(newMainFile, 'product-variants');
				mainImagePath = result.filePath;
				mainFileId = result.fileId;
			}

			let galleryPaths = [...variant.galleryPaths];
			let galleryFileIds = [...(variant.galleryFileIds ?? [])];

			if (newGalleryFiles.length) {
				for (const file of newGalleryFiles) {
					const result = await uploadToIK(file, 'product-variants');
					galleryPaths.push(result.filePath);
					galleryFileIds.push(result.fileId);
				}
			}

			if (newMainPreview) URL.revokeObjectURL(newMainPreview);
			for (const p of newGalleryPreviews) URL.revokeObjectURL(p);
			newMainFile = null;
			newMainPreview = '';
			newGalleryFiles = [];
			newGalleryPreviews = [];

			return { mainImagePath, mainFileId, galleryPaths, galleryFileIds };
		} catch (e: any) {
			error = e.message ?? 'Upload failed';
			throw e;
		} finally {
			uploading = false;
		}
	}

	export function destroy() {
		if (newMainPreview) URL.revokeObjectURL(newMainPreview);
		for (const p of newGalleryPreviews) URL.revokeObjectURL(p);
	}

	const existingGalleryCount = $derived(variant.galleryPaths.length);
	const newGalleryCount = $derived(newGalleryFiles.length);
	const totalGalleryCount = $derived(existingGalleryCount + newGalleryCount);
	const canAddMore = $derived(totalGalleryCount < 6);
	const belowMin = $derived(totalGalleryCount < 4);
</script>

<div class="rounded-lg border border-subtle bg-surface p-4">
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="h-6 w-6 rounded-full border border-subtle shadow-sm"
				style="background-color: {variant.hex || '#ccc'}"
			></div>
			<span class="text-[13px] font-semibold text-[#1a1a1a]">
				{variant.colorName || `Variant ${index + 1}`}
			</span>
			{#if belowMin}
				<span class="text-[11px] text-danger font-medium">{totalGalleryCount}/4 min</span>
			{:else}
				<span class="text-[11px] text-copy-light">{totalGalleryCount}/6</span>
			{/if}
		</div>
		{#if canRemove}
			<button
				class="text-copy-light hover:text-danger cursor-pointer border-none bg-transparent p-1 transition-colors"
				onclick={onremove}
				aria-label="Remove variant"
			>
				<span class="icon-[lucide--trash-2] h-3.5 w-3.5"></span>
			</button>
		{/if}
	</div>

	{#if error}
		<div class="mb-3 text-[12px] text-danger">{error}</div>
	{/if}

	{#if uploading}
		<div class="mb-3 flex items-center gap-2 text-[12px] text-primary">
			<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
			Uploading images to ImageKit…
		</div>
	{/if}

	<!-- Main image -->
	<div class="mb-3">
		<p class="mb-1.5 text-[11px] font-semibold text-copy uppercase tracking-[0.04em]">Main Image</p>
		{#if newMainPreview}
			<div class="relative inline-block">
				<img src={newMainPreview} alt="Main preview" class="h-24 w-24 rounded-md border border-primary object-cover" />
				<button
					class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
					onclick={removeNewMainImage}
					aria-label="Remove new main image"
				>
					<span class="icon-[lucide--x] h-3 w-3"></span>
				</button>
				<span class="absolute bottom-0.5 left-0.5 rounded bg-primary px-1 py-px text-[9px] font-bold text-white">NEW</span>
			</div>
		{:else if variant.mainImagePath}
			<div class="relative inline-block">
				<img src={thumb(variant.mainImagePath) ?? ''} alt="Main" class="h-24 w-24 rounded-md border border-subtle object-cover" />
				<button
					class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
					onclick={() => { variant.mainImagePath = ''; variant.mainFileId = ''; }}
					aria-label="Remove main image"
				>
					<span class="icon-[lucide--x] h-3 w-3"></span>
				</button>
			</div>
		{:else}
			<label class="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-subtle bg-neutral transition-colors hover:border-primary">
				<input type="file" accept="image/*" class="hidden" onchange={selectMainImage} />
				<span class="icon-[lucide--image-plus] h-5 w-5 text-copy-light"></span>
				<span class="mt-1 text-[10px] text-copy-light">Upload</span>
			</label>
		{/if}
	</div>

	<!-- Gallery images -->
	<div>
		<p class="mb-1.5 text-[11px] font-semibold text-copy uppercase tracking-[0.04em]">
			Gallery <span class="text-copy-light font-normal">(min 4, max 6)</span>
		</p>
		<div class="flex flex-wrap gap-2">
			{#each variant.galleryPaths as path, i}
				<div class="relative">
					<img src={thumb(path) ?? ''} alt="Gallery {i + 1}" class="h-20 w-20 rounded-md border border-subtle object-cover" />
					<button
						class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
						onclick={() => removeExistingGalleryImage(i)}
						aria-label="Remove gallery image"
					>
						<span class="icon-[lucide--x] h-2.5 w-2.5"></span>
					</button>
				</div>
			{/each}

			{#each newGalleryPreviews as preview, i}
				<div class="relative">
					<img src={preview} alt="New gallery {i + 1}" class="h-20 w-20 rounded-md border border-primary object-cover" />
					<button
						class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
						onclick={() => removeNewGalleryImage(i)}
						aria-label="Remove new gallery image"
					>
						<span class="icon-[lucide--x] h-2.5 w-2.5"></span>
					</button>
					<span class="absolute bottom-0.5 left-0.5 rounded bg-primary px-1 py-px text-[8px] font-bold text-white">NEW</span>
				</div>
			{/each}

			{#if canAddMore}
				<label class="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-subtle bg-neutral transition-colors hover:border-primary">
					<input type="file" accept="image/*" multiple class="hidden" onchange={selectGalleryImages} />
					<span class="icon-[lucide--plus] h-4 w-4 text-copy-light"></span>
				</label>
			{/if}
		</div>
	</div>
</div>
