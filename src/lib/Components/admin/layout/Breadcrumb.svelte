<script lang="ts">
	import { adminNav, getBreadcrumbs, getParentView } from '$lib/stores/adminNav';

	const crumbs = $derived(getBreadcrumbs($adminNav));
	const parentView = $derived(getParentView($adminNav));
</script>

<div class="flex items-center gap-3 px-6 py-2.5 min-h-[44px] border-b border-subtle bg-neutral">
	{#if parentView}
		<button
			class="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-inter text-[0.8125rem] font-medium text-copy px-2 py-1 rounded-md transition-colors hover:bg-surface hover:text-[#1a1a1a] whitespace-nowrap"
			onclick={() => parentView && adminNav.navigate(parentView)}
			aria-label="Go back"
		>
			<span class="icon-[lucide--chevron-left] w-4 h-4"></span>
			<span>Back</span>
		</button>
		<span class="w-px h-4 bg-subtle shrink-0" aria-hidden="true"></span>
	{/if}

	<nav class="flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
		{#each crumbs as crumb, i}
			{#if i > 0}
				<span class="text-copy-light text-[0.8125rem] select-none" aria-hidden="true">/</span>
			{/if}
			{#if crumb.view}
				<button
					class="font-inter text-[0.8125rem] bg-transparent border-none cursor-pointer p-0 text-primary font-medium underline underline-offset-2 decoration-transparent transition-[text-decoration-color] hover:decoration-primary"
					onclick={() => crumb.view && adminNav.navigate(crumb.view)}
				>{crumb.label}</button>
			{:else}
				<span class="font-inter text-[0.8125rem] text-copy font-semibold" aria-current="page">{crumb.label}</span>
			{/if}
		{/each}
	</nav>
</div>
