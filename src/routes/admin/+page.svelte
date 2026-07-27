<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let email = $state('');
	let password = $state('');
	let role: 'Admin' | 'Editor' = $state('Editor');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		if (data.user) {
			goto('/admin/dashboard');
		}
	});

	$effect(() => {
		if (role === 'Editor') {
			email = 'editor@example.com';
			password = 'editor123';
		} else {
			email = '';
			password = '';
		}
	});

	function toggleEye() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Admin — Sign In</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main class="grid h-dvh grid-cols-1 md:grid-cols-2 bg-neutral font-inter">

	<!-- Left panel -->
	<div class="relative hidden overflow-hidden md:flex md:flex-col bg-[#0e0e0e]">
		<div class="pointer-events-none absolute inset-0 grid-overlay opacity-[0.06]"></div>
		<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#eddea412_0%,_transparent_65%)]"></div>

		<div class="relative z-10 flex flex-1 flex-col justify-between px-12 py-14">
			<div class="flex items-center gap-3">
				<div class="h-7 w-7 bg-brand flex items-center justify-center">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M2 12L7 2L12 12" stroke="#0e0e0e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M3.5 9h7" stroke="#0e0e0e" stroke-width="1.8" stroke-linecap="round"/>
					</svg>
				</div>
				<span class="text-[11px] font-medium tracking-[0.2em] uppercase text-[#9d9d9d]">Admin Panel</span>
			</div>

			<div>
				<p class="text-[11px] tracking-[0.18em] uppercase text-[#6d6d6d] mb-5 font-medium">
					Store management
				</p>
				<h1 class="font-['Playfair_Display'] text-[2.6rem] leading-[1.15] font-normal text-[#f1efe9]">
					One place<br />
					<em class="not-italic text-brand">for everything</em><br />
					you manage.
				</h1>
				<div class="mt-8 flex flex-col gap-[5px]">
					<div class="h-px w-16 bg-brand opacity-90"></div>
					<div class="h-px w-10 bg-brand opacity-50"></div>
					<div class="h-px w-6 bg-brand opacity-25"></div>
				</div>
			</div>

			<div class="flex items-center gap-2.5">
				<div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
				<span class="text-[11px] tracking-wide text-[#6d6d6d] font-medium uppercase">
					Restricted &middot; Authorised personnel only
				</span>
			</div>
		</div>
	</div>

	<!-- Right: form -->
	<div class="flex items-center justify-center bg-neutral px-8 py-12">
		<div class="w-full max-w-[360px]">

			<!-- Mobile wordmark -->
			<div class="flex items-center gap-2.5 mb-10 md:hidden">
				<div class="h-6 w-6 bg-[#0e0e0e] flex items-center justify-center">
					<svg width="12" height="12" viewBox="0 0 14 14" fill="none">
						<path d="M2 12L7 2L12 12" stroke="#eddea4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M3.5 9h7" stroke="#eddea4" stroke-width="1.8" stroke-linecap="round"/>
					</svg>
				</div>
				<span class="text-[11px] font-medium tracking-[0.18em] uppercase text-copy">Admin</span>
			</div>

			<!-- Header -->
			<div class="mb-8">
				<h2 class="font-['Playfair_Display'] text-[1.75rem] font-normal leading-tight text-[#0e0e0e] mb-1.5">
					Welcome back
				</h2>
				<p class="text-[13px] text-copy-light font-light">
					Sign in to your admin account to continue.
				</p>
			</div>

			<!-- Error alert -->
			{#if error}
				<div
					class="mb-6 flex items-start gap-2.5 rounded-sm border border-danger/20 bg-danger/5 px-3.5 py-3 text-[12.5px] text-danger"
					role="alert"
				>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" class="shrink-0 mt-px">
						<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
						<path d="M8 4.5v4M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					{error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				use:enhance={() => {
					loading = true;
					error = '';
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'redirect') {
							goto('/admin/dashboard');
							return;
						} else if (result.type === 'error') {
							error = result.error?.message || 'Login failed due to an unexpected server error.';
						} else if (result.type === 'failure') {
							error = result.data?.error || 'Login failed: Invalid credentials.';
						}
						await update();
					};
				}}
				novalidate
			>
				<fieldset disabled={loading} class="border-none p-0 flex flex-col gap-4">

				<!-- Role selector -->
				<div class="role-section flex gap-2 rounded-lg bg-[#e6e3db] p-1.5">
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

					<input type="hidden" name="role" value={role} />

					<!-- Email -->
					<div class="flex flex-col gap-1.5">
						<label for="email" class="field-label">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="you@example.com"
							autocomplete="email"
							required
							class="field-input"
							bind:value={email}
						/>
					</div>

					<!-- Password -->
					<div class="flex flex-col gap-1.5">
						<label for="password" class="field-label">
							Password
						</label>
						<div class="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
								autocomplete="current-password"
								required
								class="field-input pr-11"
								bind:value={password}
							/>
							<button
								type="button"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								onclick={toggleEye}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-copy-light hover:text-copy transition-colors p-0.5"
							>
								{#if showPassword}
									<span class="icon-[tabler--eye] h-4 w-4"></span>
								{:else}
									<span class="icon-[tabler--eye-off] h-4 w-4"></span>
								{/if}
							</button>
						</div>
					</div>

					<!-- Submit -->
					<button
						type="submit"
						disabled={loading}
						class="mt-2 w-full flex items-center justify-center gap-2 bg-[#0e0e0e] text-neutral text-[13.5px] font-medium tracking-wide py-3 px-5 rounded-sm transition-all hover:bg-[#1a1a1a] active:scale-[.99] disabled:opacity-60 disabled:cursor-wait"
					>
						{#if loading}
							<span class="spinner-dark"></span>
							Signing in&hellip;
						{:else}
							Sign in
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</button>

				</fieldset>
			</form>

			<!-- Role hint -->
			<div class="mt-6 rounded-lg border border-subtle bg-[#e6e3db] px-3.5 py-3">
				{#if role === 'Admin'}
					<span class="text-left text-xs text-copy sm:text-sm">
						Enter your admin credentials to manage the store.
					</span>
				{:else}
					<span class="text-left text-xs text-copy sm:text-sm">
						Logging in as an editor only shows you the UI, but it will not allow you to do <span class="font-bold">CUD</span> operations.
					</span>
				{/if}
			</div>

			<!-- Divider + hint -->
			<div class="mt-6 pt-5 border-t border-subtle">
				<p class="text-[11.5px] text-copy-light text-center">
					Contact your administrator if you need access.
				</p>
			</div>

		</div>
	</div>
</main>

<style>
	.grid-overlay {
		background-image:
			linear-gradient(#ffffff 1px, transparent 1px),
			linear-gradient(90deg, #ffffff 1px, transparent 1px);
		background-size: 44px 44px;
	}

	.field-label {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-copy);
	}

	.field-input {
		width: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-subtle);
		color: #0e0e0e;
		padding: 0.65rem 0.875rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		font-weight: 300;
		border-radius: 2px;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.field-input::placeholder {
		color: var(--color-copy-light);
		opacity: 0.6;
	}

	.field-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-accent-ghost);
	}

	.field-input:disabled {
		opacity: 0.6;
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

	.spinner-dark {
		width: 14px;
		height: 14px;
		border: 1.8px solid #f1efe940;
		border-top-color: #f1efe9;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
