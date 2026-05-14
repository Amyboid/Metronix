// routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { getProductsCursor, type ProductFilters } from '$lib/server/services/productService';

export async function GET({ url }) {
    const slug = url.searchParams.get('slug') ?? '';
    const sort = url.searchParams.get('sort') ?? 'newest';
    const limit = Math.min(50, Number(url.searchParams.get('limit') ?? '6'));
    const lastId = url.searchParams.get('lastId') ?? null;
    const lastPrimaryRaw = url.searchParams.get('lastPrimary') ?? null;
    console.log("🌿 Api called: ", slug, lastId, lastPrimaryRaw);

    if (!slug) return json({ error: 'slug is required' }, { status: 400 });
    if (limit < 1) return json({ error: 'invalid limit' }, { status: 400 });

    // Parse filters from query params
    const brands = url.searchParams.getAll('brand');
    const badges = url.searchParams.getAll('badge');
    const stock = url.searchParams.getAll('stock');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');

    const filters: ProductFilters = {};
    if (brands.length) filters.brands = brands;
    if (badges.length) filters.badges = badges;
    if (stock.length) filters.stock = stock;
    if (minPrice !== null) filters.minPrice = Number(minPrice);
    if (maxPrice !== null) filters.maxPrice = Number(maxPrice);

    // Normalise lastPrimary type
    let lastPrimary: string | number | null = null;
    if (lastPrimaryRaw !== null) {
        lastPrimary = (sort === 'price-low' || sort === 'price-high')
            ? Number(lastPrimaryRaw)
            : lastPrimaryRaw;
    }

    try {
        const products = await getProductsCursor(slug, limit, lastPrimary, lastId, sort, filters);
        return json(products);
    } catch (err) {
        console.error('[API /products] error:', err);
        return json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}