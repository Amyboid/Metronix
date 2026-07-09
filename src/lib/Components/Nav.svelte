<script>
	import { setContext } from 'svelte';
	import HamburgerMenu from './HamburgerMenu.svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';

	const { navLinks } = $props();
	let hamburger = $state({ show: false });
	setContext('hamburger', hamburger);

	function isActive(href) {
		const path = page.url.pathname.replace(/\/+$/, '') || '/';
		const link = href.replace(/\/+$/, '') || '/';
		if (link === '/') return path === '/';
		return path === link || path.startsWith(link + '/');
	}
</script>

<nav
	class="nav sticky top-0 left-0 z-100 flex w-full min-w-80 items-center justify-between bg-neutral px-4 h-nav md:px-12"
>
	<a data-sveltekit-reload href="/">
		<div class="logo flex flex-col items-end">
			<p class="text-2xl font-bold tracking-wider sm:text-2xl md:tracking-widest">
				META
			</p>
			<p class="-mt-2 -mr-2 sm:-mr-1 text-xs font-medium sm:text-sm">electronics</p>
		</div>
	</a>

	<div class="nav-right flex items-center gap-4">
		<div class="navlinks hidden gap-8 md:flex md:items-center">
			{#each navLinks as link}
				<a
					data-sveltekit-reload
					href={link.link}
					class:opacity-70={!isActive(link.link)}
				>{link.name}</a>
			{/each}
		</div>
		<button
			onclick={() => { hamburger.show = !hamburger.show; }}
			aria-label="hamburger"
			class="flex items-center justify-center md:hidden"
		>
			{#if !hamburger.show}
				<span class="icon-[cil--hamburger-menu] h-5 w-5 transition-all sm:h-6 sm:w-6"></span>
			{:else}
				<span class="icon-[ix--cancel] h-5 w-5 transition-all sm:h-6 sm:w-6"></span>
			{/if}
		</button>
	</div>

	{#if hamburger.show}
		<HamburgerMenu {navLinks} />
	{/if}
</nav>

<style>
	.nav {
		backdrop-filter: blur(50px);
	}
	@media only screen and (min-width: 768px) {
		.navlinks { font-size: var(--text-sm); }
	}
</style>
