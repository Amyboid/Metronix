<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import SidePanel from '../catalog/SidePanel.svelte';
	import StockManager from './StockManager.svelte';

	let { locationId = null }: { locationId?: string | null } = $props();

	let formStoreName  = $state('');
	let formAddress    = $state('');
	let formCity       = $state('');
	let formLatitude   = $state(0);
	let formLongitude  = $state(0);
	let formPhone      = $state('');
	let formSaving     = $state(false);
	let formError      = $state('');
	let loading        = $state(true);

	let originalStoreName  = $state('');
	let originalAddress    = $state('');
	let originalCity       = $state('');
	let originalLatitude   = $state(0);
	let originalLongitude  = $state(0);
	let originalPhone      = $state('');

	const isEdit = $derived(locationId !== null);

	const canSave = $derived.by(() => {
		if (!formStoreName.trim() || !formAddress.trim() || !formCity.trim()) return false;
		if (!isEdit) return true;
		return (
			formStoreName !== originalStoreName ||
			formAddress !== originalAddress ||
			formCity !== originalCity ||
			formLatitude !== originalLatitude ||
			formLongitude !== originalLongitude ||
			formPhone !== originalPhone
		);
	});

	onMount(async () => {
		if (locationId) {
			try {
				const res = await fetch('/api/admin/locations');
				const data = await res.json();
				const loc = data.items.find((l: any) => l.id === locationId);
				if (loc) {
					formStoreName = loc.storeName;
					formAddress = loc.address;
					formCity = loc.city;
					formLatitude = loc.latitude;
					formLongitude = loc.longitude;
					formPhone = loc.phone ?? '';
					originalStoreName = loc.storeName;
					originalAddress = loc.address;
					originalCity = loc.city;
					originalLatitude = loc.latitude;
					originalLongitude = loc.longitude;
					originalPhone = loc.phone ?? '';
				}
			} catch (e: any) {
				formError = e.message ?? 'Failed to load location';
			}
		}
		loading = false;
	});

	function closePanel() {
		adminNav.navigate({ tab: 'locations', view: 'list' });
	}

	async function save() {
		formSaving = true; formError = '';
		try {
			const payload: any = {
				storeName:  formStoreName.trim(),
				address:    formAddress.trim(),
				city:       formCity.trim(),
				latitude:   formLatitude,
				longitude:  formLongitude,
				phone:      formPhone.trim() || null,
			};

			if (isEdit) {
				payload.id = locationId;
				const res = await fetch('/api/admin/locations', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
				if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Update failed' })); throw new Error(b.message); }
			} else {
				const res = await fetch('/api/admin/locations', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
				if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Create failed' })); throw new Error(b.message); }
			}
			closePanel();
		} catch (err: any) {
			formError = err.message ?? 'Save failed';
		} finally {
			formSaving = false;
		}
	}
</script>

<SidePanel
	open={true}
	title={isEdit ? 'Edit Location' : 'New Location'}
	saving={formSaving}
	{canSave}
	onsave={save}
	ondiscard={closePanel}
>
	{#if loading}
		<div class="flex flex-col gap-2">
			{#each Array(5) as _}
				<div class="h-10 rounded-lg shimmer"></div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			<label class="flex flex-col gap-[5px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Store Name <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formStoreName} placeholder="e.g. Main Store" />
			</label>

			<label class="flex flex-col gap-[5px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Address <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formAddress} placeholder="123 Main St" />
			</label>

			<label class="flex flex-col gap-[5px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">City <span class="text-danger">*</span></span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formCity} placeholder="Mumbai" />
			</label>

			<div class="flex gap-3 flex-wrap">
				<label class="flex flex-col gap-[5px] flex-1 min-w-[140px]">
					<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Latitude</span>
					<input type="number" step="any" class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formLatitude} placeholder="19.0760" />
				</label>
				<label class="flex flex-col gap-[5px] flex-1 min-w-[140px]">
					<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Longitude</span>
					<input type="number" step="any" class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formLongitude} placeholder="72.8777" />
				</label>
			</div>

			<label class="flex flex-col gap-[5px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Phone</span>
				<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formPhone} placeholder="+91 98765 43210" />
			</label>

			{#if formError}
				<p class="text-xs text-danger m-0">{formError}</p>
			{/if}
		</div>

		{#if isEdit && locationId}
			<div class="mt-6 pt-5 border-t border-subtle">
				<StockManager {locationId} />
			</div>
		{/if}
	{/if}
</SidePanel>

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
</style>
