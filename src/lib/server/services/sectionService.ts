import { db } from '$lib/server/db';
import { products, tags } from '$lib/server/db/schema';
import { eq, and, or, sql, SQL } from 'drizzle-orm';

function buildProductConditions(config: any): SQL[] {
    const conditions: SQL[] = [eq(products.isPublished, true)];
    const filterType  = config.linkTo ?? 'category';
    const filterValue = config.linkValue ?? '';

    if (filterType === 'product_type') {
        conditions.push(eq(products.productType, filterValue));
    } else {
        conditions.push(eq(products.categorySlug, filterValue));
    }
    return conditions;
}

async function withBadgeLabels<T extends { badgeTag: string | null }>(rows: T[]): Promise<(T & { badgeLabel: string | null })[]> {
    const values = [...new Set(rows.map(r => r.badgeTag).filter(Boolean))] as string[];
    if (!values.length) return rows.map(r => ({ ...r, badgeLabel: null }));
    const tagRows = await db.select({ value: tags.value, label: tags.label })
        .from(tags)
        .where(and(eq(tags.type, 'badge'), or(...values.map(v => eq(tags.value, v)))));
    const map = new Map(tagRows.map(t => [t.value, t.label]));
    return rows.map(r => ({ ...r, badgeLabel: r.badgeTag ? (map.get(r.badgeTag) ?? null) : null }));
}

export const sectionFetchers = {
    'product-slider': async (config: any) => {
        const conditions = buildProductConditions(config);
        const limit = Number(config.productLimit) || 4;

        // Soft priority: products with matching promotionTag first, then the rest
        const tagOrder = config.promotionTag
            ? sql`CASE WHEN ${products.promotionTag} = ${config.promotionTag} THEN 0 ELSE 1 END`
            : sql`1`;

        const rows = await db.select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            discountPrice: products.discountPrice,
            mainImagePath: products.mainImagePath,
            colors: products.colors,
            badgeTag: products.badgeTag,
        })
        .from(products)
        .where(and(...conditions))
        .orderBy(tagOrder, sql`${products.createdAt} DESC`)
        .limit(limit);

        return withBadgeLabels(rows);
    },

    'long-banner': async (config: any) => {
        return config;
    },

    'two-column-grid': async (config: any) => {
        const result: any = { ...config };

        const leftSlug = config.leftProductName ?? config.leftProductSlug;
        if (config.leftMode === 'single' && leftSlug) {
            const rows = await db.select({
                id: products.id, name: products.name, slug: products.slug,
                price: products.price, discountPrice: products.discountPrice,
                mainImagePath: products.mainImagePath, colors: products.colors, badgeTag: products.badgeTag,
            }).from(products).where(eq(products.slug, leftSlug)).limit(1);
            const enriched = await withBadgeLabels(rows);
            result.leftProduct = enriched[0] ?? null;
        }

        const rightSlug = config.rightProductName ?? config.rightProductSlug;
        if (config.rightMode === 'single' && rightSlug) {
            const rows = await db.select({
                id: products.id, name: products.name, slug: products.slug,
                price: products.price, discountPrice: products.discountPrice,
                mainImagePath: products.mainImagePath, colors: products.colors, badgeTag: products.badgeTag,
            }).from(products).where(eq(products.slug, rightSlug)).limit(1);
            const enriched = await withBadgeLabels(rows);
            result.rightProduct = enriched[0] ?? null;
        }

        return result;
    },

    'product-highlight': async (config: any) => {
        return config;
    },
};
