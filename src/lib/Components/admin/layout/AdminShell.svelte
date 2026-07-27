<script lang="ts">
	import LeftNav from './LeftNav.svelte';
	import BottomNav from './BottomNav.svelte';
	import Breadcrumb from './Breadcrumb.svelte';
	import PermissionDeniedModal from '../PermissionDeniedModal.svelte';
	import { onMount } from 'svelte';

	const { adminEmail = '', storeName = 'Admin Panel', children } = $props<{ adminEmail?: string; storeName?: string; children?: any }>();

	let collapsed = $state(false);

	onMount(() => {
		collapsed = localStorage.getItem('adminNavCollapsed') === 'true';
	});

	function toggleCollapse() {
		collapsed = !collapsed;
		localStorage.setItem('adminNavCollapsed', String(collapsed));
	}

	async function handleSignOut() {
		await fetch('/api/auth/sign-out', { method: 'POST' });
		window.location.href = '/admin';
	}
</script>

<div class="shell">
	<header class="topbar">
		<div class="topbar-left">
			<span class="store-name">{storeName}</span>
		</div>
		<div class="topbar-right">
			{#if adminEmail}
				<span class="truncate max-w-[200px] text-[0.8125rem] text-copy-light">{adminEmail}</span>
			{/if}
			<button class="logout-btn" onclick={handleSignOut} aria-label="Sign out">
				<span class="icon-[lucide--log-out] w-4 h-4"></span>
				<span class="logout-label">Sign out</span>
			</button>
		</div>
	</header>

	<div class="flex flex-1 w-full min-h-0">
		<aside class="left-nav-wrap" class:collapsed aria-label="Sidebar">
			<LeftNav {collapsed} onToggle={toggleCollapse} />
		</aside>

		<div class="content-col" class:collapsed>
			<Breadcrumb />
			<main class="flex-1 min-h-0 overflow-y-auto flex flex-col">
				{@render children?.()}
			</main>
		</div>
	</div>

	<div class="bottom-nav-wrap" aria-label="Bottom navigation">
		<BottomNav />
	</div>

	<PermissionDeniedModal />
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		background: var(--color-neutral);
		font-family: var(--font-inter), sans-serif;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		height: var(--spacing-nav);
		min-height: var(--spacing-nav);
		border-bottom: 1px solid var(--color-subtle);
		background: var(--color-neutral);
		flex-shrink: 0;
	}

	.topbar-left { display: flex; align-items: center; }
	.store-name { font-size: 0.9375rem; font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em; }
	.topbar-right { display: flex; align-items: center; gap: 12px; }

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
	.logout-btn:hover { background: var(--color-surface); border-color: var(--color-subtle-hover); color: #1a1a1a; }

	.left-nav-wrap {
		display: flex;
		flex-shrink: 0;
		width: 220px;
		transition: width 0.2s ease;
	}
	.left-nav-wrap.collapsed { width: 60px; }

	.content-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}

	.bottom-nav-wrap { display: none; }

	@media (max-width: 768px) {
		.left-nav-wrap { display: none !important; }
		.bottom-nav-wrap { display: block !important; }
		.topbar { padding: 0 16px; }
		.content-col { width: 100% !important; }
		.logout-label { display: none; }
		.logout-btn { padding: 6px 8px; }
	}
</style>
