<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadToIK, deleteFromIK, ikUrl, getIKAuth } from '$lib/utils/imagekit';

	type ProductType = {
		slug:         string;
		name:         string;
		bannerPath:   string | null;
		bannerFileId: string | null;
		bannerMsg:    string | null;
	};

	let items:      ProductType[] = [];
	let loading     = true;
	let loadingMore = false;
	let hasMore     = false;
	let offset      = 0;
	let total       = 0;
	let listError   = '';
	let ikEndpoint  = '';

	let showAdd      = false;
	let addSlug      = '';
	let addName      = '';
	let addBannerMsg = '';
	let addPending:  { fileId: string; filePath: string } | null = null;
	let addUploading = false;
	let addSaving    = false;
	let addError     = '';

	type EditState = {
		name:         string;
		bannerMsg:    string;
		bannerPath:   string | null;
		bannerFileId: string | null;
		pending:      { fileId: string; filePath: string } | null;
		uploading:    boolean;
	};

	let editing:   Record<string, EditState> = {};
	let savingSlug = '';
	let rowError:  Record<string, string>    = {};

	let deleteTarget:      ProductType | null = null;
	let deleteProductCount = 0;
	let deleteChecking     = false;
	let deleteConfirming   = false;
	let deletingSlug       = '';

	function nameToSlug(n: string) {
		return n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	}
	function thumb(path: string | null) { return ikUrl(path, ikEndpoint, 'w-80,h-48,fo-auto'); }

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

	async function handleAddUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		addUploading = true; addError = '';
		try {
			const r = await uploadToIK(file, 'assets/hero-banner');
			addPending = { fileId: r.fileId, filePath: r.filePath };
		} catch (err: any) { addError = err.message ?? 'Upload failed'; }
		finally { addUploading = false; }
	}

	async function cancelAdd() {
		if (addPending) { await deleteFromIK(addPending.fileId); addPending = null; }
		addName = ''; addSlug = ''; addBannerMsg = ''; addError = '';
		showAdd = false;
	}

	async function addItem() {
		if (!addName.trim()) { addError = 'Name is required'; return; }
		if (!addSlug.trim()) { addError = 'Slug is required'; return; }
		addSaving = true; addError = '';
		try {
			const res = await fetch('/api/admin/catalog', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					section: 'product-type', slug: addSlug.trim(), name: addName.trim(),
					bannerMsg: addBannerMsg || null,
					bannerPath: addPending?.filePath ?? null, bannerFileId: addPending?.fileId ?? null,
				}),
			});
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Create failed' })); throw new Error(b.message); }
			addPending = null; addName = ''; addSlug = ''; addBannerMsg = '';
			showAdd = false; await load();
		} catch (err: any) { addError = err.message ?? 'Create failed'; }
		finally { addSaving = false; }
	}

	function startEdit(item: ProductType) {
		editing[item.slug] = {
			name: item.name, bannerMsg: item.bannerMsg ?? '',
			bannerPath: item.bannerPath ?? null, bannerFileId: item.bannerFileId ?? null,
			pending: null, uploading: false,
		};
		rowError[item.slug] = ''; editing = { ...editing };
	}

	function closeEdit(slug: string) {
		const { [slug]: _, ...rest } = editing;
		editing = rest; rowError = { ...rowError, [slug]: '' };
	}

	async function cancelEdit(slug: string) {
		const ed = editing[slug];
		if (ed?.pending) await deleteFromIK(ed.pending.fileId);
		closeEdit(slug);
	}

	async function handleEditUpload(e: Event, slug: string) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const ed = editing[slug]; if (!ed) return;
		if (ed.pending) await deleteFromIK(ed.pending.fileId);
		editing[slug] = { ...ed, uploading: true }; editing = { ...editing };
		try {
			const r = await uploadToIK(file, 'assets/hero-banner');
			editing[slug] = { ...editing[slug], pending: { fileId: r.fileId, filePath: r.filePath }, uploading: false };
		} catch (err: any) {
			rowError[slug] = err.message ?? 'Upload failed';
			editing[slug] = { ...editing[slug], uploading: false };
		}
		editing = { ...editing }; rowError = { ...rowError };
	}

	async function saveEdit(item: ProductType) {
		const ed = editing[item.slug]; if (!ed) return;
		savingSlug = item.slug; rowError[item.slug] = '';
		const finalPath   = ed.pending ? ed.pending.filePath : ed.bannerPath;
		const finalFileId = ed.pending ? ed.pending.fileId   : ed.bannerFileId;
		if (ed.pending && ed.bannerFileId) await deleteFromIK(ed.bannerFileId);
		try {
			const res = await fetch('/api/admin/catalog', {
				method: 'PATCH', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					section: 'product-type', slug: item.slug,
					name: ed.name, bannerMsg: ed.bannerMsg || null,
					bannerPath: finalPath ?? null, bannerFileId: finalFileId ?? null,
				}),
			});
			if (!res.ok) throw new Error(await res.text());
			await load(); closeEdit(item.slug);
		} catch (err: any) { rowError[item.slug] = err.message ?? 'Save failed'; rowError = { ...rowError }; }
		finally { savingSlug = ''; }
	}

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
		deletingSlug = slug; closeDeleteModal(); rowError[slug] = '';
		try {
			const res = await fetch(`/api/admin/catalog?section=product-type&slug=${slug}${force ? '&force=true' : ''}`, { method: 'DELETE' });
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Delete failed' })); throw new Error(b.message); }
			await load();
		} catch (err: any) { rowError[slug] = err.message ?? 'Delete failed'; rowError = { ...rowError }; }
		finally { deletingSlug = ''; }
	}
</script>

{#if deleteTarget && (deleteChecking || deleteConfirming)}
	<div class="modal-backdrop" on:click|self={closeDeleteModal} role="dialog" aria-modal="true">
		<div class="modal">
			{#if deleteChecking}
				<p class="modal-body">Checking linked products…</p>
			{:else}
				<h3 class="modal-title">Delete "{deleteTarget.name}"?</h3>
				{#if deleteProductCount > 0}
					<div class="modal-warning">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
						<span>
							<strong>{deleteProductCount} product{deleteProductCount !== 1 ? 's' : ''}</strong>
							{deleteProductCount !== 1 ? 'are' : 'is'} linked to this product type.
							Force deleting will permanently remove all of them and all their ImageKit images.
							This cannot be undone.
						</span>
					</div>
					<div class="modal-actions">
						<button class="btn-modal-cancel" on:click={closeDeleteModal}>Cancel</button>
						<button class="btn-modal-soft"   on:click={() => confirmDelete(false)}>Delete type only</button>
						<button class="btn-modal-force"  on:click={() => confirmDelete(true)}>Force delete + {deleteProductCount} product{deleteProductCount !== 1 ? 's' : ''}</button>
					</div>
				{:else}
					<p class="modal-body">This product type has no linked products and will be permanently deleted.</p>
					<div class="modal-actions">
						<button class="btn-modal-cancel" on:click={closeDeleteModal}>Cancel</button>
						<button class="btn-modal-force"  on:click={() => confirmDelete(false)}>Delete</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<div class="section">
	<div class="section-header">
		<div>
			<h2 class="section-title">Product Types</h2>
			<p class="section-sub">Manage product type filters, banner images and messages.</p>
		</div>
		<button class="btn-add" on:click={() => showAdd ? cancelAdd() : (showAdd = true)}>
			{showAdd ? 'Cancel' : '+ Add Product Type'}
		</button>
	</div>

	{#if listError}<div class="banner-error">{listError}</div>{/if}

	{#if showAdd}
		<div class="add-form">
			<h3 class="form-title">New Product Type</h3>
			<div class="image-picker-row">
				<div class="image-preview-box">
					{#if addPending}
						<img src={ikUrl(addPending.filePath, ikEndpoint, 'w-240,h-120,fo-auto') ?? addPending.filePath} alt="Preview" />
					{:else}
						<span class="preview-placeholder">No banner selected</span>
					{/if}
				</div>
				<div class="image-picker-controls">
					<label class="upload-btn" class:uploading={addUploading}>
						{#if addUploading}<span class="spinner"></span> Uploading…
						{:else}
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
							{addPending ? 'Replace Banner' : 'Upload Banner'}
						{/if}
						<input type="file" accept="image/*" style="display:none" on:change={handleAddUpload} disabled={addUploading} />
					</label>
					{#if addPending}
						<button class="btn-remove-img" on:click={async () => { await deleteFromIK(addPending!.fileId); addPending = null; }}>Remove</button>
					{/if}
					<span class="upload-hint">Recommended: 1200 × 400 px</span>
				</div>
			</div>
			<div class="form-row two-col">
				<label class="field">
					<span class="label">Name <span class="req">*</span></span>
					<input class="input" bind:value={addName} on:input={() => { addSlug = nameToSlug(addName); }} placeholder="e.g. Air Conditioner" />
				</label>
				<label class="field">
					<span class="label">Slug <span class="req">*</span></span>
					<input class="input" bind:value={addSlug} placeholder="auto-generated" />
				</label>
			</div>
			<label class="field">
				<span class="label">Banner Message</span>
				<input class="input" bind:value={addBannerMsg} placeholder="Stay cool this summer…" />
			</label>
			{#if addError}<p class="inline-error">{addError}</p>{/if}
			<div class="form-actions">
				<button class="btn-save" on:click={addItem} disabled={addSaving || addUploading}>
					{addSaving ? 'Saving…' : 'Create Product Type'}
				</button>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="shimmer-list">{#each Array(5) as _}<div class="shimmer-row"></div>{/each}</div>
	{:else if items.length === 0}
		<div class="empty">No product types yet. Add one above.</div>
	{:else}
		<div class="table-wrap">
			<table class="table">
				<thead>
					<tr>
						<th class="th-img">Banner</th>
						<th>Slug</th>
						<th>Name</th>
						<th>Banner Message</th>
						<th class="th-actions">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.slug)}
						{@const ed = editing[item.slug]}
						{@const displayPath = ed ? (ed.pending?.filePath ?? ed.bannerPath) : item.bannerPath}
						<tr class:editing-row={!!ed}>
							<td class="td-img">
								{#if displayPath}
									<div class="thumb"><img src={thumb(displayPath) ?? ''} alt={item.name} /></div>
								{:else}
									<div class="thumb-empty">—</div>
								{/if}
							</td>
							<td class="td-slug"><code>{item.slug}</code></td>
							{#if ed}
								<td><input class="input inline" bind:value={ed.name} /></td>
								<td>
									<div class="edit-img-row">
										<label class="upload-btn small" class:uploading={ed.uploading}>
											{#if ed.uploading}<span class="spinner"></span>
											{:else}
												<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
												{ed.pending ? 'Replace' : 'Upload'}
											{/if}
											<input type="file" accept="image/*" style="display:none" on:change={(e) => handleEditUpload(e, item.slug)} disabled={ed.uploading} />
										</label>
										<input class="input inline msg-input" bind:value={ed.bannerMsg} placeholder="Banner message" />
									</div>
								</td>
								<td class="td-actions">
									<button class="btn-icon save" on:click={() => saveEdit(item)} disabled={savingSlug === item.slug || ed.uploading} title="Save">
										{savingSlug === item.slug ? '…' : '✓'}
									</button>
									<button class="btn-icon cancel" on:click={() => cancelEdit(item.slug)} title="Cancel">✕</button>
								</td>
							{:else}
								<td>{item.name}</td>
								<td class="td-muted">{item.bannerMsg ?? '—'}</td>
								<td class="td-actions">
									<button class="btn-icon edit" on:click={() => startEdit(item)} title="Edit">
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
									</button>
									<button class="btn-icon delete" on:click={() => startDelete(item)} disabled={deletingSlug === item.slug} title="Delete">
										{#if deletingSlug === item.slug}…{:else}
											<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
										{/if}
									</button>
								</td>
							{/if}
						</tr>
						{#if rowError[item.slug]}
							<tr class="error-row"><td colspan="5"><span class="inline-error">{rowError[item.slug]}</span></td></tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
		{#if hasMore}
			<div class="load-more-row">
				<button class="btn-load-more" on:click={() => load(false)} disabled={loadingMore}>
					{loadingMore ? 'Loading…' : `Load more (${total - items.length} remaining)`}
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.section { display: flex; flex-direction: column; gap: 20px; }
	.section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
	.section-title { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin: 0 0 2px; }
	.section-sub   { font-size: 0.8125rem; color: var(--color-copy-light); margin: 0; }
	.btn-add {
		font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; font-weight: 600;
		padding: 7px 14px; border-radius: 7px; border: 1px solid var(--color-primary);
		background: transparent; color: var(--color-primary); cursor: pointer;
		white-space: nowrap; transition: background 0.15s, color 0.15s; flex-shrink: 0;
	}
	.btn-add:hover { background: var(--color-primary); color: #fff; }
	.add-form { background: var(--color-surface); border: 1px solid var(--color-subtle); border-radius: 10px; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
	.form-title { font-size: 0.875rem; font-weight: 700; color: #1a1a1a; margin: 0; }
	.form-row { display: flex; gap: 12px; flex-wrap: wrap; }
	.two-col > .field { flex: 1 1 200px; }
	.field { display: flex; flex-direction: column; gap: 5px; }
	.label { font-size: 0.75rem; font-weight: 600; color: var(--color-copy); text-transform: uppercase; letter-spacing: 0.04em; }
	.req { color: var(--color-danger); }
	.input { font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; padding: 7px 10px; border: 1px solid var(--color-subtle); border-radius: 6px; background: var(--color-neutral); color: #1a1a1a; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
	.input:focus { border-color: var(--color-primary); }
	.input.inline { padding: 5px 8px; min-width: 90px; }
	.msg-input { flex: 1; min-width: 140px; }
	.form-actions { display: flex; justify-content: flex-end; }
	.btn-save { font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; font-weight: 600; padding: 7px 18px; border-radius: 7px; border: none; background: var(--color-primary); color: #fff; cursor: pointer; transition: background 0.15s; }
	.btn-save:hover:not(:disabled) { background: var(--color-primary-hover); }
	.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
	.image-picker-row { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
	.image-preview-box { width: 200px; height: 90px; flex-shrink: 0; border: 1px solid var(--color-subtle); border-radius: 8px; overflow: hidden; background: var(--color-canvas); display: flex; align-items: center; justify-content: center; }
	.image-preview-box img { width: 100%; height: 100%; object-fit: cover; }
	.preview-placeholder { font-size: 0.75rem; color: var(--color-copy-light); }
	.image-picker-controls { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
	.upload-hint { font-size: 0.7rem; color: var(--color-copy-light); }
	.upload-btn { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-inter), sans-serif; font-size: 0.75rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--color-subtle); background: var(--color-neutral); color: var(--color-copy); cursor: pointer; white-space: nowrap; transition: background 0.15s, border-color 0.15s; }
	.upload-btn:hover:not(.uploading) { background: var(--color-canvas); border-color: var(--color-subtle-hover); }
	.upload-btn.uploading { opacity: 0.6; cursor: not-allowed; }
	.upload-btn.small { padding: 4px 8px; font-size: 0.7rem; }
	.btn-remove-img { font-family: var(--font-inter), sans-serif; font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; border: 1px solid #fca5a5; background: transparent; color: var(--color-danger); cursor: pointer; transition: background 0.12s; }
	.btn-remove-img:hover { background: #fef2f2; }
	.edit-img-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.table-wrap { border: 1px solid var(--color-subtle); border-radius: 10px; overflow: hidden; overflow-x: auto; }
	.table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.table thead { background: var(--color-surface); }
	.table th { padding: 10px 14px; text-align: left; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-copy-light); border-bottom: 1px solid var(--color-subtle); white-space: nowrap; }
	.th-img { width: 80px; } .th-actions { text-align: right; }
	.table td { padding: 8px 14px; color: var(--color-copy); border-bottom: 1px solid var(--color-subtle); vertical-align: middle; }
	.table tbody tr:last-child td { border-bottom: none; }
	.table tbody tr:hover:not(.editing-row):not(.error-row) { background: var(--color-surface); }
	.editing-row td { background: var(--color-accent-ghost, #f8f7f4); }
	.error-row td { padding: 4px 14px 8px; }
	.td-img { width: 80px; }
	.td-slug code { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--color-copy-light); }
	.td-muted { color: var(--color-copy-light); }
	.td-actions { text-align: right; white-space: nowrap; }
	.thumb { width: 64px; height: 36px; border-radius: 5px; overflow: hidden; background: var(--color-canvas); border: 1px solid var(--color-subtle); }
	.thumb img { width: 100%; height: 100%; object-fit: cover; }
	.thumb-empty { width: 64px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--color-copy-light); }
	.btn-icon { font-size: 0.75rem; padding: 5px 8px; border-radius: 5px; border: 1px solid var(--color-subtle); background: transparent; cursor: pointer; color: var(--color-copy); display: inline-flex; align-items: center; justify-content: center; transition: background 0.12s, border-color 0.12s, color 0.12s; margin-left: 4px; }
	.btn-icon.save { border-color: var(--color-primary); color: var(--color-primary); }
	.btn-icon.save:hover { background: var(--color-primary); color: #fff; }
	.btn-icon.cancel:hover { background: var(--color-canvas); }
	.btn-icon.edit:hover { background: var(--color-surface); border-color: var(--color-subtle-hover); }
	.btn-icon.delete { color: var(--color-danger); border-color: transparent; }
	.btn-icon.delete:hover { background: #fef2f2; border-color: #fca5a5; }
	.btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
	.load-more-row { display: flex; justify-content: center; padding-top: 4px; }
	.btn-load-more { font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; font-weight: 500; padding: 8px 24px; border-radius: 8px; border: 1px solid var(--color-subtle); background: var(--color-surface); color: var(--color-copy); cursor: pointer; transition: background 0.15s; }
	.btn-load-more:hover:not(:disabled) { background: var(--color-canvas); }
	.btn-load-more:disabled { opacity: 0.5; cursor: not-allowed; }
	.modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.35); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 24px; }
	.modal { background: var(--color-neutral); border: 1px solid var(--color-subtle); border-radius: 12px; padding: 24px; width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
	.modal-title { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin: 0; }
	.modal-body { font-size: 0.875rem; color: var(--color-copy); margin: 0; }
	.modal-warning { display: flex; gap: 10px; align-items: flex-start; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 14px; font-size: 0.8125rem; color: #92400e; }
	.modal-warning svg { flex-shrink: 0; margin-top: 1px; color: #f97316; }
	.modal-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
	.btn-modal-cancel { font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; font-weight: 500; padding: 7px 16px; border-radius: 7px; border: 1px solid var(--color-subtle); background: transparent; color: var(--color-copy); cursor: pointer; transition: background 0.15s; }
	.btn-modal-cancel:hover { background: var(--color-surface); }
	.btn-modal-soft { font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; font-weight: 600; padding: 7px 16px; border-radius: 7px; border: 1px solid var(--color-subtle); background: var(--color-surface); color: var(--color-copy); cursor: pointer; transition: background 0.15s; }
	.btn-modal-soft:hover { background: var(--color-canvas); }
	.btn-modal-force { font-family: var(--font-inter), sans-serif; font-size: 0.8125rem; font-weight: 600; padding: 7px 16px; border-radius: 7px; border: none; background: var(--color-danger); color: #fff; cursor: pointer; transition: background 0.15s; }
	.btn-modal-force:hover { background: #dc2626; }
	.banner-error { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 14px; font-size: 0.8125rem; color: var(--color-danger); }
	.inline-error { font-size: 0.75rem; color: var(--color-danger); }
	.empty { padding: 32px; text-align: center; font-size: 0.875rem; color: var(--color-copy-light); border: 1px dashed var(--color-subtle); border-radius: 10px; }
	.shimmer-list { display: flex; flex-direction: column; gap: 8px; }
	.shimmer-row { height: 48px; border-radius: 8px; background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.spinner { display: inline-block; width: 10px; height: 10px; border: 2px solid var(--color-subtle); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
</style>