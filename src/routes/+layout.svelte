<script>
	import '../app.css';
	import Nav from '$lib/Components/Nav.svelte';
	import Footer from '$lib/Components/Footer.svelte';
	let navLinks = [
		{ name: 'Home', link: '/' },
		{ name: 'Products', link: '/products/all' },
		{ name: 'AboutUs', link: '/about' }
	];
	let { children, data } = $props();

	const user = $derived(data.user);
	const adminProfile = $derived(user)

</script>

<div class="relative z-100 h-max w-full">
	{#if !user}
		<Nav {navLinks} adminProfile={null} />
	{:else}
		<Nav navLinks={null} {adminProfile}/>
	{/if}
</div>
<main
	class="relative flex min-h-[100vh] w-full flex-col items-center bg-[var(--neutral)] pt-[65px] sm:pt-[75px] md:pt-[90px]"
>
	{@render children()}
	<Footer />
</main>

<style>
</style>
