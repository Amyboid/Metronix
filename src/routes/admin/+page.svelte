<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let loading = false;
	let showPassword = false;
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

	<!-- ── Left panel ── -->
	<div class="relative hidden overflow-hidden md:flex md:flex-col bg-[#0e0e0e]">

		<!-- Subtle grid -->
		<div class="pointer-events-none absolute inset-0 grid-overlay opacity-[0.06]"></div>

		<!-- Warm vignette -->
		<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#eddea412_0%,_transparent_65%)]"></div>

		<div class="relative z-10 flex flex-1 flex-col justify-between px-12 py-14">

			<!-- Top: wordmark -->
			<div class="flex items-center gap-3">
				<div class="h-7 w-7 bg-brand flex items-center justify-center">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M2 12L7 2L12 12" stroke="#0e0e0e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M3.5 9h7" stroke="#0e0e0e" stroke-width="1.8" stroke-linecap="round"/>
					</svg>
				</div>
				<span class="text-[11px] font-medium tracking-[0.2em] uppercase text-[#9d9d9d]">Admin Panel</span>
			</div>

			<!-- Middle: headline -->
			<div>
				<p class="text-[11px] tracking-[0.18em] uppercase text-[#6d6d6d] mb-5 font-medium">
					Store management
				</p>
				<h1 class="font-['Playfair_Display'] text-[2.6rem] leading-[1.15] font-normal text-[#f1efe9]">
					One place<br />
					<em class="not-italic text-brand">for everything</em><br />
					you manage.
				</h1>

				<!-- Accent bar -->
				<div class="mt-8 flex flex-col gap-[5px]">
					<div class="h-px w-16 bg-brand opacity-90"></div>
					<div class="h-px w-10 bg-brand opacity-50"></div>
					<div class="h-px w-6 bg-brand opacity-25"></div>
				</div>
			</div>

			<!-- Bottom: notice -->
			<div class="flex items-center gap-2.5">
				<div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
				<span class="text-[11px] tracking-wide text-[#6d6d6d] font-medium uppercase">
					Restricted · Authorised personnel only
				</span>
			</div>
		</div>
	</div>

	<!-- ── Right: form ── -->
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
			{#if form?.error}
				<div
					class="mb-6 flex items-start gap-2.5 rounded-sm border border-danger/20 bg-danger/5 px-3.5 py-3 text-[12.5px] text-danger"
					role="alert"
				>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" class="shrink-0 mt-px">
						<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
						<path d="M8 4.5v4M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
					</svg>
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							window.location.href = result.location;
							return;
						}
						loading = false;
						update();
					};
				}}
				novalidate
			>
				<fieldset disabled={loading} class="border-none p-0 flex flex-col gap-4">

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
							value="admin@example.com"
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
								placeholder="••••••••"
								autocomplete="current-password"
								required
								class="field-input pr-11"
								value="changeme123"
							/>
							<button
								type="button"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								on:click={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-copy-light hover:text-copy transition-colors p-0.5"
							>
								{#if showPassword}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
										<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
										<line x1="1" y1="1" x2="23" y2="23"/>
									</svg>
								{:else}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
										<circle cx="12" cy="12" r="3"/>
									</svg>
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
							Signing in…
						{:else}
							Sign in
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</button>

				</fieldset>
			</form>

			<!-- Divider + hint -->
			<div class="mt-8 pt-6 border-t border-subtle">
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