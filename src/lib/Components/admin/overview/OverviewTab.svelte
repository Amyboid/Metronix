<script lang="ts">
	export let user: { name: string; email: string; role: string };
</script>

<div class="overview">
	<div class="welcome">
		<h1 class="title">Welcome back, {user.name.split(' ')[0]}</h1>
		<p class="subtitle">Here's what's happening with your store today.</p>
	</div>

	<div class="cards">
		<div class="card">
			<span class="card-label">Products</span>
			<span class="card-value">—</span>
		</div>
		<div class="card">
			<span class="card-label">Locations</span>
			<span class="card-value">—</span>
		</div>
		<div class="card">
			<span class="card-label">Pages</span>
			<span class="card-value">—</span>
		</div>
		<div class="card">
			<span class="card-label">Brands</span>
			<span class="card-value">—</span>
		</div>
	</div>
</div>

<style>
	.overview {
		display: flex;
		flex-direction: column;
		gap: 28px;
		font-family: var(--font-inter), sans-serif;
	}

	.welcome {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		letter-spacing: -0.03em;
	}

	.subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-copy-light);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 16px;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-subtle);
		border-radius: 10px;
		padding: 20px 18px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.card-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-copy-light);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.card-value {
		font-size: 2rem;
		font-weight: 700;
		color: #1a1a1a;
		letter-spacing: -0.04em;
	}
</style>