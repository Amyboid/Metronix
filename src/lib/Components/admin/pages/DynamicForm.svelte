<script lang="ts">
	import { uploadToIK, ikUrl } from '$lib/utils/imagekit';

	let {
		schema,
		data = $bindable({}),
		dynamicOptions = {},
		ikEndpoint = '',
		templateSlug = '',
	}: {
		schema: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string; dependsOn?: string; showWhen?: string; folder?: string; disabled?: boolean; autoFrom?: string[]; tagType?: string }[];
		data: Record<string, any>;
		dynamicOptions?: Record<string, string[]>;
		ikEndpoint?: string;
		templateSlug?: string;
	} = $props();

	let pendingFiles: Record<string, File> = $state({});
	let pendingPreviews: Record<string, string> = $state({});
	let uploadingFields: Record<string, boolean> = $state({});

	// Product search state (per field)
	let searchStates: Record<string, { query: string; results: { slug: string; name: string; price: number }[]; loading: boolean }> = $state({});
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

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

	function isFieldVisible(field: any): boolean {
		if (!field.dependsOn) return true;
		const parentField = schema.find(f => f.field === field.dependsOn);
		if (parentField && !isFieldVisible(parentField)) return false;
		if (!field.showWhen) return true;
		return data[field.dependsOn] === field.showWhen;
	}

	// Auto-generate CTA link from autoFrom fields
	function getAutoValue(field: any): string {
		if (!field.autoFrom?.length) return '';

		// Detect mode field (value is 'single' or 'batch')
		const modeFieldName = field.autoFrom.find((f: string) => data[f] === 'single' || data[f] === 'batch');
		if (modeFieldName) {
			if (data[modeFieldName] === 'single') {
				// Single mode: use product slug field → /product/details/{slug}
				const prefix = modeFieldName.replace('Mode', '');
				const productField = prefix + 'ProductName';
				return data[productField] ? '/products/details/' + data[productField] : '';
			}
			// Batch mode: use linkTo + linkValue → /products/{value}
			const prefix = modeFieldName.replace('Mode', '');
			const linkValue = data[prefix + 'LinkValue'];
			return linkValue ? '/products/' + linkValue : '';
		}

		// Fallback: no mode field, join last values as listing URL
		const parts = field.autoFrom.map((f: string) => data[f] ?? '').filter(Boolean);
		return parts.length ? '/products/' + parts[parts.length - 1] : '';
	}

	// Product search (per field)
	function ensureSearchState(field: string) {
		if (!searchStates[field]) searchStates[field] = { query: '', results: [], loading: false };
	}

	function onSearchInput(field: any, e: Event) {
		const input = e.target as HTMLInputElement;
		ensureSearchState(field.field);
		searchStates[field.field].query = input.value;
		if (searchTimeout) clearTimeout(searchTimeout);
		if (!input.value.trim()) { searchStates[field.field].results = []; return; }
		const fieldName = field.field;
		searchTimeout = setTimeout(async () => {
			ensureSearchState(fieldName);
			searchStates[fieldName].loading = true;
			try {
				const res = await fetch(`/api/admin/products?search=${encodeURIComponent(input.value)}&limit=8`);
				if (res.ok) {
					const d = await res.json();
					searchStates[fieldName].results = (d.items ?? []).map((p: any) => ({ slug: p.slug, name: p.name, price: p.price }));
				}
			} catch { /* ignore */ }
			finally { searchStates[fieldName].loading = false; }
		}, 300);
	}

	function selectProduct(field: any, product: { slug: string; name: string; price: number }) {
		ensureSearchState(field.field);
		data[field.field] = product.slug;
		data[field.field + '_name'] = product.name;
		data[field.field + '_price'] = product.price;
		searchStates[field.field].query = product.name;
		searchStates[field.field].results = [];
	}

	function selectImage(field: any, e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (pendingPreviews[field.field]) URL.revokeObjectURL(pendingPreviews[field.field]);
		pendingFiles[field.field] = file;
		pendingPreviews[field.field] = URL.createObjectURL(file);
		data[field.field] = '';
		data[field.field + 'FileId'] = '';
		input.value = '';
	}

	function removeImage(field: any) {
		if (pendingPreviews[field.field]) URL.revokeObjectURL(pendingPreviews[field.field]);
		delete pendingFiles[field.field];
		delete pendingPreviews[field.field];
		data[field.field] = '';
		data[field.field + 'FileId'] = '';
	}

	export function hasPendingFile(fieldName: string): boolean {
		return fieldName in pendingFiles;
	}

	export function syncAutoValues() {
		for (const field of schema) {
			if (field.disabled && field.autoFrom?.length) {
				const val = getAutoValue(field);
				if (val) data[field.field] = val;
			}
		}
	}

	export async function uploadPendingImages(): Promise<void> {
		for (const [fieldName, file] of Object.entries(pendingFiles)) {
			uploadingFields[fieldName] = true;
			try {
				const folder = 'assets/section-templates/' + templateSlug;
				const result = await uploadToIK(file, folder);
				data[fieldName] = result.filePath;
				data[fieldName + 'FileId'] = result.fileId;
			} finally {
				uploadingFields[fieldName] = false;
			}
		}
		for (const url of Object.values(pendingPreviews)) URL.revokeObjectURL(url);
		pendingFiles = {};
		pendingPreviews = {};
	}
</script>

<div class="flex flex-col gap-4">
	{#each schema as field (field.field)}
		{#if isFieldVisible(field)}
			<label class="flex flex-col gap-[5px]">
				<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
					{field.label ?? field.field}
					{#if field.required}<span class="text-danger">*</span>{/if}
				</span>

				{#if field.type === 'text'}
					<input
						class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
						class:opacity-50={field.disabled}
						class:cursor-not-allowed={field.disabled}
						value={field.disabled ? (getAutoValue(field) || '—') : (data[field.field] ?? '')}
						oninput={field.disabled ? undefined : (e) => { data[field.field] = (e.target as HTMLInputElement).value; }}
						placeholder={field.label ?? field.field}
						readonly={field.disabled}
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
			{:else if field.type === 'product-search'}
				{@const ss = searchStates[field.field] ?? { query: '', results: [], loading: false }}
				<div class="relative">
					<input
						class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
						value={data[field.field + '_name'] ?? ss.query}
						oninput={(e) => onSearchInput(field, e)}
						placeholder="Search products…"
					/>
					{#if ss.results.length > 0}
						<div class="absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
							{#each ss.results as product}
								<button
									class="w-full text-left px-3 py-2 hover:bg-surface-hover text-[13px] border-none bg-transparent cursor-pointer transition-colors"
									onclick={() => selectProduct(field, product)}
								>
									<span class="font-medium text-copy">{product.name}</span>
									<span class="text-copy-light ml-2">₹{product.price?.toLocaleString('en-IN')}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				{:else if field.type === 'image'}
					<div class="flex items-start gap-3">
						{#if pendingPreviews[field.field] || data[field.field]}
							<div class="relative">
								<img
									src={pendingPreviews[field.field] || (ikUrl(data[field.field], ikEndpoint, 'w-200,h-100,fo-auto') ?? '')}
									alt={field.label}
									class="h-20 w-40 object-cover rounded-md border border-subtle"
								/>
								{#if !pendingPreviews[field.field]}
									<span class="absolute top-1 left-1 rounded bg-primary px-1 py-px text-[9px] font-bold text-white">SAVED</span>
								{/if}
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
								<input type="file" accept="image/*" class="hidden" onchange={(e) => selectImage(field, e)} />
								<span class="icon-[lucide--image-plus] h-5 w-5 text-copy-light"></span>
								<span class="mt-1 text-[10px] text-copy-light">Upload</span>
							</label>
						{/if}
					</div>
				{/if}
			</label>
		{/if}
	{/each}
</div>
