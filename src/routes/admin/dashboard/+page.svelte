<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { adminNav } from '$lib/stores/adminNav';
	import AdminShell from '$lib/Components/admin/layout/AdminShell.svelte';

	// Lazy-loaded tab components — import placeholders until real components exist
	// Replace these with actual imports as you build each section
	import OverviewTab from '$lib/Components/admin/overview/OverviewTab.svelte';

	export let data: PageData;

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

	$: currentView = $adminNav;
</script>

<svelte:head>
	<title>Admin — {data.user.name}</title>
</svelte:head>

<AdminShell adminEmail={data.user.email} storeName="Admin Panel">
	{#if currentView.tab === 'overview'}
		<OverviewTab user={data.user} />

	{:else if currentView.tab === 'products'}
		<!-- Placeholder until ProductList / ProductWizard are built -->
		<div class="placeholder">
			<h2>Products</h2>
			{#if currentView.view === 'list'}
				<p>Product list view — build <code>ProductList.svelte</code></p>
			{:else if currentView.view === 'new'}
				<p>New product wizard — build <code>ProductWizard.svelte</code></p>
			{:else}
				<p>Update product <strong>{currentView.slug}</strong> — build <code>ProductWizard.svelte</code></p>
			{/if}
		</div>

	{:else if currentView.tab === 'pages'}
		<div class="placeholder">
			<h2>Pages</h2>
			{#if currentView.view === 'list'}
				<p>Pages list — build <code>PagesList.svelte</code></p>
			{:else}
				<p>Edit page <strong>{currentView.pageName}</strong> — build <code>PageEditor.svelte</code></p>
			{/if}
		</div>

	{:else if currentView.tab === 'catalog'}
		<div class="placeholder">
			<h2>Catalog — {currentView.section}</h2>
			<p>Build <code>CatalogTab.svelte</code></p>
		</div>

	{:else if currentView.tab === 'locations'}
		<div class="placeholder">
			<h2>Locations</h2>
			{#if currentView.view === 'list'}
				<p>Locations list — build <code>LocationList.svelte</code></p>
			{:else if currentView.view === 'new'}
				<p>New location form — build <code>LocationForm.svelte</code></p>
			{:else}
				<p>Update location <strong>{currentView.id}</strong> — build <code>LocationForm.svelte</code></p>
			{/if}
		</div>

	{:else if currentView.tab === 'settings'}
		<div class="placeholder">
			<h2>Settings — {currentView.section}</h2>
			<p>Build <code>SettingsTab.svelte</code></p>
		</div>
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