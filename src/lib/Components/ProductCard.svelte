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
		<div class="bg-surface flex h-full min-w-0 w-full flex-col items-center justify-end gap-4 sm:rounded-lg px-5 pt-[4%] pb-16">
			<!-- Main image -->
			<img
				class="{imgHeight} object-contain"
				src="{base}/{product.mainImagePath}"
				alt={product.name}
			/>

			<!-- Color dots -->
			{#if product.colors && product.colors.length > 0}
				<div class="flex items-center gap-1.5">
					{#each product.colors as color}
						<span
							class="h-3 w-3 shrink-0 rounded-full border border-black/10"
							style="background-color: {color.hex};"
							title={color.name}
						></span>
					{/each}
				</div>
			{/if}

			<!-- Badge tag -->
			{#if product.badgeLabel}
				<span class="text-tag text-xs font-semibold capitalize ">
					{product.badgeLabel}
				</span>
			{/if}

			<!-- Name and price -->
			<div class="min-w-0 flex flex-col items-center gap-1">
				<span class="min-h-16 text-center text-sm tracking-wider hover:underline md:text-base">
					{product.name}
				</span>
				<div class="flex items-center flex-wrap justify-center gap-1">
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