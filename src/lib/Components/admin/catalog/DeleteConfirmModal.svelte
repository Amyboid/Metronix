<script lang="ts">
	let {
		open = false,
		entityName = '',
		entityLabel = 'item',
		productCount = 0,
		checking = false,
		onconfirm,
		oncancel,
	}: {
		open?: boolean;
		entityName?: string;
		entityLabel?: string;
		productCount?: number;
		checking?: boolean;
		onconfirm?: (force: boolean) => void;
		oncancel?: () => void;
	} = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-[200] bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-6"
		onclick={oncancel}
		onkeydown={(e) => { if (e.key === 'Escape') oncancel?.(); }}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
	>
		<div
			class="bg-neutral border border-subtle rounded-xl p-6 w-full max-w-[480px] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
			role="document"
			onkeydown={(e) => e.stopPropagation()}
			onclick={(e) => e.stopPropagation()}
		>
			{#if checking}
				<p class="text-sm text-copy m-0">Checking linked products…</p>
			{:else}
				<h3 class="text-base font-bold text-gray-900 m-0">Delete "{entityName}"?</h3>
				{#if productCount > 0}
					<div class="flex gap-2.5 items-start bg-[#fff7ed] border border-[#fed7aa] rounded-lg p-3.5 text-[13px] text-[#92400e]">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-px text-[#f97316]"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
						<span>
							<strong>{productCount} product{productCount !== 1 ? 's' : ''}</strong>
							{productCount !== 1 ? 'are' : 'is'} linked to this {entityLabel}.
							Force deleting will permanently remove all of them and all their ImageKit images. This cannot be undone.
						</span>
					</div>
					<div class="flex gap-2 justify-end flex-wrap">
						<button class="font-inter text-[13px] font-medium py-[7px] px-4 rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={oncancel}>Cancel</button>
						<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border border-subtle bg-surface text-copy cursor-pointer transition-colors hover:bg-canvas" onclick={() => onconfirm?.(false)}>Delete {entityLabel} only</button>
						<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border-none bg-danger text-white cursor-pointer transition-colors hover:bg-[#dc2626]" onclick={() => onconfirm?.(true)}>Force delete + {productCount} product{productCount !== 1 ? 's' : ''}</button>
					</div>
				{:else}
					<p class="text-sm text-copy m-0">This {entityLabel} has no linked products and will be permanently deleted.</p>
					<div class="flex gap-2 justify-end flex-wrap">
						<button class="font-inter text-[13px] font-medium py-[7px] px-4 rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={oncancel}>Cancel</button>
						<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border-none bg-danger text-white cursor-pointer transition-colors hover:bg-[#dc2626]" onclick={() => onconfirm?.(false)}>Delete</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}
