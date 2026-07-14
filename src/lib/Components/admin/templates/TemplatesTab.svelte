<script lang="ts">
	import { onMount } from 'svelte';
	import DataTable from '$lib/Components/admin/catalog/DataTable.svelte';
	import DeleteConfirmModal from '$lib/Components/admin/catalog/DeleteConfirmModal.svelte';
	import CreateTemplateModal from '$lib/Components/admin/pages/CreateTemplateModal.svelte';
	import EditTemplateModal from './EditTemplateModal.svelte';

	type Template = {
		slug: string;
		name: string;
		schemaDefinition: { field: string; type: string; label?: string; required?: boolean; options?: string[]; folder?: string }[];
	};

	// Dev-added templates that cannot be edited
	const DEV_SLUGS = ['product-slider', 'long-banner', 'two-column-grid', 'product-highlight'];

	let items: Template[] = $state([]);
	let loading = $state(true);
	let listError = $state('');
	let showCreateModal = $state(false);
	let editingTemplate: Template | null = $state(null);

	let selectedIds: string[] = $state([]);
	let selectAll = $state(false);

	let deleteTarget: string | null = $state(null);
	let deleteConfirming = $state(false);
	let deletingSlug = $state('');

	async function load() {
		loading = true; listError = '';
		try {
			const res = await fetch('/api/admin/pages?templates=true');
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			items = data.templates ?? [];
		} catch (e: any) {
			listError = e.message ?? 'Failed to load templates';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	function isDevTemplate(slug: string) {
		return DEV_SLUGS.includes(slug);
	}

	function toggleSelectAll() {
		const deletable = items.filter(t => !isDevTemplate(t.slug));
		if (selectAll) { selectedIds = []; selectAll = false; }
		else { selectedIds = deletable.map((i) => i.slug); selectAll = true; }
	}

	function toggleSelect(slug: string) {
		if (isDevTemplate(slug)) return; // Cannot select system templates
		selectedIds = selectedIds.includes(slug) ? selectedIds.filter((s) => s !== slug) : [...selectedIds, slug];
		selectAll = selectedIds.length === items.filter(t => !isDevTemplate(t.slug)).length;
	}

	function handleRowClick(slug: string) {
		if (isDevTemplate(slug)) return; // Dev templates not editable
		const template = items.find((t) => t.slug === slug);
		if (template) editingTemplate = template;
	}

	function startDelete(slug: string) {
		deleteTarget = slug;
		deleteConfirming = true;
	}

	function closeDeleteModal() {
		deleteTarget = null;
		deleteConfirming = false;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		const slug = deleteTarget;
		deletingSlug = slug; closeDeleteModal();
		try {
			const res = await fetch(`/api/admin/pages?templateSlug=${slug}`, { method: 'DELETE' });
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Delete failed' })); throw new Error(b.message); }
			selectedIds = selectedIds.filter((s) => s !== slug);
			await load();
		} catch (err: any) { listError = err.message ?? 'Delete failed'; }
		finally { deletingSlug = ''; }
	}
</script>

<DeleteConfirmModal
	open={deleteTarget !== null && deleteConfirming}
	entityName={deleteTarget ?? ''}
	entityLabel="template"
	productCount={0}
	checking={false}
	message="This template and all sections using it will be permanently deleted. Associated images will also be removed from ImageKit."
	onconfirm={() => confirmDelete()}
	oncancel={closeDeleteModal}
/>

{#if showCreateModal}
	<CreateTemplateModal
		onsaved={(tpl) => { items = [...items, tpl]; showCreateModal = false; }}
		onclose={() => { showCreateModal = false; }}
	/>
{/if}

{#if editingTemplate}
	<EditTemplateModal
		template={editingTemplate}
		onsaved={(tpl) => { items = items.map((t) => t.slug === tpl.slug ? tpl : t); editingTemplate = null; }}
		onclose={() => { editingTemplate = null; }}
	/>
{/if}

<section class="flex flex-col gap-5 px-6 py-5">
	<div class="flex items-center justify-between">
		<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0">Section Templates</h2>
		<button
			class="font-inter border-primary text-primary hover:bg-primary cursor-pointer rounded-[7px] border bg-transparent px-3 py-[7px] text-[13px] font-semibold transition-colors hover:text-white"
			onclick={() => { showCreateModal = true; }}
		>
			+ Create Template
		</button>
	</div>

	{#if listError}
		<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>
	{/if}

	{#if selectedIds.length > 0}
		<div class="flex items-center gap-2 text-[13px]">
			<span class="text-primary font-semibold">{selectedIds.length} selected</span>
			<button
				class="font-inter border-danger text-danger hover:bg-danger cursor-pointer rounded-md border bg-transparent px-3 py-1.5 font-medium transition-colors hover:text-white inline-flex items-center gap-1"
				onclick={() => {
					if (selectedIds.length === 1) { startDelete(selectedIds[0]); }
					else if (confirm(`Delete ${selectedIds.length} templates and all their sections?`)) {
						(async () => {
							for (const slug of selectedIds) {
								await fetch(`/api/admin/pages?templateSlug=${slug}`, { method: 'DELETE' });
							}
							selectedIds = [];
							await load();
						})();
					}
				}}
			>
				<span class="icon-[lucide--trash-2] h-3.5 w-3.5"></span>
				Delete
			</button>
			<button
				class="font-inter border-subtle text-copy hover:bg-surface cursor-pointer rounded-md border bg-transparent px-3 py-1.5 font-medium transition-colors ml-auto"
				onclick={() => { selectedIds = []; selectAll = false; }}
			>
				Clear
			</button>
		</div>
	{/if}

	<DataTable
		columns={[
			{ label: 'Name' },
			{ label: 'Slug' },
			{ label: 'Fields' },
			{ label: 'Type' },
		]}
		{loading}
		empty={items.length === 0}
		emptyMessage="No templates yet. Create one to get started."
		{selectAll}
		{selectedIds}
		onSelectAll={toggleSelectAll}
		onSelect={toggleSelect}
		onRowClick={handleRowClick}
	>
		{#each items as item (item.slug)}
			{@const isSelected = selectedIds.includes(item.slug)}
			{@const isDev = isDevTemplate(item.slug)}
			<tr class="hover:bg-surface/50 transition-colors {isDev ? '' : 'cursor-pointer'}" onclick={() => handleRowClick(item.slug)}>
				<td class="border-subtle w-10 border px-3 py-2" onclick={(e) => e.stopPropagation()}>
					<input type="checkbox" class="accent-primary cursor-pointer" checked={isSelected} onchange={() => toggleSelect(item.slug)} />
				</td>
				<td class="border-subtle border px-3 py-2 font-medium">{item.name}</td>
				<td class="border-subtle border px-3 py-2"><code class="font-mono text-xs text-copy-light">{item.slug}</code></td>
				<td class="border-subtle border px-3 py-2 text-copy-light">{item.schemaDefinition.length} fields</td>
				<td class="border-subtle border px-3 py-2">
					{#if isDev}
						<span class="text-[11px] text-copy-light font-medium">System</span>
					{:else}
						<span class="text-[11px] text-primary font-medium">Custom</span>
					{/if}
				</td>
			</tr>
		{/each}
	</DataTable>
</section>
