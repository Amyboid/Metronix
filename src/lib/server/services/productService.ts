// lib/server/services/productService.ts
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, gt, lt, and, or, asc, desc, count, sql, gte, lte, inArray } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'price' | 'createdAt';

interface SortConfig {
    col: typeof products.price | typeof products.createdAt;
    dirAsc: boolean;
    primaryName: SortKey;
}

export interface ProductFilters {
    brands?:    string[];   // e.g. ['Samsung', 'LG']
    badges?:    string[];   // e.g. ['new', 'on-sale']
    stock?:     string[];   // e.g. ['in_stock']
    minPrice?:  number;
    maxPrice?:  number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortToPrimary(sort: string): SortConfig {
    switch (sort) {
        case 'price-low':  return { col: products.price,     dirAsc: true,  primaryName: 'price' };
        case 'price-high': return { col: products.price,     dirAsc: false, primaryName: 'price' };
        case 'oldest':     return { col: products.createdAt, dirAsc: true,  primaryName: 'createdAt' };
        default:           return { col: products.createdAt, dirAsc: false, primaryName: 'createdAt' };
    }
}

/**
 * Base slug filter — matches category OR productType slug, published only.
 * All queries start with this.
 */
function baseWhere(slug: string) {
    return and(
        or(eq(products.categorySlug, slug), eq(products.productType, slug)),
        eq(products.isPublished, true)
    );
}

/**
 * Build additional filter conditions from active filters.
 * Returns an array of SQL conditions to spread into and().
 * Empty array when no filters active — zero overhead.
 */
function buildFilterConditions(filters: ProductFilters) {
    const conditions: any[] = [];

    if (filters.brands?.length)
        conditions.push(inArray(products.brand, filters.brands));

    if (filters.badges?.length)
        conditions.push(inArray(products.badgeTag, filters.badges));

    if (filters.stock?.length)
        conditions.push(inArray(products.stockStatus, filters.stock));

    if (filters.minPrice !== undefined)
        conditions.push(gte(products.price, filters.minPrice));

    if (filters.maxPrice !== undefined)
        conditions.push(lte(products.price, filters.maxPrice));

    return conditions;
}

/**
 * Shared WHERE clause = base slug filters + active user filters.
 */
function fullWhere(slug: string, filters: ProductFilters) {
    const filterConds = buildFilterConditions(filters);
    return filterConds.length
        ? and(baseWhere(slug), ...filterConds)
        : baseWhere(slug);
}

/**
 * Build cursor WHERE condition.
 * Uses ::timestamp(3) cast for createdAt to match column precision after migration.
 * Extracted as a shared function so getCursorForPage and getProductsCursor
 * produce identical boundary conditions — prevents items falling in cracks.
 */
function buildCursorCondition(
    primaryCol: typeof products.price | typeof products.createdAt,
    primaryName: SortKey,
    lastPrimary: string | number,
    lastId: string,
    dirAsc: boolean
) {
    const primarySql = primaryName === 'createdAt'
        ? sql`${String(lastPrimary)}::timestamp(3)`
        : sql`${Number(lastPrimary)}`;

    if (dirAsc) {
        return or(
            gt(primaryCol, primarySql as any),
            and(eq(primaryCol, primarySql as any), gt(products.id, lastId))
        );
    } else {
        return or(
            lt(primaryCol, primarySql as any),
            and(eq(primaryCol, primarySql as any), lt(products.id, lastId))
        );
    }
}

// ─── Server-side count cache ──────────────────────────────────────────────────
// Keyed by slug + serialised filters so filtered counts are cached separately.
// TTL of 60s — balances freshness vs DB load.
// This avoids the COUNT(*) query on every page navigation when client carries
// ?total= in URL, AND avoids the URL becoming polluted with total= param.

interface CacheEntry { value: number; ts: number }
const countCache = new Map<string, CacheEntry>();
const CACHE_TTL  = 60_000; // 1 minute

function countCacheKey(slug: string, filters: ProductFilters): string {
    return `${slug}::${JSON.stringify(filters)}`;
}

async function getCachedCount(slug: string, filters: ProductFilters): Promise<number> {
    const key    = countCacheKey(slug, filters);
    const cached = countCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.value;

    const res = await db
        .select({ value: count() })
        .from(products)
        .where(fullWhere(slug, filters));

    const value = res[0].value;
    countCache.set(key, { value, ts: Date.now() });
    return value;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * getProductsCursor
 * Keyset/cursor query with filter support.
 * Pass null cursors to get the very first chunk.
 */
export async function getProductsCursor(
    slug: string,
    limit = 6,
    lastPrimary: string | number | null = null,
    lastId: string | null = null,
    sort = 'newest',
    filters: ProductFilters = {}
) {
    const { col: primaryCol, dirAsc, primaryName } = sortToPrimary(sort);

    const orderBy = dirAsc
        ? [asc(primaryCol), asc(products.id)]
        : [desc(primaryCol), desc(products.id)];

    const cursorCond = (lastPrimary !== null && lastId !== null)
        ? buildCursorCondition(primaryCol, primaryName, lastPrimary, lastId, dirAsc)
        : undefined;

    const whereClause = cursorCond
        ? and(fullWhere(slug, filters), cursorCond)
        : fullWhere(slug, filters);

    return db.select({
        id:            products.id,
        name:          products.name,
        slug:          products.slug,
        price:         products.price,
        discountPrice: products.discountPrice,
        mainImagePath: products.mainImagePath,
        stockStatus:   products.stockStatus,
        badgeTag:      products.badgeTag,
        brand:         products.brand,
        createdAt:     products.createdAt,
    })
        .from(products)
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(limit);
}

/**
 * getCursorForPage
 * Finds cursor for the last item of the PREVIOUS page (page N-1),
 * which marks the boundary before the current page starts.
 * Uses OFFSET once per SSR navigation — acceptable cost.
 */
export async function getCursorForPage(
    slug: string,
    page: number,
    pageSize: number,
    sort = 'newest',
    filters: ProductFilters = {}
): Promise<{ lastPrimary: number | string; lastId: string } | null> {
    if (page <= 1) return null;

    // Last item of previous page = index (page-1)*pageSize - 1 (0-based)
    const targetIndex = (page - 1) * pageSize - 1;
    const { col: primaryCol, dirAsc, primaryName } = sortToPrimary(sort);

    const orderBy = dirAsc
        ? [asc(primaryCol), asc(products.id)]
        : [desc(primaryCol), desc(products.id)];

    const rows = await db.select({
        primaryVal: primaryCol,
        id:         products.id,
    })
        .from(products)
        .where(fullWhere(slug, filters))
        .orderBy(...orderBy)
        .offset(targetIndex)
        .limit(1);

    if (!rows || rows.length === 0) return null;

    const r = rows[0];
    const lastPrimary = primaryName === 'price'
        ? Number(r.primaryVal)
        : (r.primaryVal as Date).toISOString();

    return { lastPrimary, lastId: r.id };
}

/**
 * getProductCount
 * Cached count — won't hit DB more than once per minute per slug+filter combo.
 * Called on every page load but returns cached value on page navigation.
 */
export async function getProductCount(
    slug: string,
    filters: ProductFilters = {}
): Promise<number> {
    return getCachedCount(slug, filters);
}