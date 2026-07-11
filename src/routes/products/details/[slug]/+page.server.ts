// routes/products/details/[slug]/+page.server.ts
import { db } from '$lib/server/db';
import { products, productVariants, tags } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, and, ne, or } from 'drizzle-orm';

async function getBadgeLabel(value: string | null): Promise<string | null> {
    if (!value) return null;
    const row = await db.select({ label: tags.label }).from(tags)
        .where(and(eq(tags.type, 'badge'), eq(tags.value, value))).limit(1);
    return row[0]?.label ?? null;
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

    const mainBadgeLabel = await getBadgeLabel(productRow.badgeTag);

    return {
        product:         { ...productRow, badgeLabel: mainBadgeLabel },
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
        .limit(3)
        .then(withBadgeLabels),
    }
    };
}