<script lang="ts">
	import { adminNav, type AdminView } from '$lib/stores/adminNav';

	const tabs: {
		id: AdminView['tab'];
		label: string;
		defaultView: AdminView;
		icon: string;
	}[] = [
		{
			id: 'overview',
			label: 'Overview',
			defaultView: { tab: 'overview' },
			icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
		},
		{
			id: 'products',
			label: 'Products',
			defaultView: { tab: 'products', view: 'list' },
			icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
		},
		{
			id: 'pages',
			label: 'Pages',
			defaultView: { tab: 'pages', view: 'list' },
			icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
		},
		{
			id: 'catalog',
			label: 'Catalog',
			defaultView: { tab: 'catalog', section: 'categories' },
			icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
		},
		{
			id: 'locations',
			label: 'Locations',
			defaultView: { tab: 'locations', view: 'list' },
			icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
		},
		{
			id: 'settings',
			label: 'Settings',
			defaultView: { tab: 'settings', section: 'store' },
			icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`
		}
	];

	$: currentTab = $adminNav.tab;
</script>

<nav class="bottom-nav" role="navigation" aria-label="Main navigation">
	{#each tabs as tab}
		<button
			class="bottom-tab"
			class:active={currentTab === tab.id}
			on:click={() => adminNav.navigate(tab.defaultView)}
			aria-current={currentTab === tab.id ? 'page' : undefined}
			aria-label={tab.label}
		>
			<span class="tab-icon">{@html tab.icon}</span>
			<span class="tab-label">{tab.label}</span>
		</button>
	{/each}
</nav>

<style>
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--spacing-nav);
		background: var(--color-neutral);
		border-top: 1px solid var(--color-subtle);
		display: flex;
		align-items: stretch;
		z-index: 100;
		padding: 0 4px;
		/* safe area for iOS */
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	.bottom-tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-copy-light);
		padding: 4px 2px;
		border-radius: 8px;
		transition: color 0.15s, background 0.15s;
		font-family: var(--font-inter), sans-serif;
		-webkit-tap-highlight-color: transparent;
	}

	.bottom-tab:active {
		background: var(--color-surface);
	}

	.bottom-tab.active {
		color: var(--color-primary);
	}

	.tab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tab-label {
		font-size: 0.6rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}
</style>