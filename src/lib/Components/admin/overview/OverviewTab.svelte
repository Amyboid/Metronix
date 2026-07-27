<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import { Chart, registerables } from 'chart.js';
	import GlassCard from './GlassCard.svelte';
	import MetricCard from './MetricCard.svelte';
	import PlaceholderCard from './PlaceholderCard.svelte';
	import ShimmerRows from './ShimmerRows.svelte';
	import { handleApiError } from '$lib/utils/apiError';

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
			if (!res.ok) await handleApiError(res);
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
							ticks: { color: '#6d6d6d', font: { size: 12, weight: 500 } },
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

<div class="flex flex-col gap-4 md:gap-5 px-4 md:px-6 py-4 md:py-5">
	<header class="flex flex-col gap-0.5">
		<h1 class="text-[1.25rem] font-bold text-[#1a1a1a] tracking-[-0.02em] m-0">Overview</h1>
		<p class="text-[0.8125rem] text-copy-light m-0">Live snapshot · refreshes on tab mount</p>
	</header>

	{#if error}
		<div class="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] text-danger rounded-xl px-4 py-3 text-[13px] font-medium">
			<span class="icon-[lucide--circle-alert] w-4 h-4"></span>
			{error}
		</div>
	{/if}

	<!-- Row 1: Metric cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
		<MetricCard label="Total Products" value={data?.totalProducts ?? 0} hint="{data?.perCategory?.length ?? 0} categories" {loading} />
		<MetricCard label="Published" value="{data?.published ?? 0} / {data?.unpublished ?? 0}" hint="published / unpublished" {loading} color="text-[#16a34a]" />
		<MetricCard label="Inventory Value" value={fmt(data?.inventoryValue ?? 0)} hint="across {data?.locations?.count ?? 0} locations" {loading} />
		<MetricCard label="Low Stock" value={data?.lowStockProducts?.length ?? 0} hint="products need restocking →" {loading} color="text-danger" onClick={() => navigateWithFilter({ filterStock: ['out_of_stock'] })} />
	</div>

	<!-- Row 2: Info cards -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
		<!-- Recent Activity -->
		<GlassCard>
			<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light mb-3">Recent Activity</span>
			{#if loading}
				<ShimmerRows />
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
		</GlassCard>

		<!-- Stock by Location -->
		<GlassCard>
			<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light mb-3">Stock by Location</span>
			{#if loading}
				<ShimmerRows />
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
		</GlassCard>

		<!-- Quick Actions -->
		<GlassCard>
			<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light mb-3">Quick Actions</span>
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
		</GlassCard>
	</div>

	<!-- Row 3: Visual cards -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
		<!-- Brand Distribution -->
		<GlassCard>
			<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light mb-3">Brand Distribution</span>
			{#if loading}
				<div class="h-[180px] rounded-lg shimmer"></div>
			{:else if data?.brandDistribution?.length}
				<div class="h-[180px]">
					<canvas bind:this={brandChartCanvas}></canvas>
				</div>
			{:else}
				<p class="text-[12px] text-copy-light m-0">No brand data</p>
			{/if}
		</GlassCard>

		<!-- Category Health -->
		<GlassCard>
			<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light mb-3">Category Health</span>
			{#if loading}
				<ShimmerRows />
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
		</GlassCard>

		<!-- Promotion Tags -->
		<GlassCard>
			<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light mb-3">Promotion Tags</span>
			{#if loading}
				<ShimmerRows />
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
		</GlassCard>
	</div>

	<!-- Row 4: Placeholders -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
		<PlaceholderCard label="Revenue" hint="Payment integration planned" />
		<PlaceholderCard label="Recent Orders" hint="Order tracking on the roadmap" />
	</div>
</div>

<style>
	.shimmer {
		background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%);
		background-size: 800px 100%;
		animation: shimmer 1.4s infinite linear;
		border-radius: 8px;
	}

	@keyframes shimmer {
		0% { background-position: -400px 0; }
		100% { background-position: 400px 0; }
	}

	:global(.shimmer-text) {
		background: linear-gradient(90deg, #d5d0c3 25%, #e6e3db 50%, #d5d0c3 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite linear;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		border-radius: 4px;
	}
</style>
