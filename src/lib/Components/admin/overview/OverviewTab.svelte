<script lang="ts">
	import { onMount } from 'svelte';

	type CategoryCount  = { categorySlug: string; count: number };
	type TypeCount      = { productType: string;  count: number };
	type StoreRow       = { id: string; storeName: string; address: string; city: string };

	type OverviewData = {
		perCategory:   CategoryCount[];
		perType:       TypeCount[];
		published:     number;
		unpublished:   number;
		outOfStock:    number;
		recentlyAdded: number;
		locations: {
			count:  number;
			stores: StoreRow[];
		};
	};

	let data: OverviewData | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/overview');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			data = await res.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load overview';
		} finally {
			loading = false;
		}
	});

	function fmt(slug: string): string {
		return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	}

	function display(n: number | undefined): string {
		if (loading || n === undefined) return '—';
		return n.toLocaleString();
	}
</script>

<div class="flex flex-col gap-6">
	<header class="flex flex-col gap-0.5">
		<h1 class="text-[1.25rem] font-bold text-[#1a1a1a] tracking-[-0.02em] m-0">Overview</h1>
		<p class="text-[0.8125rem] text-copy-light m-0">Live snapshot · refreshes on tab mount</p>
	</header>

	{#if error}
		<div class="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] text-danger rounded-lg px-3.5 py-2.5 text-[0.8125rem] font-medium">
			<span class="icon-[lucide--circle-alert] w-4 h-4"></span>
			{error}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-4">
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Published</span>
			<span class="text-[2.25rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-[#1a1a1a] text-[#16a34a]">{display(data?.published)}</span>
			<span class="card-hint">products live on storefront</span>
		</div>
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Unpublished</span>
			<span class="text-[2.25rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-[#1a1a1a] text-[#d97706]">{display(data?.unpublished)}</span>
			<span class="card-hint">drafts not yet visible</span>
		</div>
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Out of Stock</span>
			<span class="text-[2.25rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-danger">{display(data?.outOfStock)}</span>
			<span class="card-hint">products with no stock</span>
		</div>
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Added This Week</span>
			<span class="text-[2.25rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-primary">{display(data?.recentlyAdded)}</span>
			<span class="card-hint">products added in last 7 days</span>
		</div>
	</div>

	<div class="grid grid-cols-3 gap-4 lower-grid">
		<div class="card card--list" class:shimmer={loading}>
			<span class="card-label">By Category</span>
			{#if data?.perCategory.length}
				<ul class="breakdown-list">
					{#each data.perCategory as row}
						<li class="flex items-center justify-between text-[0.8125rem]">
							<span class="text-copy">{fmt(row.categorySlug)}</span>
							<span class="font-bold text-[#1a1a1a] bg-surface rounded px-1.75 py-[1px] text-[0.75rem]">{row.count}</span>
						</li>
					{/each}
				</ul>
			{:else if !loading}
				<span class="text-[0.8125rem] text-copy-light mt-2 italic">No products yet</span>
			{/if}
		</div>

		<div class="card card--list" class:shimmer={loading}>
			<span class="card-label">By Product Type</span>
			{#if data?.perType.length}
				<ul class="breakdown-list">
					{#each data.perType as row}
						<li class="flex items-center justify-between text-[0.8125rem]">
							<span class="text-copy">{fmt(row.productType)}</span>
							<span class="font-bold text-[#1a1a1a] bg-surface rounded px-1.75 py-[1px] text-[0.75rem]">{row.count}</span>
						</li>
					{/each}
				</ul>
			{:else if !loading}
				<span class="text-[0.8125rem] text-copy-light mt-2 italic">No products yet</span>
			{/if}
		</div>

		<div class="card card--list card--locations" class:shimmer={loading}>
			<div class="flex items-center justify-between">
				<span class="card-label">Locations</span>
				{#if data}
					<span class="text-[0.75rem] font-bold bg-primary text-white rounded-full px-2 leading-relaxed">{data.locations.count}</span>
				{/if}
			</div>

			{#if data?.locations.stores.length}
				<ul class="flex flex-col gap-2 list-none m-0 p-0">
					{#each data.locations.stores as store}
						<li class="flex items-start gap-2">
							<span class="shrink-0 mt-0.5 text-copy-light">
								<span class="icon-[lucide--map-pin] w-3.5 h-3.5"></span>
							</span>
							<span class="flex flex-col gap-[1px]">
								<span class="text-[0.8125rem] font-semibold text-[#1a1a1a]">{store.storeName}</span>
								<span class="text-[0.75rem] text-copy-light">{store.address}, {store.city}</span>
							</span>
						</li>
					{/each}
				</ul>
			{:else if !loading}
				<span class="text-[0.8125rem] text-copy-light mt-2 italic">No locations added</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.card {
		background: #fff;
		border: 1px solid var(--color-subtle);
		border-radius: 10px;
		padding: 18px 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		transition: box-shadow 0.15s;
	}
	.card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

	.card-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-copy-light);
	}

	.card-hint {
		font-size: 0.75rem;
		color: var(--color-copy-light);
		margin-top: 2px;
	}

	.card--list { gap: 10px; }

	.breakdown-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	@keyframes shimmer {
		0%   { background-position: -400px 0; }
		100% { background-position: 400px 0; }
	}

	.shimmer {
		background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%);
		background-size: 800px 100%;
		animation: shimmer 1.4s infinite linear;
		border-color: transparent;
		pointer-events: none;
	}
	.shimmer * { visibility: hidden; }

	@media (max-width: 1023px) {
		.lower-grid { grid-template-columns: repeat(2, 1fr); }
		.card--locations { grid-column: 1 / -1; }
	}

	@media (max-width: 767px) {
		.lower-grid { grid-template-columns: 1fr; }
		.card--locations { grid-column: unset; }
		:global(.text-\[2\.25rem\]) { font-size: 1.875rem !important; }
	}
</style>
