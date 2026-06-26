<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import SectionHeader from '../catalog/SectionHeader.svelte';
	import DataTable from '../catalog/DataTable.svelte';
	import DeleteConfirmModal from '../catalog/DeleteConfirmModal.svelte';

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

	async function load() {
		loading = true; listError = '';
		try {
			const res = await fetch('/api/admin/locations');
			if (!res.ok) throw new Error(await res.text());
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
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Delete failed' })); throw new Error(b.message); }
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
	onconfirm={confirmDelete}
	oncancel={closeDeleteModal}
/>

<section class="flex flex-col gap-5">
	<SectionHeader title="Locations" subtitle="Manage store locations and delivery ranges." onAdd={openAdd} addLabel="+ Add Location" />

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
		emptyMessage="No locations yet. Add one above."
	>
		{#each items as item (item.id)}
			<tr>
				<td class="py-2.5 px-3.5 text-copy border-b border-subtle font-medium">{item.storeName}</td>
				<td class="py-2.5 px-3.5 text-copy-light border-b border-subtle">{item.address}</td>
				<td class="py-2.5 px-3.5 text-copy border-b border-subtle">{item.city}</td>
				<td class="py-2.5 px-3.5 text-copy-light border-b border-subtle">{item.phone ?? '—'}</td>
				<td class="text-right whitespace-nowrap py-2.5 px-3.5 border-b border-subtle">
					<button class="text-xs py-[5px] px-2 rounded-[5px] border border-subtle bg-transparent cursor-pointer text-copy inline-flex items-center justify-center transition-colors ml-1 hover:bg-surface hover:border-subtle-hover" onclick={() => openEdit(item)} title="Edit" aria-label="Edit">
						<span class="icon-[lucide--pencil] w-3 h-3"></span>
					</button>
					<button class="text-xs py-[5px] px-2 rounded-[5px] border border-transparent bg-transparent cursor-pointer text-danger inline-flex items-center justify-center transition-colors ml-1 hover:bg-[#fef2f2] hover:border-[#fca5a5]" onclick={() => startDelete(item)} disabled={deletingId === item.id} title="Delete" aria-label="Delete">
						{#if deletingId === item.id}…{:else}
							<span class="icon-[lucide--trash-2] w-3 h-3"></span>
						{/if}
					</button>
				</td>
			</tr>
		{/each}
	</DataTable>
</section>
