<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { adminNav } from '$lib/stores/adminNav';
	import AdminShell from '$lib/Components/admin/layout/AdminShell.svelte';

	import OverviewTab from '$lib/Components/admin/overview/OverviewTab.svelte';
	import CatalogTab from '$lib/Components/admin/catalog/CatalogTab.svelte';
	import LocationsTab from '$lib/Components/admin/locations/LocationsTab.svelte';
	import PagesTab from '$lib/Components/admin/pages/PagesTab.svelte';
	import ProductList from '$lib/Components/admin/products/ProductList.svelte';
	import ProductWizard from '$lib/Components/admin/products/ProductWizard.svelte';
	import SettingsTab from '$lib/Components/admin/settings/SettingsTab.svelte';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		// Sync store from current URL on first load
		adminNav.syncFromUrl();

		// Handle browser back/forward
		const onPopState = (e: PopStateEvent) => {
			if (e.state?.view) {
				// Restore from history state
				import('$lib/stores/adminNav').then(({ adminNav: nav }) => {
					// We need to set without pushing another history entry
					nav.syncFromUrl();
				});
			} else {
				adminNav.syncFromUrl();
			}
		};

		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	});

	const currentView = $derived($adminNav);
</script>

<svelte:head>
	<title>Admin — {data.user.name}</title>
</svelte:head>

<AdminShell adminEmail={data.user.email} storeName="Admin Panel">
	{#if currentView.tab === 'overview'}
		<OverviewTab />

	{:else if currentView.tab === 'products'}
		{#if currentView.view === 'list'}
			<ProductList />
		{:else if currentView.view === 'new'}
			<ProductWizard />
		{:else}
			<ProductWizard slug={currentView.slug} />
		{/if}

	{:else if currentView.tab === 'pages'}
		<PagesTab />

	{:else if currentView.tab === 'catalog'}
		<CatalogTab />

	{:else if currentView.tab === 'locations'}
		<LocationsTab />

	{:else if currentView.tab === 'settings'}
		<SettingsTab user={data.user} />
	{/if}
</AdminShell>