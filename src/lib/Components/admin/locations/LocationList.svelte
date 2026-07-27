<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import DataTable from '$lib/Components/admin/catalog/DataTable.svelte';
	import DeleteConfirmModal from '$lib/Components/admin/catalog/DeleteConfirmModal.svelte';
	import { handleApiError } from '$lib/utils/apiError';

	type Location = {
		id:          string;
		storeName:   string;
		address:     string;
		city:        string;
		latitude:    number;
		longitude:   number;
		phone:       string | null;
	};

	let items:     Location[] = $state([]);
	let loading    = $state(true);
	let listError  = $state('');
	let deletingId = $state('');
	let deleteTarget:      Location | null = $state(null);
	let deleteConfirming   = $state(false);
	let deleting           = $state(false);

	// ── Selection ────────────────────────────────────────────────────────────
	let selectedIds: string[] = $state([]);
	let selectAll = $state(false);

	function toggleSelectAll() {
		if (selectAll) { selectedIds = []; selectAll = false; }
		else { selectedIds = items.map((i) => i.id); selectAll = true; }
	}
	function toggleSelect(id: string) {
		selectedIds = selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id];
		selectAll = selectedIds.length === items.length;
	}
	function handleRowClick(id: string) {
		const item = items.find((i) => i.id === id);
		if (item) openEdit(item);
	}

	function bulkDelete() {
		if (selectedIds.length === 0) return;
		if (selectedIds.length === 1) {
			const item = items.find(i => i.id === selectedIds[0]);
			if (item) startDelete(item);
			return;
		}
		if (!confirm(`Delete ${selectedIds.length} locations? This cannot be undone.`)) return;
		(async () => {
			try {
				for (const id of selectedIds) {
					const res = await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' });
					if (!res.ok) await handleApiError(res);
				}
				selectedIds = []; selectAll = false;
				await load();
			} catch (err: any) { listError = err.message ?? 'Delete failed'; }
		})();
	}

	async function load() {
		loading = true; listError = '';
		try {
			const res = await fetch('/api/admin/locations');
			if (!res.ok) await handleApiError(res);
			const data = await res.json();
			items = data.items;
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	function openAdd() {
		adminNav.navigate({ tab: 'locations', view: 'new' });
	}

	function openEdit(item: Location) {
		adminNav.navigate({ tab: 'locations', view: 'update', id: item.id });
	}

	function startDelete(item: Location) {
		deleteTarget = item;
		deleteConfirming = true;
	}

	function closeDeleteModal() {
		deleteTarget = null;
		deleteConfirming = false;
	}

	async function confirmDelete(force: boolean) {
		if (!deleteTarget) return;
		const id = deleteTarget.slug ?? deleteTarget.id;
		deletingId = id;
		closeDeleteModal();
		try {
			const res = await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' });
			if (!res.ok) await handleApiError(res);
			await load();
		} catch (err: any) {
			listError = err.message ?? 'Delete failed';
		} finally {
			deletingId = '';
		}
	}
</script>

<DeleteConfirmModal
	open={deleteTarget !== null && deleteConfirming}
	entityName={deleteTarget?.storeName ?? ''}
	entityLabel="location"
	productCount={0}
	checking={false}
	message="This location and its stock data will be permanently deleted."
	onconfirm={confirmDelete}
	oncancel={closeDeleteModal}
/>

<section class="flex flex-col gap-5">
	<div class="flex items-center justify-between px-6 py-5">
		<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0">Locations</h2>
		<div class="flex items-center gap-2">
			{#if selectedIds.length > 0}
				<span class="text-primary text-[13px] font-semibold">{selectedIds.length} selected</span>
				<button
					class="font-inter border-danger text-danger hover:bg-danger cursor-pointer rounded-md border bg-transparent px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-white inline-flex items-center gap-1"
					onclick={bulkDelete}
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
			{/if}
			<button
				class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
				onclick={openAdd}
			>
				+ Add Location
			</button>
		</div>
	</div>

	{#if listError}
		<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>
	{/if}

	<DataTable
		columns={[
			{ label: 'Store Name' },
			{ label: 'Address' },
			{ label: 'City' },
			{ label: 'Phone' },
		]}
		{loading}
		empty={items.length === 0}
		emptyMessage="No locations yet."
		{selectAll}
		{selectedIds}
		onSelectAll={toggleSelectAll}
		onSelect={toggleSelect}
		onRowClick={handleRowClick}
	>
		{#each items as item (item.id)}
			{@const isSelected = selectedIds.includes(item.id)}
			<tr class="hover:bg-surface/50 cursor-pointer transition-colors" onclick={() => handleRowClick(item.id)}>
				<td class="border-subtle w-10 border px-3 py-2" onclick={(e) => e.stopPropagation()}>
					<input type="checkbox" class="accent-primary cursor-pointer" checked={isSelected} onchange={() => toggleSelect(item.id)} />
				</td>
				<td class="border-subtle border px-3 py-2 font-medium">{item.storeName}</td>
				<td class="border-subtle border px-3 py-2 text-copy-light">{item.address}</td>
				<td class="border-subtle border px-3 py-2">{item.city}</td>
				<td class="border-subtle border px-3 py-2 text-copy-light">{item.phone ?? '—'}</td>
			</tr>
		{/each}
	</DataTable>
</section>
