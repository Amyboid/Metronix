<section class="mb-10 px-4 md:px-[8%]">
	<div class="w-full h-64 md:h-80 rounded-2xl bg-surface shimmer"></div>
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
		{#each Array(4) as _}
			<div class="aspect-square rounded-xl bg-surface shimmer"></div>
		{/each}
	</div>
</section>

<style>
	.shimmer {
		background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite;
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
