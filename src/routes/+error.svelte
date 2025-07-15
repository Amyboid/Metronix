<script>
	import { page } from '$app/state';
</script>

<div class="flex w-full flex-col items-center justify-center gap-3 md:gap-4 p-12">
	<h2 class="text-2xl font-bold">oops!</h2>
	<h1 class="text-8xl font-bold md:text-9xl">404</h1>
	<p class="text-center text-base md:text-lg">We can't find the page that you're looking for.</p>
	<div class="flex">
		<a href="/">
			<button
			class="font-semibold bg-accent mt-6 flex cursor-pointer items-center justify-center rounded-lg p-3 px-4 sm:mt-10 sm:px-4 text-sm sm:text-base"
			>
			BACK TO HOME
		</button>
	</a>
	</div>
</div>

<style>
	
	button {
		border: 3px solid #0a98ae;
	}
</style>
