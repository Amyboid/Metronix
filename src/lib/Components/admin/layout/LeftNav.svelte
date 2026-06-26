<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { adminNav, type AdminView } from '$lib/stores/adminNav';

	export let collapsed = false;
	const dispatch = createEventDispatcher();

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
			icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
		},
		{
			id: 'products',
			label: 'Products',
			defaultView: { tab: 'products', view: 'list' },
			icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
		},
		{
			id: 'pages',
			label: 'Pages',
			defaultView: { tab: 'pages', view: 'list' },
			icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
		},
		{
			id: 'catalog',
			label: 'Catalog',
			defaultView: { tab: 'catalog', section: 'categories' },
			icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
		},
		{
			id: 'locations',
			label: 'Locations',
			defaultView: { tab: 'locations', view: 'list' },
			icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
		},
		{
			id: 'settings',
			label: 'Settings',
			defaultView: { tab: 'settings', section: 'store' },
			icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`
		}
	];

	$: currentTab = $adminNav.tab;
</script>

<nav
	class="left-nav"
	class:collapsed
>
	<ul class="nav-list">
		{#each tabs as tab}
			<li>
				<button
					class="nav-item"
					class:active={currentTab === tab.id}
					on:click={() => adminNav.navigate(tab.defaultView)}
					aria-current={currentTab === tab.id ? 'page' : undefined}
					title={collapsed ? tab.label : undefined}
				>
					<span class="shrink-0 opacity-75 nav-icon">{@html tab.icon}</span>
					{#if !collapsed}
						<span class="tracking-[0.01em]">{tab.label}</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>

	<div class="px-3 py-2 border-t border-subtle shrink-0">
		<button class="flex items-center justify-center w-9 h-9 mx-auto bg-transparent border border-subtle rounded-md cursor-pointer text-copy-light transition-colors hover:bg-surface hover:text-copy hover:border-subtle-hover" on:click={() => dispatch('toggle')} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class:rotated={collapsed}>
				<polyline points="11 17 6 12 11 7"/>
				<polyline points="18 17 13 12 18 7"/>
			</svg>
		</button>
	</div>
</nav>

<style>
	.left-nav {
		width: 220px;
		min-width: 220px;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--color-neutral);
		border-right: 1px solid var(--color-subtle);
		transition: width 0.2s ease, min-width 0.2s ease;
	}
	.left-nav.collapsed { width: 60px; min-width: 60px; }

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 8px 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 20px;
		background: none;
		border: none;
		border-left: 3px solid transparent;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-inter), sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-copy);
		transition: background 0.15s, color 0.15s, border-color 0.15s;
		border-radius: 0 6px 6px 0;
		overflow: hidden;
		white-space: nowrap;
	}
	.collapsed .nav-item { justify-content: center; padding: 10px 0; }
	.nav-item:hover { background: var(--color-surface-hover); color: #1a1a1a; }
	.nav-item.active { border-left-color: var(--color-primary); background: var(--color-surface); color: var(--color-primary); font-weight: 600; }
	.nav-item.active :global(.nav-icon) { opacity: 1; }

	.rotated { transform: rotate(180deg); }
</style>
