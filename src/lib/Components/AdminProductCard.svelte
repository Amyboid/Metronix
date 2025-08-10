<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import AdminProductForm from './AdminProductForm.svelte';
	import { getImagePath } from '$lib/utils/imageImports';
	let isFormOpen = $state(false);
	let showConfirmation = $state(false);
	let deleteErrorMessage: string | null = $state(null);
	let { item, form, handleDeleteToast } = $props();

	function toggleForm() {
		isFormOpen = !isFormOpen;
	}

	function closeEditForm() {
		isFormOpen = false;
	}

	function handleErrorMessage() {
		showConfirmation = true;
		// setTimeout(() => {
		// 	showConfirmation = false
		// }, 1000);
	}
</script>

<div class="item-card flex h-[420px] w-full flex-col items-center justify-center gap-5 p-5">
	<enhanced:img class="h-[145px] object-contain" src={getImagePath(item.src)} alt={item.name} />
	<div class="relative flex h-[60%] w-full flex-col justify-around gap-2">
		<!-- The form for updating item details -->

		<div class="flex flex-col items-center gap-2 text-sm">
			<p class="min-h-16 w-full text-center tracking-wider">
				{item.name}
			</p>
			<div class="flex items-center justify-center">
				<span class="icon-[bi--currency-rupee] h-[14px] w-[14px]"></span>
				<span class="">
					{item.price}
				</span>
			</div>
		</div>
		<div class="mt-2 flex w-full justify-between text-sm">
			<button
				type="button"
				onclick={toggleForm}
				aria-label="edit"
				class="edit-button cursor-pointer p-2 px-3"
			>
				<span class="icon-[material-symbols--edit-rounded]"></span>
			</button>
		</div>

		{#if isFormOpen}
			<AdminProductForm closeForm={closeEditForm} initialProductData={item} />
		{/if}
		<form
			action="?/delete"
			method="post"
			use:enhance={() => {
				return async ({ result, update }) => { 
					if (result.type === 'success') { 
						await invalidateAll();
						handleDeleteToast();
					} else if (result.type === 'failure') {
						handleErrorMessage();
						deleteErrorMessage = result.data?.message as string;
						console.error('Failed to delete product (server validation):');
					} else if (result.type === 'error') {
						console.error('Error deleting product:', result.error);
					}
					await update();
				};
			}}
			class="w-full"
		>
			<input type="hidden" name="id" value={item._id} />
			<input type="hidden" name="imgSrc" value={item.src} />
			{#if showConfirmation}
				<div
					in:fade={{ duration: 100 }}
					out:fade={{ duration: 100 }}
					class="border-primary-background bg-primary-background absolute bottom-[10%] left-[50%] flex h-auto w-[95%] -translate-x-[50%] flex-col gap-1 rounded-lg border p-4 pt-12"
				>
					<button
						type="button"
						class="absolute top-2 right-2 flex cursor-pointer items-center rounded-md bg-[#d1cbbd] p-2 transition-all duration-200 ease-in hover:bg-[#c7bfae]"
						onclick={() => {
							showConfirmation = false;
						}}
						aria-label="cancel"
					>
						<span class="icon-[ix--cancel] h-4 w-4"></span>
					</button>

					{#if deleteErrorMessage}
						<p class="w-full text-center text-sm text-[#6d6d6d]">
							{deleteErrorMessage}
						</p>
					{:else}
						<h1 class="text-sm">Are you sure you want to delete this item?</h1>
						<h3 class="text-xs text-[#6d6d6d]">This action is irreversible.</h3>
						<button
							onclick={() => {
								showConfirmation = false;
							}}
							type="submit"
							class="bg-neutral mt-4 p-2 text-sm">Confirm</button
						>
					{/if}
				</div>
			{/if}
			<button
				class="delete-button flex w-full cursor-pointer items-center justify-center p-2 text-sm"
				aria-label="delete"
				type="button"
				onclick={() => {
					showConfirmation = true;
				}}
			>
				Delete
			</button>
		</form>
	</div>
</div>

<style>
	.item-card {
		border-right: 1px solid var(--primary-background);
		border-bottom: 1px solid var(--primary-background);
	}

	input {
		margin-left: -8px;
	}

	button {
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}
	.edit-button,
	.delete-button {
		background-color: #0bacc5;
	}
	.edit-button:hover,
	.delete-button:hover {
		background-color: #0a98ae;
	}
</style>
