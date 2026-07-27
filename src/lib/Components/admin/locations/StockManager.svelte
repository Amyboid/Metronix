<script lang="ts">
	import { onMount } from 'svelte';
	import { handleApiError } from '$lib/utils/apiError';

	let { locationId }: { locationId: string } = $props();

	type StockItem = {
		productId:       string;
		productName:     string;
		productSlug:     string;
		mainImagePath:   string | null;
		stockCount:      number;
		deliveryRangeKm: number;
	};

	let items:     StockItem[] = $state([]);
	let loading    = $state(true);
	let loadingMore = $state(false);
	let hasMore    = $state(false);
	let lastId     = $state('');
	let lastName   = $state('');
	let editingId  = $state('');
	let editValue  = $state(0);
	let saving     = $state(false);
	let error      = $state('');

	async function load(reset = true) {
		if (reset) { items = []; lastId = ''; lastName = ''; loading = true; }
		else loadingMore = true;
		error = '';
		try {
			const params = new URLSearchParams({ locationId, stock: 'true', limit: '20' });
			if (!reset && lastId && lastName) {
				params.set('lastId', lastId);
				params.set('lastName', lastName);
			}
			const res = await fetch(`/api/admin/locations?${params}`);
			if (!res.ok) await handleApiError(res);
			const data = await res.json();
			items = reset ? data.items : [...items, ...data.items];
			hasMore = data.hasMore;
			if (data.items.length) {
				const last = data.items[data.items.length - 1];
				lastId = last.productId;
				lastName = last.productName;
			}
		} catch (e: any) {
			error = e.message ?? 'Failed to load stock';
		} finally {
			loading = false; loadingMore = false;
		}
	}

	onMount(() => load());

	function beginEdit(productId: string, currentCount: number) {
		editingId = productId;
		editValue = currentCount;
	}

	function cancelEdit() {
		editingId = '';
	}

	async function saveStock(productId: string) {
		saving = true; error = '';
		try {
			const res = await fetch('/api/admin/locations', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ locationId, productId, stockCount: editValue }),
			});
			if (!res.ok) await handleApiError(res);
			items = items.map(i => i.productId === productId ? { ...i, stockCount: editValue } : i);
			editingId = '';
		} catch (e: any) {
			error = e.message ?? 'Save failed';
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex flex-col gap-3">
	<h3 class="text-sm font-bold text-gray-900 m-0">Stock Management</h3>

	{#if error}
		<p class="text-xs text-danger m-0">{error}</p>
	{/if}

	{#if loading}
		<div class="flex flex-col gap-2">
			{#each Array(5) as _}
				<div class="h-10 rounded-lg shimmer"></div>
			{/each}
		</div>
	{:else if items.length === 0}
		<p class="text-xs text-copy-light m-0">No products found.</p>
	{:else}
		<div class="border border-subtle rounded-lg overflow-hidden">
			<table class="w-full border-collapse text-[13px]">
				<thead>
					<tr>
						<th class="py-2 px-3 text-left text-[11px] font-bold uppercase tracking-wider text-copy-light border-b border-subtle">Product</th>
						<th class="py-2 px-3 text-right text-[11px] font-bold uppercase tracking-wider text-copy-light border-b border-subtle w-32">Stock</th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.productId)}
						<tr>
							<td class="py-2 px-3 text-copy border-b border-subtle">{item.productName}</td>
							<td class="py-2 px-3 border-b border-subtle text-right">
								{#if editingId === item.productId}
									<div class="flex items-center justify-end gap-1">
										<input
											type="number"
											min="0"
											class="w-16 text-right font-inter text-[13px] py-1 px-1.5 border border-subtle rounded bg-neutral text-gray-900 outline-none focus:border-primary"
											value={editValue}
											oninput={(e) => { editValue = Number((e.target as HTMLInputElement).value); }}
											onkeydown={(e) => { if (e.key === 'Enter') saveStock(item.productId); if (e.key === 'Escape') cancelEdit(); }}
											disabled={saving}
										/>
										<button class="inline-flex items-center justify-center w-6 h-6 rounded border border-primary bg-transparent text-primary cursor-pointer hover:bg-primary hover:text-white disabled:opacity-50" onclick={() => saveStock(item.productId)} disabled={saving} aria-label="Save stock">
											<span class="icon-[lucide--check] w-3 h-3"></span>
										</button>
										<button class="inline-flex items-center justify-center w-6 h-6 rounded border border-subtle bg-transparent text-copy cursor-pointer hover:bg-surface" onclick={cancelEdit} aria-label="Cancel edit">
											<span class="icon-[lucide--x] w-3 h-3"></span>
										</button>
									</div>
								{:else}
									<div class="flex items-center justify-end gap-1.5">
										<span class="font-mono text-xs text-copy">{item.stockCount}</span>
										<button class="inline-flex items-center justify-center w-6 h-6 rounded border border-subtle bg-transparent text-copy cursor-pointer hover:bg-surface hover:border-subtle-hover transition-colors" onclick={() => beginEdit(item.productId, item.stockCount)} title="Edit stock" aria-label="Edit stock">
											<span class="icon-[lucide--pencil] w-3 h-3"></span>
										</button>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if hasMore}
			<div class="flex justify-center">
				<button class="font-inter text-xs font-medium py-1.5 px-4 rounded-md border border-subtle bg-surface text-copy cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas" onclick={() => load(false)} disabled={loadingMore}>
					{loadingMore ? 'Loading…' : 'Load more'}
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
</style>
