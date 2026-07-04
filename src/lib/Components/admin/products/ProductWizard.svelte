<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import Step1BasicInfo from './steps/Step1BasicInfo.svelte';
	import Step2Pricing from './steps/Step2Pricing.svelte';
	import Step3Details from './steps/Step3Details.svelte';
	import Step4Variants from './steps/Step4Variants.svelte';
	import Step5Publish from './steps/Step5Publish.svelte';
	import type { ProductFormData, CatalogOption } from './wizard/types';
	import { validateStep, STEP_LABELS } from './wizard/validation';
	import { submitProduct } from './wizard/save';

	let { slug = null }: { slug?: string | null } = $props();

	const isEdit = $derived(slug !== null);
	let currentStep = $state(1);
	let saving = $state(false);
	let error = $state('');
	let productId = $state('');

	let data = $state<ProductFormData>({
		name: '', slug: '', brand: '', description: '',
		categorySlug: '', productType: '',
		promotionTag: null, badgeTag: null,
		price: null, discountPrice: null, offers: [], whatsappMsg: '',
		specifications: [], inTheBox: [],
		stockStatus: 'in_stock', isHero: false,
		variants: [],
		heroDesktopPath: '', heroDesktopFileId: '',
		heroMobilePath: '', heroMobileFileId: '',
		isPublished: false
	});

	let brandOptions: CatalogOption[] = $state([]);
	let categoryOptions: CatalogOption[] = $state([]);
	let typeOptions: CatalogOption[] = $state([]);
	let ikEndpoint = $state('');
	let step4FileState: { hasNewMain: boolean; newGalleryCount: number }[] = $state([]);
	let availableColors: { hex: string; name: string }[] = $state([]);
	let originalData = $state<string>('');

	const hasChanges = $derived(() => {
		if (!isEdit) return true;
		const hasPendingFiles = data.variants.some(
			(v) => (v as any)._pendingMainFile || (v as any)._pendingGalleryFiles?.length
		) || (data as any)._pendingHeroDesktopFile || (data as any)._pendingHeroMobileFile;
		if (hasPendingFiles) return true;
		const current = JSON.stringify({
			name: data.name, slug: data.slug, brand: data.brand,
			description: data.description, categorySlug: data.categorySlug,
			productType: data.productType, promotionTag: data.promotionTag,
			badgeTag: data.badgeTag, price: data.price, discountPrice: data.discountPrice,
			offers: data.offers, whatsappMsg: data.whatsappMsg,
			specifications: data.specifications, inTheBox: data.inTheBox,
			stockStatus: data.stockStatus, isHero: data.isHero,
			heroDesktopPath: data.heroDesktopPath, heroMobilePath: data.heroMobilePath,
			isPublished: data.isPublished,
			variants: data.variants.map((v) => ({
				colorName: v.colorName, hex: v.hex,
				mainImagePath: v.mainImagePath, galleryPaths: v.galleryPaths,
			})),
		});
		return current !== originalData;
	});

	async function loadCatalogOptions() {
		try {
			const res = await fetch('/api/admin/catalog');
			if (res.ok) {
				const d = await res.json();
				brandOptions = d.brands ?? [];
				categoryOptions = d.categories ?? [];
				typeOptions = d.productTypes ?? [];
			}
		} catch { /* ignore */ }
	}

	async function loadIKEndpoint() {
		try {
			const auth = await fetch('/api/admin/imagekit-auth').then((r) => r.json());
			if (auth?.urlEndpoint) ikEndpoint = auth.urlEndpoint;
		} catch { /* ignore */ }
	}

	async function loadProduct() {
		if (!slug) return;
		try {
			const res = await fetch(`/api/admin/products?slug=${slug}`);
			if (!res.ok) throw new Error('Failed to load product');
			const result = await res.json();
			const p = result.items?.[0];
			if (p) {
				productId = p.id;
				data = {
					name: p.name ?? '', slug: p.slug ?? '', brand: p.brand ?? '',
					description: p.description ?? '', categorySlug: p.categorySlug ?? '',
					productType: p.productType ?? '',
					promotionTag: p.promotionTag ?? null, badgeTag: p.badgeTag ?? null,
					price: p.price ?? null, discountPrice: p.discountPrice ?? null,
					offers: p.offers ?? [], whatsappMsg: p.whatsappMsg ?? '',
					specifications: p.specifications ?? [], inTheBox: p.inTheBox ?? [],
					stockStatus: p.stockStatus ?? 'in_stock', isHero: p.isHero ?? false,
					variants: p.variants ?? [],
					heroDesktopPath: p.heroDesktopPath ?? '',
					heroDesktopFileId: p.heroDesktopFileId ?? '',
					heroMobilePath: p.heroMobilePath ?? '',
					heroMobileFileId: p.heroMobileFileId ?? '',
					isPublished: p.isPublished ?? false
				};
				originalData = JSON.stringify({
					name: data.name, slug: data.slug, brand: data.brand,
					description: data.description, categorySlug: data.categorySlug,
					productType: data.productType, promotionTag: data.promotionTag,
					badgeTag: data.badgeTag, price: data.price, discountPrice: data.discountPrice,
					offers: data.offers, whatsappMsg: data.whatsappMsg,
					specifications: data.specifications, inTheBox: data.inTheBox,
					stockStatus: data.stockStatus, isHero: data.isHero,
					heroDesktopPath: data.heroDesktopPath, heroMobilePath: data.heroMobilePath,
					isPublished: data.isPublished,
					variants: data.variants.map((v: any) => ({
						colorName: v.colorName, hex: v.hex,
						mainImagePath: v.mainImagePath, galleryPaths: v.galleryPaths,
					})),
				});
			}
		} catch (e: any) {
			error = e.message ?? 'Failed to load product';
		}
	}

	$effect(() => {
		Promise.all([loadCatalogOptions(), loadIKEndpoint(), loadProduct()]);
	});

	async function loadAvailableColors() {
		if (!data.brand || !data.productType) { availableColors = []; return; }
		try {
			const params = new URLSearchParams({ brand: data.brand, productType: data.productType });
			const res = await fetch(`/api/admin/colors?${params}`);
			if (res.ok) {
				const d = await res.json();
				availableColors = (d.items ?? []).map((c: any) => ({ hex: c.hex, name: c.name }));
			}
		} catch { availableColors = []; }
	}

	$effect(() => {
		if (data.brand && data.productType) loadAvailableColors();
	});

	function addVariant() {
		data.variants = [
			...data.variants,
			{ colorName: '', hex: '#000000', mainImagePath: '', mainFileId: '', galleryPaths: [], galleryFileIds: [] }
		];
	}

	function removeVariant(index: number) {
		data.variants = data.variants.filter((_: any, i: number) => i !== index);
		step4FileState = step4FileState.filter((_: any, i: number) => i !== index);
	}

	function goBack() {
		adminNav.navigate({ tab: 'products', view: 'list' });
	}

	function goToStep(step: number) {
		if (step === currentStep) return;
		if (isEdit) {
			currentStep = step;
			error = '';
			return;
		}
		if (step < currentStep) {
			currentStep = step;
			error = '';
		}
	}

	function nextStep() {
		if (currentStep >= 5) return;
		const result = validateStep(currentStep, data, step4FileState, availableColors);
		if (!result.valid) {
			error = result.error ?? 'Please fix the errors before continuing';
			return;
		}
		error = '';
		currentStep++;
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
			error = '';
		}
	}

	async function save() {
		// Validate ALL steps before saving
		for (let step = 1; step <= 5; step++) {
			const result = validateStep(step, data, step4FileState, availableColors);
			if (!result.valid) {
				error = `Step ${step} (${STEP_LABELS[step - 1]}): ${result.error}`;
				currentStep = step;
				return;
			}
		}

		saving = true;
		error = '';
		try {
			const result = await submitProduct(data, productId);
			if (!result.ok) throw new Error(result.error ?? 'Save failed');
			adminNav.navigate({ tab: 'products', view: 'list' });
		} catch (e: any) {
			error = e.message ?? 'Save failed';
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col">
	<!-- Header -->
	<div class="border-subtle bg-neutral shrink-0 border-b px-6 py-3">
		<h1 class="text-[15px] font-bold text-[#1a1a1a] m-0">
			{isEdit ? 'Edit Product' : 'New Product'}
		</h1>
	</div>

	<!-- Step indicator -->
	<div class="border-subtle bg-neutral shrink-0 border-b px-6 py-3">
		<div class="flex items-center gap-2">
			{#each [1, 2, 3, 4, 5] as step}
				{@const canNavigate = isEdit || step <= currentStep}
				<button
					class="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 transition-colors {step === currentStep
						? 'text-primary'
						: canNavigate
							? 'text-green-600 hover:text-green-700'
							: 'text-copy-light'}"
					onclick={() => goToStep(step)}
					disabled={!canNavigate}
				>
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors {step === currentStep
							? 'bg-primary text-white'
							: canNavigate
								? 'bg-green-600 text-white'
								: 'bg-canvas text-copy-light'}"
					>
						{#if step < currentStep}
							<span class="icon-[lucide--check] h-3 w-3"></span>
						{:else}
							{step}
						{/if}
					</span>
					<span class="text-[13px] font-medium hidden sm:inline">
						{STEP_LABELS[step - 1]}
					</span>
				</button>
				{#if step < 5}
					<div
						class="h-px flex-1 max-w-[40px] {step < currentStep ? 'bg-green-600' : 'bg-canvas'}"
					></div>
				{/if}
			{/each}
		</div>
	</div>

	{#if error}
		<div
			class="mx-6 mt-3 text-danger rounded-lg border border-[#fca5a5] bg-[#fef2f2] px-3.5 py-2.5 text-[13px]"
		>
			{error}
		</div>
	{/if}

	<!-- Step content -->
	<div class="flex-1 overflow-y-auto px-6 py-5">
		{#if currentStep === 1}
			<Step1BasicInfo
				bind:data
				{brandOptions}
				{categoryOptions}
				{typeOptions}
			/>
		{:else if currentStep === 2}
			<Step2Pricing bind:data />
		{:else if currentStep === 3}
			<Step3Details bind:data />
		{:else if currentStep === 4}
			<Step4Variants
				bind:data
				{ikEndpoint}
				{addVariant}
				{removeVariant}
				bind:fileState={step4FileState}
			/>
		{:else if currentStep === 5}
			<Step5Publish
				bind:data
				{isEdit}
				{ikEndpoint}
				{saving}
				canSave={hasChanges()}
				onsave={save}
			/>
		{/if}
	</div>

	<!-- Footer nav -->
	<div class="border-subtle bg-neutral shrink-0 border-t px-6 py-3">
		<div class="flex items-center justify-between">
			{#if currentStep > 1}
				<button
					class="font-inter border-subtle text-copy hover:bg-surface cursor-pointer rounded-[7px] border bg-transparent px-4 py-[7px] text-[13px] font-medium transition-colors"
					onclick={prevStep}
				>
					Back
				</button>
			{:else}
				<div></div>
			{/if}

			{#if currentStep < 5}
				<button
					class="font-inter border-none text-primary hover:bg-primary/10 cursor-pointer rounded-[7px] bg-transparent px-5 py-[7px] text-[13px] font-semibold transition-colors"
					onclick={nextStep}
				>
					Next
				</button>
			{/if}
		</div>
	</div>
</div>
