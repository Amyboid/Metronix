<script lang="ts">
	let { count = 3, height = 'h-8' }: { count?: number; height?: string } = $props();
</script>

<div class="flex flex-col gap-2">
	{#each Array(count) as _}
		<div class="{height} rounded-lg shimmer"></div>
	{/each}
</div>

<style>
	@keyframes shimmer {
		0% { background-position: -400px 0; }
		100% { background-position: 400px 0; }
	}
	.shimmer {
		background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-canvas) 50%, var(--color-surface) 75%);
		background-size: 800px 100%;
		animation: shimmer 1.4s infinite linear;
	}
</style>
