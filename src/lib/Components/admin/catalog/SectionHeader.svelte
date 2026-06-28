<script lang="ts">
	let { title, subtitle, onAdd, addLabel = '+ Add' }: {
		title: string;
		subtitle: string;
		onAdd?: () => void;
		addLabel?: string;
	} = $props();
</script>

<div class="flex items-start justify-between gap-3">
	<div>
		<h2 class="text-base font-bold text-gray-900 mb-0.5">{title}</h2>
		<p class="text-[13px] text-copy-light m-0">{subtitle}</p>
	</div>
	{#if onAdd}
		<button class="font-inter text-[13px] font-semibold py-[7px] px-3.5 rounded-[7px] border border-primary bg-transparent text-primary cursor-pointer whitespace-nowrap transition-colors shrink-0 hover:bg-primary hover:text-white" onclick={onAdd}>
			{addLabel}
		</button>
	{/if}
</div>
