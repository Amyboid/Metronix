<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadToIK, deleteFromIK, ikUrl, getIKAuth } from '$lib/utils/imagekit';
	import SidePanel from './SidePanel.svelte';
	import DataTable from './DataTable.svelte';
	import DeleteConfirmModal from './DeleteConfirmModal.svelte';

	let { onadd, selectedCount = $bindable(0), bulkDelete = $bindable(null), clearSelection = $bindable(null) }: {
		onadd?: (fn: () => void) => void;
		selectedCount?: number;
		bulkDelete?: (() => void) | null;
		clearSelection?: (() => void) | null;
	} = $props();

	type Brand = {
		slug:        string;
		name:        string;
		logoPath:    string | null;
		logoFileId:  string | null;
	};

	// ── List ──────────────────────────────────────────────────────────────────
	let items:      Brand[] = $state([]);
	let loading     = $state(true);
	let loadingMore = $state(false);
	let hasMore     = $state(false);
	let offset      = $state(0);
	let listError   = $state('');
	let ikEndpoint  = $state('');

	// ── Selection ────────────────────────────────────────────────────────────
	let selectedIds: string[] = $state([]);
	let selectAll = $state(false);

	function toggleSelectAll() {
		if (selectAll) { selectedIds = []; selectAll = false; }
		else { selectedIds = items.map((i) => i.slug); selectAll = true; }
	}
	function toggleSelect(id: string) {
		selectedIds = selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id];
		selectAll = selectedIds.length === items.length;
	}

	$effect(() => { selectedCount = selectedIds.length; });
	$effect(() => { bulkDelete = _bulkDelete; });
	$effect(() => { clearSelection = () => { selectedIds = []; selectAll = false; }; });

	function handleRowClick(id: string) {
		const item = items.find((i) => i.slug === id);
		if (item) openEdit(item);
	}

	function _bulkDelete() {
		if (selectedIds.length === 0) return;
		if (selectedIds.length === 1) {
			const item = items.find((i) => i.slug === selectedIds[0]);
			if (item) startDelete(item);
			return;
		}
		if (!confirm(`Delete ${selectedIds.length} brands? This cannot be undone.`)) return;
		(async () => {
			try {
				for (const slug of selectedIds) {
					const res = await fetch(`/api/admin/catalog?section=brand&slug=${slug}`, { method: 'DELETE' });
					if (!res.ok) {
						const b = await res.json().catch(() => ({ message: 'Delete failed' }));
						throw new Error(b.message ?? 'Delete failed');
					}
				}
				selectedIds = []; selectAll = false;
				await load();
			} catch (err: any) { listError = err.message ?? 'Delete failed'; }
		})();
	}

	// ── Panel state ──────────────────────────────────────────────────────────
	let panelMode:   'add' | 'edit' | null = $state(null);
	let panelItem:   Brand | null = $state(null);
	let formName     = $state('');
	let formSlug     = $state('');
	let formPending: { file: File; previewUrl: string } | null = $state(null);
	let formUploading = $state(false);
	let formSaving   = $state(false);
	let formError    = $state('');
	let formLogoPath: string | null = $state(null);
	let formLogoFileId: string | null = $state(null);

	const canSave = $derived.by(() => {
		if (!formName.trim() || !formSlug.trim()) return false;
		if (panelMode === 'add') return true;
		if (!panelItem) return false;
		return (
			formName !== panelItem.name ||
			formSlug !== panelItem.slug ||
			formLogoPath !== panelItem.logoPath ||
			formLogoFileId !== panelItem.logoFileId ||
			formPending !== null
		);
	});

	// ── Delete modal ──────────────────────────────────────────────────────────
	let deleteTarget:      Brand | null = $state(null);
	let deleteProductCount = $state(0);
	let deleteChecking     = $state(false);
	let deleteConfirming   = $state(false);
	let deletingSlug       = $state('');

	// ── Helpers ───────────────────────────────────────────────────────────────
	function nameToSlug(n: string) {
		return n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	}
	function logoThumb(path: string | null) {
		return ikUrl(path, ikEndpoint, 'w-64,h-64,fo-auto');
	}

	// ── Data loading ──────────────────────────────────────────────────────────
	async function load(reset = true) {
		if (reset) { offset = 0; items = []; loading = true; }
		else loadingMore = true;
		listError = '';
		try {
			const res  = await fetch(`/api/admin/catalog?section=brands&offset=${offset}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			items   = reset ? data.items : [...items, ...data.items];
			hasMore = data.hasMore;
			offset  = items.length;
		} catch (e: any) { listError = e.message ?? 'Failed to load'; }
		finally { loading = false; loadingMore = false; }
	}

	onMount(async () => {
		const auth = await getIKAuth().catch(() => null);
		if (auth) ikEndpoint = auth.urlEndpoint;
		await load();
		onadd?.(openAdd);
	});

	// ── Panel helpers ────────────────────────────────────────────────────────
	function openAdd() {
		panelMode = 'add'; panelItem = null;
		formName = ''; formSlug = ''; formError = '';
		formPending = null; formLogoPath = null; formLogoFileId = null;
	}

	function openEdit(item: Brand) {
		panelMode = 'edit'; panelItem = item;
		formName = item.name; formSlug = item.slug;
		formLogoPath = item.logoPath ?? null;
		formLogoFileId = item.logoFileId ?? null;
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
			let logoPath: string | null = formLogoPath;
			let logoFileId: string | null = formLogoFileId;
			if (formPending) {
				formUploading = true;
				const r = await uploadToIK(formPending.file, 'assets/brand-logo');
				uploadedFileId = r.fileId;
				logoPath = r.filePath;
				logoFileId = r.fileId;
				formUploading = false;
			}

			if (panelMode === 'add') {
				const res = await fetch('/api/admin/catalog', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						section: 'brand', slug: formSlug.trim(), name: formName.trim(),
						logoPath, logoFileId,
					}),
				});
				if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Create failed' })); throw new Error(b.message); }
			} else {
				const res = await fetch('/api/admin/catalog', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						section: 'brand', slug: panelItem!.slug,
						name: formName.trim(), logoPath, logoFileId,
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

	// ── Delete modal ──────────────────────────────────────────────────────────
	async function startDelete(item: Brand) {
		deleteTarget = item; deleteChecking = true; deleteConfirming = false;
		try {
			const res  = await fetch(`/api/admin/catalog?section=product-count&entity=brand&slug=${item.slug}`);
			const data = await res.json();
			deleteProductCount = data.count ?? 0;
		} catch { deleteProductCount = 0; }
		finally { deleteChecking = false; deleteConfirming = true; }
	}

	function closeDeleteModal() {
		deleteTarget = null; deleteConfirming = false; deleteChecking = false;
	}

	async function confirmDelete(force: boolean) {
		if (!deleteTarget) return;
		const slug = deleteTarget.slug;
		deletingSlug = slug; closeDeleteModal();
		try {
			const res = await fetch(
				`/api/admin/catalog?section=brand&slug=${slug}${force ? '&force=true' : ''}`,
				{ method: 'DELETE' }
			);
			if (!res.ok) {
				const b = await res.json().catch(() => ({ message: 'Delete failed' }));
				throw new Error(b.message ?? 'Delete failed');
			}
			await load();
		} catch (err: any) { listError = err.message ?? 'Delete failed'; }
		finally { deletingSlug = ''; }
	}
</script>

<!-- ── Delete Modal ──────────────────────────────────────────────────────────── -->
<DeleteConfirmModal
	open={deleteTarget !== null && (deleteChecking || deleteConfirming)}
	entityName={deleteTarget?.name ?? ''}
	entityLabel="brand"
	productCount={deleteProductCount}
	checking={deleteChecking}
	message="This brand and its logo will be permanently deleted."
	onconfirm={confirmDelete}
	oncancel={closeDeleteModal}
/>

<!-- ── Side Panel (Add / Edit) ─────────────────────────────────────────────── -->
<SidePanel
	open={panelMode !== null}
	title={panelMode === 'add' ? 'New Brand' : 'Edit Brand'}
	saving={formSaving || formUploading}
	{canSave}
	onsave={save}
	ondiscard={closePanel}
>
	<div class="flex flex-col gap-4">
		<!-- Logo preview + upload -->
		<div class="flex gap-3.5 items-start">
			<div class="w-20 h-20 shrink-0 border border-subtle rounded-lg overflow-hidden bg-canvas flex items-center justify-center">
				{#if formPending}
					<img class="w-full h-full object-contain" src={formPending.previewUrl} alt="Preview" />
				{:else if formLogoPath}
					<img class="w-full h-full object-contain" src={logoThumb(formLogoPath) ?? ''} alt="Logo" />
				{:else}
					<span class="text-xs text-copy-light">No logo selected</span>
				{/if}
			</div>
			<div class="flex flex-col gap-2 justify-center">
				<label class="inline-flex items-center gap-[5px] font-inter text-xs font-semibold py-1.5 px-3 rounded-md border border-subtle bg-neutral text-copy cursor-pointer whitespace-nowrap transition-colors hover:bg-canvas hover:border-subtle-hover" class:opacity-60={formUploading}>
					{#if formUploading}<span class="inline-block w-2.5 h-2.5 border-2 border-subtle border-t-primary rounded-full animate-[spin_0.7s_linear_infinite]"></span> Uploading…
					{:else}
						<span class="icon-[lucide--upload] w-3 h-3"></span>
						{formPending ? 'Replace Logo' : 'Upload Logo'}
					{/if}
					<input type="file" accept="image/*" class="hidden" onchange={handleUpload} disabled={formUploading} />
				</label>
				{#if formPending}
					<button class="font-inter text-xs py-[5px] px-2.5 rounded-md border border-[#fca5a5] bg-transparent text-danger cursor-pointer transition-colors hover:bg-[#fef2f2]" onclick={removePending}>Remove</button>
				{/if}
				<span class="text-[11px] text-copy-light">PNG with transparency recommended</span>
			</div>
		</div>

		<!-- Name + Slug -->
		<div class="flex gap-3 flex-wrap">
			<label class="flex flex-col gap-[5px] flex-1 min-w-[200px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Name <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formName} oninput={() => { formSlug = nameToSlug(formName); }} placeholder="e.g. Samsung" />
			</label>
			<label class="flex flex-col gap-[5px] flex-1 min-w-[200px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Slug <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formSlug} placeholder="auto-generated" />
			</label>
		</div>

		{#if formError}
			<p class="text-xs text-danger m-0">{formError}</p>
		{/if}
	</div>
</SidePanel>

<!-- ── Main ──────────────────────────────────────────────────────────────────── -->
<section class="flex flex-col gap-5">

	{#if listError}<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>{/if}

	<DataTable
		columns={[
			{ label: 'Logo', width: 'w-20' },
			{ label: 'Slug' },
			{ label: 'Name' },
		]}
		{loading}
		empty={items.length === 0}
		emptyMessage="No brands yet."
		{selectAll}
		{selectedIds}
		onSelectAll={toggleSelectAll}
		onSelect={toggleSelect}
		onRowClick={handleRowClick}
	>
		{#each items as item: Brand (item.slug)}
			{@const isSelected = selectedIds.includes(item.slug)}
			<tr class="hover:bg-surface/50 cursor-pointer transition-colors" onclick={() => handleRowClick(item.slug)}>
				<td class="border-subtle w-10 border px-3 py-2" onclick={(e) => e.stopPropagation()}>
					<input type="checkbox" class="accent-primary cursor-pointer" checked={isSelected} onchange={() => toggleSelect(item.slug)} />
				</td>
				<td class="border-subtle w-20 border px-3 py-2">
					{#if item.logoPath}
						<div class="w-10 h-10 rounded overflow-hidden bg-canvas border border-subtle"><img class="w-full h-full object-cover" src={logoThumb(item.logoPath) ?? ''} alt={item.name} /></div>
					{:else}
						<div class="w-10 h-10 flex items-center justify-center text-[10px] text-copy-light">—</div>
					{/if}
				</td>
				<td class="border-subtle border px-3 py-2"><code class="font-mono text-xs text-copy-light">{item.slug}</code></td>
				<td class="border-subtle border px-3 py-2">{item.name}</td>
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

