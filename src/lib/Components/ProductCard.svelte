<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { product } = $props();

	const base = env.PUBLIC_ASSET_BASE_URL || '';

	const badgeConfig: Record<string, { label: string; classes: string }> = {
		'new':       { label: 'New',  classes: 'bg-primary text-white'   },
		'on-sale':   { label: 'Sale', classes: 'bg-danger text-white'    },
		'demanding': { label: 'Hot',  classes: 'bg-[#f59e0b] text-white' },
	};
</script>

<div class="h-full w-full rounded-lg">
	<a
		data-sveltekit-reload
		href={'/products/details/' + product.slug}
		class="block h-full w-full no-underline"
	>
		<div class="bg-surface flex h-100 w-full flex-col items-center justify-center gap-4 rounded-lg px-5">
			<!-- Main image -->
			<img
				class="h-50 object-contain"
				src="{base}/{product.mainImagePath}"
				alt={product.name}
			/>

			<!-- Color dots -->
			{#if product.colors && product.colors.length > 0}
				<div class="flex items-center gap-1.5">
					{#each product.colors as color}
						<span
							class="h-3 w-3 flex-shrink-0 rounded-full border border-black/10"
							style="background-color: {color.hex};"
							title={color.name}
						></span>
					{/each}
				</div>
			{/if}

			<!-- Badge tag -->
			{#if product.badgeTag && badgeConfig[product.badgeTag]}
				<span class="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider {badgeConfig[product.badgeTag].classes}">
					{badgeConfig[product.badgeTag].label}
				</span>
			{/if}

			<!-- Name and price -->
			<div class="flex flex-col items-center gap-1">
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

<style>
</style>