<script>
	import ContactCard from "$lib/Components/ContactCard.svelte";

	const cardDetails = [
		{
			icon: 'icon-[tabler--mail-filled]',
			title: 'Quick contact',
			content: 'Email: contact.meta@gmail.com'
		},
		{
			icon: 'icon-[ic--round-phone]',
			title: 'Phone number',
			content: '+91 8345678917'
		},
		{
			icon: 'icon-[tabler--location-filled]',
			title: 'Location',
			content: 'Ranichak More, Haldia, Purba Medinipur district, West Bengal, India'
		},

	];
</script>

<header class="section-header mt-2 flex h-24 w-full items-center pl-6 sm:h-30 md:mt-0 md:pl-[8%]">
	<h1 class="text-lg font-semibold md:text-xl">Get in touch with Meta Electronics.</h1>
</header>

<section
	class="mt-8 flex flex-col-reverse items-center justify-center gap-2 md:mt-12 md:w-[65%] md:flex-row md:gap-6 md:h-[80vh]"
>
	<div class="flex flex-col gap-8 p-6 md:w-1/2 h-full bg-[#dcd8cd36]">
		<div class="flex flex-col gap-2 border-b border-b-[var(--primary-background)]">
			<h1 class="text-2xl sm:text-3xl">Let's Talk!</h1>
			<p class="pb-3 text-sm text-[#6d6d6d] sm:text-base">
				Get in touch with us using the enquiry form or contact details below.
			</p>
		</div>
		<form class="flex flex-col gap-3 md:gap-5" action="">
			<div class="flex gap-2">
				<div class="formfield w-1/2">
					<label for="firstname">First Name</label>
					<input type="text" name="firstname" id="firstname" placeholder="vam" />
				</div>
				<div class="formfield w-1/2">
					<label for="lastname">Last Name</label>
					<input type="text" name="lastname" id="lastname" placeholder="joy" />
				</div>
			</div>
			<div class="formfield">
				<label for="email">Email</label>
				<input type="email" name="email" id="lastname" placeholder="vam.joy@gmail.com" />
			</div>
			<div class="formfield">
				<label for="email">Email</label>
				<textarea
					class="h-[100px]"
					name="email"
					id=""
					cols="30"
					rows="10"
					placeholder="Type something..."
				></textarea>
			</div>
			<button
				type="submit"
				class="bg-accent flex cursor-pointer items-center justify-center gap-2 rounded-lg p-3 text-sm transition-all duration-300 hover:bg-[#0a98ae] sm:text-lg"
			>
				<span class="icon-[mynaui--send-solid]"></span>
				<span> Send </span>
			</button>
		</form>
	</div>
	<div class="flex flex-col gap-8 p-6 md:w-1/2 h-full">
		<div class="contact-person-img md:bg-primary-background-gradient w-full h-1/2 rounded-lg pt-2">
			<img class="object-contain w-full h-full max-h-[250px] md:max-h-auto" src="/assets/bg/contact.png" alt="">
		</div>
		<div class="flex flex-col gap-4 h-1/2">
			{#each cardDetails as card}
				<ContactCard cardDetails={card}/>
			{/each} 
		</div>
	</div>
</section>

<style>
	.section-header {
		border-bottom: 1px solid var(--primary-background);
		border-top: 1px solid var(--primary-background);
		background-color: #dcd8cd36;
	}
	.formfield {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	label {
		font-size: var(--text-base);
		line-height: var(--tw-leading, var(--text-base--line-height));
		text-transform: capitalize;
	}
	input,
	textarea {
		background: #e6e3db;
		width: 100%;
		padding: 12px;
		border-radius: var(--radius-lg);
		outline: none;
		font-size: var(--text-xs);
		line-height: var(--tw-leading, var(--text-xs--line-height));
		resize: none;
		border: 1px solid transparent;
		transition: all 0.2s ease;
		color: #6d6d6d;
	}

	textarea:focus,
	input:focus {
		border: 1px solid #6d6d6d;
	}

	.contact-person-img{
		background: url('/static//assets/bg/contact-bg1.svg');  
	}
	@media only screen and (min-width: 768px) {
		label {
			font-size: var(--text-base);
			line-height: var(--tw-leading, var(--text-base--line-height));
		}

		input,
		textarea {
			font-size: var(--text-sm);
			line-height: var(--tw-leading, var(--text-sm--line-height));
		}
	}
</style>
