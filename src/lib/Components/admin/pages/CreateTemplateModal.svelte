<script lang="ts">
	import SidePanel from '../catalog/SidePanel.svelte';

	let {
		onsaved,
		onclose,
	}: {
		onsaved: (template: { slug: string; name: string; schemaDefinition: any[] }) => void;
		onclose: () => void;
	} = $props();

	let templateName = $state('');
	let fields: { field: string; type: string; label: string; required: boolean; folder?: string }[] = $state([]);
	let saving = $state(false);
	let error = $state('');

	let newFieldName = $state('');
	let newFieldType = $state('text');
	let newFieldLabel = $state('');
	let newFieldRequired = $state(false);
	let showFieldForm = $state(false);

	const canSave = $derived(templateName.trim().length > 0 && fields.length > 0);

	function addField() {
		if (!newFieldName.trim()) return;
		const slug = nameToSlug(templateName);
		fields = [...fields, {
			field: newFieldName.trim().replace(/\s+/g, ''),
			type: newFieldType,
			label: newFieldLabel || newFieldName.trim(),
			required: newFieldRequired,
			...(newFieldType === 'image' ? { folder: `assets/section-templates/${slug}` } : {}),
		}];
		newFieldName = '';
		newFieldLabel = '';
		newFieldRequired = false;
		showFieldForm = false;
	}

	function removeField(index: number) {
		fields = fields.filter((_: any, i: number) => i !== index);
	}

	function nameToSlug(name: string) {
		return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
	}

	async function save() {
		if (!templateName.trim()) { error = 'Template name is required'; return; }
		if (fields.length === 0) { error = 'Add at least one field'; return; }

		saving = true; error = '';
		try {
			const slug = nameToSlug(templateName);
			const res = await fetch('/api/admin/pages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'createTemplate',
					slug,
					name: templateName.trim(),
					schemaDefinition: fields,
				}),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: 'Failed to create template' }));
				throw new Error(body.message);
			}
			const template = await res.json();
			onsaved(template);
		} catch (e: any) {
			error = e.message ?? 'Failed to create template';
		} finally {
			saving = false;
		}
	}
</script>

<SidePanel
	open={true}
	title="Create New Template"
	saving={saving}
	{canSave}
	onsave={save}
	ondiscard={onclose}
>
	<div class="flex flex-col gap-4">
		<!-- Template Name -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Template Name <span class="text-danger">*</span></span>
			<input
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
				bind:value={templateName}
				placeholder="e.g. Custom Banner"
			/>
		</label>

		<!-- Fields list -->
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
				<p class="text-[11px] text-copy-light m-0">No fields added yet</p>
			{/if}

			<!-- Add field form -->
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

		<!-- Layout picker -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Layout</span>
			<select class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none cursor-pointer transition-colors w-full box-border focus:border-primary">
				<option value="stacked">Stacked (default)</option>
				<option value="2col-equal">2 Column Equal</option>
				<option value="2col-60-40">2 Column 60/40</option>
				<option value="2col-40-60">2 Column 40/60</option>
				<option value="3col">3 Column</option>
			</select>
		</label>

		{#if error}
			<p class="text-xs text-danger m-0">{error}</p>
		{/if}
	</div>
</SidePanel>
