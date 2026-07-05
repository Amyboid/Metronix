<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div class="glass-card {className}">
	{@render children?.()}
</div>

<style>
	:global(.glass-card) {
		background: var(--color-surface);
		border: 1px solid var(--color-subtle);
		border-radius: 12px;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		transition: box-shadow 0.2s ease;
		min-width: 0;
		overflow: hidden;
	}
	:global(.glass-card:hover) {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
	}
	@media (min-width: 768px) {
		:global(.glass-card) {
			background: rgba(255, 255, 255, 0.55);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			border-color: rgba(255, 255, 255, 0.5);
		}
	}
</style>
