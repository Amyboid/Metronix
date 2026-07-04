<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import CategoriesSection from './CategoriesSection.svelte';
	import ProductTypesSection from './ProductTypesSection.svelte';
	import BrandsSection from './BrandsSection.svelte';

	type CatalogSection = 'categories' | 'product-types' | 'brands';

	const currentSection = $derived(($adminNav.tab === 'catalog'
		? $adminNav.section
		: 'categories') as CatalogSection);

	let addFn: (() => void) | null = $state(null);
	let deleteFn: (() => void) | null = $state(null);
	let clearFn: (() => void) | null = $state(null);
	let selectedCount = $state(0);

	function setSection(s: CatalogSection) {
		selectedCount = 0;
		deleteFn = null;
		clearFn = null;
		adminNav.navigate({ tab: 'catalog', section: s });
	}

	const pills: { id: CatalogSection; label: string }[] = [
		{ id: 'categories',    label: 'Categories' },
		{ id: 'product-types', label: 'Product Types' },
		{ id: 'brands',        label: 'Brands' },
	];

	const addLabels: Record<CatalogSection, string> = {
		'categories': '+ Add Category',
		'product-types': '+ Add Product Type',
		'brands': '+ Add Brand',
	};
</script>

<div class="flex flex-col gap-0">
	<div class="border-b border-subtle bg-neutral shrink-0 px-6 py-2">
		<div class="flex items-center gap-3">
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
			<div class="ml-auto flex items-center gap-2">
				{#if selectedCount > 0}
					<span class="text-primary text-[13px] font-semibold">{selectedCount} selected</span>
					<button
						class="font-inter border-danger text-danger hover:bg-danger cursor-pointer rounded-md border bg-transparent px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-white inline-flex items-center gap-1"
						onclick={() => deleteFn?.()}
					>
						<span class="icon-[lucide--trash-2] h-3.5 w-3.5"></span>
						Delete
					</button>
					<button
						class="font-inter border-subtle text-copy hover:bg-surface cursor-pointer rounded-md border bg-transparent px-3 py-1.5 text-[13px] font-medium transition-colors"
						onclick={() => clearFn?.()}
					>
						Clear
					</button>
				{:else}
					<button
						class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
						onclick={() => addFn?.()}
					>
						{addLabels[currentSection]}
					</button>
				{/if}
			</div>
		</div>
	</div>
	<div class="flex-1 overflow-y-auto">
		{#if currentSection === 'categories'}
			<CategoriesSection
				onadd={(fn) => { addFn = fn; }}
				bind:selectedCount
				bind:bulkDelete={deleteFn}
				bind:clearSelection={clearFn}
			/>
		{:else if currentSection === 'product-types'}
			<ProductTypesSection
				onadd={(fn) => { addFn = fn; }}
				bind:selectedCount
				bind:bulkDelete={deleteFn}
				bind:clearSelection={clearFn}
			/>
		{:else if currentSection === 'brands'}
			<BrandsSection
				onadd={(fn) => { addFn = fn; }}
				bind:selectedCount
				bind:bulkDelete={deleteFn}
				bind:clearSelection={clearFn}
			/>
		{/if}
	</div>
</div>
