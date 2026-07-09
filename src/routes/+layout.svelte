<script>
	import '../app.css';
	import Nav from '$lib/Components/Nav.svelte';
	import Footer from '$lib/Components/Footer.svelte';
	import { page } from '$app/state';
	let navLinks = [
		{ name: 'Admin', link: '/admin' },
		{ name: 'Home', link: '/' },
		{ name: 'Products', link: '/products' },
		{ name: 'About Us', link: '/about' },
		{ name: 'Contact Us', link: '/contact' }
	];
	let { children, data } = $props();

	const user = $derived(data.user);
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
</script>

{#if !user && !isAdmin}
	<Nav {navLinks} />
{/if}

<main
	class="scroll-smooth relative flex min-h-[100vh] w-full flex-col items-center bg-neutral"
>
	{@render children()}
	{#if !isAdmin}
		<Footer />
	{/if}
</main>