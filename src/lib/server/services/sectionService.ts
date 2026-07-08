import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, and, SQL } from 'drizzle-orm';

function buildProductConditions(config: any): SQL[] {
    const conditions: SQL[] = [eq(products.isPublished, true)];
    const filterType  = config.linkTo ?? config.filterType ?? 'category';
    const filterValue = config.linkValue ?? config.filterValue ?? config.categorySlug ?? '';

    if (filterType === 'product_type') {
        conditions.push(eq(products.productType, filterValue));
    } else {
        conditions.push(eq(products.categorySlug, filterValue));
    }
    return conditions;
}

export const sectionFetchers = {
    'product-slider': async (config: any) => {
        const conditions = buildProductConditions(config);
        const tag = config.promotionTag ?? config.tag;
        if (tag) conditions.push(eq(products.promotionTag, tag));

        const limit = Number(config.productLimit ?? config.limit) || 4;

        return await db.select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            mainImagePath: products.mainImagePath,
            colors: products.colors,
        })
        .from(products)
        .where(and(...conditions))
        .limit(limit);
    },

    'long-banner': async (config: any) => {
        return config;
    },

    'two-column-grid': async (config: any) => {
        // Fetch single products if needed
        const result: any = { ...config };

        if (config.leftMode === 'single' && config.leftProductName) {
            const rows = await db.select({
                id: products.id, name: products.name, slug: products.slug,
                price: products.price, mainImagePath: products.mainImagePath, colors: products.colors,
            }).from(products).where(eq(products.slug, config.leftProductName)).limit(1);
            result.leftProduct = rows[0] ?? null;
        }

        if (config.rightMode === 'single' && config.rightProductName) {
            const rows = await db.select({
                id: products.id, name: products.name, slug: products.slug,
                price: products.price, mainImagePath: products.mainImagePath, colors: products.colors,
            }).from(products).where(eq(products.slug, config.rightProductName)).limit(1);
            result.rightProduct = rows[0] ?? null;
        }

        return result;
    },

    'product-highlight': async (config: any) => {
        return config;
    },
};
