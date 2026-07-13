<script>
	const { cardDetails, editable = false, fieldKey = '' } = $props();
</script>

<div class="contact-card flex w-full items-center gap-3 sm:gap-4">
	<button
		class=" flex h-10 w-10 items-center justify-center rounded-lg border border-strong p-2"
		aria-label="contact-icon"
	>
		<span class={cardDetails.icon + ' h-5 w-5 sm:h-6 sm:w-6 text-copy'}></span>
	</button>
	<div class="w-full flex flex-col gap-1 sm:gap-2">
		<h1 class="text-base sm:text-lg">{cardDetails.title}</h1>
		{#if editable}
			<span data-editable={fieldKey} class="text-xs sm:text-sm text-copy">{cardDetails.content}</span>
		{:else}
			<span class="text-xs sm:text-sm text-copy">{cardDetails.content}</span>
		{/if}
	</div>
</div>
