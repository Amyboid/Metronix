<script lang="ts">
	let {
		brandOptions = [],
		categoryOptions = [],
		typeOptions = [],
		selectedBrand = $bindable([]),
		selectedCategory = $bindable([]),
		selectedType = $bindable([]),
		selectedStock = $bindable([]),
		onapply,
		onclear,
	}: {
		brandOptions?: string[];
		categoryOptions?: string[];
		typeOptions?: string[];
		selectedBrand?: string[];
		selectedCategory?: string[];
		selectedType?: string[];
		selectedStock?: string[];
		onapply?: () => void;
		onclear?: () => void;
	} = $props();

	type FilterGroup = { id: string; label: string; options: string[]; selected: string[] };

	const groups: FilterGroup[] = $derived([
		{ id: 'brand',    label: 'Brand',         options: brandOptions,    selected: selectedBrand },
		{ id: 'category', label: 'Category',      options: categoryOptions, selected: selectedCategory },
		{ id: 'type',     label: 'Product Type',   options: typeOptions,     selected: selectedType },
		{ id: 'stock',    label: 'Stock Status',   options: ['in_stock', 'out_of_stock'], selected: selectedStock },
	]);

	let activeGroup = $state('brand');

	const currentGroup = $derived(groups.find(g => g.id === activeGroup));

	const totalSelected = $derived(
		selectedBrand.length + selectedCategory.length + selectedType.length + selectedStock.length
	);

	function toggleValue(value: string) {
		const group = activeGroup;
		let current: string[];
		if (group === 'brand')    current = selectedBrand;
		else if (group === 'category') current = selectedCategory;
		else if (group === 'type')     current = selectedType;
		else                           current = selectedStock;

		if (current.includes(value)) {
			current = current.filter(v => v !== value);
		} else {
			current = [...current, value];
		}

		if (group === 'brand')           selectedBrand = current;
		else if (group === 'category')   selectedCategory = current;
		else if (group === 'type')       selectedType = current;
		else                             selectedStock = current;
	}

	function formatLabel(value: string) {
		return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
	}
</script>

<div class="flex flex-col h-full">
	<!-- Header -->
	<div class="px-4 py-3 border-b border-subtle shrink-0">
		<h3 class="text-sm font-bold text-gray-900 m-0">Filters</h3>
		{#if totalSelected > 0}
			<p class="text-[11px] text-copy-light m-0 mt-0.5">{totalSelected} filter{totalSelected !== 1 ? 's' : ''} active</p>
		{/if}
	</div>

	<!-- Two-column body -->
	<div class="flex flex-1 min-h-0">
		<!-- Left: filter type list -->
		<div class="w-[130px] shrink-0 border-r border-subtle flex flex-col">
			<div class="flex-1 overflow-y-auto min-h-0">
				{#each groups as group}
					{@const count = group.selected.length}
					<button
						class="w-full text-left px-3 py-2.5 text-[13px] font-medium border-none cursor-pointer transition-colors {activeGroup === group.id ? 'bg-primary/10 text-primary border-l-[3px] border-l-primary' : 'bg-transparent text-copy border-l-[3px] border-l-transparent hover:bg-surface'}"
						onclick={() => { activeGroup = group.id; }}
					>
						{group.label}
						{#if count > 0}
							<span class="ml-auto text-[11px] font-bold bg-primary text-white rounded-full w-4 h-4 inline-flex items-center justify-center">{count}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Right: values grid -->
		<div class="flex-1 min-w-0 flex flex-col">
			<div class="px-4 py-3 border-b border-subtle shrink-0">
				<h4 class="text-xs font-semibold text-copy uppercase tracking-[0.04em] m-0">
					{currentGroup?.label ?? ''}
				</h4>
				{#if currentGroup?.selected.length}
					<p class="text-[11px] text-primary font-medium m-0 mt-0.5">{currentGroup.selected.length} selected</p>
				{/if}
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 px-4 py-3">
				{#if currentGroup}
					<div class="grid grid-cols-2 gap-2">
						{#each currentGroup.options as opt (opt)}
							{@const isSelected = currentGroup.selected.includes(opt)}
							<button
								class="text-left px-3 py-2 rounded-lg border text-[13px] font-medium cursor-pointer transition-all {isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-subtle bg-transparent text-copy hover:bg-surface hover:border-subtle-hover'}"
								onclick={() => toggleValue(opt)}
							>
								{formatLabel(opt)}
							</button>
						{/each}
					</div>
					{#if currentGroup.options.length === 0}
						<p class="text-xs text-copy-light text-center py-8">No options available</p>
					{/if}
				{:else}
					<p class="text-xs text-copy-light text-center py-8">Select a filter type from the left</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="flex gap-2.5 px-4 py-3 border-t border-subtle shrink-0">
		<button class="flex-1 font-inter text-[13px] font-medium py-[7px] rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={onclear}>Clear All</button>
		<button class="flex-1 font-inter text-[13px] font-semibold py-[7px] rounded-[7px] border-none bg-primary text-white cursor-pointer transition-colors hover:bg-primary-hover" onclick={onapply}>Apply</button>
	</div>
</div>
