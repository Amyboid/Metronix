<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import SectionHeader from '../catalog/SectionHeader.svelte';

	type PageEntry = { name: string; label: string };

	const pages: PageEntry[] = [
		{ name: 'products_home', label: 'Products Home' },
	];

	function openPage(page: PageEntry) {
		adminNav.navigate({ tab: 'pages', view: 'update', pageName: page.name });
	}
</script>

<section class="flex flex-col gap-5">
	<SectionHeader title="Pages" subtitle="Manage content sections for each page." />

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each pages as page (page.name)}
			<button
				class="flex flex-col gap-2 p-5 bg-surface border border-subtle rounded-[10px] cursor-pointer transition-all hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:border-subtle-hover text-left group"
				onclick={() => openPage(page)}
			>
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-bold text-gray-900 m-0">{page.label}</h3>
					<span class="icon-[lucide--chevron-right] w-4 h-4 text-copy-light group-hover:text-copy transition-colors"></span>
				</div>
				<p class="text-[13px] text-copy-light m-0">{page.name}</p>
			</button>
		{/each}
	</div>
</section>
