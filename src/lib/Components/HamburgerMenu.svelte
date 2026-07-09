<script>
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	let hamburger = getContext('hamburger');
	let { navLinks } = $props();

	function handleHamburger() {
		hamburger.show = !hamburger.show;
	}

	function isActive(href) {
		const path = page.url.pathname.replace(/\/+$/, '') || '/';
		const link = href.replace(/\/+$/, '') || '/';
		if (link === '/') return path === '/';
		return path === link || path.startsWith(link + '/');
	}
</script>

<div
	in:fade={{ duration: 300 }}
	out:fade={{ duration: 300 }}
	class="absolute top-16 sm:top-18 right-0 z-10 h-[100vh] w-full bg-[#30303080] md:hidden"
>
	<div
		in:fly={{ x: 50, duration: 300 }}
		out:fly={{ x: 50, duration: 300 }}
		class="hamburger-menu bg-surface absolute top-1 sm:top-2 right-0 flex w-48 flex-col items-center gap-5 pt-14 sm:w-60 sm:gap-4 sm:pt-16"
	>
		<div class="relative flex flex-col items-center gap-5 pb-14">
			{#each navLinks as link}
				<a
					data-sveltekit-reload
					onclick={handleHamburger}
					class="text-xs font-semibold tracking-wider sm:text-sm sm:tracking-widest"
					class:opacity-70={!isActive(link.link)}
					href={link.link}>{link.name}</a
				>
			{/each}
		</div>
	</div>
</div>

<style>
	.hamburger-menu {
		border-top-left-radius: var(--radius-lg);
		border-bottom-left-radius: var(--radius-lg);
	}
</style>
