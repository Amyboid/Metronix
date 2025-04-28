<script>
	import { fade, fly } from 'svelte/transition'; 
	import { setContext } from 'svelte';
	import HamburgerMenu from './HamburgerMenu.svelte';

	let navLinks = [
		{ name: 'Products', link: '/products/all' },
		{ name: 'About Us', link: '/about' }
	];
	
	let hamburger = $state({ show: false }); 
	setContext('hamburger', hamburger); 
	
</script>

<nav
	class="nav fixed top-0 left-0 flex w-full min-w-80 items-center justify-between bg-[var(--neutral)] p-4 pt-2 pb-2 md:pr-12 md:pl-12"
>
	<!-- left -->
	<a href="/">
		<div class="logo flex flex-col items-end">
			<p class="text-2xl font-bold tracking-wider sm:text-3xl md:text-4xl md:tracking-widest">
				META
			</p>
			<p class="-mt-2 -mr-1 text-xs font-medium sm:text-sm md:text-base">electronics</p>
		</div>
	</a>

	<!-- right -->
	<div class="nav-right flex items-center gap-4 sm:gap-4 md:gap-5">
		<!-- nav-links -->
		<div class="hidden items-center justify-between md:mr-3 md:flex lg:mr-5">
			{#each navLinks as link}
				<a
					class="font-semibold tracking-widest md:mr-2 md:ml-2 lg:mr-4 lg:ml-4 md:text-base"
					href={link.link}>{link.name}</a
				>
			{/each}
		</div> 
		<!-- hamburger or cancel button-->
		<button
			onclick={()=>{hamburger.show = !hamburger.show}}
			aria-label="hamburger"
			class="flex items-center justify-center md:hidden"
		>
			{#if !hamburger.show}
				<span class="icon-[cil--hamburger-menu] h-5 w-5 transition-all sm:h-6 sm:w-6"></span>
			{/if}
			{#if hamburger.show}
				<span class="icon-[ix--cancel] h-5 w-5 transition-all sm:h-6 sm:w-6"></span>
			{/if}
		</button>

		<!-- contact us button -->
		<button class="enquer relative hidden cursor-pointer items-center p-2 md:flex">
			<a href="/contact" class="font-semibold md:text-base md:tracking-widest lg:text-lg"
				>Contact Us</a
			>
		</button>
	</div>
	
	{#if hamburger.show}
		<HamburgerMenu navLinks={navLinks}/>
	{/if}
</nav>

<style>
	@media only screen and (min-width: 640px) {
		/* sm */
	}

	@media only screen and (min-width: 768px) {
		/* md */

		.enquer::after {
			position: absolute;
			right: 0;
			bottom: 0;
			content: '';
			width: 100%;
			height: 5%;
			background: var(--accent);
			transition: all 0.2s;
			z-index: -1;
		}
		.enquer:hover::after {
			height: 50%;
		}
	}
	@media only screen and (min-width: 1024px) {
		/* lg */
	}
	@media only screen and (min-width: 1280px) {
		/* xl */
	}

	/* .search-result,
  .quick-links,
  .search-input,
  .search-box {
    border: 1px solid black;
  } */

	.nav {
		box-shadow: 0px 0px 8px 12px var(--neutral);
	}

	
</style>
