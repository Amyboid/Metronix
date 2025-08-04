<script>
	import { getImagePath } from "$lib/utils/imageImports";

	let { product } = $props();
	console.log('product at cart', product);
</script>

<div
	class="product-card h-full w-full rounded-lg"
>
	<div
		class="product-card-img flex h-[400px] w-full flex-col items-center justify-center gap-10 rounded-lg pr-5 pl-5 sm:h-[400px] md:h-[400px]"
	>
		<enhanced:img class="h-[200px] object-contain" src={getImagePath(product.src)} alt={product.name}  />
		<div class="flex flex-col items-center">
			<a
				class="min-h-16 text-center text-sm tracking-wider hover:underline md:text-base"
				href="#notimplemented">{product.src}</a
			>
			<div class="flex items-center">
				<span class="icon-[bi--currency-rupee] -ml-1 h-[14px] w-[14px]"></span>
				<span class="flex items-center justify-between text-sm tracking-wider md:text-base">
					{product.src}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.product-card { 
		background-color: transparent; 
	}
	.product-card-img {
		background: linear-gradient(to bottom, #dcd8cd80 0%, #dcd8cde1 60%, #dcd8cd80 100%);
		/* background: var(--primary-background); */
	} 
 
</style>
