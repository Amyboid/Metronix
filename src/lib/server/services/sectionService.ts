// src/lib/server/services/sectionService.ts
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, and, SQL } from 'drizzle-orm';

export const sectionFetchers = {
    'product-slider': async (config: any) => {
        const conditions: SQL[] = [eq(products.isPublished, true)];

        // Support both old config (categorySlug) and new config (filterType + filterValue)
        const filterType  = config.filterType ?? 'category';
        const filterValue = config.filterValue ?? config.categorySlug ?? '';

        if (filterType === 'product_type') {
            conditions.push(eq(products.productType, filterValue));
        } else {
            conditions.push(eq(products.categorySlug, filterValue));
        }

        if (config.tag) {
            conditions.push(eq(products.promotionTag, config.tag));
        }

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
        .limit(Number(config.limit) || 4);
    },

    'long-banner': async (config: any) => {
        return config;
    },

    'category-grid': async (config: any) => {
        return [];
    }
};
