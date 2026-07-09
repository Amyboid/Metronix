<script lang="ts">
	import SidePanel from '../catalog/SidePanel.svelte';
	import DynamicForm from './DynamicForm.svelte';

	let {
		pageName,
		templates,
		categoryOptions = [],
		productTypeOptions = [],
		ikEndpoint = '',
		onsaved,
		onclose,
	}: {
		pageName: string;
		templates: { slug: string; name: string; schemaDefinition: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string; dependsOn?: string; folder?: string }[] }[];
		categoryOptions?: string[];
		productTypeOptions?: string[];
		ikEndpoint?: string;
		onsaved: () => void;
		onclose: () => void;
	} = $props();

	let selectedSlug = $state('');
	let formData: Record<string, any> = $state({});
	let saving = $state(false);
	let error  = $state('');

	const selectedTemplate = $derived(templates.find(t => t.slug === selectedSlug));

	const resolvedSchema = $derived(
		(selectedTemplate?.schemaDefinition ?? []).map(f => ({
			...f,
			options: f.source === 'categories' ? categoryOptions : f.options,
		}))
	);

	const dynamicOptions = $derived({
		category: categoryOptions,
		product_type: productTypeOptions,
	});

	function isFieldVisible(field: any, schema: any[]): boolean {
		if (!field.dependsOn) return true;
		const parent = schema.find((f: any) => f.field === field.dependsOn);
		if (parent && !isFieldVisible(parent, schema)) return false;
		if (!field.showWhen) return true;
		return formData[field.dependsOn] === field.showWhen;
	}

	const canSave = $derived(
		selectedSlug !== '' &&
		resolvedSchema.every(f => {
			if (!isFieldVisible(f, resolvedSchema)) return true;
			if (!f.required) return true;
			if (f.type === 'image') return formData[f.field] || formRef?.hasPendingFile(f.field);
			return !!formData[f.field];
		})
	);

	let formRef: DynamicForm | undefined = $state();

	function selectTemplate(slug: string) {
		selectedSlug = slug;
		formData = {};
		error = '';
	}

	async function save() {
		if (!selectedTemplate) return;
		saving = true; error = '';
		try {
			if (formRef) await formRef.uploadPendingImages();
			if (formRef) formRef.syncAutoValues();

			const res = await fetch('/api/admin/pages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageName,
					templateSlug: selectedSlug,
					config: formData,
				}),
			});
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Failed to add section' })); throw new Error(b.message); }
			onsaved();
		} catch (e: any) {
			error = e.message ?? 'Save failed';
		} finally {
			saving = false;
		}
	}
</script>

<SidePanel
	open={true}
	title={selectedSlug ? `Add ${selectedTemplate?.name ?? ''}` : 'Add Section'}
	saving={saving}
	{canSave}
	onsave={save}
	ondiscard={onclose}
>
	{#if !selectedSlug}
		<div class="flex flex-col gap-2">
			<p class="text-xs font-semibold text-copy uppercase tracking-[0.04em] m-0">Choose a template</p>
			<div class="flex flex-col gap-2">
				{#each templates as tpl (tpl.slug)}
					<button
						class="flex items-center gap-3 p-3 rounded-lg border border-subtle bg-transparent cursor-pointer text-left transition-colors hover:bg-surface hover:border-subtle-hover"
						onclick={() => selectTemplate(tpl.slug)}
					>
						<span class="icon-[lucide--layout-template] w-4 h-4 text-primary shrink-0"></span>
						<div>
							<p class="text-sm font-medium text-gray-900 m-0">{tpl.name}</p>
							<p class="text-[11px] text-copy-light m-0">{tpl.schemaDefinition.length} fields</p>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{:else if selectedTemplate}
		<button class="flex items-center gap-1.5 text-[13px] text-copy-light cursor-pointer bg-transparent border-none font-inter mb-3 hover:text-copy transition-colors" onclick={() => selectTemplate('')}>
			<span class="icon-[lucide--arrow-left] w-3.5 h-3.5"></span> Back to templates
		</button>

		<div class="flex flex-col gap-4">
			<p class="text-xs font-semibold text-copy uppercase tracking-[0.04em] m-0">Configure: {selectedTemplate.name}</p>
			<DynamicForm bind:this={formRef} schema={resolvedSchema} bind:data={formData} {dynamicOptions} {ikEndpoint} templateSlug={selectedSlug} />
		</div>

		{#if error}
			<p class="text-xs text-danger m-0 mt-3">{error}</p>
		{/if}
	{/if}
</SidePanel>
