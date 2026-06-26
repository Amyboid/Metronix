<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadToIK, deleteFromIK, ikUrl, getIKAuth } from '$lib/utils/imagekit';

	type Brand = {
		slug:        string;
		name:        string;
		logoPath:    string | null;
		logoFileId:  string | null;
	};

	// ── List ──────────────────────────────────────────────────────────────────
	let items:      Brand[] = [];
	let loading     = true;
	let loadingMore = false;
	let hasMore     = false;
	let offset      = 0;
	let total       = 0;
	let listError   = '';
	let ikEndpoint  = '';

	// ── Add form ──────────────────────────────────────────────────────────────
	let showAdd      = false;
	let addSlug      = '';
	let addName      = '';
	let addPending:  { file: File; previewUrl: string } | null = null;
	let addUploading = false;
	let addSaving    = false;
	let addError     = '';

	// ── Inline edit ───────────────────────────────────────────────────────────
	type EditState = {
		name:       string;
		logoPath:   string | null;
		logoFileId: string | null;
		pending:    { file: File; previewUrl: string } | null;
		uploading:  boolean;
	};

	let editing:   Record<string, EditState> = {};
	let savingSlug = '';
	let rowError:  Record<string, string>    = {};

	// ── Delete modal ──────────────────────────────────────────────────────────
	let deleteTarget:      Brand | null = null;
	let deleteProductCount = 0;
	let deleteChecking     = false;
	let deleteConfirming   = false;
	let deletingSlug       = '';

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
			total   = data.total;
			offset  = items.length;
		} catch (e: any) { listError = e.message ?? 'Failed to load'; }
		finally { loading = false; loadingMore = false; }
	}

	onMount(async () => {
		const auth = await getIKAuth().catch(() => null);
		if (auth) ikEndpoint = auth.urlEndpoint;
		await load();
	});

	// ── Add ───────────────────────────────────────────────────────────────────
	function handleAddUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		addError = '';
		if (addPending?.previewUrl) URL.revokeObjectURL(addPending.previewUrl);
		addPending = { file, previewUrl: URL.createObjectURL(file) };
	}

	function cancelAdd() {
		if (addPending?.previewUrl) URL.revokeObjectURL(addPending.previewUrl);
		addPending = null;
		addName = ''; addSlug = ''; addError = '';
		showAdd = false;
	}

	async function addItem() {
		if (!addName.trim()) { addError = 'Name is required'; return; }
		if (!addSlug.trim()) { addError = 'Slug is required'; return; }
		addSaving = true; addError = '';
		let uploadedFileId: string | null = null;
		try {
			let logoPath: string | null = null;
			let logoFileId: string | null = null;
			if (addPending) {
				addUploading = true;
				const r = await uploadToIK(addPending.file, 'assets/brand-logo');
				uploadedFileId = r.fileId;
				logoPath = r.filePath;
				logoFileId = r.fileId;
				addUploading = false;
			}
			const res = await fetch('/api/admin/catalog', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					section:   'brand',
					slug:      addSlug.trim(),
					name:      addName.trim(),
					logoPath,
					logoFileId,
				}),
			});
			if (!res.ok) {
				const b = await res.json().catch(() => ({ message: 'Create failed' }));
				throw new Error(b.message ?? 'Create failed');
			}
			if (addPending?.previewUrl) URL.revokeObjectURL(addPending.previewUrl);
			addPending = null;
			addName = ''; addSlug = '';
			showAdd = false;
			await load();
		} catch (err: any) {
			if (uploadedFileId) await deleteFromIK(uploadedFileId);
			addError = err.message ?? 'Create failed';
		}
		finally { addSaving = false; addUploading = false; }
	}

	// ── Edit ──────────────────────────────────────────────────────────────────
	function startEdit(item: Brand) {
		editing[item.slug] = {
			name:      item.name,
			logoPath:  item.logoPath  ?? null,
			logoFileId: item.logoFileId ?? null,
			pending:   null,
			uploading: false,
		};
		rowError[item.slug] = '';
		editing = { ...editing };
	}

	function closeEdit(slug: string) {
		const { [slug]: _, ...rest } = editing;
		editing = rest; rowError = { ...rowError, [slug]: '' };
	}

	function cancelEdit(slug: string) {
		const ed = editing[slug];
		if (ed?.pending?.previewUrl) URL.revokeObjectURL(ed.pending.previewUrl);
		closeEdit(slug);
	}

	function handleEditUpload(e: Event, slug: string) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const ed = editing[slug]; if (!ed) return;
		if (ed.pending?.previewUrl) URL.revokeObjectURL(ed.pending.previewUrl);
		const previewUrl = URL.createObjectURL(file);
		editing[slug] = { ...ed, pending: { file, previewUrl } };
		editing = { ...editing };
	}

	async function saveEdit(item: Brand) {
		const ed = editing[item.slug]; if (!ed) return;
		savingSlug = item.slug; rowError[item.slug] = '';

		let finalPath   = ed.logoPath;
		let finalFileId = ed.logoFileId;
		let uploadedFileId: string | null = null;

		if (ed.pending) {
			try {
				const r = await uploadToIK(ed.pending.file, 'assets/brand-logo');
				uploadedFileId = r.fileId;
				finalPath   = r.filePath;
				finalFileId = r.fileId;
			} catch (err: any) {
				rowError[item.slug] = err.message ?? 'Upload failed';
				rowError = { ...rowError }; savingSlug = '';
				return;
			}
		}

		try {
			const res = await fetch('/api/admin/catalog', {
				method: 'PATCH', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					section:   'brand',
					slug:      item.slug,
					name:      ed.name,
					logoPath:  finalPath   ?? null,
					logoFileId: finalFileId ?? null,
				}),
			});
			if (!res.ok) {
				if (uploadedFileId) await deleteFromIK(uploadedFileId);
				throw new Error(await res.text());
			}
			if (ed.pending?.previewUrl) URL.revokeObjectURL(ed.pending.previewUrl);
			await load(); closeEdit(item.slug);
		} catch (err: any) {
			rowError[item.slug] = err.message ?? 'Save failed';
			rowError = { ...rowError };
		} finally { savingSlug = ''; }
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
		deletingSlug = slug; closeDeleteModal(); rowError[slug] = '';
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
		} catch (err: any) {
			rowError[slug] = err.message ?? 'Delete failed';
			rowError = { ...rowError };
		} finally { deletingSlug = ''; }
	}
</script>

<!-- ── Delete modal ───────────────────────────────────────────────────────────── -->
{#if deleteTarget && (deleteChecking || deleteConfirming)}
	<div class="fixed inset-0 z-[200] bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-6" onclick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }} onkeydown={(e) => { if (e.key === 'Escape') closeDeleteModal(); }} role="dialog" tabindex="-1" aria-modal="true">
		<div class="bg-neutral border border-subtle rounded-xl p-6 w-full max-w-[480px] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
			{#if deleteChecking}
				<p class="text-sm text-copy m-0">Checking linked products…</p>
			{:else}
				<h3 class="text-base font-bold text-gray-900 m-0">Delete "{deleteTarget.name}"?</h3>
				{#if deleteProductCount > 0}
					<div class="flex gap-2.5 items-start bg-[#fff7ed] border border-[#fed7aa] rounded-lg p-3.5 text-[13px] text-[#92400e]">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
							<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
						</svg>
						<span>
							<strong>{deleteProductCount} product{deleteProductCount !== 1 ? 's' : ''}</strong>
							{deleteProductCount !== 1 ? 'are' : 'is'} linked to this brand.
							Force deleting will permanently remove all of them and all their ImageKit images.
							This cannot be undone.
						</span>
					</div>
					<div class="flex gap-2 justify-end flex-wrap">
						<button class="font-inter text-[13px] font-medium py-[7px] px-4 rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={closeDeleteModal}>Cancel</button>
						<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border border-subtle bg-surface text-copy cursor-pointer transition-colors hover:bg-canvas"   onclick={() => confirmDelete(false)}>Delete brand only</button>
						<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border-none bg-danger text-white cursor-pointer transition-colors"  onclick={() => confirmDelete(true)}>
							Force delete + {deleteProductCount} product{deleteProductCount !== 1 ? 's' : ''}
						</button>
					</div>
				{:else}
					<p class="text-sm text-copy m-0">This brand has no linked products and will be permanently deleted.</p>
					<div class="flex gap-2 justify-end flex-wrap">
						<button class="font-inter text-[13px] font-medium py-[7px] px-4 rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={closeDeleteModal}>Cancel</button>
						<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border-none bg-danger text-white cursor-pointer transition-colors"  onclick={() => confirmDelete(false)}>Delete</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<!-- ── Main ──────────────────────────────────────────────────────────────────── -->
<div class="flex flex-col gap-5">
	<div class="flex items-start justify-between gap-3">
		<div>
			<h2 class="text-base font-bold text-gray-900 mb-0.5">Brands</h2>
			<p class="text-[13px] text-copy-light m-0">Manage brands, slugs and logo images.</p>
		</div>
		<button class="font-inter text-[13px] font-semibold py-[7px] px-3.5 rounded-[7px] border border-primary bg-transparent text-primary cursor-pointer whitespace-nowrap transition-colors shrink-0 hover:bg-primary hover:text-white" onclick={() => showAdd ? cancelAdd() : (showAdd = true)}>
			{showAdd ? 'Cancel' : '+ Add Brand'}
		</button>
	</div>

	{#if listError}<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>{/if}

	<!-- ── Add form ── -->
	{#if showAdd}
		<div class="bg-surface border border-subtle rounded-[10px] px-5 py-[18px] flex flex-col gap-3.5">
			<h3 class="text-sm font-bold text-gray-900 m-0">New Brand</h3>

			<div class="flex gap-3.5 items-start flex-wrap">
				<div class="w-20 h-20 shrink-0 border border-subtle rounded-lg overflow-hidden bg-white flex items-center justify-center">
					{#if addPending}
						<img class="w-full h-full object-contain" src={addPending.previewUrl} alt="Logo preview" />
					{:else}
						<span class="text-[11px] text-copy-light text-center py-1">No logo</span>
					{/if}
				</div>
				<div class="flex flex-col gap-2 justify-center">
					<label class="inline-flex items-center gap-[5px] font-inter text-xs font-semibold py-1.5 px-3 rounded-md border border-subtle bg-neutral text-copy cursor-pointer whitespace-nowrap transition-colors" class:uploading={addUploading}>
						{#if addUploading}
							<span class="inline-block w-2.5 h-2.5 border-2 border-subtle border-t-primary rounded-full animate-[spin_0.7s_linear_infinite]"></span> Uploading…
						{:else}
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
								<polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
							</svg>
							{addPending ? 'Replace Logo' : 'Upload Logo'}
						{/if}
						<input type="file" accept="image/*" class="hidden" onchange={handleAddUpload} disabled={addUploading} />
					</label>
					{#if addPending}
						<button class="font-inter text-xs py-[5px] px-2.5 rounded-md border border-[#fca5a5] bg-transparent text-danger cursor-pointer transition-colors hover:bg-[#fef2f2]" onclick={() => { if (addPending?.previewUrl) URL.revokeObjectURL(addPending.previewUrl); addPending = null; }}>
							Remove
						</button>
					{/if}
					<span class="text-[11px] text-copy-light">PNG with transparency recommended</span>
				</div>
			</div>

			<div class="flex gap-3 flex-wrap two-col">
				<label class="flex flex-col gap-[5px]">
					<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Name <span class="text-danger">*</span></span>
					<input
						class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
						bind:value={addName}
						oninput={() => { addSlug = nameToSlug(addName); }}
						placeholder="e.g. Samsung"
					/>
				</label>
				<label class="flex flex-col gap-[5px]">
					<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Slug <span class="text-danger">*</span></span>
					<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={addSlug} placeholder="auto-generated" />
				</label>
			</div>

			{#if addError}<p class="text-xs text-danger">{addError}</p>{/if}
			<div class="flex justify-end">
				<button class="font-inter text-[13px] font-semibold py-[7px] px-[18px] rounded-[7px] border-none bg-primary text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onclick={addItem} disabled={addSaving || addUploading}>
					{addSaving ? 'Saving…' : 'Create Brand'}
				</button>
			</div>
		</div>
	{/if}

	<!-- ── Table ── -->
	{#if loading}
		<div class="flex flex-col gap-2 w-full">
			{#each Array(5) as _}<div class="w-full h-12 rounded-lg shimmer"></div>{/each}
		</div>
	{:else if items.length === 0}
		<div class="py-8 text-center text-sm text-copy-light border border-dashed border-subtle rounded-[10px]">No brands yet. Add one above.</div>
	{:else}
		<div class="border border-subtle rounded-[10px] overflow-hidden overflow-x-auto">
			<table class="w-full border-collapse text-[13px]">
				<thead>
					<tr>
						<th class="py-2.5 px-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap w-20">Logo</th>
						<th class="py-2.5 px-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap">Slug</th>
						<th class="py-2.5 px-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap">Name</th>
						<th class="py-2.5 px-3.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap w-0 p-0"></th>
						<th class="py-2.5 px-3.5 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.slug)}
						{@const ed = editing[item.slug]}
						{@const displayPath = ed ? (ed.pending?.previewUrl ?? ed.logoPath) : item.logoPath}
						<tr class:editing-row={!!ed}>

							<!-- Logo thumbnail -->
							<td class="w-20 py-2 px-3.5 text-copy border-b border-subtle">
								{#if displayPath}
									<div class="w-16 h-9 rounded-[5px] overflow-hidden bg-canvas border border-subtle flex items-center justify-center">
										<img class="w-full h-full object-cover" src={displayPath.startsWith('blob:') ? displayPath : (logoThumb(displayPath) ?? '')} alt={item.name} />
									</div>
								{:else}
									<div class="w-16 h-9 rounded-[5px] border border-dashed border-subtle flex items-center justify-center text-xs text-copy-light">—</div>
								{/if}
							</td>

							<td class="py-2 px-3.5 text-copy border-b border-subtle"><code class="font-mono text-xs text-copy-light">{item.slug}</code></td>

							{#if ed}
								<!-- Editing row -->
								<td class="py-2 px-3.5 text-copy border-b border-subtle"><input class="font-inter text-[13px] py-[5px] px-2 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border min-w-[100px] focus:border-primary" bind:value={ed.name} placeholder="Brand name" /></td>
								<td class="py-2 px-3.5 text-copy border-b border-subtle"></td>
								<td class="text-right whitespace-nowrap py-2 px-3.5 text-copy border-b border-subtle">
									<label class="inline-flex items-center gap-[5px] font-inter text-xs font-semibold py-1 px-2.5 rounded-md border border-subtle bg-neutral text-copy cursor-pointer whitespace-nowrap transition-colors" class:uploading={ed.uploading} title="Upload new logo">
										{#if ed.uploading}
											<span class="inline-block w-2.5 h-2.5 border-2 border-subtle border-t-primary rounded-full animate-[spin_0.7s_linear_infinite]"></span>
										{:else}
											<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
												<polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
											</svg>
											{ed.pending ? 'Replace' : 'Logo'}
										{/if}
										<input
											type="file" accept="image/*" class="hidden"
											onchange={(e) => handleEditUpload(e, item.slug)}
											disabled={ed.uploading}
										/>
									</label>
									<button
										class="text-xs py-[5px] px-2 rounded-[5px] border border-primary text-primary bg-transparent cursor-pointer inline-flex items-center justify-center transition-colors ml-1"
										onclick={() => saveEdit(item)}
										disabled={savingSlug === item.slug || ed.uploading}
										title="Save"
									>
										{savingSlug === item.slug ? '…' : '✓'}
									</button>
									<button class="text-xs py-[5px] px-2 rounded-[5px] border border-subtle bg-transparent cursor-pointer text-copy inline-flex items-center justify-center transition-colors ml-1" onclick={() => cancelEdit(item.slug)} title="Cancel">✕</button>
								</td>
							{:else}
								<!-- View row -->
								<td class="py-2 px-3.5 text-copy border-b border-subtle">{item.name}</td>
								<td class="py-2 px-3.5 text-copy border-b border-subtle"></td>
								<td class="text-right whitespace-nowrap py-2 px-3.5 text-copy border-b border-subtle">
									<button class="text-xs py-[5px] px-2 rounded-[5px] border border-subtle bg-transparent cursor-pointer text-copy inline-flex items-center justify-center transition-colors ml-1" onclick={() => startEdit(item)} title="Edit" aria-label="Edit">
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
										</svg>
									</button>
									<button
										class="text-xs py-[5px] px-2 rounded-[5px] border border-transparent bg-transparent cursor-pointer text-danger inline-flex items-center justify-center transition-colors ml-1"
										onclick={() => startDelete(item)}
										disabled={deletingSlug === item.slug}
										title="Delete"
									>
										{#if deletingSlug === item.slug}
											…
										{:else}
											<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
												<polyline points="3 6 5 6 21 6"/>
												<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
												<path d="M10 11v6"/><path d="M14 11v6"/>
												<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
											</svg>
										{/if}
									</button>
								</td>
							{/if}
						</tr>
						{#if rowError[item.slug]}
							<tr class="error-row">
								<td colspan="5"><span class="text-xs text-danger">{rowError[item.slug]}</span></td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>

		{#if hasMore}
			<div class="flex justify-center pt-1">
				<button class="font-inter text-[13px] font-medium py-2 px-6 rounded-lg border border-subtle bg-surface text-copy cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onclick={() => load(false)} disabled={loadingMore}>
					{loadingMore ? 'Loading…' : `Load more (${total - items.length} remaining)`}
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	@keyframes spin { to { transform: rotate(360deg); } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
	.table tbody tr:last-child td { border-bottom: none; }
	.two-col > .field { flex: 1 1 200px; }
	.editing-row td { background: var(--color-accent-ghost, #f8f7f4); }
	.error-row td { padding: 4px 14px 8px; }
</style>
