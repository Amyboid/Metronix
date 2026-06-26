<script lang="ts">
	import { fly, fade } from 'svelte/transition';

	let { open = false, title = '', saving = false, canSave = true, onsave, ondiscard, children }: {
		open?: boolean;
		title?: string;
		saving?: boolean;
		canSave?: boolean;
		onsave?: () => void;
		ondiscard?: () => void;
		children?: any;
	} = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-[200] flex justify-end" transition:fade={{ duration: 200 }} role="dialog" aria-modal="true" onkeydown={(e) => { if (e.key === 'Escape') ondiscard?.(); }}>
		<button type="button" class="absolute inset-0 bg-black/35 backdrop-blur-[2px] border-none cursor-default" onclick={ondiscard} aria-label="Close panel"></button>

		<div
			class="relative h-full w-full max-w-[520px] bg-neutral border-l border-subtle flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.12)]"
			transition:fly={{ x: 520, duration: 300 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 h-[var(--spacing-nav)] min-h-[var(--spacing-nav)] border-b border-subtle shrink-0">
				<h2 class="text-[15px] font-bold text-[#1a1a1a] m-0">{title}</h2>
				<button class="flex items-center justify-center w-8 h-8 rounded-md border border-subtle bg-transparent cursor-pointer text-copy-light transition-colors hover:bg-surface hover:text-copy" onclick={ondiscard} aria-label="Close">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
				{@render children?.()}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-subtle shrink-0">
				<button class="font-inter text-[13px] font-medium py-[7px] px-4 rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={ondiscard} disabled={saving}>
					Discard
				</button>
				<button class="font-inter text-[13px] font-semibold py-[7px] px-5 rounded-[7px] border-none bg-primary text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onclick={onsave} disabled={saving || !canSave}>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</div>
	</div>
{/if}
