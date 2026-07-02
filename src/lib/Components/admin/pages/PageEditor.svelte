<script lang="ts">
	import { onMount } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import SectionCard from './SectionCard.svelte';
	import AddSectionModal from './AddSectionModal.svelte';
	import EditSectionModal from './EditSectionModal.svelte';
	import { adminNav } from '$lib/stores/adminNav';

	let { pageName }: { pageName: string } = $props();

	type Section = {
		id:           string;
		pageName:     string;
		templateSlug: string;
		order:        number;
		priority:     string;
		dataSource:   string;
		config:       Record<string, any>;
		isActive:     boolean;
	};

	type Template = {
		slug:             string;
		name:             string;
		schemaDefinition: { field: string; type: string; label?: string; required?: boolean; options?: string[]; source?: string }[];
	};

	let sections:  Section[] = $state([]);
	let templates: Template[] = $state([]);
	let loading    = $state(true);
	let listError  = $state('');
	let showAddModal = $state(false);
	let editingSection: Section | null = $state(null);

	let categoryOptions: string[] = $state([]);
	let productTypeOptions: string[] = $state([]);

	const flipDurationMs = 200;

	async function load() {
		loading = true; listError = '';
		try {
			const [sectionsRes, templatesRes] = await Promise.all([
				fetch(`/api/admin/pages?pageName=${pageName}`),
				fetch('/api/admin/pages?templates=true'),
			]);
			if (!sectionsRes.ok) throw new Error(await sectionsRes.text());
			const sData = await sectionsRes.json();
			const tData = await templatesRes.json();
			sections = sData.sections;
			templates = tData.templates;
		} catch (e: any) {
			listError = e.message ?? 'Failed to load';
		} finally {
			loading = false;
		}
	}

	async function loadDynamicOptions() {
		try {
			const res = await fetch('/api/admin/catalog');
			if (res.ok) {
				const d = await res.json();
				categoryOptions = (d.categories ?? []).map((c: any) => c.slug);
				productTypeOptions = (d.productTypes ?? []).map((t: any) => t.slug);
			}
		} catch { /* ignore */ }
	}

	onMount(async () => {
		await load();
		await loadDynamicOptions();
	});

	function handleDndConsider(e: CustomEvent) {
		sections = e.detail.items;
	}

	async function handleDndFinalize(e: CustomEvent) {
		sections = e.detail.items.map((s, i) => ({ ...s, order: i + 1 }));
		const reorder = sections.map((s) => ({ id: s.id, order: s.order }));
		try {
			const res = await fetch('/api/admin/pages', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reorder, pageName }),
			});
			if (!res.ok) throw new Error(await res.text());
		} catch (e: any) {
			listError = e.message ?? 'Reorder failed';
			await load();
		}
	}

	async function toggleActive(section: Section) {
		try {
			const res = await fetch('/api/admin/pages', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: section.id, isActive: !section.isActive }),
			});
			if (!res.ok) throw new Error(await res.text());
			sections = sections.map(s => s.id === section.id ? { ...s, isActive: !s.isActive } : s);
		} catch (e: any) {
			listError = e.message ?? 'Update failed';
		}
	}

	async function deleteSection(section: Section) {
		try {
			const res = await fetch(`/api/admin/pages?id=${section.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			sections = sections.filter(s => s.id !== section.id);
		} catch (e: any) {
			listError = e.message ?? 'Delete failed';
		}
	}

	function onSectionAdded() {
		showAddModal = false;
		load();
	}

	function onSectionEdited() {
		editingSection = null;
		load();
	}

	function getTemplateName(slug: string) {
		return templates.find(t => t.slug === slug)?.name ?? slug;
	}

	function getTemplate(slug: string) {
		return templates.find(t => t.slug === slug);
	}

	function getConfigSummary(config: Record<string, any>) {
		const parts: string[] = [];
		if (config.heading) parts.push(config.heading);
		if (config.categorySlug) parts.push(config.categorySlug);
		if (config.tag) parts.push(config.tag);
		if (config.limit) parts.push(`limit: ${config.limit}`);
		return parts.join(' · ') || 'No config';
	}
</script>

{#if showAddModal}
	<AddSectionModal
		{pageName}
		{templates}
		{categoryOptions}
		{productTypeOptions}
		onsaved={onSectionAdded}
		onclose={() => { showAddModal = false; }}
	/>
{/if}

{#if editingSection}
	<EditSectionModal
		section={editingSection}
		template={getTemplate(editingSection.templateSlug)}
		{categoryOptions}
		{productTypeOptions}
		onsaved={onSectionEdited}
		onclose={() => { editingSection = null; }}
	/>
{/if}

<section class="flex flex-col gap-5 px-6 py-5">
	<div class="flex items-start justify-between gap-3">
		<div>
			<button class="flex items-center gap-1.5 text-[13px] text-copy-light cursor-pointer bg-transparent border-none font-inter mb-1 hover:text-copy transition-colors" onclick={() => adminNav.navigate({ tab: 'pages', view: 'list' })}>
				<span class="icon-[lucide--arrow-left] w-3.5 h-3.5"></span> Pages
			</button>
			<h2 class="text-base font-bold text-gray-900 mb-0.5">{pageName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
			<p class="text-[13px] text-copy-light m-0">Drag to reorder. Toggle to enable/disable sections.</p>
		</div>
		<button class="font-inter text-[13px] font-semibold py-[7px] px-3.5 rounded-[7px] border border-primary bg-transparent text-primary cursor-pointer whitespace-nowrap transition-colors shrink-0 hover:bg-primary hover:text-white" onclick={() => { showAddModal = true; }}>
			+ Add Section
		</button>
	</div>

	{#if listError}
		<div class="bg-[#fef2f2] border border-[#fca5a5] rounded-lg py-2.5 px-3.5 text-[13px] text-danger">{listError}</div>
	{/if}

	{#if loading}
		<div class="flex flex-col gap-3">
			{#each Array(3) as _}
				<div class="h-20 rounded-[10px] shimmer"></div>
			{/each}
		</div>
	{:else if sections.length === 0}
		<div class="py-8 text-center text-sm text-copy-light border border-dashed border-subtle rounded-[10px]">No sections yet. Add one above.</div>
	{:else}
		<div
			use:dndzone={{ items: sections, flipDurationMs, type: 'sections' }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
			class="flex flex-col gap-3"
		>
			{#each sections as section (section.id)}
				<SectionCard
					{section}
					templateName={getTemplateName(section.templateSlug)}
					configSummary={getConfigSummary(section.config)}
					ontoggle={() => toggleActive(section)}
					ondelete={() => deleteSection(section)}
					onedit={() => { editingSection = section; }}
				/>
			{/each}
		</div>
	{/if}
</section>

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
</style>
