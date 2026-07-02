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
	</div>

	<div class="flex-1 overflow-y-auto">
		{#if currentSection === 'store'}
			<StoreInfoSection />
		{:else if currentSection === 'page-size'}
			<PageSizeSection />
		{:else if currentSection === 'imagekit'}
			<ImageKitSection />
		{:else if currentSection === 'admins' && isSuperAdmin}
			<AdminUsersSection currentUserId={user.id} />
		{:else if currentSection === 'audit-logs' && isSuperAdmin}
			<AuditLogsSection />
		{:else}
			<p class="text-sm text-copy-light">Access denied.</p>
		{/if}
	</div>
</div>

