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

<div class="flex flex-col gap-0">
	<div class="border-b border-subtle bg-neutral shrink-0 px-6 py-2">
		<div class="flex gap-1.5 bg-surface border border-subtle rounded-[10px] p-1 w-fit" role="tablist" aria-label="Catalog sections">
			{#each pills as pill}
				<button
					role="tab"
					aria-selected={currentSection === pill.id}
					class="font-inter text-[0.8125rem] font-medium px-4 py-1.5 rounded-[7px] border-none cursor-pointer transition-colors whitespace-nowrap {currentSection === pill.id ? 'bg-neutral text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-copy hover:bg-surface-hover'}"
					onclick={() => setSection(pill.id)}
				>
					{pill.label}
				</button>
			{/each}
		</div>
	</div>
	<div class="flex-1 overflow-y-auto">
		{#if currentSection === 'categories'}
			<CategoriesSection />
		{:else if currentSection === 'product-types'}
			<ProductTypesSection />
		{:else if currentSection === 'brands'}
			<BrandsSection />
		{/if}
	</div>
</div>

