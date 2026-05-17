<script lang="ts">
	import { onMount } from 'svelte';

	// ── Types ────────────────────────────────────────────────────────────────

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

	// ── State ────────────────────────────────────────────────────────────────

	let data: OverviewData | null = null;
	let loading = true;
	let error: string | null = null;

	// ── Fetch ────────────────────────────────────────────────────────────────

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

	// ── Helpers ──────────────────────────────────────────────────────────────

	/** Format a slug like "air-conditioners" → "Air Conditioners" */
	function fmt(slug: string): string {
		return slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	/** Numeric display — returns '—' while loading */
	function display(n: number | undefined): string {
		if (loading || n === undefined) return '—';
		return n.toLocaleString();
	}
</script>

<!-- ─────────────────────────── Markup ─────────────────────────── -->

<div class="overview">
	<header class="overview-header">
		<h1 class="overview-title">Overview</h1>
		<p class="overview-sub">Live snapshot · refreshes on tab mount</p>
	</header>

	{#if error}
		<div class="error-banner">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
			{error}
		</div>
	{/if}

	<!-- ── Row 1: four scalar metric cards ── -->
	<div class="cards-grid">

		<!-- Published -->
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Published</span>
			<span class="card-value accent-green">{display(data?.published)}</span>
			<span class="card-hint">products live on storefront</span>
		</div>

		<!-- Unpublished -->
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Unpublished</span>
			<span class="card-value accent-amber">{display(data?.unpublished)}</span>
			<span class="card-hint">drafts not yet visible</span>
		</div>

		<!-- Out of stock -->
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Out of Stock</span>
			<span class="card-value accent-red">{display(data?.outOfStock)}</span>
			<span class="card-hint">products with no stock</span>
		</div>

		<!-- Recently added -->
		<div class="card" class:shimmer={loading}>
			<span class="card-label">Added This Week</span>
			<span class="card-value accent-blue">{display(data?.recentlyAdded)}</span>
			<span class="card-hint">products added in last 7 days</span>
		</div>

	</div>

	<!-- ── Row 2: breakdown cards + locations ── -->
	<div class="cards-grid cards-grid--lower">

		<!-- Per category -->
		<div class="card card--list" class:shimmer={loading}>
			<span class="card-label">By Category</span>
			{#if data?.perCategory.length}
				<ul class="breakdown-list">
					{#each data.perCategory as row}
						<li>
							<span class="bl-name">{fmt(row.categorySlug)}</span>
							<span class="bl-count">{row.count}</span>
						</li>
					{/each}
				</ul>
			{:else if !loading}
				<span class="card-empty">No products yet</span>
			{/if}
		</div>

		<!-- Per product type -->
		<div class="card card--list" class:shimmer={loading}>
			<span class="card-label">By Product Type</span>
			{#if data?.perType.length}
				<ul class="breakdown-list">
					{#each data.perType as row}
						<li>
							<span class="bl-name">{fmt(row.productType)}</span>
							<span class="bl-count">{row.count}</span>
						</li>
					{/each}
				</ul>
			{:else if !loading}
				<span class="card-empty">No products yet</span>
			{/if}
		</div>

		<!-- Locations -->
		<div class="card card--list card--locations" class:shimmer={loading}>
			<div class="locations-header">
				<span class="card-label">Locations</span>
				{#if data}
					<span class="locations-badge">{data.locations.count}</span>
				{/if}
			</div>

			{#if data?.locations.stores.length}
				<ul class="stores-list">
					{#each data.locations.stores as store}
						<li class="store-item">
							<span class="store-icon">
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
									<circle cx="12" cy="10" r="3"/>
								</svg>
							</span>
							<span class="store-info">
								<span class="store-name">{store.storeName}</span>
								<span class="store-address">{store.address}, {store.city}</span>
							</span>
						</li>
					{/each}
				</ul>
			{:else if !loading}
				<span class="card-empty">No locations added</span>
			{/if}
		</div>

	</div>
</div>

<!-- ─────────────────────────── Styles ─────────────────────────── -->

<style>
	/* ── Layout ── */
	.overview {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.overview-header {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.overview-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a1a;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.overview-sub {
		font-size: 0.8125rem;
		color: var(--color-copy-light);
		margin: 0;
	}

	/* ── Grid ── */
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	/* Lower grid: 3 equal columns on desktop, 1 on mobile */
	.cards-grid--lower {
		grid-template-columns: repeat(3, 1fr);
	}

	/* ── Card base ── */
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

	.card:hover {
		box-shadow: 0 2px 10px rgba(0,0,0,0.06);
	}

	.card-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-copy-light);
	}

	.card-value {
		font-size: 2.25rem;
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
		margin-top: 6px;
		color: #1a1a1a;
	}

	.card-hint {
		font-size: 0.75rem;
		color: var(--color-copy-light);
		margin-top: 2px;
	}

	.card-empty {
		font-size: 0.8125rem;
		color: var(--color-copy-light);
		margin-top: 8px;
		font-style: italic;
	}

	/* ── Accent colours ── */
	.accent-green { color: #16a34a; }
	.accent-amber { color: #d97706; }
	.accent-red   { color: var(--color-danger); }
	.accent-blue  { color: var(--color-primary); }

	/* ── List card ── */
	.card--list {
		gap: 10px;
	}

	.breakdown-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.breakdown-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.8125rem;
	}

	.bl-name {
		color: var(--color-copy);
	}

	.bl-count {
		font-weight: 700;
		color: #1a1a1a;
		background: var(--color-surface);
		border-radius: 4px;
		padding: 1px 7px;
		font-size: 0.75rem;
	}

	/* ── Locations card ── */
	.locations-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.locations-badge {
		font-size: 0.75rem;
		font-weight: 700;
		background: var(--color-primary);
		color: #fff;
		border-radius: 999px;
		padding: 1px 8px;
		line-height: 1.6;
	}

	.stores-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.store-item {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}

	.store-icon {
		flex-shrink: 0;
		margin-top: 2px;
		color: var(--color-copy-light);
	}

	.store-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.store-name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.store-address {
		font-size: 0.75rem;
		color: var(--color-copy-light);
	}

	/* ── Shimmer loading state ── */
	@keyframes shimmer {
		0%   { background-position: -400px 0; }
		100% { background-position: 400px 0; }
	}

	.shimmer {
		background: linear-gradient(
			90deg,
			var(--color-surface) 25%,
			var(--color-canvas) 50%,
			var(--color-surface) 75%
		);
		background-size: 800px 100%;
		animation: shimmer 1.4s infinite linear;
		border-color: transparent;
		pointer-events: none;
	}

	/* Shimmer: hide inner content */
	.shimmer * {
		visibility: hidden;
	}

	/* ── Error banner ── */
	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: var(--color-danger);
		border-radius: 8px;
		padding: 10px 14px;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	/* ── Responsive ── */
	@media (max-width: 1023px) {
		.cards-grid--lower {
			grid-template-columns: repeat(2, 1fr);
		}

		/* Locations card spans full width */
		.card--locations {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 767px) {
		.cards-grid,
		.cards-grid--lower {
			grid-template-columns: 1fr;
		}

		.card--locations {
			grid-column: unset;
		}

		.card-value {
			font-size: 1.875rem;
		}
	}
</style>