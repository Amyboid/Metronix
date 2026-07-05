<script lang="ts">
	let {
		section,
		templateName,
		configSummary,
		ontoggle,
		ondelete,
		onedit,
	}: {
		section: { id: string; templateSlug: string; order: number; isActive: boolean; config: Record<string, any> };
		templateName: string;
		configSummary: string;
		ontoggle: () => void;
		ondelete: () => void;
		onedit: () => void;
	} = $props();

	let showDelete = $state(false);
</script>

<div class="flex items-center gap-3 p-4 bg-surface border border-subtle rounded-[10px] transition-all {section.isActive ? '' : 'opacity-50'}">
	<!-- Drag handle -->
	<div class="cursor-grab active:cursor-grabbing text-copy-light shrink-0">
		<span class="icon-[lucide--grip-vertical] w-4 h-4"></span>
	</div>

	<!-- Content -->
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2 mb-0.5">
			<span class="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{templateName}</span>
			<span class="text-[11px] text-copy-light">#{section.order}</span>
		</div>
		<p class="text-[13px] text-copy m-0 truncate">{configSummary}</p>
	</div>

	<!-- Actions -->
	<div class="flex items-center gap-1.5 shrink-0">
		<button class="inline-flex items-center justify-center w-7 h-7 rounded-md border border-subtle bg-transparent cursor-pointer text-copy transition-colors hover:bg-surface hover:border-subtle-hover" onclick={onedit} title="Edit config" aria-label="Edit config">
			<span class="icon-[lucide--pencil] w-3.5 h-3.5"></span>
		</button>

		<button
			class="relative w-9 h-5 rounded-full transition-colors cursor-pointer border-none {section.isActive ? 'bg-primary' : 'bg-canvas'}"
			onclick={ontoggle}
			aria-label={section.isActive ? 'Disable section' : 'Enable section'}
		>
			<span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform {section.isActive ? 'translate-x-4' : ''}"></span>
		</button>

		<button class="inline-flex items-center justify-center w-7 h-7 rounded-md border border-transparent bg-transparent cursor-pointer text-copy-light transition-colors hover:bg-[#fef2f2] hover:text-danger hover:border-[#fca5a5]" onclick={() => { showDelete = true; }} title="Delete section" aria-label="Delete section">
			<span class="icon-[lucide--trash-2] w-3.5 h-3.5"></span>
		</button>
	</div>
</div>

{#if showDelete}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="fixed inset-0 z-[200] bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-6" onclick={() => { showDelete = false; }} onkeydown={(e) => { if (e.key === 'Escape') showDelete = false; }} role="dialog" tabindex="-1" aria-modal="true">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="bg-neutral border border-subtle rounded-xl p-6 w-full max-w-[400px] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]" onkeydown={(e) => e.stopPropagation()} onclick={(e) => e.stopPropagation()}>
			<h3 class="text-base font-bold text-gray-900 m-0">Delete "{templateName}" section?</h3>
			<p class="text-sm text-copy m-0">This section will be permanently removed from this page. This action cannot be undone.</p>
			<div class="flex gap-2 justify-end">
				<button class="font-inter text-[13px] font-medium py-[7px] px-4 rounded-[7px] border border-subtle bg-transparent text-copy cursor-pointer transition-colors hover:bg-surface" onclick={() => { showDelete = false; }}>Cancel</button>
				<button class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border-none bg-danger text-white cursor-pointer transition-colors hover:bg-[#dc2626]" onclick={() => { showDelete = false; ondelete(); }}>Delete</button>
			</div>
		</div>
	</div>
{/if}
