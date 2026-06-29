<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { adminNav } from '$lib/stores/adminNav';
	import AdminShell from '$lib/Components/admin/layout/AdminShell.svelte';

	// Lazy-loaded tab components — import placeholders until real components exist
	// Replace these with actual imports as you build each section
	import OverviewTab from '$lib/Components/admin/overview/OverviewTab.svelte';
	import CatalogTab from '$lib/Components/admin/catalog/CatalogTab.svelte';
	import LocationsTab from '$lib/Components/admin/locations/LocationsTab.svelte';
	import PagesTab from '$lib/Components/admin/pages/PagesTab.svelte';
	import ProductList from '$lib/Components/admin/products/ProductList.svelte';
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
		<OverviewTab user={data.user} />

	{:else if currentView.tab === 'products'}
		{#if currentView.view === 'list'}
			<ProductList />
		{:else if currentView.view === 'new'}
			<div class="placeholder">
				<h2>New Product</h2>
				<p>Product wizard — build <code>ProductWizard.svelte</code></p>
			</div>
		{:else}
			<div class="placeholder">
				<h2>Update Product</h2>
				<p>Update product <strong>{currentView.slug}</strong> — build <code>ProductWizard.svelte</code></p>
			</div>
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

<style>
	/* Reset default body margin that might leak in */
	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.placeholder {
		padding: 32px;
		background: var(--color-surface);
		border-radius: 10px;
		border: 1px dashed var(--color-subtle);
		color: var(--color-copy);
		font-family: var(--font-inter), sans-serif;
	}

	.placeholder h2 {
		font-size: 1.1rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 8px;
	}

	.placeholder p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-copy-light);
	}

	.placeholder code {
		background: var(--color-canvas);
		padding: 1px 5px;
		border-radius: 4px;
		font-size: 0.8rem;
		color: var(--color-primary);
	}
</style>