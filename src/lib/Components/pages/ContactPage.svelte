<script lang="ts">
	import { onMount } from 'svelte';
	import ContactCard from '$lib/Components/ContactCard.svelte';
	import { initAdminMode } from './adminMode';

	let { content: previewContent, imagekitUrl = '' } = $props();
	const c = previewContent ?? {};

	function ikSrc(path: string | null | undefined) {
		if (!path) return '';
		if (path.startsWith('http')) return path;
		if (!imagekitUrl) return path;
		const base = imagekitUrl.replace(/\/$/, '');
		const clean = path.replace(/^\//, '');
		return `${base}/${clean}`;
	}

	onMount(() => {
		initAdminMode('contact');
	});

	const cardDetails = $derived([
		{
			icon: 'icon-[tabler--mail-filled]',
			title: 'Quick contact',
			content: 'Email: ' + c.email,
			fieldKey: 'email'
		},
		{
			icon: 'icon-[ic--round-phone]',
			title: 'Phone number',
			content: c.phone,
			fieldKey: 'phone'
		},
		{
			icon: 'icon-[tabler--location-filled]',
			title: 'Location',
			content: c.address,
			fieldKey: 'address'
		}
	]);

	const isPreview = $derived(!!previewContent);
</script>

<header class="section-header mt-1 flex h-24 w-full items-center pl-6 sm:h-30 md:mt-0 md:pl-[8%]">
	<h1 data-editable="page_heading" class="text-lg font-semibold md:text-xl">{c.page_heading}</h1>
</header>

<section
	class="mt-8 flex flex-col-reverse items-center justify-center gap-8 md:mt-12 md:h-[80vh] md:w-[65%] md:flex-row md:gap-6"
>
	<div class="flex h-full flex-col gap-8 rounded-lg bg-glass p-6 md:w-1/2">
		<div class="flex flex-col gap-1 sm:gap-2 border-b border-b-surface">
			<h1 data-editable="talk_heading" class="text-2xl sm:text-3xl">{c.talk_heading}</h1>
			<p data-editable="talk_description" class="pb-3 text-xs text-copy sm:text-base">
				{c.talk_description}
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
				onclick={() => 'not implemented'}
				type="submit"
				class="bg-accent flex cursor-pointer items-center justify-center gap-2 rounded-lg p-3 text-sm transition-all duration-300 hover:bg-[#0a98ae] sm:text-lg"
			>
				<span class="icon-[mynaui--send-solid]"></span>
				<span> Send </span>
			</button>
		</form>
	</div>
	<div class="flex h-full flex-col gap-8 p-6 md:w-1/2">
		<div class="contact-person-img md:bg-surface-gradient h-1/2 w-full rounded-lg pt-2" data-editable-image="contact_image">
			<img
				class="md:max-h-auto h-full max-h-[250px] w-full object-contain"
				src={ikSrc(c.contact_image || 'assets/page-contents/contact/contact.png')}
				alt="contact-img"
			/>
		</div>
		<div class="flex h-1/2 flex-col gap-4">
			{#each cardDetails as card}
				<ContactCard cardDetails={card} editable={isPreview} fieldKey={card.fieldKey} />
			{/each}
		</div>
	</div>
</section>

<style>
	.contact-person-img {
		background: url('$lib/assets/bg/contact-bg.svg');
	}
	.section-header {
		border-bottom: 1px solid var(--color-surface);
		border-top: 1px solid var(--color-surface);
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
