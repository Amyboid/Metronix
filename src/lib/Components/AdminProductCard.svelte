<script>
	import { enhance } from '$app/forms';

	let isEditing = $state(false);
	let { item } = $props();
	function toggleEditing() {
		isEditing = !isEditing;
	}
</script>

<div
	class="item-card relative flex h-[420px] w-full flex-col items-center justify-center gap-5 p-5"
>
	<img class=" h-[40%] object-contain" src={'/assets/' + item.src + '.png'} alt={item.name} />

	<div class="flex h-[60%] w-full flex-col justify-around gap-2">
		<!-- The form for updating item details -->
		<form action="?/update" method="post" use:enhance class="flex w-full flex-col gap-2">
			<div class="flex flex-col items-center text-sm">
				<p class="min-h-16 w-full text-center tracking-wider">
					<textarea
						name="name"
						bind:value={item.name}
						disabled={!isEditing}
						class:border-input={isEditing}
						class:no-border-input={!isEditing}
						class="w-full text-center"
					></textarea>
				</p>
				<div class="flex w-full items-center justify-center">
					<span class="icon-[bi--currency-rupee] ml-8 h-[14px] w-[14px] border"></span>
					<span class="flex items-center justify-between gap-2 tracking-wider">
						<input
							name="price"
							type="text"
							bind:value={item.price}
							disabled={!isEditing}
							class:border-input={isEditing}
							class:no-border-input={!isEditing}
							class="w-24 border pl-0"
						/>
					</span>
				</div>
			</div>
			<div class="mt-2 flex w-full justify-between text-sm">
				<button
					class="update-button cursor-pointer rounded-lg p-2 px-3"
					type="submit"
					disabled={!isEditing}
				>
					Update
				</button>
				<button
					type="button"
					onclick={toggleEditing}
					aria-label="edit"
					class="edit-button cursor-pointer p-2 px-3"
				>
					<span class="icon-[material-symbols--edit-rounded]"></span>
				</button>
			</div>
		</form>
		<form action="?/delete" method="post" use:enhance class="w-full">
			<input type="hidden" name="id" value={item._id} />
			<button
				class="delete-button flex w-full cursor-pointer items-center justify-center p-2 text-sm"
				aria-label="delete"
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

	input,
	textarea {
		padding: 8px;
		transition: border 0.3s ease;
		border-radius: 8px;
	}
	input {
		margin-left: -8px;
	}
	.border-input {
		border: 1px solid var(--primary-background);
		margin-left: 0;
	}
	.no-border-input {
		border: 1px solid transparent;
		cursor: not-allowed;
	}
	button {
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}
	.edit-button {
		background-color: #0bacc5;
	}
	.edit-button:hover {
		background-color: #0a98ae;
	}
	.update-button {
		background-color: #0bacc5;
	}
	.update-button:hover:not(:disabled) {
		background-color: #0a98ae;
	}
	.update-button:disabled {
		background-color: var(--primary-background);
		color: #6d6d6d;
		cursor: not-allowed;
	}
	.delete-button {
		background-color: #0bacc5;
	}
	.delete-button:hover {
		background-color: #0a98ae;
	}
</style>
