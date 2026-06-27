<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable from '../catalog/DataTable.svelte';
	import SidePanel from '../catalog/SidePanel.svelte';

	let { currentUserId = '' }: { currentUserId?: string } = $props();

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

	let inviteOpen  = $state(false);
	let inviteEmail = $state('');
	let inviteSaving = $state(false);
	let inviteError  = $state('');

	async function load() {
		loading = true; listError = '';
		try {
			const res = await fetch('/api/admin/users');
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

	async 	function toggleBan(item: AdminUser) {
		if (item.id === currentUserId) return;
		try {
			const res = await fetch('/api/admin/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: item.id, banned: !item.banned }),
			});
			if (!res.ok) throw new Error(await res.text());
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
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Invite failed' })); throw new Error(b.message); }
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
	<div class="flex items-start justify-between gap-3">
		<div>
			<h2 class="text-base font-bold text-gray-900 mb-0.5">Admin Users</h2>
			<p class="text-[13px] text-copy-light m-0">Manage admin accounts and access.</p>
		</div>
		<button class="font-inter text-[13px] font-semibold py-[7px] px-3.5 rounded-[7px] border border-primary bg-transparent text-primary cursor-pointer whitespace-nowrap transition-colors shrink-0 hover:bg-primary hover:text-white" onclick={() => { inviteOpen = true; inviteEmail = ''; inviteError = ''; }}>
			+ Invite Admin
		</button>
	</div>

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
	>
		{#each items as item (item.id)}
			<tr>
				<td class="py-2.5 px-3.5 text-copy border-b border-subtle font-medium">{item.email}</td>
				<td class="py-2.5 px-3.5 border-b border-subtle">
					<span class="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full {item.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-surface text-copy'}">{item.role}</span>
				</td>
				<td class="py-2.5 px-3.5 text-copy-light border-b border-subtle text-[13px]">{formatDate(item.createdAt)}</td>
				<td class="py-2.5 px-3.5 border-b border-subtle">
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
