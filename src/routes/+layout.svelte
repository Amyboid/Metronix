<script>
	let { children } = $props();
	import '../app.css';
	import Nav from '$lib/Nav.svelte';
</script>

<div class="relative z-20 h-max w-full">
	<Nav />
</div>
<main
	class="relative flex min-h-[100vh] w-full flex-col items-center overflow-y-scroll bg-[var(--neutral)] pt-[64px] md:pt-[100px]"
>
	{@render children()}
	<footer
	class="flex w-full items-center justify-center bg-[var(--neutral)] p-4 md:p-6"
	>
	<p class="text-xs text-[#9d9d9d] sm:text-sm md:text-sm">
		Copyright &copy; 2025 Meta electronics. All rights reserved.
	</p>
</footer>
</main>

<style>
	footer {
		border-top: 1px solid var(--primary);
	}
</style>
