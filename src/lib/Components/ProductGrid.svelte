<script lang="ts">
	import { env } from '$env/dynamic/public';

	interface Props {
		filterOpen: boolean;
		items: any[];
		expectedOnPage: number;
		isPageChanging: boolean;
		onloadmore: (currentItems: any[], currentExpected: number) => void;
	}

	let { filterOpen, items, expectedOnPage, isPageChanging, onloadmore }: Props = $props();

	let sentinelRef = $state<HTMLElement | null>(null);

	// $effect(() => {
	// 	if (!sentinelRef) return;
	// 	const observer = new IntersectionObserver(
	// 		(entries) => {
	// 			if (entries[0].isIntersecting) {
	// 				// Read items and expectedOnPage fresh at call time
	// 				onloadmore(items, expectedOnPage);
	// 			}
	// 		},
	// 		{ rootMargin: '400px' }
	// 	);
	// 	observer.observe(sentinelRef);
	// 	return () => {
	// 		console.log('observer disconnected...');
	// 		observer.disconnect();
	// 	};
	// });

	const base = env.PUBLIC_ASSET_BASE_URL || '';
</script>

{#snippet itemCard(item: any)}
	<a data-sveltekit-reload href={'/products/details/' + item.slug} aria-label="item-data">
		<div
			class="border-subtle flex flex-col items-center justify-center gap-10 border-r border-b py-6 pr-5 pl-5 {filterOpen
				? 'filter-open-container md:h-100'
				: 'md:h-130'}"
		>
			<img
				class="h-50 {filterOpen ? 'md:h-50' : 'md:h-80'} object-contain"
				src="{base}/assets/{item.mainImagePath}.png"
				alt={item.name}
			/>
			<div class="flex flex-col items-center">
				<span class="min-h-16 text-center text-sm md:text-base">
					{item.name}
				</span>
				<div class="flex items-center">
					<span class="icon-[bi--currency-rupee] -ml-1 h-[14px] w-[14px]"></span>
					<span class="flex items-center justify-between text-sm tracking-wider md:text-base">
						{item.price}
					</span>
				</div>
			</div>
		</div>
	</a>
{/snippet}
<div class="grid-wrapper">
	<!-- Page transition overlay — dims old items instead of wiping them -->
	{#if isPageChanging}
		<div class="page-overlay" aria-hidden="true">
			<span class="loading-text">Loading…</span>
		</div>
	{/if}

	{#if expectedOnPage === 0 && !isPageChanging}
		<div class="empty-state">
			<p>No products found.</p>
			<span>Try adjusting your filters.</span>
		</div>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-3">
			{#each Array(expectedOnPage) as _, i}
				{#if items[i]}
					<div class="grid-item">
						{@render itemCard(items[i])}
					</div>
				{:else}
					<div
						aria-roledescription="skeleton"
						class="border-subtle {filterOpen ? 'md:h-100' : 'md:h-130'} border-r border-b"
					></div>
				{/if}
			{/each}
		</div>

		<!-- Single sentinel, outside the grid, only when more items remain -->
		{#if items.length < expectedOnPage && expectedOnPage > 0}
			<div bind:this={sentinelRef} class="sentinel" aria-hidden="true"></div>
		{/if}
	{/if}
</div>

<style>
	.grid-wrapper {
		position: relative;
		width: 100%;
	}

	/* Page transition overlay */
	.page-overlay {
		position: absolute;
		width: 100%;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-background, --color-accent-ghost) 60%, transparent);
		backdrop-filter: blur(4px);
	}

	.loading-text {
		font-size: 0.875rem;
		color: var(--color-copy-light);
		animation: pulse 1.4s ease-in-out infinite;
	}
	.sentinel {
		height: 1px;
		width: 100%;
	}

	/* Empty state */
	.empty-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 6rem 1rem;
		text-align: center;
		gap: 0.5rem;
	}

	.empty-state p {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-copy);
	}

	.empty-state span {
		font-size: 0.875rem;
		color: var(--color-copy-light);
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
	}

	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
	}

	@media (min-width: 768px) {
		/* ensure each grid cell uses the border on the card/skeleton element, not the wrapper */
		.grid > .grid-item .border-subtle {
			border-right: 1px solid var(--color-subtle);
		}

		/* remove right border from every 3rd item (3rd, 6th, 9th...)
		.grid > .grid-item:nth-child(3n) .border-subtle,
		.grid > .grid-item:nth-child(3n) {
			border-right: none;
		}

		.grid > .grid-item:nth-child(3n + 1) > .filter-open-container.border-subtle {
			border-left: 1px solid var(--color-subtle);
		} */
		.grid > .grid-item:nth-child(3n + 1) {
			border-left: 1px solid var(--color-subtle);
		}
	}
</style>
