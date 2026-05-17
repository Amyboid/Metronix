<script lang="ts">
	import { adminNav, getBreadcrumbs, getParentView, type AdminView } from '$lib/stores/adminNav';

	$: crumbs = getBreadcrumbs($adminNav);
	$: parentView = getParentView($adminNav);
</script>

<div class="breadcrumb-bar">
	{#if parentView}
		<button
			class="back-btn"
			on:click={() => parentView && adminNav.navigate(parentView)}
			aria-label="Go back"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6"/>
			</svg>
			<span>Back</span>
		</button>
		<span class="divider" aria-hidden="true"></span>
	{/if}

	<nav class="crumbs" aria-label="Breadcrumb">
		{#each crumbs as crumb, i}
			{#if i > 0}
				<span class="sep" aria-hidden="true">/</span>
			{/if}
			{#if crumb.view}
				<button
					class="crumb crumb-link"
					on:click={() => crumb.view && adminNav.navigate(crumb.view)}
				>{crumb.label}</button>
			{:else}
				<span class="crumb crumb-current" aria-current="page">{crumb.label}</span>
			{/if}
		{/each}
	</nav>
</div>

<style>
	.breadcrumb-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 24px;
		border-bottom: 1px solid var(--color-subtle);
		background: var(--color-neutral);
		min-height: 44px;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-inter), sans-serif;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-copy);
		padding: 4px 8px;
		border-radius: 6px;
		transition: background 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.back-btn:hover {
		background: var(--color-surface);
		color: #1a1a1a;
	}

	.divider {
		width: 1px;
		height: 16px;
		background: var(--color-subtle);
		flex-shrink: 0;
	}

	.crumbs {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.sep {
		color: var(--color-copy-light);
		font-size: 0.8125rem;
		user-select: none;
	}

	.crumb {
		font-family: var(--font-inter), sans-serif;
		font-size: 0.8125rem;
	}

	.crumb-link {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		color: var(--color-primary);
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-color: transparent;
		transition: text-decoration-color 0.15s;
	}

	.crumb-link:hover {
		text-decoration-color: var(--color-primary);
	}

	.crumb-current {
		color: var(--color-copy);
		font-weight: 600;
	}
</style>