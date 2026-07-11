<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { product, imgHeight = 'h-60' } = $props();

	const base = env.PUBLIC_ASSET_BASE_URL || '';
</script>

<div class="h-full w-full rounded-lg">
	<a
		data-sveltekit-reload
		href={'/products/details/' + product.slug}
		class="block h-full w-full no-underline"
	>
		<div
			class="bg-surface flex h-full w-full min-w-0 flex-col items-center justify-between px-10 pt-12 pb-12 sm:rounded-lg"
		>
			<div class="h-[60%]">
				<!-- Main image -->
				<img
					class="h-full object-contain"
					src="{base}/{product.mainImagePath}"
					alt={product.name}
				/>
			</div>
			<div
				class="grid h-[35%] w-full grid-rows-[minmax(1rem,auto)_minmax(1.25rem,auto)_minmax(3rem,1fr)_minmax(1.5rem,auto)] items-start justify-items-center gap-2"
			>
				<!-- Color dots -->
				<div class="flex items-center justify-center gap-1.5">
					{#if product.colors && product.colors.length > 0}
						{#each product.colors as color}
							<span
								class="h-3 w-3 shrink-0 rounded-full border border-black/10"
								style="background-color: {color.hex};"
								title={color.name}
							></span>
						{/each}
					{/if}
				</div>

				<!-- Badge tag -->
				<span class="self-end-safe text-tag text-center text-xs font-semibold capitalize">
					{#if product.badgeLabel}
						{product.badgeLabel}
					{/if}
				</span>

				<!-- Name -->
				<span class="line-clamp-2 text-center text-sm tracking-wider hover:underline md:text-base">
					{product.name}
				</span>

				<!-- Price row -->
				<div class="self-end flex flex-wrap items-center justify-center gap-1">
					<div class="flex items-center">
						<span class="icon-[bi--currency-rupee] -ml-1 h-[14px] w-[14px]"></span>
						{#if product.discountPrice}
							<span class="text-sm font-semibold tracking-wider md:text-base">
								{product.discountPrice.toLocaleString('en-IN')}
							</span>
						{:else}
							<span class="text-sm tracking-wider md:text-base">
								{product.price.toLocaleString('en-IN')}
							</span>
						{/if}
					</div>
					{#if product.discountPrice}
						<span class="text-copy-light text-xs line-through">
							₹{product.price.toLocaleString('en-IN')}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</a>
</div>
