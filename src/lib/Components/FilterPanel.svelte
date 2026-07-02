<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { findClosestColor, sortByClosest } from '$lib/utils/color';

	interface Props {
		isOpen: boolean;
		slug: string;
		onclose?: () => void;
		onapply?: () => void;
	}

	let { isOpen = $bindable(false), slug, onclose, onapply }: Props = $props();

	type FilterOption = { slug: string; name: string };
	type BadgeOption = { value: string; label: string };
	type StockOption = { value: string; label: string; count: number };
	type ColorOption = { hex: string };

	let brandOptions: FilterOption[] = $state([]);
	let categoryOptions: FilterOption[] = $state([]);
	let typeOptions: { slug: string; name: string; categorySlug: string }[] = $state([]);
	let badgeOptions: BadgeOption[] = $state([]);
	let stockOptions: StockOption[] = $state([]);
	let colorOptions: ColorOption[] = $state([]);
	let context: 'category' | 'type' | null = $state(null);
	let loading = $state(true);

	let selectedBrands = $state<string[]>([]);
	let selectedCategories = $state<string[]>([]);
	let selectedTypes = $state<string[]>([]);
	let selectedBadges = $state<string[]>([]);
	let selectedStock = $state<string[]>([]);
	let selectedColors = $state<string[]>([]);
	let colorPickerHex = $state('#000000');
	let priceMin = $state(0);
	let priceMax = $state(200000);

	let activeGroup = $state('brand');

	const PRICE_MIN = 0;
	const PRICE_MAX = 200000;

	type FilterGroup = {
		id: string;
		label: string;
		options: { value: string; label: string }[];
		selected: string[];
	};

	const groups: FilterGroup[] = $derived.by(() => {
		const g: FilterGroup[] = [];
		g.push({
			id: 'brand', label: 'Brand',
			options: brandOptions.map((b) => ({ value: b.slug, label: b.name })),
			selected: selectedBrands,
		});
		if (context !== 'category' && context !== 'type') {
			g.push({
				id: 'category', label: 'Category',
				options: categoryOptions.map((c) => ({ value: c.slug, label: c.name })),
				selected: selectedCategories,
			});
		}
		if (context !== 'type') {
			g.push({
				id: 'type', label: 'Product Type',
				options: typeOptions.map((t) => ({ value: t.slug, label: t.name })),
				selected: selectedTypes,
			});
		}
		g.push({
			id: 'color', label: 'Color',
			options: colorOptions.map((c) => ({ value: c.hex, label: c.hex })),
			selected: selectedColors,
		});
		g.push({
			id: 'badge', label: 'Badge',
			options: badgeOptions.map((b) => ({ value: b.value, label: b.label })),
			selected: selectedBadges,
		});
		g.push({
			id: 'stock', label: 'Availability',
			options: stockOptions.map((s) => ({ value: s.value, label: s.label })),
			selected: selectedStock,
		});
		return g;
	});

	const currentGroup = $derived(groups.find((g) => g.id === activeGroup));

	const totalSelected = $derived(
		selectedBrands.length + selectedCategories.length + selectedTypes.length +
		selectedBadges.length + selectedStock.length + selectedColors.length +
		(priceMin > PRICE_MIN || priceMax < PRICE_MAX ? 1 : 0)
	);

	const sortedColors = $derived(
		sortByClosest(colorPickerHex, colorOptions.map((c) => ({ hex: c.hex, name: c.hex })))
	);

	onMount(async () => {
		try {
			const params = new URLSearchParams();
			if (slug) params.set('slug', slug);
			const res = await fetch(`/api/filters?${params}`);
			if (res.ok) {
				const d = await res.json();
				context = d.context;
				brandOptions = d.brands ?? [];
				categoryOptions = d.categories ?? [];
				typeOptions = d.productTypes ?? [];
				badgeOptions = d.badgeTags ?? [];
				stockOptions = d.stockOptions ?? [];
				colorOptions = d.colors ?? [];
			}
		} catch { /* ignore */ } finally {
			loading = false;
		}
	});

	$effect(() => {
		if (isOpen) {
			const p = page.url.searchParams;
			selectedBrands = p.getAll('brand');
			selectedCategories = p.getAll('category');
			selectedTypes = p.getAll('type');
			selectedBadges = p.getAll('badge');
			selectedStock = p.getAll('stock');
			selectedColors = p.getAll('color');
			priceMin = Number(p.get('minPrice') ?? PRICE_MIN);
			priceMax = Number(p.get('maxPrice') ?? PRICE_MAX);
		}
	});

	function toggle(arr: string[], value: string): string[] {
		return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
	}

	function toggleValue(value: string) {
		const g = activeGroup;
		if (g === 'brand') selectedBrands = toggle(selectedBrands, value);
		else if (g === 'category') {
			selectedCategories = toggle(selectedCategories, value);
			if (selectedTypes.length) {
				const valid = typeOptions
					.filter((t) => !selectedCategories.length || selectedCategories.includes(t.categorySlug))
					.map((t) => t.slug);
				selectedTypes = selectedTypes.filter((t) => valid.includes(t));
			}
		}
		else if (g === 'type') selectedTypes = toggle(selectedTypes, value);
		else if (g === 'color') selectedColors = toggle(selectedColors, value);
		else if (g === 'badge') selectedBadges = toggle(selectedBadges, value);
		else if (g === 'stock') selectedStock = toggle(selectedStock, value);
	}

	function reset() {
		selectedBrands = [];
		selectedCategories = [];
		selectedTypes = [];
		selectedBadges = [];
		selectedStock = [];
		selectedColors = [];
		priceMin = PRICE_MIN;
		priceMax = PRICE_MAX;
	}

	function apply() {
		const newUrl = new URL(page.url);
		['brand', 'category', 'type', 'badge', 'stock', 'color', 'minPrice', 'maxPrice', 'page'].forEach((k) =>
			newUrl.searchParams.delete(k)
		);
		selectedBrands.forEach((b) => newUrl.searchParams.append('brand', b));
		selectedCategories.forEach((c) => newUrl.searchParams.append('category', c));
		selectedTypes.forEach((t) => newUrl.searchParams.append('type', t));
		selectedBadges.forEach((b) => newUrl.searchParams.append('badge', b));
		selectedStock.forEach((s) => newUrl.searchParams.append('stock', s));
		selectedColors.forEach((c) => newUrl.searchParams.append('color', c));
		if (priceMin > PRICE_MIN) newUrl.searchParams.set('minPrice', String(priceMin));
		if (priceMax < PRICE_MAX) newUrl.searchParams.set('maxPrice', String(priceMax));
		newUrl.searchParams.set('page', '1');
		goto(newUrl.href, { noScroll: true });
		onapply?.();
		isOpen = false;
		onclose?.();
	}

	function cancel() {
		isOpen = false;
		onclose?.();
	}

	function fmt(n: number) {
		return '₹' + n.toLocaleString('en-IN');
	}

	function onColorPickerInput(e: Event) {
		colorPickerHex = (e.target as HTMLInputElement).value;
	}

	function addClosestColor() {
		const closest = findClosestColor(colorPickerHex, colorOptions.map((c) => ({ hex: c.hex, name: c.hex })));
		if (closest && !selectedColors.includes(closest.hex)) {
			selectedColors = [...selectedColors, closest.hex];
		}
	}
</script>

<!-- ─── Desktop sidebar ───────────────────────────────────────────────────── -->
<aside
	class="hidden md:flex flex-col h-[90vh] {isOpen ? 'w-[360px] border-l border-b border-subtle' : 'w-0'} overflow-hidden transition-[width] duration-300 ease-in-out shrink-0 sticky top-nav"
	aria-hidden={!isOpen}
>
	<div class="flex flex-col h-full min-h-0">
		<!-- Header -->
		<div class="flex items-center justify-between shrink-0 p-4">
			<h3 class="text-[13px] font-bold text-gray-900 m-0">Filters</h3>
			{#if totalSelected > 0}
				<button class="text-[12px] text-copy-light hover:text-copy bg-transparent border-none cursor-pointer underline p-0" onclick={reset}>
					Clear all ({totalSelected})
				</button>
			{:else}
				<button class="text-[12px] text-copy-light hover:text-copy bg-transparent border-none cursor-pointer underline p-0" onclick={reset}>
					Reset
				</button>
			{/if}
		</div>

		<!-- Scrollable body -->
		<div class="flex-1 min-h-0 overflow-y-auto border-y border-subtle">
			{#if loading}
				<div class="flex flex-col gap-3">
					{#each Array(4) as _}
						<div class="h-8 rounded-lg shimmer"></div>
					{/each}
				</div>
			{:else}
				{@render filterBody()}
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex gap-2.5 shrink-0 p-4">
			<button class="flex-1 font-inter text-[13px] font-medium py-[7px] rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={reset}>Clear All</button>
			<button class="flex-1 font-inter text-[13px] font-semibold py-[7px] rounded-[7px] border-none bg-primary text-white cursor-pointer transition-colors hover:opacity-90" onclick={apply}>Apply</button>
		</div>
	</div>
</aside>

<!-- ─── Mobile overlay + drawer ───────────────────────────────────────────── -->
{#if isOpen}
	<button class="fixed inset-0 bg-black/45 z-[120] animate-[fadeIn_0.2s_ease] md:hidden" onclick={cancel} aria-label="Close filters"></button>

	<div class="fixed left-0 right-0 bottom-0 h-[75dvh] bg-surface rounded-t-[1.25rem] overflow-hidden z-[120] flex flex-col animate-[slideUp_0.28s_cubic-bezier(0.4,0,0.2,1)] md:hidden" role="dialog" aria-modal="true" aria-label="Filter panel">
		<div class="w-10 h-1 rounded-full bg-subtle mx-auto mt-3 shrink-0"></div>

		<div class="flex items-center justify-between px-5 pt-3 pb-3 border-b border-subtle shrink-0">
			<span class="text-[13px] font-bold tracking-[0.08em] uppercase text-copy">Filters</span>
			{#if totalSelected > 0}
				<button class="text-[12px] text-copy-light hover:text-copy bg-transparent border-none cursor-pointer underline p-0" onclick={reset}>Clear ({totalSelected})</button>
			{/if}
			<button class="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer text-copy p-1" onclick={cancel} aria-label="Close">
				<span class="icon-[lucide--x] h-5 w-5"></span>
			</button>
		</div>

		<div class="flex-1 overflow-y-auto min-h-0 flex flex-col">
			{#if loading}
				<div class="flex flex-col gap-3 p-4 md:p-5">
					{#each Array(4) as _}
						<div class="h-8 rounded-lg shimmer"></div>
					{/each}
				</div>
			{:else}
				{@render filterBody()}
			{/if}
		</div>

		<div class="flex gap-3 px-5 py-3 border-t border-subtle shrink-0">
			<button class="flex-1 py-[10px] px-4 border border-subtle bg-transparent rounded-[0.5rem] text-[14px] font-semibold cursor-pointer text-copy" onclick={reset}>Reset</button>
			<button class="flex-[2] py-[10px] px-4 border-none bg-primary rounded-[0.5rem] text-[14px] font-semibold cursor-pointer text-white" onclick={apply}>Apply</button>
		</div>
	</div>
{/if}

<!-- ─── Shared filter body ────────────────────────────────────────────────── -->
{#snippet filterBody()}
	<!-- Two-column layout -->
	<div class="flex flex-col md:flex-row min-h-0 h-full">
		<!-- Left: group tabs -->
		<div class="w-full md:w-[110px] md:shrink-0 md:border-r md:border-subtle flex md:flex-col overflow-x-auto md:overflow-x-hidden overflow-y-hidden shrink-0 border-b border-subtle md:border-b-0">
			{#each groups as group}
				{@const count = group.selected.length}
				<button
					class="w-full text-left px-3 py-2 text-[12px] font-medium border-none cursor-pointer transition-colors whitespace-nowrap md:px-3 md:py-2.5 md:text-[13px] md:border-l-[3px] border-l-transparent {activeGroup === group.id ? 'bg-primary/10 text-primary md:border-l-primary border-b-2 md:border-b-0 border-b-primary' : 'bg-transparent text-copy hover:bg-surface md:border-l-transparent'}"
					onclick={() => (activeGroup = group.id)}
				>
					{group.label}
					{#if count > 0}
						<span class="ml-auto md:ml-0 text-[11px] font-bold bg-primary text-white rounded-full w-4 h-4 inline-flex items-center justify-center md:inline">{count}</span>
					{/if}
				</button>
			{/each}
			<!-- Price tab -->
			<button
				class="w-full text-left px-3 py-2 text-[12px] font-medium border-none cursor-pointer transition-colors whitespace-nowrap md:px-3 md:py-2.5 md:text-[13px] md:border-l-[3px] border-l-transparent {activeGroup === 'price' ? 'bg-primary/10 text-primary md:border-l-primary border-b-2 md:border-b-0 border-b-primary' : 'bg-transparent text-copy hover:bg-surface md:border-l-transparent'}"
				onclick={() => (activeGroup = 'price')}
			>
				Price
				{#if priceMin > PRICE_MIN || priceMax < PRICE_MAX}
					<span class="ml-auto md:ml-0 text-[11px] font-bold bg-primary text-white rounded-full w-4 h-4 inline-flex items-center justify-center md:inline">1</span>
				{/if}
			</button>
		</div>

		<!-- Right: values -->
		<div class="flex-1 min-w-0 flex flex-col overflow-hidden">
			<div class="px-4 py-3 border-b border-subtle shrink-0 flex items-center justify-between">
				<h4 class="text-xs font-semibold text-copy uppercase tracking-[0.04em] m-0">
					{#if activeGroup === 'price'}Price Range{:else}{currentGroup?.label ?? ''}{/if}
				</h4>
				{#if activeGroup === 'price'}
					{#if priceMin > PRICE_MIN || priceMax < PRICE_MAX}
						<span class="text-[11px] text-primary font-medium">{fmt(priceMin)} – {fmt(priceMax)}</span>
					{/if}
				{:else if currentGroup?.selected.length}
					<span class="text-[11px] text-primary font-medium">{currentGroup.selected.length} selected</span>
				{/if}
			</div>

			<div class="flex-1 overflow-y-auto min-h-0 px-4 py-3">
				{#if activeGroup === 'price'}
					<div class="flex flex-col gap-3">
						<div class="flex justify-between text-[13px] text-copy-light">
							<span>{fmt(priceMin)}</span>
							<span>{fmt(priceMax)}</span>
						</div>
						<input type="range" min={PRICE_MIN} max={PRICE_MAX} step={1000} bind:value={priceMin} oninput={() => { if (priceMin > priceMax - 1000) priceMin = priceMax - 1000; }} class="w-full accent-primary cursor-pointer" />
						<input type="range" min={PRICE_MIN} max={PRICE_MAX} step={1000} bind:value={priceMax} oninput={() => { if (priceMax < priceMin + 1000) priceMax = priceMin + 1000; }} class="w-full accent-primary cursor-pointer" />
					</div>

				{:else if activeGroup === 'color'}
					<!-- Color picker -->
					<div class="pb-3 mb-3 border-b border-subtle">
						<p class="text-[11px] font-semibold text-copy-light uppercase tracking-[0.04em] m-0 mb-1.5">Pick a color</p>
						<div class="flex items-center gap-2">
							<input type="color" value={colorPickerHex} oninput={onColorPickerInput} class="w-9 h-9 rounded-lg border-2 border-subtle cursor-pointer p-0 color-input" />
							<button class="px-3 py-1.5 rounded-full border border-primary bg-transparent text-primary text-[12px] font-semibold cursor-pointer transition-colors hover:bg-primary/10" onclick={addClosestColor}>Find closest</button>
						</div>
						{#if sortedColors.length}
							<p class="text-[11px] text-copy-light m-0 mt-1.5">
								Closest: <span class="font-medium text-copy inline-flex items-center gap-1"><span class="inline-block w-3 h-3 rounded-sm border border-black/10" style="background-color: {sortedColors[0].hex}"></span>{sortedColors[0].hex}</span>
								({Math.round(sortedColors[0].distance)} away)
							</p>
						{/if}
					</div>
					<!-- Color grid -->
					<div class="grid grid-cols-[repeat(auto-fill,minmax(32px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1.5">
						{#each colorOptions as color (color.hex)}
							{@const isSelected = selectedColors.includes(color.hex)}
							<button
								class="w-9 h-9 rounded-md border-2 cursor-pointer transition-all active:scale-90 {isSelected ? 'border-primary shadow-[0_0_0_2px_var(--color-primary)]' : 'border-subtle hover:border-subtle-hover'}"
								style="background-color: {color.hex}"
								onclick={() => toggleValue(color.hex)}
								title={color.hex}
								aria-label={color.hex}
							></button>
						{/each}
						{#if colorOptions.length === 0}
							<p class="text-xs text-copy-light text-center py-6 m-0 col-span-full">No colors found</p>
						{/if}
					</div>

				{:else if currentGroup}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
						{#each currentGroup.options as opt (opt.value)}
							{@const isSelected = currentGroup.selected.includes(opt.value)}
							<button
								class="text-left px-3 py-2 rounded-lg border text-[13px] font-medium cursor-pointer transition-all truncate {isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-subtle bg-transparent text-copy hover:bg-surface hover:border-subtle-hover'}"
								onclick={() => toggleValue(opt.value)}
								title={opt.label}
							>
								{opt.label}
							</button>
						{/each}
					</div>
					{#if currentGroup.options.length === 0}
						<p class="text-xs text-copy-light text-center py-8">No options available</p>
					{/if}
				{:else}
					<p class="text-xs text-copy-light text-center py-8">Select a filter from the left</p>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes slideUp {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	.shimmer {
		background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
	}
	.color-input::-webkit-color-swatch-wrapper { padding: 2px; }
	.color-input::-webkit-color-swatch { border: none; border-radius: 0.375rem; }
</style>
