<script>
	import { setContext } from 'svelte';
	import HamburgerMenu from './HamburgerMenu.svelte';
	import LogoutButton from './LogoutButton.svelte';
	import { fly } from 'svelte/transition';

	const { navLinks, adminProfile } = $props();
	let hamburger = $state({ show: false });
	let showAdminProfile = $state(false);
	setContext('hamburger', hamburger);

	/**
	 * @param {HTMLDivElement} element
	 * @param {{ (): void; }} callback
	 */

	function clickOutside(element, callback) {
		/**
		 * @param {{ target: Node | null; }} event
		 */
		function handleClick(event) {
			if (!element.contains(event.target)) {
				console.log('clicked outside');

				callback();
			}
		}

		// @ts-ignore
		document.body.addEventListener('click', handleClick, true);

		return {
			// @ts-ignore
			update(newCallback) {
				callback = newCallback;
			},
			destroy() {
				// @ts-ignore
				document.body.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<nav
	class="nav fixed top-0 left-0 flex w-full min-w-80 items-center justify-between bg-[var(--neutral)] p-4 pt-2 pb-2 md:px-12"
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
	<div class="nav-right flex items-center gap-4">
		<!-- nav-links -->
		<div class="navlinks hidden gap-8 md:flex md:items-center">
			{#if navLinks}
				{#each navLinks as link}
					<a href={link.link}>{link.name}</a>
				{/each}
				<button class="contact-us-btn relative hidden cursor-pointer items-center md:flex">
					<a href="/contact">ContactUs</a>
				</button>
			{:else}
				<h1>{adminProfile.role}</h1>
				<button
					onclick={() => (showAdminProfile = !showAdminProfile)}
					aria-label="profile"
					class="h-8 w-8 p-1 cursor-pointer rounded-full border border-primary-background bg-primary-background-dark"
				>
					<span class="icon-[solar--user-bold-duotone] w-full h-full"></span>
				</button>

				{#if showAdminProfile}
					<div
						in:fly={{ x: 50, duration: 300 }}
						out:fly={{ x: 50, duration: 300 }}
						use:clickOutside={() => (showAdminProfile = false)}
						class="bg-primary-background absolute top-15 right-12 w-48 h-24 flex flex-col justify-between px-4 p-4 rounded-lg"
					>
						<div>
							<h1 class="capitalize">
								{adminProfile.username}
							</h1>
						</div>
						<div class="bg-neutral rounded-lg">
							<LogoutButton />
						</div>
					</div>
				{/if}
			{/if}
		</div>
		<!-- hamburger or cancel button-->
		<button
			onclick={() => {
				hamburger.show = !hamburger.show;
			}}
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
	</div>

	{#if hamburger.show}
		<HamburgerMenu {navLinks} {adminProfile} />
	{/if}
</nav>

<style>  
	@media only screen and (min-width: 768px) {
		.navlinks {
			font-size: var(--text-base);
		}
		.contact-us-btn::after {
			position: absolute;
			right: 0;
			bottom: 0;
			content: '';
			width: 100%;
			height: 6%;
			background: var(--accent);
			transition: all 0.2s;
			z-index: -1;
		}
		.contact-us-btn:hover::after {
			height: 40%;
		}
	} 

	.nav {
		box-shadow: 0px 0px 8px 12px var(--neutral);
	}
</style>
