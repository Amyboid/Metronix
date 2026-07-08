<script lang="ts">
	import { env } from '$env/dynamic/public';
	const base = env.PUBLIC_ASSET_BASE_URL || '';

	let {
		config = {},
		schemaDefinition = [],
	}: {
		config: Record<string, any>;
		schemaDefinition: { field: string; type: string; label?: string }[];
	} = $props();

	const layout = $derived(config.layout ?? 'stacked');

	const gridStyle = $derived.by(() => {
		switch (layout) {
			case '2col-equal': return 'grid-template-columns: 1fr 1fr';
			case '2col-60-40': return 'grid-template-columns: 3fr 2fr';
			case '2col-40-60': return 'grid-template-columns: 2fr 3fr';
			case '3col': return 'grid-template-columns: 1fr 1fr 1fr';
			default: return 'grid-template-columns: 1fr';
		}
	});

	function img(path: string) {
		return `${base}/${path}`;
	}

	const heading = $derived(config.heading ?? '');
	const subheading = $derived(config.subheading ?? '');
	const ctaLink = $derived(config.ctaLink ?? '');
	const ctaText = $derived(config.ctaText ?? '');

	// Separate fields by type for layout
	const imageFields = $derived(
		schemaDefinition.filter(f => f.type === 'image' && config[f.field])
	);
	const textFields = $derived(
		schemaDefinition.filter(f => f.type === 'text' && config[f.field] && f.field !== 'heading' && f.field !== 'subheading' && f.field !== 'ctaText' && f.field !== 'ctaLink')
	);
</script>

<section class="generic-section mb-10">
	{#if heading}
		<h2 class="generic-heading">{heading}</h2>
	{/if}
	{#if subheading}
		<p class="generic-subheading">{subheading}</p>
	{/if}

	<div class="generic-grid" style={gridStyle}>
		{#each imageFields as field}
			<img
				src={img(config[field.field])}
				alt={field.label ?? field.field}
				class="generic-image"
				loading="lazy"
			/>
		{/each}
		{#each textFields as field}
			<p class="generic-text">{config[field.field]}</p>
		{/each}
	</div>

	{#if ctaLink && ctaText}
		<a href={ctaLink} class="generic-cta">{ctaText}</a>
	{/if}
</section>

<style>
	.generic-section {
		padding: 0 1rem;
	}
	.generic-heading {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 0.5rem;
	}
	.generic-subheading {
		font-size: 0.9375rem;
		color: #6d6d6d;
		margin: 0 0 1rem;
	}
	.generic-grid {
		display: grid;
		gap: 1rem;
	}
	.generic-image {
		width: 100%;
		height: auto;
		border-radius: 0.75rem;
		object-fit: cover;
	}
	.generic-text {
		font-size: 0.875rem;
		color: #6d6d6d;
		line-height: 1.6;
		margin: 0;
	}
	.generic-cta {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.6rem 1.5rem;
		background: var(--color-primary, #0bacc5);
		color: #fff;
		border-radius: 0.5rem;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		transition: opacity 0.2s;
	}
	.generic-cta:hover {
		opacity: 0.85;
	}

	@media (max-width: 768px) {
		.generic-heading {
			font-size: 1.25rem;
		}
	}
</style>
