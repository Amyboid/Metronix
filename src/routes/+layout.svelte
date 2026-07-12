<script>
	import '../app.css';
	import Nav from '$lib/Components/Nav.svelte';
	import Footer from '$lib/Components/Footer.svelte';
	import ProductDetailSkeleton from '$lib/Components/skeletons/ProductDetailSkeleton.svelte';
	import { page, navigating } from '$app/state';
	import { afterNavigate } from '$app/navigation';

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

	let showDetailSkeleton = $state(false);

	$effect(() => {
		const to = navigating?.to?.url?.pathname ?? '';
		if (to.startsWith('/products/details/')) {
			showDetailSkeleton = true;
		}
	});

	afterNavigate(() => {
		showDetailSkeleton = false;
	});
</script>

{#if !user && !isAdmin}
	<Nav {navLinks} />
{/if}

<main
	class="scroll-smooth relative flex min-h-[100vh] w-full flex-col items-center bg-neutral"
>
	{#if showDetailSkeleton}
		<ProductDetailSkeleton />
	{:else}
		{@render children()}
	{/if}
	{#if !isAdmin}
		<Footer />
	{/if}
</main>
