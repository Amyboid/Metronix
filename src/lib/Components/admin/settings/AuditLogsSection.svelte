<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable from '../catalog/DataTable.svelte';
	import DeleteConfirmModal from '../catalog/DeleteConfirmModal.svelte';

	let { onaction }: { onaction?: (fn: () => void) => void } = $props();

	type AuditLog = {
		id:         string;
		adminId:    string;
		adminEmail: string;
		action:     string;
		entityType: string;
		entityId:   string;
		entityName: string;
		createdAt:  string;
	};

	let items:    AuditLog[] = $state([]);
	let loading   = $state(true);
	let hasMore   = $state(false);
	let loadingMore = $state(false);
	let lastId    = $state('');
	let lastDate  = $state('');
	let listError = $state('');

	let selectedIds: string[] = $state([]);
	let selectAll    = $state(false);

	function toggleSelectAll() {
		if (selectAll) { selectedIds = []; selectAll = false; }
		else { selectedIds = items.map(i => i.id); selectAll = true; }
	}
	function toggleSelect(id: string) {
		selectedIds = selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id];
		selectAll = selectedIds.length === items.length;
	}
	function handleRowClick(_id: string) { /* no-op */ }

	let filterEntity  = $state('');
	let filterEmail   = $state('');
	let dateFrom      = $state('');
	let dateTo        = $state('');

	let showDeleteModal = $state(false);
	let deleteBefore    = $state('');
	let deleteSaving    = $state(false);

	async function load(reset = true) {
		if (reset) { items = []; lastId = ''; lastDate = ''; loading = true; }
		else loadingMore = true;
		listError = '';
		try {
			const params = new URLSearchParams({ limit: '30' });
			if (!reset && lastId && lastDate) {
				params.set('lastId', lastId);
				params.set('lastDate', lastDate);
			}
			if (filterEntity) params.set('entityType', filterEntity);
			if (filterEmail)  params.set('adminEmail', filterEmail);
			if (dateFrom)     params.set('dateFrom', dateFrom);
			if (dateTo)       params.set('dateTo', dateTo);

			const res = await fetch(`/api/admin/audit?${params}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			items = reset ? data.items : [...items, ...data.items];
			hasMore = data.hasMore;
			if (data.items.length) {
				const last = data.items[data.items.length - 1];
				lastId = last.id;
				lastDate = last.createdAt;
			}
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false; loadingMore = false;
		}
	}

	onMount(async () => {
		await load();
		onaction?.(openDeleteBefore);
	});

	function applyFilters() {
		load(true);
	}

	function clearFilters() {
		filterEntity = '';
		filterEmail = '';
		dateFrom = '';
		dateTo = '';
		load(true);
	}

	function openDeleteBefore() {
		deleteBefore = new Date().toISOString().split('T')[0];
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
	}

	async function confirmDeleteBefore() {
		if (!deleteBefore) return;
		deleteSaving = true;
		try {
			const res = await fetch('/api/admin/audit', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ before: deleteBefore }),
			});
			if (!res.ok) throw new Error(await res.text());
			showDeleteModal = false;
			await load(true);
		} catch (e: any) {
			listError = e.message ?? 'Delete failed';
		} finally {
			deleteSaving = false;
		}
	}

	function formatTimestamp(d: string) {
		return new Date(d).toLocaleString('en-IN', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		});
	}

	const entityTypes = ['product', 'brand', 'category', 'product_type', 'location', 'stock', 'page_section', 'admin_user', 'settings'];
</script>

<DeleteConfirmModal
	open={showDeleteModal}
	entityName="logs before {deleteBefore}"
	entityLabel="audit log entries"
	productCount={0}
	checking={false}
	message="All audit log entries before this date will be permanently deleted."
	onconfirm={confirmDeleteBefore}
	oncancel={closeDeleteModal}
/>

<section class="flex flex-col gap-5">
	{#if listError}
		<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-wrap gap-3 items-end">
		<label class="flex flex-col gap-[5px]">
			<span class="text-[11px] font-semibold text-copy uppercase tracking-wider">Entity Type</span>
			<select class="font-inter text-[13px] py-[6px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none cursor-pointer min-w-[140px]" bind:value={filterEntity}>
				<option value="">All</option>
				{#each entityTypes as et}
					<option value={et}>{et}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-[11px] font-semibold text-copy uppercase tracking-wider">Admin Email</span>
			<input class="font-inter text-[13px] py-[6px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-48 focus:border-primary" bind:value={filterEmail} placeholder="Search email…" />
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-[11px] font-semibold text-copy uppercase tracking-wider">From</span>
			<input type="date" class="font-inter text-[13px] py-[6px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none cursor-pointer" bind:value={dateFrom} />
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-[11px] font-semibold text-copy uppercase tracking-wider">To</span>
			<input type="date" class="font-inter text-[13px] py-[6px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none cursor-pointer" bind:value={dateTo} />
		</label>
		<button class="font-inter text-[13px] font-semibold py-[6px] px-3.5 rounded-md border border-primary bg-primary text-white cursor-pointer transition-colors hover:bg-primary-hover" onclick={applyFilters}>Apply</button>
		<button class="font-inter text-[13px] font-medium py-[6px] px-3.5 rounded-md border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={clearFilters}>Clear</button>
	</div>

	<DataTable
		columns={[
			{ label: 'Timestamp' },
			{ label: 'Admin' },
			{ label: 'Action' },
			{ label: 'Entity' },
			{ label: 'Name' },
		]}
		{loading}
		empty={items.length === 0}
		emptyMessage="No audit logs found."
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
				<td class="border-subtle border px-3 py-2 text-[12px] text-copy-light whitespace-nowrap">{formatTimestamp(item.createdAt)}</td>
				<td class="border-subtle border px-3 py-2 text-copy text-[13px]">{item.adminEmail}</td>
				<td class="border-subtle border px-3 py-2">
					<span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded {item.action === 'deleted' ? 'bg-[#fef2f2] text-danger' : item.action === 'created' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface text-copy'}">{item.action}</span>
				</td>
				<td class="border-subtle border px-3 py-2 text-copy-light text-[13px]">{item.entityType}</td>
				<td class="border-subtle border px-3 py-2 text-copy text-[13px] max-w-[200px] truncate" title={item.entityName}>{item.entityName}</td>
			</tr>
		{/each}
	</DataTable>

	{#if hasMore}
		<div class="flex justify-center">
			<button class="font-inter text-[13px] font-medium py-2 px-6 rounded-lg border border-subtle bg-surface text-copy cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas" onclick={() => load(false)} disabled={loadingMore}>
				{loadingMore ? 'Loading…' : 'Load more'}
			</button>
		</div>
	{/if}
</section>
