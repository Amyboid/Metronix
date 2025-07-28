<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let username = $state<string>('');
	let password = $state<string>('');
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
</script>

<div class="login-container min-w-[90%] p-6 md:min-w-[400px]">
	<h1 class="w-full text-center">Admin Login</h1>
	{#if error}
		<p class="error-message">{error}</p>
	{/if}
	<form
		method="POST"
		class="flex flex-col gap-4"
		action="?/login"
		use:enhance={({formData}) => {
			formData.append('role', role)
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

		<div>
			<label for="password">Password:</label>
			<input type="password" id="password" name="password" bind:value={password} required />
		</div>
		<div>
			<button
				type="button"
				class="role-button rounded-md px-6 py-2 transition-colors duration-200"
				class:selected={role === 'Admin'}
				onclick={() => (role = 'Admin')}
			>
				Admin
			</button>
			<button
				type="button"
				class="role-button rounded-md px-6 py-2 transition-colors duration-200"
				class:selected={role === 'Editor'}
				onclick={() => (role = 'Editor')}
			>
				Editor
			</button>
			<!-- <input type="radio" name="role" id="admin" value="Admin" />
			<input type="radio" name="role" id="editor" value="Editor" /> -->
		</div>
		<button
			type="submit"
			disabled={loading}
			class="cursor-pointer rounded-lg bg-[hsl(42,18%,78%)] p-3 hover:bg-[#c7bfae]"
		>
			{#if loading}Logging in...{:else}Login{/if}
		</button>
	</form>
</div>

<style>
	.login-container {
		margin: 50px auto;
		border-radius: var(--radius-lg);
		background-color: var(--color-primary-background);
		font-family: 'Inter', sans-serif;
	}
	form > div {
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
		background: hsl(42, 18%, 88%);
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
		color: #d9534f;
		background-color: #f2dede;
		border: 1px solid #ebccd1;
		padding: 10px;
		border-radius: 5px;
		margin-bottom: 20px;
	}

	.role-button {
        background-color: #e0e0e0; /* Default unselected background */
        color: #555;
        border: 1px solid #ccc;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    }

    .role-button:hover:not(.selected) {
        background-color: #d0d0d0; /* Slightly darker on hover */
    }

    .role-button.selected {
        background-color: #4f46e5; /* Indigo-600 for selected */
        color: white;
        border-color: #4f46e5;
        box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3); /* More prominent shadow for selected */
        font-weight: 600; /* Bolder text for selected */
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
