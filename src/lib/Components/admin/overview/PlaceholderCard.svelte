<script lang="ts">
	let { label = '', hint = '', icon = 'icon-[lucide--lock]' }: {
		label?: string;
		hint?: string;
		icon?: string;
	} = $props();
</script>

<div class="glass-card">
	<div class="flex items-center gap-2 mb-2">
		<span class="{icon} w-4 h-4 text-copy-light"></span>
		<span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-copy-light">{label}</span>
	</div>
	<span class="text-[1.25rem] md:text-[1.5rem] font-extrabold tracking-[-0.04em] leading-none text-copy-light">Coming Soon</span>
	<span class="text-[11px] text-copy-light mt-0.5">{hint}</span>
</div>
