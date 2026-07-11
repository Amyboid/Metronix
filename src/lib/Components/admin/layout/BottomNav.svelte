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
			icon: `<span class="icon-[lucide--layout-grid] w-5 h-5"></span>`
		},
		{
			id: 'products',
			label: 'Products',
			defaultView: { tab: 'products', view: 'list' },
			icon: `<span class="icon-[lucide--box] w-5 h-5"></span>`
		},
		{
			id: 'pages',
			label: 'Pages',
			defaultView: { tab: 'pages', view: 'list' },
			icon: `<span class="icon-[lucide--file-text] w-5 h-5"></span>`
		},
		{
			id: 'catalog',
			label: 'Catalog',
			defaultView: { tab: 'catalog', section: 'categories' },
			icon: `<span class="icon-[lucide--list] w-5 h-5"></span>`
		},
		{
			id: 'tags',
			label: 'Tags',
			defaultView: { tab: 'tags' },
			icon: `<span class="icon-[lucide--tag] w-5 h-5"></span>`
		},
		{
			id: 'locations',
			label: 'Locations',
			defaultView: { tab: 'locations', view: 'list' },
			icon: `<span class="icon-[lucide--map-pin] w-5 h-5"></span>`
		},
		{
			id: 'settings',
			label: 'Settings',
			defaultView: { tab: 'settings', section: 'store' },
			icon: `<span class="icon-[lucide--settings] w-5 h-5"></span>`
		}
	];

	const currentTab = $derived($adminNav.tab);
</script>

<nav class="fixed bottom-0 left-0 right-0 h-nav bg-neutral border-t border-subtle flex items-stretch z-[100] px-1 pb-[env(safe-area-inset-bottom,0)]" aria-label="Main navigation">
	{#each tabs as tab}
		<button
			class="flex-1 flex flex-col items-center justify-center gap-[3px] bg-transparent border-none cursor-pointer text-copy-light px-[2px] py-1 rounded-lg transition-colors font-inter -webkit-tap-highlight-color:transparent active:bg-surface"
			class:text-primary={currentTab === tab.id}
			onclick={() => adminNav.navigate(tab.defaultView)}
			aria-current={currentTab === tab.id ? 'page' : undefined}
			aria-label={tab.label}
		>
			<span class="flex items-center justify-center">{@html tab.icon}</span>
			<span class="text-[0.6rem] font-medium tracking-[0.02em] whitespace-nowrap">{tab.label}</span>
		</button>
	{/each}
</nav>
