<script>
	import { fade, fly } from 'svelte/transition';

	let props = $props();
	let products = [
		{ name: 'Ac', link: '/explore/ac' },
		{ name: 'Fridge', link: '/explore/fridge' },
		{ name: 'Chimney', link: '/explore/chimney' },
		{ name: 'Ro', link: '/explore/ro' },
		{ name: 'Speaker', link: '/explore/speaker' },
		{ name: 'Oven', link: '/explore/oven' },
		{ name: 'Misc', link: '/explore/misc' }
	];

	let navLinks = [
		{ name: 'Explore', link: '/explore' },
		...products,
		{ name: 'Achievements', link: '/achievements' }
	];
	let text = $state(null);
	let showSearch = $state(false);
	let showHamburger = $state(false);
 

	function handleShowSearch() {
		showSearch = !showSearch;
	}
	function handleShowHamburger() {
		showHamburger = !showHamburger;
	}
</script>

<nav
	class="nav fixed top-0 left-0 flex w-full min-w-80 items-center justify-between bg-[var(--neutral)] p-4 md:p-6 md:pr-12 md:pl-12"
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
					class="font-semibold tracking-widest md:mr-2 md:ml-2 md:text-xs lg:mr-4 lg:ml-4 lg:text-xs"
					href={link.link}>{link.name}</a
				>
			{/each}
		</div>

		<!-- search button -->
		<button onclick={handleShowSearch} aria-label="search" class="flex items-center justify-center">
			<span
				class="icon-[tabler--search] h-5 w-5 hover:cursor-pointer sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7"
			></span>
		</button>

		<!-- hamburger -->
		<button
			onclick={handleShowHamburger}
			aria-label="hamburger"
			class="flex items-center justify-center md:hidden"
		>
			{#if !showHamburger}
				<span class="icon-[cil--hamburger-menu] h-5 w-5 transition-all sm:h-6 sm:w-6"></span>
			{/if}
			{#if showHamburger}
				<span class="icon-[ix--cancel] h-5 w-5 transition-all sm:h-6 sm:w-6"></span>
			{/if}
		</button>

		<!-- enquery button -->
		<button class="enquer relative hidden cursor-pointer items-center p-2 md:flex">
			<a href="/support" class="font-semibold md:text-base md:tracking-widest lg:text-lg">ASK META</a>
		</button>
	</div>
	{#if showSearch && !showHamburger}
		<div
			in:fly={{ y: -50, duration: 500 }}
			out:fade
			class="absolute top-0 left-0 z-10 h-[100vh] w-full bg-[#0bacc504] backdrop-blur-sm md:top-24"
		>
			<div class="search-box grid h-max min-h-[30%] w-full gap-3 p-11 md:min-h-[50%]">
				<div class="search-input flex w-full items-center justify-center">
					<button aria-label="search" class="flex h-full items-center justify-center p-2">
						<span
							class="icon-[tabler--search] h-5 w-5 hover:cursor-pointer sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7"
						></span>
					</button>
					<input
						class="h-full w-[95%] bg-inherit p-2 text-xs outline-none sm:text-sm md:text-sm"
						type="text"
						aria-label="search for product"
						placeholder="Search for product"
						bind:value={text}
					/>
				</div>
				{#if text}
					<div class="search-result w-full overflow-scroll p-2">
						<p class="mb-2 text-xs text-[#9d9d9d] sm:text-sm md:text-sm">Relavant results</p>
						<ul class="m-0 list-none overflow-scroll p-0 text-xs sm:text-sm md:text-sm">
							{text}
						</ul>
					</div>
				{/if}
				{#if !text}
					<div transition:fade class="quick-links w-full p-2">
						<p class=" mb-2 text-xs text-[#9d9d9d] sm:text-sm md:text-sm">Quick Links</p>
						<ul class="m-0 list-none p-0 text-xs sm:text-sm md:text-sm">
							<li class="flex items-center">
								<span class="icon-[stash--arrow-right-light] mr-2"></span>Explore new fridge
							</li>
							<li class="flex items-center">
								<span class="icon-[stash--arrow-right-light] mr-2"></span> Explore new Ac
							</li>
							<li class="flex items-center">
								<span class="icon-[stash--arrow-right-light] mr-2"></span> Explore new dildo
							</li>
							<li class="flex items-center">
								<span class="icon-[stash--arrow-right-light] mr-2"></span> Explore new fridge
							</li>
							<li class="flex items-center">
								<span class="icon-[stash--arrow-right-light] mr-2"></span> Explore new fridge
							</li>
						</ul>
					</div>
				{/if}
			</div>
			<button
				class="absolute top-4 right-4 flex items-center justify-center p-2"
				onclick={handleShowSearch}
				aria-label="cancel"
				><span class="icon-[ix--cancel] h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7"
				></span></button
			>
		</div>
	{/if}

	{#if showHamburger}
		<div
			in:fly={{ x: 50, duration: 300 }}
			out:fly={{ x: 50, duration: 300 }}
			class="absolute top-16 right-0 z-10 h-[100vh] w-full bg-[#0bacc504] backdrop-blur-sm md:hidden"
		>
			<div
				class="hamburger-menu absolute right-0 flex h-[80vh] w-48 flex-col items-center gap-5 pt-14 sm:w-60 sm:gap-4 sm:pt-16"
			>
				<div class="flex flex-col gap-5 pb-14">
					{#each navLinks as link}
						<a
            onclick={handleShowHamburger}
							class="text-xs font-semibold tracking-wider sm:text-sm sm:tracking-widest"
							href={link.link}>{link.name}</a
						>
					{/each}
				</div>
				<!-- enquery icon -->
				<button
					aria-label="enquery"
					class="absolute bottom-4 flex w-full items-center justify-center gap-3 p-2 sm:bottom-6 sm:gap-4"
				>
					<a onclick={handleShowHamburger} href="/support" class="text-xs font-semibold tracking-wider sm:text-sm sm:tracking-widest">Support</a>
					<!-- <span class="icon-[wpf--ask-question] h-6 w-6"></span> -->
				</button>
			</div>
		</div>
	{/if}
</nav>

<style>
	@media only screen and (min-width: 640px) {
		/* sm */
	}

	@media only screen and (min-width: 768px) {
		/* md */

		.search-box {
			grid-template-areas:
				'searchInput searchInput quickLinks'
				'searchResult searchResult quickLinks'
				'searchResult searchResult quickLinks';
			justify-content: center;
			grid-template-rows: 3rem auto auto;
		}
		.search-input {
			grid-area: searchInput;
			width: 40rem;
			height: 3rem;
		}
		.quick-links {
			width: 11rem;
			grid-area: quickLinks;
		}
		.search-result {
			grid-area: searchResult;
			width: 40rem;
			overflow: scroll;
		}

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
	.search-box {
		background-color: var(--neutral);
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

	.hamburger-menu {
		background-color: var(--neutral);
		/* border: 1px solid purple; */
	}
</style>
