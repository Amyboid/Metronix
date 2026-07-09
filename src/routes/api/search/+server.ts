import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const rows = await db.select({
        name: products.name,
        slug: products.slug,
        brand: products.brand,
        categorySlug: products.categorySlug,
        productType: products.productType,
    })
    .from(products)
    .where(eq(products.isPublished, true));

    return json(rows);
};
