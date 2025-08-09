<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let username = $state<string>('');
	let password = $state<string>('');
	let opendEye = $state(false);
	let role: 'Admin' | 'Editor' = $state('Editor');
	let error = $state<string>('');
	let loading = $state<boolean>(false);
	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (data.user) {
			goto('/admin');
		}
		if (role === 'Editor') {
			username = 'arpan';
			password = 'a@1234';
		} else if (role === 'Admin') {
			username = '';
			password = '';
		}
	});

	function toggleEye() {
		let eyeInput = document.getElementById('password') as HTMLInputElement;
		if (eyeInput) {
			if (eyeInput.type === 'password') {
				eyeInput.type = 'text';
			} else {
				eyeInput.type = 'password';
			}
		}
		opendEye = !opendEye;
	}
</script>

<div class="login-container min-w-[90%] p-6 md:min-w-[400px]">
	<h1 class="w-full text-center text-base">Admin Login</h1>
	{#if error}
		<p class="error-message rounded-lg border border-blue-700 p-3 text-sm text-blue-700">{error}</p>
	{/if}
	<form
		method="POST"
		class="flex flex-col gap-4"
		action="?/login"
		use:enhance={({ formData }) => {
			formData.append('role', role);
			loading = true; // Show loading state
			error = '';

			return async ({ result, update }) => {
				loading = false;
				console.log('result type', result.type);

				if (result.type === 'redirect') {
					goto('/admin');
				} else if (result.type === 'error') {
					error = result.error?.message || 'Login failed due to an unexpected server error.';
				} else if (result.type === 'failure') {
					error = result.data?.message || 'Login failed: Invalid credentials.';
				}
				await update();
			};
		}}
	>
		<div>
			<label for="username">Username:</label>
			<input type="text" id="username" name="username" bind:value={username} required />
		</div>

		<div class="relative">
			<label for="password">Password:</label>
			<div class="relative">
				<input
					class=""
					type="password"
					id="password"
					name="password"
					bind:value={password}
					required
				/>
				<button
					type="button"
					onclick={toggleEye}
					class="absolute top-0 right-0 flex h-full items-center justify-center px-4"
				>
					{#if opendEye}
						<span class="icon-[tabler--eye-filled] h-4 w-4 sm:h-5 sm:w-5"></span>
					{:else}
						<span class="icon-[tabler--eye-off] h-4 w-4 sm:h-5 sm:w-5"></span>
					{/if}
				</button>
			</div>
		</div>
		<div class="role-section flex gap-2 rounded-lg bg-[#e6e3db] p-2">
			<button
				type="button"
				class="role-button w-1/2 rounded-md px-6 py-2 transition-colors duration-200"
				class:selected={role === 'Admin'}
				onclick={() => (role = 'Admin')}
			>
				Admin
			</button>
			<button
				type="button"
				class="role-button w-1/2 rounded-md transition-colors duration-200"
				class:selected={role === 'Editor'}
				onclick={() => (role = 'Editor')}
			>
				Editor
			</button>
		</div>
		<button
			type="submit"
			disabled={loading}
			class="cursor-pointer rounded-lg bg-[hsl(41,18%,73%)] py-3 transition-all duration-200 hover:bg-[hsl(42,18%,67%)]"
		>
			{#if loading}
				<div class="flex items-center justify-center gap-1">
					Logging in <span class="icon-[eos-icons--loading]"></span>
				</div>
			{:else}
				Login
			{/if}
		</button>
	</form>
</div>

<div class="m-4 rounded-lg border border-[#d5d0c3] bg-[#e6e3db] p-4">
	{#if role === 'Admin'}
		<span class="text-left text-xs text-[#6d6d6d] sm:text-sm"
			>😉 Ha ha!, you don't know my admin user credentials. logged in as editor to enjoy the UI.</span
		>
	{:else}
		<span class="text-left text-xs text-[#6d6d6d] sm:text-sm"
			>Logging in as an editor only show you the UI, but it will not allow you to do <span class="font-bold">CUD</span> operations.</span
		>
	{/if}
</div>

<style>
	.login-container {
		margin: 40px auto;
		border-radius: var(--radius-lg);
		background-color: var(--color-primary-background);
		font-family: 'Inter', sans-serif;
	}
	form > div:has:not(.role-section) {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.login-container h1 {
		margin-bottom: 25px;
	}
	.login-container label {
		color: #6d6d6d;
		font-size: var(--text-sm);
		line-height: var(--tw-leading, var(--text-sm--line-height));
		text-transform: capitalize;
	}
	.login-container input[type='text'],
	.login-container input[type='password'] {
		background: #e6e3db;
		width: 100%;
		padding: 12px;
		border-radius: var(--radius-lg);
		outline: none;
		font-size: var(--text-xs);
		line-height: var(--tw-leading, var(--text-xs--line-height));
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}
	.error-message {
		background-color: #e6e3db;
		margin-bottom: 20px;
	}

	.role-button {
		background-color: #d9d5c9;
		color: #6d6d6d;
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.role-button:hover:not(.selected) {
		background-color: #d5d0c3;
	}

	.role-button.selected {
		background-color: #c7bfae;
		color: black;
	}

	button[type='submit']:disabled {
		background: #d3cdc0;
		color: #737373;
	}

	@media only screen and (min-width: 768px) {
		.login-container label {
			font-size: var(--text-base);
			line-height: var(--tw-leading, var(--text-base--line-height));
		}

		.login-container input[type='text'],
		.login-container input[type='password'] {
			font-size: var(--text-sm);
			line-height: var(--tw-leading, var(--text-sm--line-height));
		}
	}
</style>
