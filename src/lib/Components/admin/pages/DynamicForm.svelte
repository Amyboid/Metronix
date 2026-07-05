<script lang="ts">
	import { uploadToIK, ikUrl } from '$lib/utils/imagekit';

	let {
		schema,
		data = $bindable({}),
		dynamicOptions = {},
		ikEndpoint = '',
	}: {
		schema: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string; dependsOn?: string; folder?: string }[];
		data: Record<string, any>;
		dynamicOptions?: Record<string, string[]>;
		ikEndpoint?: string;
	} = $props();

	let uploadingFields: Record<string, boolean> = $state({});

	function getFieldOptions(field: any): string[] {
		if (field.source === 'dynamic' && field.dependsOn) {
			const parentVal = data[field.dependsOn] ?? '';
			return dynamicOptions[parentVal] ?? [];
		}
		return field.options ?? [];
	}

	const depKey = $derived(
		schema
			.filter(f => f.dependsOn)
			.map(f => `${f.field}:${data[f.dependsOn] ?? ''}`)
			.join('|')
	);

	async function uploadImage(field: any, e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploadingFields[field.field] = true;
		try {
			const folder = field.folder || 'assets/section-templates';
			const result = await uploadToIK(file, folder);
			data[field.field] = result.filePath;
			data[`${field.field}FileId`] = result.fileId;
		} catch (err: any) {
			console.error('Upload failed:', err);
		} finally {
			uploadingFields[field.field] = false;
			input.value = '';
		}
	}

	function removeImage(field: any) {
		data[field.field] = '';
		data[`${field.field}FileId`] = '';
	}
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
			{:else if field.type === 'image'}
				<div class="flex items-start gap-3">
					{#if data[field.field]}
						<div class="relative">
							<img
								src={ikUrl(data[field.field], ikEndpoint, 'w-200,h-100,fo-auto') ?? ''}
								alt={field.label}
								class="h-20 w-40 object-cover rounded-md border border-subtle"
							/>
							<button
								class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white border-none cursor-pointer"
								onclick={() => removeImage(field)}
								aria-label="Remove image"
							>
								<span class="icon-[lucide--x] h-3 w-3"></span>
							</button>
						</div>
					{:else}
						<label class="flex h-20 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-subtle bg-neutral transition-colors hover:border-primary">
							<input type="file" accept="image/*" class="hidden" onchange={(e) => uploadImage(field, e)} disabled={uploadingFields[field.field]} />
							{#if uploadingFields[field.field]}
								<span class="h-4 w-4 animate-spin rounded-full border-2 border-subtle border-t-primary"></span>
								<span class="mt-1 text-[10px] text-copy-light">Uploading…</span>
							{:else}
								<span class="icon-[lucide--image-plus] h-5 w-5 text-copy-light"></span>
								<span class="mt-1 text-[10px] text-copy-light">Upload</span>
							{/if}
						</label>
					{/if}
				</div>
			{/if}
		</label>
	{/each}
</div>
