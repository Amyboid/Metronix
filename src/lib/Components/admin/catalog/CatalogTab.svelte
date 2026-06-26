<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import CategoriesSection from './CategoriesSection.svelte';
	import ProductTypesSection from './ProductTypesSection.svelte';
	import BrandsSection from './BrandsSection.svelte';

	type CatalogSection = 'categories' | 'product-types' | 'brands';

	const currentSection = $derived(($adminNav.tab === 'catalog'
		? $adminNav.section
		: 'categories') as CatalogSection);

	function setSection(s: CatalogSection) {
		adminNav.navigate({ tab: 'catalog', section: s });
	}

	const pills: { id: CatalogSection; label: string }[] = [
		{ id: 'categories',    label: 'Categories' },
		{ id: 'product-types', label: 'Product Types' },
		{ id: 'brands',        label: 'Brands' },
	];
</script>

<div class="flex flex-col gap-6">
	<div class="sticky top-0 z-10 p-6 pl-0 bg-neutral">
		<div class="flex gap-1.5 bg-surface border border-subtle rounded-[10px] p-1 w-fit" role="tablist" aria-label="Catalog sections">
			{#each pills as pill}
				<button
					role="tab"
					aria-selected={currentSection === pill.id}
					class="font-inter text-[0.8125rem] font-medium px-4 py-1.5 rounded-[7px] border-none bg-transparent text-copy cursor-pointer transition-colors whitespace-nowrap"
					class:active-pill={currentSection === pill.id}
					onclick={() => setSection(pill.id)}
				>
					{pill.label}
				</button>
			{/each}
		</div>
	</div>
	<div class="flex-1">
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
	.active-pill {
		background: var(--color-neutral);
		color: #1a1a1a;
		box-shadow: 0 1px 3px rgba(0,0,0,0.08);
	}
</style>
