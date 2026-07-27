<script lang="ts">
	import { onMount } from 'svelte';
	import SidePanel from '$lib/Components/admin/catalog/SidePanel.svelte';
	import { handleApiError } from '$lib/utils/apiError';

	let {
		template,
		onsaved,
		onclose,
	}: {
		template: { slug: string; name: string; schemaDefinition: { field: string; type: string; label?: string; required?: boolean; options?: string[]; folder?: string }[] };
		onsaved: (template: { slug: string; name: string; schemaDefinition: any[] }) => void;
		onclose: () => void;
	} = $props();

	let fields = $state([...template.schemaDefinition]);
	let saving = $state(false);
	let error = $state('');
	let sectionsUsing: { id: string; pageName: string }[] = $state([]);
	let checkingSections = $state(true);

	let newFieldName = $state('');
	let newFieldType = $state('text');
	let newFieldLabel = $state('');
	let newFieldRequired = $state(false);
	let showFieldForm = $state(false);

	const canSave = $derived(template.name.trim().length > 0 && fields.length > 0);

	onMount(async () => {
		try {
			const res = await fetch(`/api/admin/pages?pageName=__check_sections&templateSlug=${template.slug}`);
			if (res.ok) {
				const data = await res.json();
				sectionsUsing = data.sections ?? [];
			}
		} catch { /* ignore */ }
		finally { checkingSections = false; }
	});

	function addField() {
		if (!newFieldName.trim()) return;
		fields = [...fields, {
			field: newFieldName.trim().replace(/\s+/g, ''),
			type: newFieldType,
			label: newFieldLabel || newFieldName.trim(),
			required: newFieldRequired,
		}];
		newFieldName = '';
		newFieldLabel = '';
		newFieldRequired = false;
		showFieldForm = false;
	}

	function removeField(index: number) {
		fields = fields.filter((_: any, i: number) => i !== index);
	}

	async function save() {
		saving = true; error = '';
		try {
			const res = await fetch('/api/admin/pages', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'updateTemplate',
					slug: template.slug,
					schemaDefinition: fields,
				}),
			});
			if (!res.ok) await handleApiError(res);
			onsaved({ ...template, schemaDefinition: fields });
		} catch (e: any) {
			error = e.message ?? 'Failed to update template';
		} finally {
			saving = false;
		}
	}
</script>

<SidePanel
	open={true}
	title="Edit: {template.name}"
	saving={saving}
	{canSave}
	onsave={save}
	ondiscard={onclose}
>
	<div class="flex flex-col gap-4">
		<!-- Warning if template is in use -->
		{#if !checkingSections && sectionsUsing.length > 0}
			<div class="flex items-start gap-2 bg-[#fff7ed] border border-[#fed7aa] rounded-lg p-3 text-[12px] text-[#92400e]">
				<span class="icon-[lucide--triangle-alert] w-4 h-4 shrink-0 mt-0.5 text-[#f97316]"></span>
				<div>
					<p class="font-semibold m-0 mb-0.5">This template is used by {sectionsUsing.length} section{sectionsUsing.length !== 1 ? 's' : ''}</p>
					<p class="m-0">After updating, review the sections in the Pages tab to ensure all fields are configured correctly. Sections with missing fields may need to be updated or temporarily disabled.</p>
					<ul class="m-0 mt-1 pl-4">
						{#each sectionsUsing as s}
							<li>{s.pageName}</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}

		<!-- Current fields -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Fields</span>
				<button
					class="text-primary hover:text-primary/80 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium transition-colors"
					onclick={() => { showFieldForm = !showFieldForm; }}
				>
					{showFieldForm ? 'Cancel' : '+ Add Field'}
				</button>
			</div>

			{#if fields.length > 0}
				<div class="flex flex-col gap-1.5">
					{#each fields as f, i}
						<div class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface border border-subtle text-[12px]">
							<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">{f.type}</span>
							<span class="font-medium text-copy flex-1 truncate">{f.label}</span>
							{#if f.required}
								<span class="text-[10px] text-danger">Required</span>
							{/if}
							<button class="text-copy-light hover:text-danger cursor-pointer border-none bg-transparent p-0.5" onclick={() => removeField(i)} aria-label="Remove field">
								<span class="icon-[lucide--x] h-3 w-3"></span>
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-[11px] text-copy-light m-0">No fields</p>
			{/if}

			{#if showFieldForm}
				<div class="flex flex-col gap-2 p-3 rounded-lg border border-subtle bg-surface">
					<label class="flex flex-col gap-[5px]">
						<span class="text-[11px] font-semibold text-copy uppercase tracking-[0.04em]">Field Name</span>
						<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={newFieldName} placeholder="e.g. heading" />
					</label>
					<label class="flex flex-col gap-[5px]">
						<span class="text-[11px] font-semibold text-copy uppercase tracking-[0.04em]">Label</span>
						<input class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary" bind:value={newFieldLabel} placeholder="e.g. Heading" />
					</label>
					<label class="flex flex-col gap-[5px]">
						<span class="text-[11px] font-semibold text-copy uppercase tracking-[0.04em]">Type</span>
						<select class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none cursor-pointer transition-colors w-full box-border focus:border-primary" bind:value={newFieldType}>
							<option value="text">Text</option>
							<option value="image">Image</option>
							<option value="select">Select</option>
						</select>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={newFieldRequired} class="accent-primary cursor-pointer" />
						<span class="text-[12px] text-copy">Required</span>
					</label>
					<button
						class="font-inter text-[13px] font-semibold py-[6px] px-3 rounded-md border-none bg-primary text-white cursor-pointer transition-colors hover:opacity-90"
						onclick={addField}
					>
						Add Field
					</button>
				</div>
			{/if}
		</div>

		{#if error}
			<p class="text-xs text-danger m-0">{error}</p>
		{/if}
	</div>
</SidePanel>
