<script lang="ts">
	import ImgSlider from '../ImgSlider.svelte';

	let { sectionHeading, data = [], ctaText, linkTo, linkValue } = $props<{
		sectionHeading: string;
		data?: any[];
		ctaText?: string;
		linkTo?: string;
		linkValue?: string;
	}>();
	console.log('Prod: ', ctaText, linkTo, linkValue);

	const ctaLink = $derived('/products/' + (linkValue ?? ''));
	const displayText = $derived(ctaText || 'shop all ' + sectionHeading);
</script>

<section
	class="z-10 mx-auto mb-4 md:mb-10 flex h-auto w-full flex-col items-center justify-center gap-4 md:gap-10 p-0 sm:pt-0 md:w-[85%] md:min-w-300 md:p-6 md:px-12 md:pt-0"
>
	<h1
		class="w-full text-center text-xl font-semibold tracking-wider sm:text-2xl md:text-3xl lg:text-4xl"
	>
		{sectionHeading}
	</h1>

	<ImgSlider images={data} />

	<a
		data-sveltekit-reload
		class="-mt-1 flex items-center tracking-wide sm:text-left"
		href={ctaLink}
	>
		<p class="first-letter:uppercase lowercase text-link hover:underline">{displayText}</p>
		<span class="icon-[cil--arrow-right] text-link ml-2 h-4 w-4"></span>
	</a>
</section>
