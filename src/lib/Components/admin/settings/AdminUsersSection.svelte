<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable from '$lib/Components/admin/catalog/DataTable.svelte';
	import SidePanel from '$lib/Components/admin/catalog/SidePanel.svelte';
	import { handleApiError } from '$lib/utils/apiError';

	let { currentUserId = '', onaction }: { currentUserId?: string; onaction?: (fn: () => void) => void } = $props();

	type AdminUser = {
		id:        string;
		name:      string;
		email:     string;
		role:      string;
		banned:    boolean | null;
		createdAt: string;
	};

	let items:    AdminUser[] = $state([]);
	let loading   = $state(true);
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
	function handleRowClick(_id: string) { /* invite-only, no-op */ }

	let inviteOpen  = $state(false);
	let inviteEmail = $state('');
	let inviteSaving = $state(false);
	let inviteError  = $state('');

	async function load() {
		loading = true; listError = '';
		try {
			const res = await fetch('/api/admin/users');
		if (!res.ok) await handleApiError(res);
		const data = await res.json();
		items = data.items;
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		await load();
		onaction?.(() => { inviteOpen = true; inviteEmail = ''; inviteError = ''; });
	});

	async 	function toggleBan(item: AdminUser) {
		if (item.id === currentUserId) return;
		try {
			const res = await fetch('/api/admin/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: item.id, banned: !item.banned }),
			});
		if (!res.ok) await handleApiError(res);
		await load();
		} catch (e: any) {
			listError = e.message ?? 'Failed to update';
		}
	}

	async function inviteAdmin() {
		if (!inviteEmail.trim()) { inviteError = 'Email is required'; return; }
		inviteSaving = true; inviteError = '';
		try {
			const res = await fetch('/api/admin/users/invite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: inviteEmail.trim() }),
			});
			if (!res.ok) await handleApiError(res);
			inviteOpen = false;
			inviteEmail = '';
			await load();
		} catch (e: any) {
			inviteError = e.message ?? 'Invite failed';
		} finally {
			inviteSaving = false;
		}
	}

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}
</script>

<section class="flex flex-col gap-5">
	{#if listError}
		<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>
	{/if}

	<DataTable
		columns={[
			{ label: 'Email' },
			{ label: 'Role' },
			{ label: 'Joined' },
			{ label: 'Status' },
		]}
		{loading}
		empty={items.length === 0}
		emptyMessage="No admin users found."
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
				<td class="border-subtle border px-3 py-2 font-medium">{item.email}</td>
				<td class="border-subtle border px-3 py-2">
					<span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full {item.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-surface text-copy'}">{item.role}</span>
				</td>
				<td class="border-subtle border px-3 py-2 text-copy-light text-[13px]">{formatDate(item.createdAt)}</td>
				<td class="border-subtle border px-3 py-2">
					{#if item.id === currentUserId}
						<span class="text-xs text-copy-light">You</span>
					{:else}
						<button
							class="text-xs py-1 px-2.5 rounded-md border cursor-pointer transition-colors {item.banned ? 'border-[#fca5a5] bg-transparent text-danger hover:bg-[#fef2f2]' : 'border-subtle bg-transparent text-copy hover:bg-surface hover:border-subtle-hover'}"
							onclick={() => toggleBan(item)}
						>
							{item.banned ? 'Deactivated' : 'Active'}
						</button>
					{/if}
				</td>
			</tr>
		{/each}
	</DataTable>
</section>

<SidePanel open={inviteOpen} title="Invite Admin" saving={inviteSaving} canSave={inviteEmail.trim().length > 0} onsave={inviteAdmin} ondiscard={() => { inviteOpen = false; inviteEmail = ''; inviteError = ''; }}>
	<div class="flex flex-col gap-4">
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Email <span class="text-danger">*</span></span>
			<input type="email" class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={inviteEmail} placeholder="admin@example.com" />
		</label>
		{#if inviteError}
			<p class="text-xs text-danger m-0">{inviteError}</p>
		{/if}
		<p class="text-xs text-copy-light m-0">An invitation email will be sent with a link to set their password.</p>
	</div>
</SidePanel>
