<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import { ikUrl } from '$lib/utils/imagekit';
	import DeleteConfirmModal from '../catalog/DeleteConfirmModal.svelte';
	import FilterPanel from './FilterPanel.svelte';

	type Product = {
		id: string;
		name: string;
		slug: string;
		categorySlug: string;
		brand: string;
		price: number;
		discountPrice: number | null;
		mainImagePath: string | null;
		stockStatus: string;
		badgeTag: string | null;
		isPublished: boolean;
		createdAt: string;
	};

	let items: Product[] = $state([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(false);
	let lastId = $state('');
	let lastCreated = $state('');
	let listError = $state('');
	let ikEndpoint = $state('');

	let activeTab: 'published' | 'unpublished' = $state('published');
	let filterBrand: string[] = $state([]);
	let filterCategory: string[] = $state([]);
	let filterType: string[] = $state([]);
	let filterStock: string[] = $state([]);
	let showFilters = $state(false);

	let selectedIds: string[] = $state([]);
	let selectAll = $state(false);
	let deleteConfirming = $state(false);

	let brandOptions: string[] = $state([]);
	let categoryOptions: string[] = $state([]);
	let typeOptions: string[] = $state([]);

	function thumb(path: string | null) {
		return ikUrl(path, ikEndpoint, 'w-64,h-64,fo-auto');
	}

	function formatPrice(p: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 0
		}).format(p);
	}

	const activeFilterCount = $derived(
		filterBrand.length + filterCategory.length + filterType.length + filterStock.length
	);

	async function load(reset = true) {
		if (reset) {
			items = [];
			lastId = '';
			lastCreated = '';
			loading = true;
			selectedIds = [];
			selectAll = false;
		} else loadingMore = true;
		listError = '';

		// Preserve scroll position during append
		const scrollEl = document.querySelector('.flex-1.min-w-0.overflow-x-auto');
		const prevScrollTop = scrollEl?.scrollTop ?? 0;

		try {
			const params = new URLSearchParams();
			params.set('published', String(activeTab === 'published'));
			params.set('limit', '30');
			if (!reset && lastId && lastCreated) {
				params.set('lastId', lastId);
				params.set('lastCreated', lastCreated);
			}
			filterBrand.forEach((b) => params.append('brand', b));
			filterCategory.forEach((c) => params.append('category', c));
			filterType.forEach((t) => params.append('type', t));
			filterStock.forEach((s) => params.append('stock', s));

			const res = await fetch(`/api/admin/products?${params}`);
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			items = reset ? data.items : [...items, ...data.items];
			hasMore = data.hasMore;
			if (data.items.length) {
				const last = data.items[data.items.length - 1];
				lastId = last.id;
				lastCreated = last.createdAt;
			}
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false;
			loadingMore = false;
			// Restore scroll position after append
			if (!reset && scrollEl) {
				requestAnimationFrame(() => {
					scrollEl.scrollTop = prevScrollTop;
				});
			}
		}
	}

	async function loadFilterOptions() {
		try {
			const res = await fetch('/api/admin/catalog');
			if (res.ok) {
				const d = await res.json();
				brandOptions = (d.brands ?? []).map((b: any) => b.slug);
				categoryOptions = (d.categories ?? []).map((c: any) => c.slug);
				typeOptions = (d.productTypes ?? []).map((t: any) => t.slug);
			}
		} catch {
			/* ignore */
		}
	}

	const FILTER_KEY = 'adminProductFilters';

	function saveFilters() {
		sessionStorage.setItem(FILTER_KEY, JSON.stringify({
			activeTab, filterBrand, filterCategory, filterType, filterStock
		}));
	}

	function restoreFilters() {
		try {
			const saved = sessionStorage.getItem(FILTER_KEY);
			if (saved) {
				const f = JSON.parse(saved);
				activeTab = f.activeTab ?? 'published';
				filterBrand = f.filterBrand ?? [];
				filterCategory = f.filterCategory ?? [];
				filterType = f.filterType ?? [];
				filterStock = f.filterStock ?? [];
			}
		} catch { /* ignore */ }
	}

	onMount(async () => {
		restoreFilters();
		const auth = await fetch('/api/admin/imagekit-auth')
			.then((r) => r.json())
			.catch(() => null);
		if (auth?.urlEndpoint) ikEndpoint = auth.urlEndpoint;
		await Promise.all([load(), loadFilterOptions()]);
	});

	function switchTab(tab: 'published' | 'unpublished') {
		activeTab = tab;
		saveFilters();
		load(true);
	}

	function applyFilters() {
		saveFilters();
		load(true);
	}

	function clearAllFilters() {
		filterBrand = [];
		filterCategory = [];
		filterType = [];
		filterStock = [];
		saveFilters();
		load(true);
	}

	async function togglePublished(product: Product) {
		const oldVal = product.isPublished;
		items = items.map((p) => (p.id === product.id ? { ...p, isPublished: !p.isPublished } : p));
		try {
			const res = await fetch('/api/admin/products', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: product.id, isPublished: !oldVal })
			});
			if (!res.ok) throw new Error(await res.text());
		} catch (e: any) {
			items = items.map((p) => (p.id === product.id ? { ...p, isPublished: oldVal } : p));
			listError = e.message ?? 'Update failed';
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
		selectAll = selectedIds.length === items.length;
	}

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = [];
			selectAll = false;
		} else {
			selectedIds = items.map((i) => i.id);
			selectAll = true;
		}
	}

	async function bulkAction(action: 'publish' | 'unpublish' | 'delete') {
		if (!selectedIds.length) return;
		if (action === 'delete') {
			deleteConfirming = true;
			return;
		}
		try {
			const res = await fetch('/api/admin/products', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bulk: true, ids: selectedIds, action })
			});
			if (!res.ok) throw new Error(await res.text());
			selectedIds = [];
			selectAll = false;
			await load(true);
		} catch (e: any) {
			listError = e.message ?? 'Bulk action failed';
		}
	}

	async function confirmBulkDelete() {
		try {
			const res = await fetch('/api/admin/products', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bulk: true, ids: selectedIds, action: 'delete' })
			});
			if (!res.ok) throw new Error(await res.text());
			selectedIds = [];
			selectAll = false;
			deleteConfirming = false;
			await load(true);
		} catch (e: any) {
			listError = e.message ?? 'Delete failed';
		}
	}
</script>

<DeleteConfirmModal
	open={deleteConfirming}
	entityName="{selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''}"
	entityLabel="product"
	productCount={0}
	checking={false}
	message="Selected products and all their images will be permanently deleted."
	onconfirm={() => {
		deleteConfirming = false;
		confirmBulkDelete();
	}}
	oncancel={() => {
		deleteConfirming = false;
	}}
/>

<div class="flex min-h-0 min-w-0 flex-1 flex-col">
	<!-- Control bar (fixed at top, does not scroll) -->
	<div class="border-subtle bg-neutral shrink-0 border-b px-4 md:px-6 py-2">
		<div class="flex flex-wrap items-center gap-2 md:gap-3">
			<!-- Tab pills -->
			<div class="border-subtle bg-surface flex gap-1.5 rounded-[10px] border p-1">
				<button
					class="font-inter cursor-pointer rounded-[7px] border-none px-3 md:px-4 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors {activeTab === 'published'
						? 'bg-neutral text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
						: 'text-copy hover:bg-surface-hover bg-transparent'}"
					onclick={() => switchTab('published')}
				>
					Published ({items.length})
				</button>
				<button
					class="font-inter cursor-pointer rounded-[7px] border-none px-3 md:px-4 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors {activeTab === 'unpublished'
						? 'bg-neutral text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
						: 'text-copy hover:bg-surface-hover bg-transparent'}"
					onclick={() => switchTab('unpublished')}
				>
					Unpublished
				</button>
			</div>

			<!-- Bulk actions (visible when items selected) -->
			{#if selectedIds.length > 0}
				<div class="flex items-center gap-1.5 md:gap-2 border-l border-subtle pl-2 md:pl-3 ml-1">
					<span class="text-primary text-[12px] font-semibold hidden sm:inline">{selectedIds.length} selected</span>
					<span class="text-primary text-[12px] font-semibold sm:hidden">{selectedIds.length}</span>

					{#if activeTab === 'unpublished'}
						<button
							class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-md border bg-transparent px-2 md:px-3 py-1 md:py-1.5 text-[12px] md:text-[13px] font-medium transition-colors hover:text-white inline-flex items-center gap-1"
							onclick={() => bulkAction('publish')}
						>
							<span class="icon-[lucide--check-circle] h-3.5 w-3.5 hidden md:inline"></span>
							Publish
						</button>
					{/if}

					{#if activeTab === 'published'}
						<button
							class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-md border bg-transparent px-2 md:px-3 py-1 md:py-1.5 text-[12px] md:text-[13px] font-medium transition-colors hover:text-white inline-flex items-center gap-1"
							onclick={() => bulkAction('unpublish')}
						>
							<span class="icon-[lucide--x-circle] h-3.5 w-3.5 hidden md:inline"></span>
							Unpublish
						</button>
					{/if}

					<button
						class="font-inter border-danger text-danger hover:bg-danger cursor-pointer rounded-md border bg-transparent px-2 md:px-3 py-1 md:py-1.5 text-[12px] md:text-[13px] font-medium transition-colors hover:text-white inline-flex items-center gap-1"
						onclick={() => bulkAction('delete')}
					>
						<span class="icon-[lucide--trash-2] h-3.5 w-3.5 hidden md:inline"></span>
						Delete
					</button>

					<button
						class="font-inter border-subtle text-copy hover:bg-surface cursor-pointer rounded-md border bg-transparent px-2 md:px-3 py-1 md:py-1.5 text-[12px] md:text-[13px] font-medium transition-colors inline-flex items-center gap-1"
						onclick={() => { selectedIds = []; selectAll = false; }}
					>
						<span class="icon-[lucide--x] h-3 w-3"></span>
						Clear
					</button>
				</div>
			{/if}

			<!-- Right side: filters + add -->
			<div class="ml-auto flex items-center gap-2">
				<button
					class="font-inter border-subtle text-copy hover:bg-surface flex cursor-pointer items-center gap-1.5 rounded-md border bg-transparent px-2.5 md:px-3 py-[5px] md:py-[6px] text-[12px] md:text-[13px] font-medium transition-colors"
					onclick={() => { showFilters = !showFilters; }}
				>
					<span class="icon-[lucide--filter] h-3.5 w-3.5"></span>
					<span class="hidden sm:inline">Filters</span>
					{#if activeFilterCount > 0}
						<span class="bg-primary flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-bold text-white">{activeFilterCount}</span>
					{/if}
				</button>
				<button
					class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-2.5 md:px-3.5 py-[5px] md:py-[7px] text-[12px] md:text-[13px] font-semibold transition-colors hover:text-white inline-flex items-center gap-1"
					onclick={() => adminNav.navigate({ tab: 'products', view: 'new' })}
				>
					<span class="icon-[lucide--plus] h-3.5 w-3.5 sm:hidden"></span>
					<span class="hidden sm:inline">+ Add Product</span>
				</button>
			</div>
		</div>
	</div>

	{#if listError}
		<div
			class="text-danger rounded-lg border border-[#fca5a5] bg-[#fef2f2] px-3.5 py-2.5 text-[13px]"
		>
			{listError}
		</div>
	{/if}

	<!-- Content + filter panel row -->
	<div class="flex min-h-0 min-w-0 flex-1 gap-0">
		<!-- Product list (scrollable) -->
		<div class="min-w-0 flex-1 overflow-y-auto">
			{#if loading}
				<div class="flex flex-col">
					{#each Array(5) as _}
						<div class="shimmer h-12"></div>
					{/each}
				</div>
			{:else if items.length === 0}
				<div
					class="border-subtle text-copy-light rounded border border-dashed py-8 text-center text-sm"
				>
					No products found.
				</div>
			{:else}
				<table class="w-full min-w-[600px] border-collapse text-[13px]">
					<thead class="sticky top-0 z-20">
						<tr>
							<th class="border-subtle bg-surface z-10 w-10 border px-3 py-2"
								><input
									type="checkbox"
									class="accent-primary cursor-pointer"
									checked={selectAll}
									onchange={toggleSelectAll}
								/></th
							>
							<th
								class="border-subtle bg-surface text-copy-light z-10 w-14 border px-3 py-2 text-center text-[11px] font-bold tracking-wider uppercase"
								>Image</th
							>
							<th
								class="border-subtle bg-surface text-copy-light z-10 border px-3 py-2 text-left text-[11px] font-bold tracking-wider uppercase"
								>Name</th
							>
							<th
								class="border-subtle bg-surface text-copy-light z-10 border px-3 py-2 text-left text-[11px] font-bold tracking-wider uppercase"
								>Category</th
							>
							<th
								class="border-subtle bg-surface text-copy-light z-10 border px-3 py-2 text-right text-[11px] font-bold tracking-wider uppercase"
								>Price</th
							>
							<th
								class="border-subtle bg-surface text-copy-light z-10 border px-3 py-2 text-center text-[11px] font-bold tracking-wider uppercase"
								>Status</th
							>
						</tr>
					</thead>
					<tbody class="z-10">
						{#each items as product (product.id)}
							<tr
								class="hover:bg-surface/50 cursor-pointer transition-colors"
								onclick={(e) => {
									const target = e.target as HTMLElement;
									if (target.tagName === 'INPUT' || target.closest('button') || target.closest('label')) return;
									adminNav.navigate({ tab: 'products', view: 'update', slug: product.slug });
								}}
							>
								<td class="border-subtle w-10 border px-3 py-2"
									><input
										type="checkbox"
										class="accent-primary cursor-pointer"
										checked={selectedIds.includes(product.id)}
										onchange={() => toggleSelect(product.id)}
									/></td
								>
								<td class="border-subtle w-14 border px-3 py-2">
									<div class="border-subtle bg-canvas h-10 w-10 overflow-hidden border">
										{#if product.mainImagePath}
											<img
												class="h-full w-full object-cover"
												src={thumb(product.mainImagePath) ?? ''}
												alt={product.name}
											/>
										{:else}
											<div
												class="text-copy-light flex h-full w-full items-center justify-center text-[10px]"
											>
												—
											</div>
										{/if}
									</div>
								</td>
								<td class="border-subtle border px-3 py-2">
									<p class="m-0 truncate text-[13px] font-medium text-gray-900">{product.name}</p>
									<p class="text-copy-light m-0 text-[11px]">{product.categorySlug}</p>
								</td>
								<td class="border-subtle text-copy border px-3 py-2 text-[13px]"
									>{product.categorySlug}</td
								>
								<td class="border-subtle border px-3 py-2 text-right text-[13px]">
									{#if product.discountPrice}
										<span class="text-danger font-medium">{formatPrice(product.discountPrice)}</span
										>
										<span class="text-copy-light ml-1 text-[11px] line-through"
											>{formatPrice(product.price)}</span
										>
									{:else}
										<span class="text-copy font-medium">{formatPrice(product.price)}</span>
									{/if}
								</td>
								<td class="border-subtle border px-3 py-2 text-center">
									<button
										class="relative h-5 w-9 cursor-pointer rounded-full border-none transition-colors {product.isPublished
											? 'bg-primary'
											: 'bg-canvas'}"
										onclick={() => togglePublished(product)}
										aria-label={product.isPublished ? 'Unpublish' : 'Publish'}
									>
										<span
											class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform {product.isPublished
												? 'translate-x-4'
												: ''}"
										></span>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				{#if hasMore}
					<div class="flex justify-center py-4">
						<button
							class="font-inter border-subtle bg-surface text-copy hover:bg-canvas cursor-pointer rounded-lg border px-6 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
							onclick={() => load(false)}
							disabled={loadingMore}
						>
							{loadingMore ? 'Loading…' : 'Load more'}
						</button>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Filter panel -->
		<aside class="filter-panel" class:open={showFilters}>
			<FilterPanel
				{brandOptions}
				{categoryOptions}
				{typeOptions}
				bind:selectedBrand={filterBrand}
				bind:selectedCategory={filterCategory}
				bind:selectedType={filterType}
				bind:selectedStock={filterStock}
				onapply={applyFilters}
				onclear={clearAllFilters}
			/>
		</aside>
	</div>
</div>

<style>
	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
	.shimmer {
		background: linear-gradient(
			90deg,
			var(--color-surface) 25%,
			var(--color-canvas) 50%,
			var(--color-surface) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
	}
	.filter-panel {
		width: 0;
		min-width: 0;
		overflow: hidden;
		transition:
			width 0.25s ease,
			min-width 0.25s ease;
		flex-shrink: 0;
	}
	.filter-panel.open {
		width: 420px;
		min-width: 420px;
	}
</style>
