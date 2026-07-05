<script lang="ts">
	let {
		label = '',
		value = '',
		hint = '',
		loading = false,
		color = '',
		onClick
	}: {
		label?: string;
		value?: string | number;
		hint?: string;
		loading?: boolean;
		color?: string;
		onClick?: () => void;
	} = $props();
</script>

{#if onClick}
	<button
		class="glass-card group cursor-pointer text-left w-full"
		onclick={onClick}
	>
		<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light">{label}</span>
		<span class="text-[1.5rem] md:text-[2rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 {color || 'text-[#1a1a1a]'} {loading ? 'shimmer-text' : ''}">
			{loading ? '—' : value}
		</span>
		{#if hint}
			<span class="text-[11px] text-copy-light mt-0.5">{hint}</span>
		{/if}
	</button>
{:else}
	<div class="glass-card group">
		<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light">{label}</span>
		<span class="text-[1.5rem] md:text-[2rem] font-extrabold tracking-[-0.04em] leading-none mt-1.5 {color || 'text-[#1a1a1a]'} {loading ? 'shimmer-text' : ''}">
			{loading ? '—' : value}
		</span>
		{#if hint}
			<span class="text-[11px] text-copy-light mt-0.5">{hint}</span>
		{/if}
	</div>
{/if}
