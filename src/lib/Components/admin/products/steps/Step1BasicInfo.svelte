<script lang="ts">
	import { onMount } from 'svelte';

	let {
		data = $bindable(),
		brandOptions = [],
		categoryOptions = [],
		typeOptions = []
	}: {
		data: any;
		brandOptions: { slug: string; name: string }[];
		categoryOptions: { slug: string; name: string }[];
		typeOptions: { slug: string; name: string; categorySlug?: string }[];
	} = $props();

	let touched = $state<Record<string, boolean>>({});
	let promotionTags: { value: string; label: string }[] = $state([]);
	let badgeTags: { value: string; label: string }[] = $state([]);

	const filteredTypes = $derived(
		data.categorySlug
			? typeOptions.filter((t) => t.categorySlug === data.categorySlug)
			: typeOptions
	);

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/tags');
			if (res.ok) {
				const d = await res.json();
				promotionTags = (d.items ?? []).filter((t: any) => t.type === 'promotion');
				badgeTags = (d.items ?? []).filter((t: any) => t.type === 'badge');
			}
		} catch {
			/* ignore */
		}
	});

	function generateSlug(name: string) {
		return name
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_]+/g, '-');
	}

	function onNameInput() {
		data.slug = generateSlug(data.name);
		touched.name = true;
	}

	function onSlugInput() {
		data.slug = data.slug
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_]+/g, '-');
		touched.slug = true;
	}
</script>

<div class="mx-auto max-w-[640px]">
	<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0 mb-5">Basic Information</h2>

	<div class="flex flex-col gap-5">
		<!-- Name -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Name <span class="text-danger">*</span>
			</span>
			<input
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {touched.name && !data.name.trim()
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.name}
				oninput={onNameInput}
				placeholder="e.g. Galaxy S24 Ultra"
			/>
		</label>

		<!-- Slug -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Slug <span class="text-danger">*</span>
			</span>
			<input
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {touched.slug && !data.slug.trim()
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.slug}
				oninput={onSlugInput}
				placeholder="galaxy-s24-ultra"
			/>
		</label>

		<!-- Brand -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Brand <span class="text-danger">*</span>
			</span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {touched.brand && !data.brand
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.brand}
				onchange={() => (touched.brand = true)}
			>
				<option value="">Select brand</option>
				{#each brandOptions as brand}
					<option value={brand.slug}>{brand.name}</option>
				{/each}
			</select>
		</label>

		<!-- Description -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Description <span class="text-danger">*</span>
			</span>
			<textarea
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border min-h-[100px] resize-y focus:border-primary {touched.description && !data.description.trim()
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.description}
				oninput={() => (touched.description = true)}
				placeholder="Product description…"
				rows="4"
			></textarea>
		</label>

		<!-- Category -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Category <span class="text-danger">*</span>
			</span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {touched.categorySlug && !data.categorySlug
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.categorySlug}
				onchange={() => {
					touched.categorySlug = true;
					data.productType = '';
				}}
			>
				<option value="">Select category</option>
				{#each categoryOptions as cat}
					<option value={cat.slug}>{cat.name}</option>
				{/each}
			</select>
		</label>

		<!-- Product Type (filtered by category) -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">
				Product Type <span class="text-danger">*</span>
			</span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary {touched.productType && !data.productType
					? 'border-danger'
					: 'border-subtle'}"
				bind:value={data.productType}
				onchange={() => (touched.productType = true)}
				disabled={!data.categorySlug}
			>
				<option value="">{data.categorySlug ? 'Select type' : 'Select category first'}</option>
				{#each filteredTypes as type}
					<option value={type.slug}>{type.name}</option>
				{/each}
			</select>
		</label>

		<!-- Promotion Tag -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Promotion Tag</span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
				bind:value={data.promotionTag}
			>
				<option value={null}>None</option>
				{#each promotionTags as tag}
					<option value={tag.value}>{tag.label}</option>
				{/each}
			</select>
		</label>

		<!-- Badge Tag -->
		<label class="flex flex-col gap-[5px]">
			<span class="text-xs font-semibold text-copy uppercase tracking-[0.04em]">Badge Tag</span>
			<select
				class="font-inter text-[13px] py-[7px] px-2.5 border border-subtle rounded-md bg-neutral text-gray-900 outline-none transition-colors w-full box-border focus:border-primary"
				bind:value={data.badgeTag}
			>
				<option value={null}>None</option>
				{#each badgeTags as tag}
					<option value={tag.value}>{tag.label}</option>
				{/each}
			</select>
		</label>
	</div>
</div>
