<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import StoreInfoSection from './StoreInfoSection.svelte';
	import PageSizeSection from './PageSizeSection.svelte';
	import ImageKitSection from './ImageKitSection.svelte';
	import AdminUsersSection from './AdminUsersSection.svelte';
	import AuditLogsSection from './AuditLogsSection.svelte';

	let { user }: { user: { id: string; name: string; email: string; role: string } } = $props();

	type SettingsSection = 'store' | 'page-size' | 'imagekit' | 'admins' | 'audit-logs';

	const currentSection = $derived(($adminNav.tab === 'settings'
		? $adminNav.section
		: 'store') as SettingsSection);

	const isSuperAdmin = $derived(user.role === 'super_admin');

	let storeActionFn: (() => void) | null = $state(null);
	let pageSizeActionFn: (() => void) | null = $state(null);
	let imagekitActionFn: (() => void) | null = $state(null);
	let adminsActionFn: (() => void) | null = $state(null);
	let auditActionFn: (() => void) | null = $state(null);

	function setSection(s: SettingsSection) {
		adminNav.navigate({ tab: 'settings', section: s });
	}

	const pills: { id: SettingsSection; label: string; adminOnly?: boolean }[] = [
		{ id: 'store',       label: 'Store Info' },
		{ id: 'page-size',   label: 'Page Size' },
		{ id: 'imagekit',    label: 'ImageKit' },
		{ id: 'admins',      label: 'Admin Users', adminOnly: true },
		{ id: 'audit-logs',  label: 'Audit Logs',  adminOnly: true },
	];
</script>

<div class="flex flex-col gap-0">
	<div class="border-b border-subtle bg-neutral shrink-0 px-6 py-2">
		<div class="flex items-center gap-3">
			<div class="flex gap-1.5 bg-surface border border-subtle rounded-[10px] p-1 w-fit" role="tablist" aria-label="Settings sections">
				{#each pills as pill}
					{#if !pill.adminOnly || isSuperAdmin}
						<button
							role="tab"
							aria-selected={currentSection === pill.id}
							class="font-inter text-[0.8125rem] font-medium px-4 py-1.5 rounded-[7px] border-none cursor-pointer transition-colors whitespace-nowrap {currentSection === pill.id ? 'bg-neutral text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-copy hover:bg-surface-hover'}"
							onclick={() => setSection(pill.id)}
						>
							{pill.label}
						</button>
					{/if}
				{/each}
			</div>
			<div class="ml-auto">
				{#if currentSection === 'store'}
					<button
						class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={() => storeActionFn?.()}
					>
						Edit
					</button>
				{:else if currentSection === 'page-size'}
					<button
						class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={() => pageSizeActionFn?.()}
					>
						Edit
					</button>
				{:else if currentSection === 'imagekit'}
					<button
						class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={() => imagekitActionFn?.()}
					>
						Edit
					</button>
				{:else if currentSection === 'admins' && isSuperAdmin}
					<button
						class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={() => adminsActionFn?.()}
					>
						+ Invite Admin
					</button>
				{:else if currentSection === 'audit-logs' && isSuperAdmin}
					<button
						class="font-inter border-danger text-danger hover:bg-danger cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={() => auditActionFn?.()}
					>
						Delete Old Logs
					</button>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto px-6 py-5">
		{#if currentSection === 'store'}
			<StoreInfoSection onaction={(fn) => { storeActionFn = fn; }} />
		{:else if currentSection === 'page-size'}
			<PageSizeSection onaction={(fn) => { pageSizeActionFn = fn; }} />
		{:else if currentSection === 'imagekit'}
			<ImageKitSection onaction={(fn) => { imagekitActionFn = fn; }} />
		{:else if currentSection === 'admins' && isSuperAdmin}
			<AdminUsersSection currentUserId={user.id} onaction={(fn) => { adminsActionFn = fn; }} />
		{:else if currentSection === 'audit-logs' && isSuperAdmin}
			<AuditLogsSection onaction={(fn) => { auditActionFn = fn; }} />
		{:else}
			<p class="text-sm text-copy-light">Access denied.</p>
		{/if}
	</div>
</div>
