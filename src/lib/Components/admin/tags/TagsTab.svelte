<script lang="ts">
	import { onMount } from 'svelte';
	import SidePanel from '../catalog/SidePanel.svelte';
	import DataTable from '../catalog/DataTable.svelte';
	import DeleteConfirmModal from '../catalog/DeleteConfirmModal.svelte';

	type Tag = {
		id: string;
		type: string;
		value: string;
		label: string;
		createdAt: string;
	};

	let items: Tag[] = $state([]);
	let loading = $state(true);
	let listError = $state('');

	let selectedIds: string[] = $state([]);
	let selectAll = $state(false);
	let deleteConfirming = $state(false);
	let deleteTarget: Tag | null = $state(null);

	let filterType: 'all' | 'promotion' | 'badge' = $state('all');

	// Panel state
	let panelMode: 'add' | 'edit' | null = $state(null);
	let panelItem: Tag | null = $state(null);
	let formType = $state('promotion');
	let formValue = $state('');
	let formLabel = $state('');
	let formSaving = $state(false);
	let formError = $state('');

	function toggleSelectAll() {
		if (selectAll) { selectedIds = []; selectAll = false; }
		else { selectedIds = items.map(i => i.id); selectAll = true; }
	}
	function toggleSelect(id: string) {
		selectedIds = selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id];
		selectAll = selectedIds.length === items.length;
	}
	function handleRowClick(id: string) {
		const item = items.find(i => i.id === id);
		if (item) openEdit(item);
	}

	const canSave = $derived.by(() => {
		if (!formValue.trim() || !formLabel.trim()) return false;
		if (panelMode === 'add') return true;
		if (!panelItem) return false;
		return formType !== panelItem.type || formValue !== panelItem.value || formLabel !== panelItem.label;
	});

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	async function load() {
		loading = true; listError = '';
		try {
			const url = filterType === 'all' ? '/api/admin/tags' : `/api/admin/tags?type=${filterType}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error('Failed to load');
			const data = await res.json();
			items = data.items ?? [];
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	$effect(() => { void filterType; load(); });

	function openAdd() {
		panelMode = 'add'; panelItem = null;
		formType = 'promotion'; formValue = ''; formLabel = ''; formError = '';
	}
	function openEdit(item: Tag) {
		panelMode = 'edit'; panelItem = item;
		formType = item.type; formValue = item.value; formLabel = item.label; formError = '';
	}
	function closePanel() {
		panelMode = null; panelItem = null; formError = '';
	}

	async function save() {
		if (!formValue.trim() || !formLabel.trim()) { formError = 'Value and label are required'; return; }
		formSaving = true; formError = '';
		try {
			if (panelMode === 'add') {
				const res = await fetch('/api/admin/tags', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ type: formType, value: formValue.trim(), label: formLabel.trim() }),
				});
				if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Create failed' })); throw new Error(b.message); }
			} else {
				const res = await fetch('/api/admin/tags', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: panelItem!.id, value: formValue.trim(), label: formLabel.trim() }),
				});
				if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Update failed' })); throw new Error(b.message); }
			}
			closePanel();
			await load();
		} catch (err: any) {
			formError = err.message ?? 'Save failed';
		} finally {
			formSaving = false;
		}
	}

	function startDelete(item: Tag) {
		deleteTarget = item; deleteConfirming = true;
	}
	function closeDeleteModal() { deleteTarget = null; deleteConfirming = false; }

	async function confirmDelete() {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		closeDeleteModal();
		try {
			const res = await fetch('/api/admin/tags', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [id] }),
			});
			if (!res.ok) throw new Error('Delete failed');
			await load();
		} catch (err: any) { listError = err.message ?? 'Delete failed'; }
	}

	function _bulkDelete() {
		if (selectedIds.length === 0) return;
		if (!confirm(`Delete ${selectedIds.length} tag(s)? This cannot be undone.`)) return;
		(async () => {
			try {
				const res = await fetch('/api/admin/tags', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ids: selectedIds }),
				});
				if (!res.ok) throw new Error('Delete failed');
				selectedIds = []; selectAll = false;
				await load();
			} catch (err: any) { listError = err.message ?? 'Delete failed'; }
		})();
	}

	const typeBadgeColor = (type: string) =>
		type === 'promotion' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-700';
</script>

<DeleteConfirmModal
	open={deleteTarget !== null && deleteConfirming}
	entityName={deleteTarget?.label ?? ''}
	entityLabel="tag"
	productCount={0}
	checking={false}
	message="This tag will be permanently deleted."
	onconfirm={confirmDelete}
	oncancel={closeDeleteModal}
/>

<SidePanel
	open={panelMode !== null}
	title={panelMode === 'add' ? 'New Tag' : 'Edit Tag'}
	saving={formSaving}
	{canSave}
	onsave={save}
	ondiscard={closePanel}
>
	<div class="flex flex-col gap-4">
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Type <span class="text-danger">*</span></span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary cursor-pointer"
				bind:value={formType}
			>
				<option value="promotion">Promotion</option>
				<option value="badge">Badge</option>
			</select>
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Value <span class="text-danger">*</span></span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formValue} placeholder="e.g. trending" />
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Label <span class="text-danger">*</span></span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formLabel} placeholder="e.g. Trending" />
		</label>
		{#if formError}
			<p class="text-xs text-danger m-0">{formError}</p>
		{/if}
	</div>
</SidePanel>

<div class="flex flex-col gap-0">
	<div class="border-b border-subtle bg-neutral shrink-0 px-6 py-2">
		<div class="flex items-center gap-3">
			<div class="flex gap-1.5 bg-surface border border-subtle rounded-[10px] p-1 w-fit" role="tablist">
				{#each [{ id: 'all', label: 'All' }, { id: 'promotion', label: 'Promotion' }, { id: 'badge', label: 'Badge' }] as tab}
					<button
						role="tab"
						aria-selected={filterType === tab.id}
						class="font-inter text-[0.8125rem] font-medium px-4 py-1.5 rounded-[7px] border-none cursor-pointer transition-colors whitespace-nowrap {filterType === tab.id ? 'bg-neutral text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-copy hover:bg-surface-hover'}"
						onclick={() => { filterType = tab.id as typeof filterType; selectedIds = []; selectAll = false; }}
					>
						{tab.label}
					</button>
				{/each}
			</div>
			<div class="ml-auto flex items-center gap-2">
				{#if selectedIds.length > 0}
					<span class="text-primary text-[13px] font-semibold">{selectedIds.length} selected</span>
					<button
						class="font-inter border-danger text-danger hover:bg-danger cursor-pointer rounded-md border bg-transparent px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-white inline-flex items-center gap-1"
						onclick={_bulkDelete}
					>
						<span class="icon-[lucide--trash-2] h-3.5 w-3.5"></span>
						Delete
					</button>
					<button
						class="font-inter border-subtle text-copy hover:bg-surface cursor-pointer rounded-md border bg-transparent px-3 py-1.5 text-[13px] font-medium transition-colors"
						onclick={() => { selectedIds = []; selectAll = false; }}
					>
						Clear
					</button>
				{:else}
					<button
						class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={openAdd}
					>
						+ Add Tag
					</button>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto">
		<section class="flex flex-col gap-5 p-6">
			{#if listError}
				<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>
			{/if}

			<DataTable
				columns={[
					{ label: 'Type' },
					{ label: 'Value' },
					{ label: 'Label' },
					{ label: 'Created', width: 'w-36' },
				]}
				{loading}
				empty={items.length === 0}
				emptyMessage="No tags yet."
				{selectAll}
				{selectedIds}
				onSelectAll={toggleSelectAll}
				onSelect={toggleSelect}
				onRowClick={handleRowClick}
			>
				{#each items as item (item.id)}
					{@const isSelected = selectedIds.includes(item.id)}
					<tr class="hover:bg-surface/50 cursor-pointer transition-colors" onclick={() => handleRowClick(item.id)}>
						<td class="border-subtle border px-3 py-2" onclick={(e) => e.stopPropagation()}>
							<input type="checkbox" checked={isSelected} onchange={() => toggleSelect(item.id)} class="accent-primary cursor-pointer" />
						</td>
						<td class="border-subtle border px-3 py-2">
							<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize {typeBadgeColor(item.type)}">
								{item.type}
							</span>
						</td>
						<td class="border-subtle border px-3 py-2"><code class="font-mono text-xs text-copy-light">{item.value}</code></td>
						<td class="border-subtle border px-3 py-2">{item.label}</td>
						<td class="border-subtle border px-3 py-2 text-copy-light text-[13px]">{formatDate(item.createdAt)}</td>
					</tr>
				{/each}
			</DataTable>
		</section>
	</div>
</div>
