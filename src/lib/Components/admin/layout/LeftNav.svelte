<script lang="ts">
	import { adminNav, type AdminView } from '$lib/stores/adminNav';

	let { collapsed = false, onToggle }: { collapsed?: boolean; onToggle: () => void } = $props();

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
			icon: `<span class="icon-[lucide--layout-grid] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'products',
			label: 'Products',
			defaultView: { tab: 'products', view: 'list' },
			icon: `<span class="icon-[lucide--box] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'pages',
			label: 'Pages',
			defaultView: { tab: 'pages', view: 'list' },
			icon: `<span class="icon-[lucide--file-text] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'templates',
			label: 'Templates',
			defaultView: { tab: 'templates' },
			icon: `<span class="icon-[lucide--layout-template] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'catalog',
			label: 'Catalog',
			defaultView: { tab: 'catalog', section: 'categories' },
			icon: `<span class="icon-[lucide--list] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'tags',
			label: 'Tags',
			defaultView: { tab: 'tags' },
			icon: `<span class="icon-[lucide--tag] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'locations',
			label: 'Locations',
			defaultView: { tab: 'locations', view: 'list' },
			icon: `<span class="icon-[lucide--map-pin] w-[18px] h-[18px]"></span>`
		},
		{
			id: 'settings',
			label: 'Settings',
			defaultView: { tab: 'settings', section: 'store' },
			icon: `<span class="icon-[lucide--settings] w-[18px] h-[18px]"></span>`
		}
	];

	const currentTab = $derived($adminNav.tab);
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
					onclick={() => adminNav.navigate(tab.defaultView)}
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

	<div class="flex justify-end px-3 py-2 border-t border-subtle shrink-0">
		<button class="flex items-center justify-center w-9 h-9 bg-transparent border border-subtle rounded-md cursor-pointer text-copy-light transition-colors hover:bg-surface hover:text-copy hover:border-subtle-hover" onclick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
			<span class="icon-[lucide--chevrons-left] w-5 h-5" class:rotated={collapsed}></span>
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
		overflow: hidden;
		white-space: nowrap;
	}
	.collapsed .nav-item { justify-content: center; padding: 10px 0; }
	.nav-item:hover { background: var(--color-surface-hover); color: #1a1a1a; }
	.nav-item.active { border-left-color: var(--color-primary); background: var(--color-surface); color: var(--color-primary); font-weight: 600; }
	.nav-item.active :global(.nav-icon) { opacity: 1; }

	.rotated { transform: rotate(180deg); }
</style>
