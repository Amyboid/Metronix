<script lang="ts">
	let {
		schema,
		data = $bindable({}),
		dynamicOptions = {},
	}: {
		schema: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string; dependsOn?: string }[];
		data: Record<string, any>;
		dynamicOptions?: Record<string, string[]>;
	} = $props();

	function getFieldOptions(field: any): string[] {
		if (field.source === 'dynamic' && field.dependsOn) {
			const parentVal = data[field.dependsOn] ?? '';
			return dynamicOptions[parentVal] ?? [];
		}
		return field.options ?? [];
	}

	// Force re-render key that changes whenever any dependsOn value changes
	const depKey = $derived(
		schema
			.filter(f => f.dependsOn)
			.map(f => `${f.field}:${data[f.dependsOn] ?? ''}`)
			.join('|')
	);
</script>

<div class="flex flex-col gap-4">
	{#each schema as field (field.field)}
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				{field.label ?? field.field}
				{#if field.required}<span class="text-danger">*</span>{/if}
			</span>

			{#if field.type === 'text'}
				<input
					class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
					bind:value={data[field.field]}
					placeholder={field.label ?? field.field}
				/>
			{:else if field.type === 'number'}
				<input
					type="number"
					class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
					bind:value={data[field.field]}
					placeholder="0"
				/>
			{:else if field.type === 'select'}
				{#key depKey}
					<select
						class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none cursor-pointer transition-colors w-full box-border focus:border-primary"
						bind:value={data[field.field]}
					>
						<option value="">Select…</option>
						{#each getFieldOptions(field) as opt}
							<option value={opt}>{opt}</option>
						{/each}
					</select>
				{/key}
			{/if}
		</label>
	{/each}
</div>
