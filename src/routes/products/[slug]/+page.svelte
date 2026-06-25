<script lang="ts">
	import FilterPanel from '$lib/Components/FilterPanel.svelte';
	import ProductGrid from '$lib/Components/ProductGrid.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	const base = env.PUBLIC_ASSET_BASE_URL || '';

	function img(path: string) {
		return `${base}/${path}`;
	}
	let { data } = $props();

	// ─── 1. Constants ─────────────────────────────────────────────────────────
	const PAGE_SIZE: number = data.pageSize;

	const SORT_OPTIONS = [
		{ value: 'newest', label: 'Newest' },
		{ value: 'oldest', label: 'Oldest' },
		{ value: 'price-low', label: 'Price: Low to High' },
		{ value: 'price-high', label: 'Price: High to Low' }
	];

	// ─── 2. Derived metadata ──────────────────────────────────────────────────
	const banner = $derived(data.meta);
	const slug = $derived(data.slug);

	// ─── 3. Core state ────────────────────────────────────────────────────────
	let items = $state<any[]>([]);
	let totalCount = $state(0);
	let isPageChanging = $state(false);
	let filterOpen = $state(false);
	let initialLoading = $state(true);

	// Concurrency guard — plain let, not $state (synchronous, no Svelte batching)
	let loadingLock = false;

	// Cursor — plain let (don't drive UI)
	let lastPrimary: string | number | null = null;
	let lastId: string | null = null;

	// ─── 4. Derived pagination ────────────────────────────────────────────────
	let currentPage = $derived(Number(page.url.searchParams.get('page')) || 1);
	let currentSort = $derived(page.url.searchParams.get('sort') || 'newest');
	let totalPages = $derived(totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0);

	let expectedOnPage = $derived(
		totalCount > 0 ? Math.min(PAGE_SIZE, totalCount - (currentPage - 1) * PAGE_SIZE) : 0 // 0 until totalCount known — grid shows nothing vs wrong skeleton count
	);

	let hasMoreInPage = $derived(totalCount > 0 && items.length < expectedOnPage);
	let paginationReady = $derived(!isPageChanging && totalCount > 0);

	// Active filter count — read from URL (source of truth)
	let activeFilterCount = $derived(
		page.url.searchParams.getAll('brand').length +
			page.url.searchParams.getAll('badge').length +
			page.url.searchParams.getAll('stock').length +
			(page.url.searchParams.has('minPrice') || page.url.searchParams.has('maxPrice') ? 1 : 0)
	);

	// ─── 5. Cursor helper ─────────────────────────────────────────────────────
	function updateCursor(lastItem: any) {
		lastId = lastItem.id;
		lastPrimary = currentSort.startsWith('price')
			? Number(lastItem.price)
			: new Date(lastItem.createdAt).toISOString();
	}

	// ─── 6. Lazy load ─────────────────────────────────────────────────────────
	// Accepts explicit currentItems + currentExpected to avoid stale $state reads
	// when called immediately from the data sync .then() before Svelte commits.
	async function loadMore(currentItems: any[] = items, currentExpected: number = expectedOnPage) {
		if (loadingLock) return;
		loadingLock = true;

		try {
			while (true) {
				const remaining = currentExpected - currentItems.length;
				if (remaining <= 0) break;

				const chunkSize = Math.min(6, remaining);
				const sort = page.url.searchParams.get('sort') || 'newest';

				const params = new URLSearchParams({ slug, limit: String(chunkSize), sort });
				if (lastPrimary !== null && lastId !== null) {
					params.set('lastPrimary', String(lastPrimary));
					params.set('lastId', lastId);
				}
				page.url.searchParams.getAll('brand').forEach((b) => params.append('brand', b));
				page.url.searchParams.getAll('badge').forEach((b) => params.append('badge', b));
				page.url.searchParams.getAll('stock').forEach((s) => params.append('stock', s));
				const minP = page.url.searchParams.get('minPrice');
				const maxP = page.url.searchParams.get('maxPrice');
				if (minP) params.set('minPrice', minP);
				if (maxP) params.set('maxPrice', maxP);

				const res = await fetch(`/api/products?${params.toString()}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const newProducts = await res.json();
				if (!Array.isArray(newProducts) || newProducts.length === 0) break;

				const existingIds = new Set(items.map((i: any) => i.id));
				const filtered = newProducts.filter((p: any) => !existingIds.has(p.id));
				if (filtered.length === 0) break;

				items = [...items, ...filtered];
				updateCursor(filtered[filtered.length - 1]);

				// Update currentItems for next iteration
				currentItems = items;

				// Small yield to let Svelte commit the state update and render
				// the new cards before fetching the next chunk
				await new Promise((r) => setTimeout(r, 50));
			}
		} catch (err) {
			console.error('[loadMore] fetch error:', err);
		} finally {
			loadingLock = false;
		}
	}

	// ─── 7. Data sync ─────────────────────────────────────────────────────────
	$effect(() => {
		const streamed = data.streamed;
		Promise.all([streamed.products, streamed.totalItems]).then(
			([streamedProducts, streamedCount]: [any[], number]) => {
				items = streamedProducts;
				totalCount = streamedCount;
				initialLoading = false;
				isPageChanging = false;

				if (streamedProducts.length > 0) {
					updateCursor(streamedProducts[streamedProducts.length - 1]);
				} else {
					lastPrimary = null;
					lastId = null;
				}

				// Kick off next chunk immediately if initial chunk didn't fill page.
				// Pass values explicitly — $state may not be committed yet at this point.
				const expected = Math.min(PAGE_SIZE, streamedCount - (currentPage - 1) * PAGE_SIZE);
				if (streamedCount > streamedProducts.length && expected > streamedProducts.length) {
					loadMore(streamedProducts, expected);
				}
			}
		);
	});

	// ─── 8. Sort change ───────────────────────────────────────────────────────
	function onSortChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('sort', val);
		newUrl.searchParams.set('page', '1');
		lastPrimary = null;
		lastId = null;
		isPageChanging = true; // shows overlay on existing items — no flash to empty
		goto(newUrl.href, { noScroll: true });
	}
	// ─── 9. Page navigation ───────────────────────────────────────────────────
	function changePage(delta: number) {
		const targetPage = currentPage + delta;
		if (targetPage < 1 || targetPage > totalPages) return;

		const newUrl = new URL(page.url);
		newUrl.searchParams.set('page', targetPage.toString());

		isPageChanging = true;
		lastPrimary = null;
		lastId = null;

		goto(newUrl.href, { noScroll: false, keepFocus: true });
	}

	function onFilterApply() {
		isPageChanging = true;
		lastPrimary = null;
		lastId = null;
	}
</script>

<!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
<section class="hero bg-surface flex w-full min-w-80 flex-col pt-2 sm:flex-row md:p-0">
	<div
		class="hero-left z-10 flex h-[30%] w-full flex-col items-center justify-center p-2 sm:h-full sm:w-[40%] sm:items-baseline sm:pb-4 sm:pl-6 md:p-8 md:pl-[8%]"
	>
		<h1
			class="mb-4 pb-1 text-center text-2xl font-bold tracking-widest sm:mb-4 sm:pt-0 sm:text-left sm:text-3xl md:mb-6 md:pr-24 md:text-5xl"
		>
			{banner?.bannerMsg}
		</h1>
		<a
			class="text-link flex items-center text-base tracking-wide sm:text-left md:text-xl"
			href={'#' + slug}
		>
			<p class="text-sm hover:underline sm:text-base">Find Your {banner?.name} today</p>
			<span class="icon-[cil--arrow-right] ml-2 h-9 w-4 md:h-6 md:w-6"></span>
		</a>
	</div>
	<div
		class="hero-right z-20 flex h-[70%] w-full justify-center sm:h-full sm:w-[60%] sm:pr-6 md:justify-end md:pr-[8%]"
	>
		<div
			class="hero-img flex items-center justify-center p-3 sm:items-center sm:pb-10 md:justify-end md:p-0"
		>
			{#if banner?.bannerPath}
				<img
					class="w-[500px] object-contain md:w-[650px]"
					src={img(banner.bannerPath)}
					alt={banner.name}
				/>
			{/if}
		</div>
	</div>
</section>

<!-- ─── Filter / Sort bar ─────────────────────────────────────────────────── -->
{#if items.length < 0 && !initialLoading}
	<p>No products found.</p>
{:else}
	<div
		class="border-subtle bg-neutral h-nav sticky top-0 z-110 flex w-full flex-col items-center justify-center border-y"
	>
		<div class="bar-inner mx-auto w-[90%] md:w-[85%]">
			<!-- Left: filter toggle button -->
			<button
				class="filter-btn"
				class:active={filterOpen}
				onclick={() => (filterOpen = !filterOpen)}
				aria-expanded={filterOpen}
				aria-label="Toggle filters"
			>
				<span class="icon-[ri--equalizer-line]"></span>
				<span>Filters</span>
				{#if activeFilterCount > 0}
					<span class="badge">{activeFilterCount}</span>
				{/if}
			</button>

			<!-- Right: sort dropdown -->
			<div class="sort-wrap">
				<label for="sort-select" class="sr-only">Sort by</label>
				<select id="sort-select" class="sort-select" value={currentSort} onchange={onSortChange}>
					{#each SORT_OPTIONS as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- ─── Main content: filter panel + product grid ────────────────────────── -->

	<div class="content-row mx-auto mb-12 flex w-full items-start md:w-[85%]">
		<!-- FilterPanel handles its own desktop sidebar + mobile drawer -->
		<FilterPanel bind:isOpen={filterOpen} {slug} onapply={onFilterApply} />

		<!-- Product grid area -->
		<div class="grid-area">
			{#await Promise.all([data.streamed.products, data.streamed.totalItems])}
				<!-- Initial skeleton while streaming resolves -->
				<div class="grid {filterOpen ? 'md:h-100' : 'md:h-130'} grid-cols-2 md:grid-cols-3">
					{#each Array(6) as _}
						<div
							aria-roledescription="skeleton"
							class="border-subtle {filterOpen ? 'md:h-100' : 'md:h-130'} border-r border-b"
						></div>
					{/each}
				</div>
			{:then}
				<ProductGrid {filterOpen} {items} {expectedOnPage} {isPageChanging} onloadmore={loadMore} />
			{/await}
		</div>
	</div>

	<!-- ─── Footer / Pagination ───────────────────────────────────────────────── -->
	<!-- {#if items.length > 0} -->
	<footer
		class="border-subtle mx-auto mb-20 flex w-[90%] flex-col items-center justify-between md:w-[85%] md:flex-row"
	>
		<p class="text-copy-light mb-4 text-sm md:mb-0">
			{#if totalCount > 0}
				Showing {items.length} of {expectedOnPage} items
			{/if}
		</p>

		<div class="flex items-center gap-4">
			<button
				aria-label="Previous page"
				onclick={() => changePage(-1)}
				disabled={currentPage === 1 || !paginationReady}
				class="border-subtle hover:bg-surface-variant flex h-10 w-10 items-center justify-center rounded-full border transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
			>
				<span class="icon-[ri--arrow-left-s-line]"></span>
			</button>

			<span class="text-sm font-medium tabular-nums">
				Page <strong>{currentPage}</strong> of {totalPages || 1}
			</span>

			<button
				aria-label="Next page"
				onclick={() => changePage(1)}
				disabled={currentPage >= totalPages || !paginationReady}
				class="border-subtle hover:bg-surface-variant flex h-10 w-10 items-center justify-center rounded-full border transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
			>
				<span class="icon-[ri--arrow-right-s-line]"></span>
			</button>
		</div>
	</footer>
{/if}

<style>
	/* ── Hero ── */
	.hero {
		height: 75vh;
	}
	.hero-right {
		background: var(--background-image-fade-v);
	}
	.hero-img {
		height: 100%;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.hero {
			height: 50vh;
		}
		.hero-right {
			background: var(--background-image-fade-h);
		}
	}
	@media (min-width: 768px) {
		.hero {
			height: 60vh;
			max-height: 422px;
		}
		.hero-img {
			width: 722px;
			height: 100%;
		}
	}

	/* ── Filter/sort bar ── */
	.bar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	/* Filter button */
	.filter-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-copy);
		background: none;
		border: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.12));
		border-radius: 0.5rem;
		padding: 0.375rem 0.75rem;
		cursor: pointer;
		position: relative;
		transition:
			background 0.15s,
			border-color 0.15s;
		white-space: nowrap;
	}
	.filter-btn:hover,
	.filter-btn.active {
		background: var(--color-surface-variant, rgba(0, 0, 0, 0.05));
		border-color: var(--color-copy-light);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1.125rem;
		border-radius: 9999px;
		background: var(--color-link);
		color: #fff;
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0 0.25rem;
	}

	/* Sort select */
	.sort-wrap {
		display: flex;
		align-items: center;
	}

	.sort-select {
		font-size: 0.875rem;
		color: var(--color-copy);
		background: transparent;
		border: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.12));
		border-radius: 0.5rem;
		padding: 0.375rem 0.625rem;
		cursor: pointer;
		outline: none;
		appearance: auto;
	}
	.sort-select:focus {
		border-color: var(--color-link);
	}

	.grid-area {
		flex: 1;
		min-width: 0; /* prevent grid from overflowing flex parent */
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (min-width: 768px) {
		.grid > [aria-roledescription='skeleton']:nth-child(3n + 1) {
			border-left: 1px solid var(--color-subtle);
		}
	}
</style>
