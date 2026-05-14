// src/lib/server/services/sectionService.ts
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const sectionFetchers = {
    'product-slider': async (config: any) => {
        return await db.select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            mainImagePath: products.mainImagePath,
            colors: products.colors,
        })
        .from(products)
        .where(
            and(
                eq(products.categorySlug, config.categorySlug ?? ''),
                eq(products.promotionTag, config.tag ?? ''),
                eq(products.isPublished, true)
            )
        )
        .limit(config.limit ?? 4);
    },

    'long-banner': async (config: any) => {
        // Banners usually have all info in config, so no DB fetch needed
        return null; 
    },

    // Future templates are easy to add here:
    'category-grid': async (config: any) => {
        // return await db.select()...
    }
};