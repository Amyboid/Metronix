<script lang="ts">
	import SidePanel from '../catalog/SidePanel.svelte';
	import DynamicForm from './DynamicForm.svelte';

	let {
		section,
		template,
		categoryOptions = [],
		productTypeOptions = [],
		ikEndpoint = '',
		onsaved,
		onclose,
	}: {
		section: { id: string; config: Record<string, any> };
		template: { slug: string; name: string; schemaDefinition: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string; dependsOn?: string; folder?: string }[] } | undefined;
		categoryOptions?: string[];
		productTypeOptions?: string[];
		onsaved: () => void;
		onclose: () => void;
	} = $props();

	let formData: Record<string, any> = $state({ ...section.config });
	let formRef: DynamicForm | undefined = $state();
	let saving = $state(false);
	let error  = $state('');

	const resolvedSchema = $derived(
		(template?.schemaDefinition ?? []).map(f => ({
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
		resolvedSchema.every(f => {
			if (!isFieldVisible(f, resolvedSchema)) return true;
			if (!f.required) return true;
			if (f.type === 'image') return formData[f.field] || formRef?.hasPendingFile(f.field);
			return !!formData[f.field];
		})
	);

	async function save() {
		saving = true; error = '';
		try {
			if (formRef) await formRef.uploadPendingImages();
			if (formRef) formRef.syncAutoValues();

			const res = await fetch('/api/admin/pages', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: section.id, config: formData }),
			});
			if (!res.ok) { const b = await res.json().catch(() => ({ message: 'Update failed' })); throw new Error(b.message); }
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
	title="Edit {template?.name ?? 'Section'}"
	saving={saving}
	{canSave}
	onsave={save}
	ondiscard={onclose}
>
	<div class="flex flex-col gap-4">
		<DynamicForm bind:this={formRef} schema={resolvedSchema} bind:data={formData} {dynamicOptions} {ikEndpoint} templateSlug={template?.slug ?? ''} />

		{#if error}
			<p class="text-xs text-danger m-0">{error}</p>
		{/if}
	</div>
</SidePanel>
