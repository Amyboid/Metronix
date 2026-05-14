// routes/products/details/[slug]/+page.server.ts
import { db } from '$lib/server/db';
import { products, productVariants } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, and, ne } from 'drizzle-orm';

export async function load({ params, setHeaders }) {
    const { slug } = params;

    setHeaders({ 'cache-control': 'public, max-age=86400' });

    // 1. Fetch product by slug
    const productRow = await db.query.products.findFirst({
        where: eq(products.slug, slug),
    });

    if (!productRow) throw error(404, 'Product not found');

    // 2. Fetch variants + similar products in parallel
    const [variantRows] = await Promise.all([
        db.select()
            .from(productVariants)
            .where(eq(productVariants.productId, productRow.id)),
    ]);

    return {
        product:         productRow,
        variants:        variantRows,
        streamed: {
        similarProducts: db.select({
            id:            products.id,
            name:          products.name,
            slug:          products.slug,
            price:         products.price,
            discountPrice: products.discountPrice,
            mainImagePath: products.mainImagePath,
            badgeTag:      products.badgeTag,
            colors:        products.colors,
        })
        .from(products)
        .where(and(
            eq(products.productType, productRow.productType),
            eq(products.isPublished, true),
            ne(products.id, productRow.id)
        ))
        .limit(3),
    }
    };
}