<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		columns,
		loading = false,
		emptyMessage = 'No items yet.',
		empty = false,
		children,
	}: {
		columns: { label: string; width?: string; align?: 'left' | 'right' }[];
		loading?: boolean;
		emptyMessage?: string;
		empty?: boolean;
		children?: Snippet;
	} = $props();
</script>

{#if loading}
	<div class="flex flex-col gap-2 w-full">
		{#each Array(5) as _}
			<div class="w-full h-12 rounded-lg shimmer"></div>
		{/each}
	</div>
{:else if empty}
	<div class="py-8 text-center text-sm text-copy-light border border-dashed border-subtle rounded-[10px]">{emptyMessage}</div>
{:else}
	<div class="border border-subtle rounded-[10px] overflow-hidden overflow-x-auto">
		<table class="w-full border-collapse text-[13px]">
			<thead>
				<tr>
					{#each columns as col}
						<th class="py-2.5 px-3.5 text-{col.align || 'left'} text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap {col.width || ''}">{col.label}</th>
					{/each}
					<th class="py-2.5 px-3.5 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-copy-light border-b border-subtle whitespace-nowrap">Actions</th>
				</tr>
			</thead>
			<tbody>
				{@render children?.()}
			</tbody>
		</table>
	</div>
{/if}

<style>
	@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
	.shimmer { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
	table tbody tr:last-child td { border-bottom: none; }
</style>
