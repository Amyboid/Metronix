<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	type OverviewData = {
		perCategory: { categorySlug: string; count: number }[];
		perType: { productType: string; count: number }[];
		published: number;
		unpublished: number;
		outOfStock: number;
		recentlyAdded: number;
		locations: { count: number; stores: { id: string; storeName: string; address: string; city: string }[] };
		totalProducts: number;
		inventoryValue: number;
		lowStockProducts: { id: string; name: string; slug: string; totalStock: number }[];
		recentActivity: { id: string; adminEmail: string; action: string; entityType: string; entityName: string; createdAt: string }[];
		brandDistribution: { brand: string; count: number }[];
		stockByLocation: { storeName: string; city: string; productCount: number; totalStock: number }[];
		categoryHealth: { categorySlug: string; stockStatus: string; count: number }[];
		promotionTags: { tag: string; count: number }[];
		badgeTags: { tag: string; count: number }[];
	};

	let data: OverviewData | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);
	let brandChartCanvas: HTMLCanvasElement | undefined = $state(undefined);
	let brandChart: Chart | null = null;

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

	$effect(() => {
		if (data?.brandDistribution && brandChartCanvas) {
			if (brandChart) brandChart.destroy();
			brandChart = new Chart(brandChartCanvas, {
				type: 'bar',
				data: {
					labels: data.brandDistribution.map((b) => b.brand),
					datasets: [{
						data: data.brandDistribution.map((b) => b.count),
						backgroundColor: [
							'rgba(11, 172, 197, 0.7)',
							'rgba(11, 172, 197, 0.55)',
							'rgba(11, 172, 197, 0.4)',
							'rgba(11, 172, 197, 0.28)',
							'rgba(11, 172, 197, 0.18)',
						],
						borderColor: 'rgba(11, 172, 197, 0.9)',
						borderWidth: 1,
						borderRadius: 6,
						barPercentage: 0.7,
					}],
				},
				options: {
					indexAxis: 'y',
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						x: {
							grid: { color: 'rgba(213, 208, 195, 0.3)' },
							ticks: { color: '#9d9d9d', font: { size: 11 } },
						},
						y: {
							grid: { display: false },
							ticks: { color: '#6d6d6d', font: { size: 12, weight: '500' } },
						},
					},
				},
			});
		}
	});

	function fmt(n: number) {
		return '₹' + n.toLocaleString('en-IN');
	}

	function timeAgo(dateStr: string) {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		return `${days}d ago`;
	}

	function categoryHealthColor(status: string) {
		if (status === 'in_stock') return 'bg-green-100 text-green-700 border-green-200';
		if (status === 'out_of_stock') return 'bg-red-100 text-red-700 border-red-200';
		return 'bg-amber-100 text-amber-700 border-amber-200';
	}

	function formatStatus(s: string) {
		return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function actionIcon(action: string) {
		if (action === 'created') return 'icon-[lucide--plus-circle] text-green-500';
		if (action === 'updated') return 'icon-[lucide--pencil] text-blue-500';
		if (action === 'deleted') return 'icon-[lucide--trash-2] text-red-500';
		if (action === 'published') return 'icon-[lucide--check-circle] text-green-500';
		if (action === 'unpublished') return 'icon-[lucide--x-circle] text-amber-500';
		return 'icon-[lucide--activity] text-gray-400';
	}

	const FILTER_KEY = 'adminProductFilters';

	function navigateWithFilter(filterUpdate: Record<string, any>) {
		const current = JSON.parse(sessionStorage.getItem(FILTER_KEY) ?? '{}');
		sessionStorage.setItem(FILTER_KEY, JSON.stringify({ ...current, ...filterUpdate }));
		adminNav.navigate({ tab: 'products', view: 'list' });
	}
</script>

<div class="overview-bg flex flex-col gap-5 px-6 pt-5">
	<header class="flex flex-col gap-0.5">
		<h1 class="text-[1.25rem] font-bold text-[#1a1a1a] tracking-[-0.02em] m-0">Overview</h1>
		<p class="text-[0.8125rem] text-copy-light m-0">Live snapshot · refreshes on tab mount</p>
	</header>

	{#if error}
		<div class="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] text-danger rounded-xl px-4 py-3 text-[13px] font-medium glass-card">
			<span class="icon-[lucide--circle-alert] w-4 h-4"></span>
			{error}
		</div>
	{/if}

	<!-- Row 1: Metric cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
		<!-- Total Products -->
		<div class="glass-card group">
			<span class="card-label">Total Products</span>
			<span class="text-[1.5rem] md:text-[2rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-[#1a1a1a] {loading ? 'shimmer-text' : ''}">
				{loading ? '—' : data?.totalProducts ?? 0}
			</span>
			<span class="card-hint">{data?.perCategory?.length ?? 0} categories</span>
		</div>

		<!-- Published / Unpublished -->
		<div class="glass-card group">
			<span class="card-label">Published</span>
			<div class="flex items-baseline gap-2 mt-1.5">
				<span class="text-[1.5rem] md:text-[2rem] font-extrabold tracking-[-0.04em] leading-none text-[#16a34a] {loading ? 'shimmer-text' : ''}">
					{loading ? '—' : data?.published ?? 0}
				</span>
				<span class="text-[0.875rem] md:text-[1rem] font-bold text-amber-500">/ {loading ? '—' : data?.unpublished ?? 0}</span>
			</div>
			<span class="card-hint">published / unpublished</span>
		</div>

		<!-- Inventory Value -->
		<div class="glass-card group">
			<span class="card-label">Inventory Value</span>
			<span class="text-[1.5rem] md:text-[2rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-[#1a1a1a] {loading ? 'shimmer-text' : ''}">
				{loading ? '—' : fmt(data?.inventoryValue ?? 0)}
			</span>
			<span class="card-hint">across {data?.locations?.count ?? 0} locations</span>
		</div>

		<!-- Low Stock -->
		<a href="/admin?tab=products" class="glass-card group cursor-pointer no-underline" onclick={(e) => { e.preventDefault(); navigateWithFilter({ filterStock: ['out_of_stock'] }); }}>
			<span class="card-label">Low Stock</span>
			<span class="text-[1.5rem] md:text-[2rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 text-danger {loading ? 'shimmer-text' : ''}">
				{loading ? '—' : data?.lowStockProducts?.length ?? 0}
			</span>
			<span class="card-hint">products need restocking →</span>
		</a>
	</div>

	<!-- Row 2: Info cards -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
		<!-- Recent Activity -->
		<div class="glass-card">
			<span class="card-label mb-3">Recent Activity</span>
			{#if loading}
				<div class="flex flex-col gap-2">
					{#each Array(3) as _}
						<div class="h-8 rounded-lg shimmer"></div>
					{/each}
				</div>
			{:else if data?.recentActivity?.length}
				<div class="flex flex-col gap-2.5">
					{#each data.recentActivity as log}
						<div class="flex items-center gap-2.5 text-[12px]">
							<span class="{actionIcon(log.action)} w-4 h-4 shrink-0"></span>
							<div class="flex-1 min-w-0">
								<span class="font-medium text-copy truncate">{log.adminEmail}</span>
								<span class="text-copy-light"> {log.action} </span>
								<span class="font-medium text-copy">{log.entityName}</span>
							</div>
							<span class="text-copy-light text-[11px] shrink-0">{timeAgo(log.createdAt)}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-[12px] text-copy-light m-0">No recent activity</p>
			{/if}
		</div>

		<!-- Stock by Location -->
		<div class="glass-card">
			<span class="card-label mb-3">Stock by Location</span>
			{#if loading}
				<div class="flex flex-col gap-2">
					{#each Array(3) as _}
						<div class="h-8 rounded-lg shimmer"></div>
					{/each}
				</div>
			{:else if data?.stockByLocation?.length}
				<div class="flex flex-col gap-2">
					{#each data.stockByLocation as loc}
						<div class="flex items-center justify-between text-[12px]">
							<div class="min-w-0">
								<span class="font-medium text-copy truncate block">{loc.storeName}</span>
								<span class="text-copy-light text-[11px]">{loc.city}</span>
							</div>
							<div class="text-right shrink-0">
								<span class="font-bold text-copy">{loc.totalStock}</span>
								<span class="text-copy-light"> units</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-[12px] text-copy-light m-0">No stock data</p>
			{/if}
		</div>

		<!-- Quick Actions -->
		<div class="glass-card">
			<span class="card-label mb-3">Quick Actions</span>
			<div class="flex flex-col gap-2.5">
				<button
					class="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/30 transition-all text-[13px] font-medium text-copy cursor-pointer"
					onclick={() => adminNav.navigate({ tab: 'products', view: 'new' })}
				>
					<span class="icon-[lucide--plus-circle] w-4 h-4 text-primary"></span>
					Add New Product
				</button>
				<button
					class="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/30 transition-all text-[13px] font-medium text-copy cursor-pointer"
					onclick={() => navigateWithFilter({ activeTab: 'unpublished' })}
				>
					<span class="icon-[lucide--eye-off] w-4 h-4 text-amber-500"></span>
					View Unpublished
				</button>
				<button
					class="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/30 transition-all text-[13px] font-medium text-copy cursor-pointer"
					onclick={() => navigateWithFilter({ filterStock: ['out_of_stock'] })}
				>
					<span class="icon-[lucide--alert-triangle] w-4 h-4 text-danger"></span>
					Check Low Stock
				</button>
			</div>
		</div>
	</div>

	<!-- Row 3: Visual cards -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
		<!-- Brand Distribution -->
		<div class="glass-card">
			<span class="card-label mb-3">Brand Distribution</span>
			{#if loading}
				<div class="h-[180px] rounded-lg shimmer"></div>
			{:else if data?.brandDistribution?.length}
				<div class="h-[180px]">
					<canvas bind:this={brandChartCanvas}></canvas>
				</div>
			{:else}
				<p class="text-[12px] text-copy-light m-0">No brand data</p>
			{/if}
		</div>

		<!-- Category Health -->
		<div class="glass-card">
			<span class="card-label mb-3">Category Health</span>
			{#if loading}
				<div class="flex flex-col gap-2">
					{#each Array(3) as _}
						<div class="h-8 rounded-lg shimmer"></div>
					{/each}
				</div>
			{:else if data?.categoryHealth?.length}
				<div class="flex flex-col gap-2">
					{#each data.categoryHealth as ch}
						<div class="flex items-center justify-between text-[12px]">
							<span class="font-medium text-copy truncate">{ch.categorySlug.replace(/-/g, ' ')}</span>
							<div class="flex items-center gap-1.5">
								<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border {categoryHealthColor(ch.stockStatus)}">
									{formatStatus(ch.stockStatus)}
								</span>
								<span class="font-bold text-copy w-6 text-right">{ch.count}</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-[12px] text-copy-light m-0">No category data</p>
			{/if}
		</div>

		<!-- Promotion Tags -->
		<div class="glass-card">
			<span class="card-label mb-3">Promotion Tags</span>
			{#if loading}
				<div class="flex flex-col gap-2">
					{#each Array(3) as _}
						<div class="h-8 rounded-lg shimmer"></div>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col gap-3">
					{#if data?.promotionTags?.length}
						<div>
							<span class="text-[11px] text-copy-light uppercase tracking-wider mb-1.5 block">Promotions</span>
							<div class="flex flex-wrap gap-1.5">
								{#each data.promotionTags as tag}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20">
										{tag.tag} <span class="text-primary/60">({tag.count})</span>
									</span>
								{/each}
							</div>
						</div>
					{/if}
					{#if data?.badgeTags?.length}
						<div>
							<span class="text-[11px] text-copy-light uppercase tracking-wider mb-1.5 block">Badges</span>
							<div class="flex flex-wrap gap-1.5">
								{#each data.badgeTags as tag}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/20 text-[#8a7a3a] text-[11px] font-semibold border border-brand/30">
										{tag.tag} <span class="opacity-60">({tag.count})</span>
									</span>
								{/each}
							</div>
						</div>
					{/if}
					{#if !data?.promotionTags?.length && !data?.badgeTags?.length}
						<p class="text-[12px] text-copy-light m-0">No tags assigned yet</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Row 4: Placeholders -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Revenue Placeholder -->
		<div class="glass-card opacity-60">
			<div class="flex items-center gap-2 mb-2">
				<span class="icon-[lucide--lock] w-4 h-4 text-copy-light"></span>
				<span class="card-label">Revenue</span>
			</div>
			<span class="text-[1.5rem] font-extrabold tracking-[-0.04em] leading-none text-copy-light">Coming Soon</span>
			<span class="card-hint">Payment integration planned</span>
		</div>

		<!-- Orders Placeholder -->
		<div class="glass-card opacity-60">
			<div class="flex items-center gap-2 mb-2">
				<span class="icon-[lucide--lock] w-4 h-4 text-copy-light"></span>
				<span class="card-label">Recent Orders</span>
			</div>
			<span class="text-[1.5rem] font-extrabold tracking-[-0.04em] leading-none text-copy-light">Coming Soon</span>
			<span class="card-hint">Order tracking on the roadmap</span>
		</div>
	</div>
</div>

<style>
	.glass-card {
		background: var(--color-surface);
		border: 1px solid var(--color-subtle);
		border-radius: 12px;
		padding: 18px 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		transition: box-shadow 0.2s ease;
		min-width: 0;
		overflow: hidden;
	}
	.glass-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
	}

	@media (min-width: 768px) {
		.glass-card {
			background: rgba(255, 255, 255, 0.55);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			border-color: rgba(255, 255, 255, 0.5);
		}
	}
	.glass-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
	}
	.glass-card:hover {
		box-shadow:
			0 8px 40px rgba(0, 0, 0, 0.06),
			0 2px 8px rgba(0, 0, 0, 0.03),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		transform: translateY(-2px);
	}
	.glass-card:hover {
		box-shadow:
			0 8px 40px rgba(0, 0, 0, 0.06),
			0 2px 8px rgba(0, 0, 0, 0.03),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		border-color: rgba(255, 255, 255, 0.7);
		transform: translateY(-2px);
	}

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

	@keyframes shimmer {
		0% { background-position: -400px 0; }
		100% { background-position: 400px 0; }
	}
	.shimmer {
		background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%);
		background-size: 800px 100%;
		animation: shimmer 1.4s infinite linear;
		border-radius: 8px;
	}
	.shimmer-text {
		background: linear-gradient(90deg, #d5d0c3 25%, #e6e3db 50%, #d5d0c3 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite linear;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		border-radius: 4px;
	}

	.overview-bg {
		background: var(--color-neutral);
		min-height: 100%;
	}
</style>
