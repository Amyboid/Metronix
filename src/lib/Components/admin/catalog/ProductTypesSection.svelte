<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadToIK, deleteFromIK, ikUrl, getIKAuth } from '$lib/utils/imagekit';
	import SidePanel from './SidePanel.svelte';
	import SectionHeader from './SectionHeader.svelte';
	import DataTable from './DataTable.svelte';
	import DeleteConfirmModal from './DeleteConfirmModal.svelte';

	type ProductType = {
		slug:         string;
		name:         string;
		categorySlug: string;
		bannerPath:   string | null;
		bannerFileId: string | null;
		bannerMsg:    string | null;
	};

	type CategoryOption = { slug: string; name: string };

	let items:      ProductType[] = $state([]);
	let loading     = $state(true);
	let loadingMore = $state(false);
	let hasMore     = $state(false);
	let offset      = $state(0);
	let listError   = $state('');
	let ikEndpoint  = $state('');

	// ── Panel state ──────────────────────────────────────────────────────────
	let panelMode:   'add' | 'edit' | null = $state(null);
	let panelItem:   ProductType | null = $state(null);
	let formName     = $state('');
	let formSlug     = $state('');
	let formBannerMsg = $state('');
	let formPending: { file: File; previewUrl: string } | null = $state(null);
	let formUploading = $state(false);
	let formSaving   = $state(false);
	let formError    = $state('');
	let formBannerPath: string | null = $state(null);
	let formBannerFileId: string | null = $state(null);
	let formCategorySlug = $state('');
	let categoryOptions: CategoryOption[] = $state([]);

	const canSave = $derived.by(() => {
		if (!formName.trim() || !formSlug.trim()) return false;
		if (panelMode === 'add' && !formCategorySlug) return false;
		if (panelMode === 'add') return true;
		if (!panelItem) return false;
		return (
			formName !== panelItem.name ||
			formSlug !== panelItem.slug ||
			formBannerMsg !== (panelItem.bannerMsg ?? '') ||
			formBannerPath !== panelItem.bannerPath ||
			formBannerFileId !== panelItem.bannerFileId ||
			formPending !== null
		);
	});

	// ── Delete modal ──────────────────────────────────────────────────────────
	let deleteTarget:       ProductType | null = $state(null);
	let deleteProductCount  = $state(0);
	let deleteChecking      = $state(false);
	let deleteConfirming    = $state(false);
	let deletingSlug        = $state('');

	function nameToSlug(n: string) {
		return n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	}
	function thumb(path: string | null) {
		return ikUrl(path, ikEndpoint, 'w-80,h-48,fo-auto');
	}

	async function load(reset = true) {
		if (reset) { offset = 0; items = []; loading = true; }
		else loadingMore = true;
		listError = '';
		try {
			const res  = await fetch(`/api/admin/catalog?section=product-types&offset=${offset}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			items   = reset ? data.items : [...items, ...data.items];
			hasMore = data.hasMore;
			offset  = items.length;
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false; loadingMore = false;
		}
	}

	onMount(async () => {
		const auth = await getIKAuth().catch(() => null);
		if (auth) ikEndpoint = auth.urlEndpoint;
		await Promise.all([
			load(),
			fetch('/api/admin/catalog').then(r => r.json()).then(d => {
				categoryOptions = d.categories ?? [];
			}).catch(() => {}),
		]);
	});

	// ── Panel helpers ────────────────────────────────────────────────────────
	function openAdd() {
		panelMode = 'add'; panelItem = null;
		formName = ''; formSlug = ''; formBannerMsg = ''; formError = '';
		formPending = null; formBannerPath = null; formBannerFileId = null;
		formCategorySlug = '';
	}

	function openEdit(item: ProductType) {
		panelMode = 'edit'; panelItem = item;
		formName = item.name; formSlug = item.slug;
		formBannerMsg = item.bannerMsg ?? '';
		formBannerPath = item.bannerPath ?? null;
		formBannerFileId = item.bannerFileId ?? null;
		formCategorySlug = item.categorySlug ?? '';
		formPending = null; formError = '';
	}

	function closePanel() {
		if (formPending?.previewUrl) URL.revokeObjectURL(formPending.previewUrl);
		panelMode = null; panelItem = null;
		formPending = null; formError = '';
	}

	function handleUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		formError = '';
		if (formPending?.previewUrl) URL.revokeObjectURL(formPending.previewUrl);
		formPending = { file, previewUrl: URL.createObjectURL(file) };
	}

	function removePending() {
		if (formPending?.previewUrl) URL.revokeObjectURL(formPending.previewUrl);
		formPending = null;
	}

	async function save() {
		if (!formName.trim()) { formError = 'Name is required'; return; }
		if (!formSlug.trim()) { formError = 'Slug is required'; return; }
		formSaving = true; formError = '';
		let uploadedFileId: string | null = null;
		try {
			let bannerPath: string | null = formBannerPath;
			let bannerFileId: string | null = formBannerFileId;
			if (formPending) {
				formUploading = true;
				const r = await uploadToIK(formPending.file, 'assets/hero-banner');
				uploadedFileId = r.fileId;
				bannerPath = r.filePath;
				bannerFileId = r.fileId;
				formUploading = false;
			}

			if (panelMode === 'add') {
				const res = await fetch('/api/admin/catalog', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						section: 'product-type', slug: formSlug.trim(), name: formName.trim(),
						categorySlug: formCategorySlug,
						bannerMsg: formBannerMsg || null, bannerPath, bannerFileId,
					}),
				});
				if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Create failed' })); throw new Error(b.message); }
			} else {
				const res = await fetch('/api/admin/catalog', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						section: 'product-type', slug: panelItem!.slug,
						name: formName.trim(), bannerMsg: formBannerMsg || null,
						bannerPath, bannerFileId,
					}),
				});
				if (!res.ok) {
					if (uploadedFileId) await deleteFromIK(uploadedFileId);
					throw new Error(await res.text());
				}
			}
			if (formPending?.previewUrl) URL.revokeObjectURL(formPending.previewUrl);
			closePanel();
			await load();
		} catch (err: any) {
			if (uploadedFileId) await deleteFromIK(uploadedFileId);
			formError = err.message ?? 'Save failed';
		}
		finally { formSaving = false; formUploading = false; }
	}

	// ── Delete ──────────────────────────────────────────────────────────────
	async function startDelete(item: ProductType) {
		deleteTarget = item; deleteChecking = true; deleteConfirming = false;
		try {
			const res  = await fetch(`/api/admin/catalog?section=product-count&entity=product-type&slug=${item.slug}`);
			const data = await res.json();
			deleteProductCount = data.count ?? 0;
		} catch { deleteProductCount = 0; }
		finally { deleteChecking = false; deleteConfirming = true; }
	}

	function closeDeleteModal() { deleteTarget = null; deleteConfirming = false; deleteChecking = false; }

	async function confirmDelete(force: boolean) {
		if (!deleteTarget) return;
		const slug = deleteTarget.slug;
		deletingSlug = slug; closeDeleteModal();
		try {
			const res = await fetch(`/api/admin/catalog?section=product-type&slug=${slug}${force ? '&force=true' : ''}`, { method: 'DELETE' });
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Delete failed' })); throw new Error(b.message); }
			await load();
		} catch (err: any) { listError = err.message ?? 'Delete failed'; }
		finally { deletingSlug = ''; }
	}
</script>

<!-- ── Delete Modal ──────────────────────────────────────────────────────────── -->
<DeleteConfirmModal
	open={deleteTarget !== null && (deleteChecking || deleteConfirming)}
	entityName={deleteTarget?.name ?? ''}
	entityLabel="product type"
	productCount={deleteProductCount}
	checking={deleteChecking}
	onconfirm={confirmDelete}
	oncancel={closeDeleteModal}
/>

<!-- ── Side Panel (Add / Edit) ─────────────────────────────────────────────── -->
<SidePanel
	open={panelMode !== null}
	title={panelMode === 'add' ? 'New Product Type' : 'Edit Product Type'}
	saving={formSaving || formUploading}
	{canSave}
	onsave={save}
	ondiscard={closePanel}
>
	<div class="flex flex-col gap-4">
		<!-- Image preview + upload -->
		<div class="flex gap-3.5 items-start">
			<div class="w-[200px] h-[90px] shrink-0 border border-subtle rounded-lg overflow-hidden bg-canvas flex items-center justify-center">
				{#if formPending}
					<img class="w-full h-full object-cover" src={formPending.previewUrl} alt="Preview" />
				{:else if formBannerPath}
					<img class="w-full h-full object-cover" src={ikUrl(formBannerPath, ikEndpoint, 'w-400,h-175,fo-auto') ?? ''} alt="Banner" />
				{:else}
					<span class="text-xs text-copy-light">No banner selected</span>
				{/if}
			</div>
			<div class="flex flex-col gap-2 justify-center">
				<label class="inline-flex items-center gap-[5px] font-inter text-xs font-semibold py-1.5 px-3 rounded-md border border-subtle bg-neutral text-copy cursor-pointer whitespace-nowrap transition-colors hover:bg-canvas hover:border-subtle-hover" class:opacity-60={formUploading}>
					{#if formUploading}<span class="inline-block w-2.5 h-2.5 border-2 border-subtle border-t-primary rounded-full animate-[spin_0.7s_linear_infinite]"></span> Uploading…
					{:else}
						<span class="icon-[lucide--upload] w-3 h-3"></span>
						{formPending ? 'Replace Banner' : 'Upload Banner'}
					{/if}
					<input type="file" accept="image/*" class="hidden" onchange={handleUpload} disabled={formUploading} />
				</label>
				{#if formPending}
					<button class="font-inter text-xs py-[5px] px-2.5 rounded-md border border-[#fca5a5] bg-transparent text-danger cursor-pointer transition-colors hover:bg-[#fef2f2]" onclick={removePending}>Remove</button>
				{/if}
				<span class="text-[11px] text-copy-light">Recommended: 1200 × 400 px</span>
			</div>
		</div>

		<!-- Name + Slug -->
		<div class="flex gap-3 flex-wrap">
			<label class="flex flex-col gap-[5px] flex-1 min-w-[200px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Name <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formName} oninput={() => { formSlug = nameToSlug(formName); }} placeholder="e.g. Air Conditioner" />
			</label>
			<label class="flex flex-col gap-[5px] flex-1 min-w-[200px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Slug <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formSlug} placeholder="auto-generated" />
			</label>
		</div>

		<!-- Category -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Category <span class="text-danger">*</span></span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
				bind:value={formCategorySlug}
				disabled={panelMode === 'edit'}
			>
				<option value="">Select category</option>
				{#each categoryOptions as cat}
					<option value={cat.slug}>{cat.name}</option>
				{/each}
			</select>
		</label>

		<!-- Banner Message -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Banner Message</span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formBannerMsg} placeholder="Stay cool this summer…" />
		</label>

		{#if formError}
			<p class="text-xs text-danger m-0">{formError}</p>
		{/if}
	</div>
</SidePanel>

<!-- ── Main ──────────────────────────────────────────────────────────────────── -->
<section class="flex flex-col gap-5">
	<SectionHeader title="Product Types" subtitle="Manage product type filters, banner images and messages." onAdd={openAdd} addLabel="+ Add Product Type" />

	{#if listError}<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>{/if}

	<DataTable
		columns={[
			{ label: 'Banner', width: 'w-20' },
			{ label: 'Slug' },
			{ label: 'Name' },
			{ label: 'Category' },
			{ label: 'Banner Message' },
		]}
		{loading}
		empty={items.length === 0}
		emptyMessage="No product types yet. Add one above."
	>
		{#each items as item: ProductType (item.slug)}
			<tr>
				<td class="w-20 py-2 px-3.5 text-copy border-b border-subtle">
					{#if item.bannerPath}
						<div class="w-16 h-9 rounded-[5px] overflow-hidden bg-canvas border border-subtle"><img class="w-full h-full object-cover" src={thumb(item.bannerPath) ?? ''} alt={item.name} /></div>
					{:else}
						<div class="w-16 h-9 flex items-center justify-center text-xs text-copy-light">—</div>
					{/if}
				</td>
				<td class="py-2 px-3.5 text-copy border-b border-subtle"><code class="font-mono text-xs text-copy-light">{item.slug}</code></td>
				<td class="py-2 px-3.5 text-copy border-b border-subtle">{item.name}</td>
				<td class="py-2 px-3.5 text-copy-light border-b border-subtle text-[12px]">{item.categorySlug ?? '—'}</td>
				<td class="py-2 px-3.5 text-copy-light border-b border-subtle">{item.bannerMsg ?? '—'}</td>
				<td class="text-right whitespace-nowrap py-2 px-3.5 text-copy border-b border-subtle">
					<button class="text-xs py-[5px] px-2 rounded-[5px] border border-subtle bg-transparent cursor-pointer text-copy inline-flex items-center justify-center transition-colors ml-1 hover:bg-surface hover:border-subtle-hover" onclick={() => openEdit(item)} title="Edit" aria-label="Edit">
					<span class="icon-[lucide--pencil] w-3 h-3"></span>
				</button>
				<button class="text-xs py-[5px] px-2 rounded-[5px] border border-transparent bg-transparent cursor-pointer text-danger inline-flex items-center justify-center transition-colors ml-1 hover:bg-[#fef2f2] hover:border-[#fca5a5]" onclick={() => startDelete(item)} disabled={deletingSlug === item.slug} title="Delete">
					{#if deletingSlug === item.slug}…{:else}
						<span class="icon-[lucide--trash-2] w-3 h-3"></span>
					{/if}
					</button>
				</td>
			</tr>
		{/each}
	</DataTable>
	{#if hasMore}
		<div class="flex justify-center pt-1">
			<button class="font-inter text-[13px] font-medium py-2 px-6 rounded-lg border border-subtle bg-surface text-copy cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas" onclick={() => load(false)} disabled={loadingMore}>
				{loadingMore ? 'Loading…' : 'Load more'}
			</button>
		</div>
	{/if}
</section>

