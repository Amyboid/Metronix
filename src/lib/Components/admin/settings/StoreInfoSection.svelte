<script lang="ts">
	import { onMount } from 'svelte';
	import SidePanel from '../catalog/SidePanel.svelte';

	let { onaction }: { onaction?: (fn: () => void) => void } = $props();

	let settings: Record<string, string> = $state({});
	let loading = $state(true);
	let editing = $state(false);
	let saving  = $state(false);
	let error   = $state('');

	let formStoreName    = $state('');
	let formContactPhone = $state('');
	let formWhatsapp     = $state('');
	let formAddress      = $state('');

	const canSave = $derived(
		formStoreName.trim() !== '' && (
			formStoreName !== (settings.store_name ?? '') ||
			formContactPhone !== (settings.contact_phone ?? '') ||
			formWhatsapp !== (settings.whatsapp_number ?? '') ||
			formAddress !== (settings.store_address ?? '')
		)
	);

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/settings');
			const data = await res.json();
			settings = data.settings;
			resetForm();
		} catch (e: any) {
			error = e.message ?? 'Failed to load settings';
		} finally {
			loading = false;
		}
		onaction?.(openEdit);
	});

	function resetForm() {
		formStoreName    = settings.store_name    ?? '';
		formContactPhone = settings.contact_phone  ?? '';
		formWhatsapp     = settings.whatsapp_number ?? '';
		formAddress      = settings.store_address  ?? '';
	}

	function openEdit() {
		resetForm();
		editing = true;
	}

	function closePanel() {
		editing = false;
	}

	async function save() {
		saving = true; error = '';
		try {
			const updates = [
				{ key: 'store_name',     value: formStoreName.trim() },
				{ key: 'contact_phone',  value: formContactPhone.trim() },
				{ key: 'whatsapp_number', value: formWhatsapp.trim() },
				{ key: 'store_address',  value: formAddress.trim() },
			];
			const res = await fetch('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Update failed' })); throw new Error(b.message); }
			settings.store_name     = formStoreName.trim();
			settings.contact_phone  = formContactPhone.trim();
			settings.whatsapp_number = formWhatsapp.trim();
			settings.store_address  = formAddress.trim();
			closePanel();
		} catch (e: any) {
			error = e.message ?? 'Save failed';
		} finally {
			saving = false;
		}
	}
</script>

<section class="flex flex-col gap-5">
	{#if error}
		<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{error}</div>
	{/if}

	{#if loading}
		<div class="flex flex-col gap-2">{#each Array(4) as _}<div class="h-10 rounded-lg shimmer"></div>{/each}</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="bg-surface border border-subtle rounded-lg p-4">
				<span class="text-[11px] font-semibold uppercase tracking-wider text-copy-light">Store Name</span>
				<p class="text-sm font-medium text-gray-900 m-0 mt-1">{settings.store_name || '—'}</p>
			</div>
			<div class="bg-surface border border-subtle rounded-lg p-4">
				<span class="text-[11px] font-semibold uppercase tracking-wider text-copy-light">Contact Phone</span>
				<p class="text-sm font-medium text-gray-900 m-0 mt-1">{settings.contact_phone || '—'}</p>
			</div>
			<div class="bg-surface border border-subtle rounded-lg p-4">
				<span class="text-[11px] font-semibold uppercase tracking-wider text-copy-light">WhatsApp Number</span>
				<p class="text-sm font-medium text-gray-900 m-0 mt-1">{settings.whatsapp_number || '—'}</p>
			</div>
			<div class="bg-surface border border-subtle rounded-lg p-4">
				<span class="text-[11px] font-semibold uppercase tracking-wider text-copy-light">Address</span>
				<p class="text-sm font-medium text-gray-900 m-0 mt-1">{settings.store_address || '—'}</p>
			</div>
		</div>
	{/if}
</section>

<SidePanel open={editing} title="Edit Store Info" saving={saving} {canSave} onsave={save} ondiscard={closePanel}>
	<div class="flex flex-col gap-4">
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Store Name <span class="text-danger">*</span></span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formStoreName} placeholder="Store name" />
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Contact Phone</span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formContactPhone} placeholder="+91 98765 43210" />
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">WhatsApp Number</span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formWhatsapp} placeholder="+91 98765 43210" />
		</label>
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Address</span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={formAddress} placeholder="Store address" />
		</label>
	</div>
</SidePanel>

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
</style>
