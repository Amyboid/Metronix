<script> 
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition'; 
	let text = $state(null); 

	// we were setting a context from where we are using this componenet to close and open from both side(parent and child)
    let search = getContext('search'); 
	
</script>

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
		onclick={()=> search.show = !search.show}
		aria-label="cancel"
		><span class="icon-[ix--cancel] h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7"
		></span></button
	>
</div>

<style>
	@media only screen and (min-width: 768px) {
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
	}

	.search-box {
		background-color: var(--neutral);
	}
</style>
