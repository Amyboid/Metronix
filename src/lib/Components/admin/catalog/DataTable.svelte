<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		columns,
		loading = false,
		emptyMessage = 'No items yet.',
		empty = false,
		selectAll = false,
		selectedIds = [],
		onSelectAll,
		onSelect,
		onRowClick,
		children,
	}: {
		columns: { label: string; width?: string; align?: 'left' | 'right' }[];
		loading?: boolean;
		emptyMessage?: string;
		empty?: boolean;
		selectAll?: boolean;
		selectedIds?: string[];
		onSelectAll?: () => void;
		onSelect?: (id: string) => void;
		onRowClick?: (id: string) => void;
		children?: Snippet;
	} = $props();
</script>

{#if loading}
	<div class="flex flex-col">
		{#each Array(5) as _}
			<div class="h-12 shimmer"></div>
		{/each}
	</div>
{:else if empty}
	<div class="py-8 text-center text-sm text-copy-light border border-dashed border-subtle rounded">{emptyMessage}</div>
{:else}
	<table class="w-full min-w-[500px] border-collapse text-[13px]">
		<thead class="sticky top-0 z-20">
			<tr>
				<th class="border-subtle bg-surface z-10 w-10 border px-3 py-2">
					<input
						type="checkbox"
						class="accent-primary cursor-pointer"
						checked={selectAll}
						onchange={onSelectAll}
					/>
				</th>
				{#each columns as col}
					<th class="border-subtle bg-surface text-copy-light z-10 border px-3 py-2 text-{col.align || 'left'} text-[11px] font-bold tracking-wider uppercase whitespace-nowrap {col.width || ''}">
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{@render children?.()}
		</tbody>
	</table>
{/if}

<style>
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	.shimmer {
		background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
	}
</style>
