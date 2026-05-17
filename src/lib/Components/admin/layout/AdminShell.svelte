<script lang="ts">
	import LeftNav from './LeftNav.svelte';
	import BottomNav from './BottomNav.svelte';
	import Breadcrumb from './Breadcrumb.svelte';

	export let adminEmail: string = '';
	export let storeName: string = 'Admin Panel';

	async function handleSignOut() {
		// better-auth sign-out — POST to the sign-out endpoint
		await fetch('/api/auth/sign-out', { method: 'POST' });
		window.location.href = '/admin';
	}
</script>

<div class="shell">
	<!-- Top bar -->
	<header class="topbar">
		<div class="topbar-left">
			<span class="store-name">{storeName}</span>
		</div>
		<div class="topbar-right">
			{#if adminEmail}
				<span class="admin-email">{adminEmail}</span>
			{/if}
			<button class="logout-btn" on:click={handleSignOut} aria-label="Sign out">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
					<polyline points="16 17 21 12 16 7"/>
					<line x1="21" y1="12" x2="9" y2="12"/>
				</svg>
				<span class="logout-label">Sign out</span>
			</button>
		</div>
	</header>

	<!-- Body: left nav + main -->
	<div class="body">
		<!-- Desktop left nav (hidden on mobile) -->
		<aside class="left-nav-wrap" aria-label="Sidebar">
			<LeftNav />
		</aside>

		<!-- Content column -->
		<div class="content-col">
			<Breadcrumb />
			<main class="main-content">
				<slot />
			</main>
		</div>
	</div>

	<!-- Mobile bottom nav -->
	<div class="bottom-nav-wrap" aria-label="Bottom navigation">
		<BottomNav />
	</div>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: var(--color-neutral);
		font-family: var(--font-inter), sans-serif;
	}

	/* ── Top bar ── */
	.topbar {
		height: var(--spacing-nav);
		min-height: var(--spacing-nav);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		border-bottom: 1px solid var(--color-subtle);
		background: var(--color-neutral);
		z-index: 50;
		flex-shrink: 0;
	}

	.topbar-left {
		display: flex;
		align-items: center;
	}

	.store-name {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #1a1a1a;
		letter-spacing: -0.02em;
	}

	.topbar-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.admin-email {
		font-size: 0.8125rem;
		color: var(--color-copy-light);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: 1px solid var(--color-subtle);
		border-radius: 6px;
		padding: 5px 10px;
		cursor: pointer;
		font-family: var(--font-inter), sans-serif;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-copy);
		transition: background 0.15s, border-color 0.15s, color 0.15s;
	}

	.logout-btn:hover {
		background: var(--color-surface);
		border-color: var(--color-subtle-hover);
		color: #1a1a1a;
	}

	/* ── Body ── */
	.body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Left nav (desktop only) ── */
	.left-nav-wrap {
		display: flex;
		flex-shrink: 0;
	}

	/* ── Content column ── */
	.content-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.main-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	/* ── Bottom nav (mobile only) ── */
	.bottom-nav-wrap {
		display: none;
	}

	/* ── Responsive ── */
	@media (max-width: 767px) {
		.left-nav-wrap {
			display: none;
		}

		.bottom-nav-wrap {
			display: block;
		}

		.main-content {
			padding: 16px;
			/* Leave room for bottom nav */
			padding-bottom: calc(var(--spacing-nav) + 16px + env(safe-area-inset-bottom, 0px));
		}

		.admin-email {
			display: none;
		}

		.logout-label {
			display: none;
		}

		.logout-btn {
			padding: 6px 8px;
		}
	}
</style>