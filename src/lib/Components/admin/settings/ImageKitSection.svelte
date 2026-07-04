<script lang="ts">
	import { onMount } from 'svelte';
	import SidePanel from '../catalog/SidePanel.svelte';

	let { onaction }: { onaction?: (fn: () => void) => void } = $props();

	let settings: Record<string, string> = $state({});
	let loading = $state(true);
	let editing = $state(false);
	let saving  = $state(false);
	let error   = $state('');

	let formImageKitUrl = $state('');

	const canSave = $derived(formImageKitUrl.trim() !== '' && formImageKitUrl !== (settings.imagekit_url ?? ''));

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/settings');
			const data = await res.json();
			settings = data.settings;
			formImageKitUrl = settings.imagekit_url ?? '';
		} catch (e: any) {
			error = e.message ?? 'Failed to load settings';
		} finally {
			loading = false;
		}
		onaction?.(openEdit);
	});

	function openEdit() {
		formImageKitUrl = settings.imagekit_url ?? '';
		editing = true;
	}

	function closePanel() { editing = false; }

	async function save() {
		saving = true; error = '';
		try {
			const res = await fetch('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates: [{ key: 'imagekit_url', value: formImageKitUrl.trim() }] }),
			});
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Update failed' })); throw new Error(b.message); }
			settings.imagekit_url = formImageKitUrl.trim();
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
		<div class="flex flex-col gap-2">{#each Array(2) as _}<div class="h-10 rounded-lg shimmer"></div>{/each}</div>
	{:else}
		<div class="bg-surface border border-subtle rounded-lg p-4">
			<span class="text-[11px] font-semibold uppercase tracking-wider text-copy-light">URL Endpoint</span>
			<p class="text-sm font-medium text-gray-900 m-0 mt-1 font-mono break-all">{settings.imagekit_url || '—'}</p>
		</div>
	{/if}
</section>

<SidePanel open={editing} title="Edit ImageKit Config" saving={saving} {canSave} onsave={save} ondiscard={closePanel}>
	<div class="flex flex-col gap-4">
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">URL Endpoint <span class="text-danger">*</span></span>
			<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary font-mono" bind:value={formImageKitUrl} placeholder="https://ik.imagekit.io/your_id" />
		</label>
		<p class="text-xs text-copy-light m-0">The public URL endpoint for ImageKit. The private key stays in environment variables and is never exposed.</p>
	</div>
</SidePanel>

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
</style>
