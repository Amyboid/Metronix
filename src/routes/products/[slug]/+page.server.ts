// routes/[slug]/+page.server.ts
import { db } from '$lib/server/db';
import { categories, productTypes } from '$lib/server/db/schema';
import {
    getProductsCursor,
    getCursorForPage,
    getProductCount,
    type ProductFilters
} from '$lib/server/services/productService';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

/** Parse filter params from URL into a ProductFilters object. */
function parseFilters(url: URL): ProductFilters {
    const brands    = url.searchParams.getAll('brand');
    const categories = url.searchParams.getAll('category');
    const types     = url.searchParams.getAll('type');
    const badges    = url.searchParams.getAll('badge');
    const stock     = url.searchParams.getAll('stock');
    const colors    = url.searchParams.getAll('color');
    const minPrice  = url.searchParams.get('minPrice');
    const maxPrice  = url.searchParams.get('maxPrice');

    const filters: ProductFilters = {};
    if (brands.length)          filters.brands    = brands;
    if (categories.length)      filters.categories = categories;
    if (types.length)           filters.types     = types;
    if (badges.length)          filters.badges    = badges;
    if (stock.length)           filters.stock     = stock;
    if (colors.length)          filters.colors    = colors;
    if (minPrice !== null)      filters.minPrice  = Number(minPrice);
    if (maxPrice !== null)      filters.maxPrice  = Number(maxPrice);
    return filters;
}

export async function load({ params, url, setHeaders }) {
    const { slug } = params;

    const page    = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const sort    = url.searchParams.get('sort') || 'newest';
    const filters = parseFilters(url);

    const PAGE_SIZE     = 30;
    const INITIAL_CHUNK = 6;

    setHeaders({ 'cache-control': 'private, max-age=60' });

    // Meta lookup
    const [catMeta, typeMeta] = await Promise.all([
        db.select().from(categories).where(eq(categories.slug, slug)).limit(1),
        db.select().from(productTypes).where(eq(productTypes.slug, slug)).limit(1)
    ]);

    const activeMeta = catMeta[0] || typeMeta[0];
    if (!activeMeta) throw error(404, 'Not found');

    // Cursor for this page (lightweight, OFFSET=1 row)
    const cursor = await getCursorForPage(slug, page, PAGE_SIZE, sort, filters);

    return {
        meta:     activeMeta,
        slug,
        pageSize: PAGE_SIZE,
        // Pass filters back to client so FilterPanel can read current state
        activeFilters: filters,
        streamed: {
            products: getProductsCursor(
                slug,
                INITIAL_CHUNK,
                cursor?.lastPrimary ?? null,
                cursor?.lastId     ?? null,
                sort,
                filters
            ),
            // Server-side cache means this is rarely a real DB hit
            totalItems: getProductCount(slug, filters),
        }
    };
}