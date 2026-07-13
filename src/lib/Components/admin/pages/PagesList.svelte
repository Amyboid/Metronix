<script lang="ts">
	import { onMount } from 'svelte';
	import { adminNav } from '$lib/stores/adminNav';
	import SectionHeader from '../catalog/SectionHeader.svelte';
	import { pages } from '$lib/contentRegistry';

	type DraftCounts = Record<string, number>;
	let draftCounts = $state<DraftCounts>({});

	onMount(async () => {
		const results = await Promise.all(
			pages
				.filter(p => p.editingMode !== 'sections')
				.map(async (p) => {
					try {
						const res = await fetch(`/api/admin/content?page=${p.name}`);
						if (res.ok) {
							const data = await res.json();
							return [p.name, Object.keys(data.drafts).length] as const;
						}
					} catch {}
					return [p.name, 0] as const;
				})
		);
		draftCounts = Object.fromEntries(results);
	});

	function openPreview(page: typeof pages[number]) {
		window.open(`/admin/preview/${page.name}`, '_blank');
	}

	function openSections(page: typeof pages[number]) {
		adminNav.navigate({ tab: 'pages', view: 'update', pageName: page.name });
	}
</script>

<section class="flex flex-col gap-5 px-6 py-5">
	<SectionHeader title="Pages" subtitle="Manage content for each page." />

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each pages as pg (pg.name)}
			<div class="flex flex-col gap-3 p-5 bg-surface border border-subtle rounded-[10px] transition-all hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:border-subtle-hover">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<h3 class="text-sm font-bold text-gray-900 m-0">{pg.label}</h3>
						{#if draftCounts[pg.name]}
							<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
								{draftCounts[pg.name]} draft{draftCounts[pg.name] > 1 ? 's' : ''}
							</span>
						{/if}
					</div>
					<span class="text-[13px] text-copy-light">{pg.route}</span>
				</div>

				<div class="flex gap-2">
					<button
						class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[13px] font-medium rounded-lg border border-subtle bg-white text-gray-700 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
						onclick={() => openPreview(pg)}
					>
						<span class="icon-[lucide--eye] w-3.5 h-3.5"></span>
						Preview
					</button>

					{#if pg.hasSections}
						<button
							class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[13px] font-medium rounded-lg border border-primary bg-transparent text-primary cursor-pointer transition-all hover:bg-primary hover:text-white"
							onclick={() => openSections(pg)}
						>
							<span class="icon-[lucide--layout-grid] w-3.5 h-3.5"></span>
							Sections
						</button>
					{:else}
						<button
							class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[13px] font-medium rounded-lg border border-subtle bg-gray-50 text-gray-400 cursor-not-allowed"
							disabled
							title="Configure frontend to enable section editing"
						>
							<span class="icon-[lucide--layout-grid] w-3.5 h-3.5"></span>
							Sections
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
