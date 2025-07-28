<script>
	const { cardDetails } = $props();
</script>

<div class="contact-card flex w-full items-center gap-3 sm:gap-4">
	<button
		class=" flex h-10 w-10 items-center justify-center rounded-lg border border-[#6d6d6d] p-2"
		aria-label="contact-icon"
	>
		<span class={cardDetails.icon + ' h-5 w-5 sm:h-6 sm:w-6 text-[#6d6d6d]'}></span>
	</button>
	<div class="w-full flex flex-col gap-1 sm:gap-2">
		<h1 class="text-base sm:text-lg">{cardDetails.title}</h1>
		<span class="text-xs sm:text-sm text-[#6d6d6d]">{cardDetails.content}</span>
	</div>
</div>
