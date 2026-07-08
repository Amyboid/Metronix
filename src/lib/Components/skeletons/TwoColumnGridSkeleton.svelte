<section class="mb-10 px-4 md:px-[8%]">
	<div class="h-8 w-48 rounded-lg bg-surface shimmer mx-auto mb-6"></div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="flex flex-col gap-4">
			<div class="h-48 rounded-xl bg-surface shimmer"></div>
			<div class="h-4 w-3/4 rounded bg-surface shimmer"></div>
		</div>
		<div class="flex flex-col gap-4">
			<div class="h-48 rounded-xl bg-surface shimmer"></div>
			<div class="h-4 w-3/4 rounded bg-surface shimmer"></div>
		</div>
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
