<script>
	import '../app.css';
	import Nav from '$lib/Components/Nav.svelte';
	import Footer from '$lib/Components/Footer.svelte';
	let navLinks = [
		{ name: 'Admin', link: '/admin' },
		{ name: 'Home', link: '/' },
		{ name: 'Products', link: '/products/' },
		{ name: 'About Us', link: '/about' }
	];
	let { children, data } = $props();

	const user = $derived(data.user);
	const adminProfile = $derived(user);




</script>

{#if !user}
	<Nav {navLinks} adminProfile={null} />
{:else}
	<Nav navLinks={null} {adminProfile}/>
{/if}

<main
	class="scroll-smooth relative flex min-h-[100vh] w-full flex-col items-center bg-neutral"
>
	{@render children()}
	<Footer />
</main> 