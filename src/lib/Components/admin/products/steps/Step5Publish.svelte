<script lang="ts">
	import { uploadToIK, ikUrl } from '$lib/utils/imagekit';

	let {
		data = $bindable(),
		isEdit = false,
		ikEndpoint = '',
		saving = false,
		canSave = true,
		onsave
	}: {
		data: any;
		isEdit: boolean;
		ikEndpoint: string;
		saving: boolean;
		canSave?: boolean;
		onsave: () => void;
	} = $props();

	let newDesktopFile: File | null = $state(null);
	let newDesktopPreview = $state('');
	let newMobileFile: File | null = $state(null);
	let newMobilePreview = $state('');

	let uploadingDesktop = $state(false);
	let uploadingMobile = $state(false);

	function thumb(path: string | null) {
		return ikUrl(path, ikEndpoint, 'w-256,h-256,fo-auto');
	}

	function selectDesktop(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (newDesktopPreview) URL.revokeObjectURL(newDesktopPreview);
		newDesktopFile = file;
		newDesktopPreview = URL.createObjectURL(file);
		data.heroDesktopPath = '';
		data.heroDesktopFileId = '';
		(data as any)._pendingHeroDesktopFile = file;
		input.value = '';
	}

	function removeNewDesktop() {
		if (newDesktopPreview) URL.revokeObjectURL(newDesktopPreview);
		newDesktopFile = null;
		newDesktopPreview = '';
		(data as any)._pendingHeroDesktopFile = null;
	}

	function selectMobile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (newMobilePreview) URL.revokeObjectURL(newMobilePreview);
		newMobileFile = file;
		newMobilePreview = URL.createObjectURL(file);
		data.heroMobilePath = '';
		data.heroMobileFileId = '';
		(data as any)._pendingHeroMobileFile = file;
		input.value = '';
	}

	function removeNewMobile() {
		if (newMobilePreview) URL.revokeObjectURL(newMobilePreview);
		newMobileFile = null;
		newMobilePreview = '';
		(data as any)._pendingHeroMobileFile = null;
	}

	export async function save(): Promise<{
		heroDesktopPath: string;
		heroDesktopFileId: string;
		heroMobilePath: string;
		heroMobileFileId: string;
	}> {
		let heroDesktopPath = data.heroDesktopPath;
		let heroDesktopFileId = data.heroDesktopFileId ?? '';
		let heroMobilePath = data.heroMobilePath;
		let heroMobileFileId = data.heroMobileFileId ?? '';

		if (newDesktopFile) {
			uploadingDesktop = true;
			try {
				const result = await uploadToIK(newDesktopFile, 'hero-images');
				heroDesktopPath = result.filePath;
				heroDesktopFileId = result.fileId;
			} finally {
				uploadingDesktop = false;
			}
		}

		if (newMobileFile) {
			uploadingMobile = true;
			try {
				const result = await uploadToIK(newMobileFile, 'hero-images');
				heroMobilePath = result.filePath;
				heroMobileFileId = result.fileId;
			} finally {
				uploadingMobile = false;
			}
		}

		if (newDesktopPreview) URL.revokeObjectURL(newDesktopPreview);
		if (newMobilePreview) URL.revokeObjectURL(newMobilePreview);
		newDesktopFile = null;
		newDesktopPreview = '';
		newMobileFile = null;
		newMobilePreview = '';

		return { heroDesktopPath, heroDesktopFileId, heroMobilePath, heroMobileFileId };
	}

	export function destroy() {
		if (newDesktopPreview) URL.revokeObjectURL(newDesktopPreview);
		if (newMobilePreview) URL.revokeObjectURL(newMobilePreview);
	}
</script>

<div class="mx-auto max-w-[640px]">
	<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0 mb-5">
		{isEdit ? 'Save Changes' : 'Review & Publish'}
	</h2>

	<div class="flex flex-col gap-6">
		<!-- Hero images (only if isHero) -->
		{#if data.isHero}
			<div class="rounded-lg border border-subtle bg-surface p-4">
				<p class="mb-3 text-xs font-semibold text-copy uppercase tracking-[0.04em]">
					Hero Banner Images
				</p>
				<div class="flex flex-wrap gap-4">
					<!-- Desktop hero -->
					<div class="flex flex-col gap-[5px]">
						<span class="text-[11px] text-copy-light">Desktop (16:9)</span>
						{#if newDesktopPreview}
							<div class="relative">
								<img src={newDesktopPreview} alt="Hero desktop preview" class="h-32 w-56 rounded-md border border-primary object-cover" />
								<button
									class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
									onclick={removeNewDesktop}
									aria-label="Remove new desktop hero image"
								>
									<span class="icon-[lucide--x] h-3 w-3"></span>
								</button>
								<span class="absolute bottom-0.5 left-0.5 rounded bg-primary px-1 py-px text-[9px] font-bold text-white">NEW</span>
							</div>
						{:else if data.heroDesktopPath}
							<div class="relative">
								<img src={thumb(data.heroDesktopPath) ?? ''} alt="Hero desktop" class="h-32 w-56 rounded-md border border-subtle object-cover" />
								<button
									class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
									onclick={() => { data.heroDesktopPath = ''; data.heroDesktopFileId = ''; }}
									aria-label="Remove desktop hero image"
								>
									<span class="icon-[lucide--x] h-3 w-3"></span>
								</button>
							</div>
						{:else}
							<label class="flex h-32 w-56 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-subtle bg-neutral transition-colors hover:border-primary">
								<input type="file" accept="image/*" class="hidden" onchange={selectDesktop} />
								<span class="icon-[lucide--image-plus] h-5 w-5 text-copy-light"></span>
								<span class="mt-1 text-[10px] text-copy-light">Upload Desktop</span>
							</label>
						{/if}
					</div>

					<!-- Mobile hero -->
					<div class="flex flex-col gap-[5px]">
						<span class="text-[11px] text-copy-light">Mobile (9:16)</span>
						{#if newMobilePreview}
							<div class="relative">
								<img src={newMobilePreview} alt="Hero mobile preview" class="h-32 w-20 rounded-md border border-primary object-cover" />
								<button
									class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
									onclick={removeNewMobile}
									aria-label="Remove new mobile hero image"
								>
									<span class="icon-[lucide--x] h-3 w-3"></span>
								</button>
								<span class="absolute bottom-0.5 left-0.5 rounded bg-primary px-1 py-px text-[9px] font-bold text-white">NEW</span>
							</div>
						{:else if data.heroMobilePath}
							<div class="relative">
								<img src={thumb(data.heroMobilePath) ?? ''} alt="Hero mobile" class="h-32 w-20 rounded-md border border-subtle object-cover" />
								<button
									class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
									onclick={() => { data.heroMobilePath = ''; data.heroMobileFileId = ''; }}
									aria-label="Remove mobile hero image"
								>
									<span class="icon-[lucide--x] h-3 w-3"></span>
								</button>
							</div>
						{:else}
							<label class="flex h-32 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-subtle bg-neutral transition-colors hover:border-primary">
								<input type="file" accept="image/*" class="hidden" onchange={selectMobile} />
								<span class="icon-[lucide--image-plus] h-5 w-5 text-copy-light"></span>
								<span class="mt-1 text-[10px] text-copy-light">Upload Mobile</span>
							</label>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Publish toggle -->
		<div class="flex items-center justify-between rounded-lg border border-subtle bg-surface p-3.5">
			<div>
				<p class="m-0 text-[13px] font-medium text-[#1a1a1a]">Published</p>
				<p class="m-0 mt-0.5 text-[12px] text-copy-light">
					{data.isPublished ? 'Product is live on the storefront' : 'Product will be saved as unpublished'}
				</p>
			</div>
			<button
				class="relative h-5 w-9 cursor-pointer rounded-full border-none transition-colors {data.isPublished ? 'bg-primary' : 'bg-canvas'}"
				onclick={() => (data.isPublished = !data.isPublished)}
				aria-label={data.isPublished ? 'Unpublish' : 'Publish'}
			>
				<span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform {data.isPublished ? 'translate-x-4' : ''}"></span>
			</button>
		</div>

		<!-- Summary card -->
		<div class="rounded-lg border border-subtle bg-surface p-4">
			<p class="mb-3 text-xs font-semibold text-copy uppercase tracking-[0.04em]">Summary</p>
			<div class="flex flex-col gap-1.5 text-[13px]">
				<div class="flex justify-between">
					<span class="text-copy-light">Name</span>
					<span class="font-medium text-[#1a1a1a]">{data.name || '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-copy-light">Category</span>
					<span class="font-medium text-[#1a1a1a]">{data.categorySlug || '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-copy-light">Type</span>
					<span class="font-medium text-[#1a1a1a]">{data.productType || '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-copy-light">Price</span>
					<span class="font-medium text-[#1a1a1a]">
						₹{data.price?.toLocaleString('en-IN') ?? '0'}
						{#if data.discountPrice}
							<span class="ml-1 text-danger">→ ₹{data.discountPrice.toLocaleString('en-IN')}</span>
						{/if}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-copy-light">Variants</span>
					<span class="font-medium text-[#1a1a1a]">{data.variants.length}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-copy-light">Status</span>
					<span class="font-medium {data.isPublished ? 'text-green-600' : 'text-copy-light'}">
						{data.isPublished ? 'Published' : 'Unpublished'}
					</span>
				</div>
			</div>
		</div>

		<!-- Save button -->
		<button
			class="font-inter w-full cursor-pointer rounded-[7px] border-none bg-primary py-3 text-[14px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
			onclick={onsave}
			disabled={saving || !canSave}
		>
			{saving ? 'Uploading images & saving…' : isEdit ? 'Save Changes' : 'Publish Product'}
		</button>
		{#if isEdit && !canSave}
			<p class="text-center text-[12px] text-copy-light m-0 mt-2">No changes to save</p>
		{/if}
	</div>
</div>
