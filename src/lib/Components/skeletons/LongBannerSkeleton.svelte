<section class="mb-10 px-4 md:px-[8%]">
	<div class="w-full h-[300px] md:h-[400px] rounded-2xl bg-surface shimmer"></div>
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
