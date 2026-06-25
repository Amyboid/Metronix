<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import CategoriesSection from './CategoriesSection.svelte';
	import ProductTypesSection from './ProductTypesSection.svelte';
	import BrandsSection from './BrandsSection.svelte';

	type CatalogSection = 'categories' | 'product-types' | 'brands';

	$: currentSection = ($adminNav.tab === 'catalog'
		? $adminNav.section
		: 'categories') as CatalogSection;

	function setSection(s: CatalogSection) {
		adminNav.navigate({ tab: 'catalog', section: s });
	}

	const pills: { id: CatalogSection; label: string }[] = [
		{ id: 'categories',    label: 'Categories' },
		{ id: 'product-types', label: 'Product Types' },
		{ id: 'brands',        label: 'Brands' },
	];
</script>

<div class="catalog-tab">
	<div class="pill-nav" role="tablist" aria-label="Catalog sections">
		{#each pills as pill}
			<button
				role="tab"
				aria-selected={currentSection === pill.id}
				class="pill"
				class:active={currentSection === pill.id}
				on:click={() => setSection(pill.id)}
			>
				{pill.label}
			</button>
		{/each}
	</div>
	<div class="section-body">
		{#if currentSection === 'categories'}
			<CategoriesSection />
		{:else if currentSection === 'product-types'}
			<ProductTypesSection />
		{:else if currentSection === 'brands'}
			<BrandsSection />
		{/if}
	</div>
</div>

<style>
	.catalog-tab { display: flex; flex-direction: column; gap: 24px; }

	.pill-nav {
		display: flex; gap: 6px;
		background: var(--color-surface); border: 1px solid var(--color-subtle);
		border-radius: 10px; padding: 4px; width: fit-content;
	}

	.pill {
		font-family: var(--font-inter), sans-serif;
		font-size: 0.8125rem; font-weight: 500;
		padding: 6px 16px; border-radius: 7px; border: none;
		background: transparent; color: var(--color-copy);
		cursor: pointer; transition: background 0.15s, color 0.15s; white-space: nowrap;
	}
	.pill:hover:not(.active) { background: var(--color-surface-hover); color: #1a1a1a; }
	.pill.active { background: var(--color-neutral); color: #1a1a1a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

	.section-body { flex: 1; }
</style>