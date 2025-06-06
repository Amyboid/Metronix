<script>
	let { children } = $props();
	import '../app.css';
	import Nav from '$lib/Components/Nav.svelte';
	import Footer from '$lib/Components/Footer.svelte';
</script>

<div class="relative z-100 h-max w-full">
	<Nav />
</div>
<main
	class="relative flex min-h-[100vh] w-full flex-col items-center bg-[var(--neutral)] pt-[65px] sm:pt-[75px] md:pt-[90px]"
>
	{@render children()}
	<Footer/> 
</main>

<style>
	
</style>
