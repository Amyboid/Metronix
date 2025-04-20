<script>
	import { getContext } from 'svelte';
	import { fly } from 'svelte/transition';
	let text = $state(null);
	let hamburger = getContext('hamburger');
	let {navLinks} = $props(); 
    
	function handleHamburger() {
		hamburger.show = !hamburger.show;
	}
</script>

<div
	in:fly={{ x: 50, duration: 300 }}
	out:fly={{ x: 50, duration: 300 }}
	class="absolute top-14 right-0 z-10 h-[100vh] w-full bg-[#0bacc504] backdrop-blur-sm md:hidden"
>
	<div
		class="hamburger-menu absolute right-0 flex w-48 flex-col items-center gap-5 pt-14 sm:w-60 sm:gap-4 sm:pt-16"
	>
		<div class="flex flex-col items-center gap-5 pb-14">
			{#each navLinks as link}
				<a
					onclick={handleHamburger}
					class="text-xs font-semibold tracking-wider sm:text-sm sm:tracking-widest"
					href={link.link}>{link.name}</a
				>
			{/each}
			<button
			aria-label="contact"
			class="flex w-full items-center justify-center gap-3 p-2"
		>
			<a
				onclick={handleHamburger}
				href="/contact"
				class="text-xs font-semibold tracking-wider sm:text-sm sm:tracking-widest">Contact Us</a
			>
			<!-- <span class="icon-[wpf--ask-question] h-6 w-6"></span> -->
		</button>
		</div> 
	</div>
</div>

<style>
	.hamburger-menu {
		background-color: var(--neutral);  
	}
</style>
