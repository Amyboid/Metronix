<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	interface Props {
		isOpen: boolean;
		slug: string;
		onclose?: () => void;
		onapply?: () => void;
	}

	let { isOpen = $bindable(false), slug, onclose, onapply }: Props = $props();

	// ─── Static filter data (replace with DB fetch later) ────────────────────
	const BRANDS = ['Samsung', 'LG', 'Whirlpool'];
	const BADGE_TAGS = ['new', 'on-sale', 'demanding'];
	const STOCK_OPTIONS = [
		{ label: 'In Stock', value: 'in_stock' },
		{ label: 'Out of Stock', value: 'out_of_stock' }
	];
	const PRICE_MIN = 0;
	const PRICE_MAX = 200000;

	// ─── Local filter state ───────────────────────────────────────────────────
	let selectedBrands = $state<string[]>([]);
	let selectedBadges = $state<string[]>([]);
	let selectedStock = $state<string[]>([]);
	let priceMin = $state(PRICE_MIN);
	let priceMax = $state(PRICE_MAX);

	// Sync local state from URL when panel opens
	$effect(() => {
		if (isOpen) {
			const p = page.url.searchParams;
			selectedBrands = p.getAll('brand');
			selectedBadges = p.getAll('badge');
			selectedStock = p.getAll('stock');
			priceMin = Number(p.get('minPrice') ?? PRICE_MIN);
			priceMax = Number(p.get('maxPrice') ?? PRICE_MAX);
		}
	});

	// ─── Derived: how many filters are active (for badge on button) ───────────
	// const activeCount = $derived(
	// 	selectedBrands.length +
	// 	selectedBadges.length +
	// 	selectedStock.length +
	// 	(priceMin > PRICE_MIN || priceMax < PRICE_MAX ? 1 : 0)
	// );

	// ─── Helpers ──────────────────────────────────────────────────────────────
	function toggle(arr: string[], value: string): string[] {
		return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
	}

	function reset() {
		selectedBrands = [];
		selectedBadges = [];
		selectedStock = [];
		priceMin = PRICE_MIN;
		priceMax = PRICE_MAX;
	}

	function apply() {
		const newUrl = new URL(page.url);
		// Wipe all filter + pagination params before re-applying
		['brand', 'badge', 'stock', 'minPrice', 'maxPrice', 'page'].forEach((k) =>
			newUrl.searchParams.delete(k)
		);

		selectedBrands.forEach((b) => newUrl.searchParams.append('brand', b));
		selectedBadges.forEach((b) => newUrl.searchParams.append('badge', b));
		selectedStock.forEach((s) => newUrl.searchParams.append('stock', s));

		if (priceMin > PRICE_MIN) newUrl.searchParams.set('minPrice', String(priceMin));
		if (priceMax < PRICE_MAX) newUrl.searchParams.set('maxPrice', String(priceMax));

		// Always reset to page 1 — filter changes the result set entirely
		newUrl.searchParams.set('page', '1');

		goto(newUrl.href, { noScroll: true });
		onapply?.(); // ← tell parent before navigating
		goto(newUrl.href, { noScroll: true });
		// Close on mobile after applying
		isOpen = false;
		onclose?.();
	}

	function cancel() {
		isOpen = false;
		onclose?.();
	}

	function fmt(n: number) {
		return '₹' + n.toLocaleString('en-IN');
	}
</script>

<!--
	Desktop: <aside> that animates width (parent flex layout pushes the grid right).
	Mobile:  bottom drawer rendered as fixed overlay — shown only when isOpen.
-->

<!-- ─── Desktop sidebar panel ─────────────────────────────────────────────── -->
<aside class="filter-panel border-subtle sticky top-nav {isOpen ? 'open' : ''}" aria-hidden={!isOpen}>
	<div class="panel-inner">
		<div class="panel-header">
			<span class="panel-title">Filters</span>
			<button class="text-btn" onclick={reset}>Reset all</button>
		</div>

		{@render filterBody()}

		<button class="apply-btn" onclick={apply}>Apply Filters</button>
	</div>
</aside>

<!-- ─── Mobile overlay + bottom drawer ───────────────────────────────────── -->
{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<button class="mob-overlay z-120" onclick={cancel} aria-label="cancel-btn"></button>

	<div class="mob-drawer z-120" role="dialog" aria-modal="true" aria-label="Filter panel">
		<div class="mob-handle"></div>

		<div class="mob-header">
			<span class="panel-title">Filters</span>
			<button class="icon-btn" onclick={cancel} aria-label="Close">
				<span class="icon-[ri--close-line] text-xl"></span>
			</button>
		</div>

		<div class="mob-body">
			{@render filterBody()}
		</div>

		<div class="mob-footer">
			<button class="outline-btn" onclick={reset}>Reset</button>
			<button class="apply-btn grow" onclick={apply}>Apply</button>
		</div>
	</div>
{/if}

<!-- ─── Shared filter body (snippet) ─────────────────────────────────────── -->
{#snippet filterBody()}
	<!-- Brand -->
	<div class="filter-group">
		<p class="group-label">Brand</p>
		{#each BRANDS as brand}
			<label class="check-row">
				<input
					type="checkbox"
					checked={selectedBrands.includes(brand)}
					onchange={() => (selectedBrands = toggle(selectedBrands, brand))}
				/>
				<span>{brand}</span>
			</label>
		{/each}
	</div>

	<!-- Badge -->
	<div class="filter-group">
		<p class="group-label">Badge</p>
		{#each BADGE_TAGS as badge}
			<label class="check-row">
				<input
					type="checkbox"
					checked={selectedBadges.includes(badge)}
					onchange={() => (selectedBadges = toggle(selectedBadges, badge))}
				/>
				<span class="capitalize">{badge}</span>
			</label>
		{/each}
	</div>

	<!-- Stock -->
	<div class="filter-group">
		<p class="group-label">Availability</p>
		{#each STOCK_OPTIONS as opt}
			<label class="check-row">
				<input
					type="checkbox"
					checked={selectedStock.includes(opt.value)}
					onchange={() => (selectedStock = toggle(selectedStock, opt.value))}
				/>
				<span>{opt.label}</span>
			</label>
		{/each}
	</div>

	<!-- Price range -->
	<div class="filter-group">
		<p class="group-label">Price Range</p>
		<div class="price-labels">
			<span>{fmt(priceMin)}</span>
			<span>{fmt(priceMax)}</span>
		</div>
		<div class="sliders">
			<input
				type="range"
				min={PRICE_MIN}
				max={PRICE_MAX}
				step={1000}
				bind:value={priceMin}
				oninput={() => {
					if (priceMin > priceMax - 1000) priceMin = priceMax - 1000;
				}}
				class="range-input"
			/>
			<input
				type="range"
				min={PRICE_MIN}
				max={PRICE_MAX}
				step={1000}
				bind:value={priceMax}
				oninput={() => {
					if (priceMax < priceMin + 1000) priceMax = priceMin + 1000;
				}}
				class="range-input"
			/>
		</div>
	</div>
{/snippet}

<style>
	/* ── Desktop panel ── */
	.filter-panel {
		display: none;
	}

	@media (min-width: 768px) {
		.filter-panel {
			display: block;
			width: 0;
			min-width: 0;
			overflow: hidden;
			flex-shrink: 0;
			transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
		}
		.filter-panel.open {
			width: 300px;
		}
	}

	.panel-inner {
		width:100%;
		padding: 1.25rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		height: 100%;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.panel-title {
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-copy);
	}

	/* ── Filter groups ── */
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.group-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--color-copy-light);
		margin-bottom: 0.125rem;
	}

	.check-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-copy);
		cursor: pointer;
		user-select: none;
		padding: 0.125rem 0;
	}

	.check-row input[type='checkbox'] {
		width: 0.9375rem;
		height: 0.9375rem;
		accent-color: var(--color-link);
		cursor: pointer;
		flex-shrink: 0;
	}

	/* ── Price slider ── */
	.price-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: var(--color-copy-light);
	}

	.sliders {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.range-input {
		width: 100%;
		accent-color: var(--color-link);
		cursor: pointer;
	}

	/* ── Buttons ── */
	.apply-btn {
		width: 100%;
		padding: 0.625rem 1rem;
		background: var(--color-link);
		color: #fff;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}
	.apply-btn:hover {
		opacity: 0.85;
	}

	.text-btn {
		font-size: 0.75rem;
		color: var(--color-copy-light);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
	}
	.text-btn:hover {
		color: var(--color-copy);
	}

	/* ── Mobile overlay ── */
	.mob-overlay {
		display: none;
	}
	.mob-drawer {
		display: none;
	}

	@media (max-width: 768px) {
		.mob-overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.45);
			animation: fadeIn 0.2s ease;
		}

		.mob-drawer {
			display: flex;
			flex-direction: column;
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			max-height: 88dvh;
			background: var(--color-surface);
			border-radius: 1.25rem 1.25rem 0 0;
			overflow: hidden;
			animation: slideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.mob-handle {
			width: 2.5rem;
			height: 0.25rem;
			border-radius: 9999px;
			background: var(--color-subtle);
			margin: 0.75rem auto 0;
			flex-shrink: 0;
		}

		.mob-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1rem 1.25rem 0.75rem;
			border-bottom: 1px solid var(--color-subtle);
			flex-shrink: 0;
		}

		.icon-btn {
			background: none;
			border: none;
			cursor: pointer;
			color: var(--color-copy);
			display: flex;
			align-items: center;
			padding: 0.25rem;
		}

		.mob-body {
			flex: 1;
			overflow-y: auto;
			padding: 1.25rem;
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.mob-footer {
			display: flex;
			gap: 0.75rem;
			padding: 1rem 1.25rem;
			border-top: 1px solid var(--color-subtle);
			flex-shrink: 0;
		}

		.outline-btn {
			flex: 1;
			padding: 0.625rem 1rem;
			border: 1px solid var(--color-subtle);
			background: none;
			border-radius: 0.5rem;
			font-size: 0.875rem;
			font-weight: 600;
			cursor: pointer;
			color: var(--color-copy);
		}

		.apply-btn {
			flex: 2;
			width: auto;
		}
		.grow {
			flex-grow: 1;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
