// routes/api/admin/products/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
    products,
    productVariants,
    productAvailability,
    locations,
    categories,
    brands,
    productTypes,
} from '$lib/server/db/schema';
import { eq, and, or, inArray, asc, desc, gt, lt, count, gte, lte, sql } from 'drizzle-orm';
import { writeAuditLog } from '$lib/server/audit';
import type { RequestHandler } from './$types';

// ─── Auth guard ───────────────────────────────────────────────────────────────

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

// ─── GET — list products (cursor pagination + filters) ───────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const isPublished = url.searchParams.get('published') !== 'false';
    const limit       = Math.min(parseInt(url.searchParams.get('limit') ?? '30'), 100);
    const lastId      = url.searchParams.get('lastId');
    const lastCreated = url.searchParams.get('lastCreated');
    const sort        = url.searchParams.get('sort') ?? 'newest';

    // Filters
    const brandFilter    = url.searchParams.getAll('brand');
    const categoryFilter = url.searchParams.getAll('category');
    const typeFilter     = url.searchParams.getAll('type');
    const stockFilter    = url.searchParams.getAll('stock');
    const minPrice       = url.searchParams.get('minPrice');
    const maxPrice       = url.searchParams.get('maxPrice');

    const conditions: any[] = [eq(products.isPublished, isPublished)];

    if (brandFilter.length)    conditions.push(inArray(products.brand, brandFilter));
    if (categoryFilter.length) conditions.push(inArray(products.categorySlug, categoryFilter));
    if (typeFilter.length)     conditions.push(inArray(products.productType, typeFilter));
    if (stockFilter.length)    conditions.push(inArray(products.stockStatus, stockFilter));
    if (minPrice)              conditions.push(gte(products.price, parseInt(minPrice)));
    if (maxPrice)              conditions.push(lte(products.price, parseInt(maxPrice)));

    const dirAsc = sort === 'oldest' || sort === 'price-low';
    const orderCol = sort === 'price-low' || sort === 'price-high' ? products.price : products.createdAt;
    const primaryName = sort === 'price-low' || sort === 'price-high' ? 'price' : 'createdAt';

    if (lastId && lastCreated) {
        const primarySql = primaryName === 'createdAt'
            ? sql`${lastCreated}::timestamp(3)`
            : sql`${parseInt(lastCreated)}`;

        const cursorCond = dirAsc
            ? or(gt(orderCol, primarySql as any), and(eq(orderCol, primarySql as any), gt(products.id, lastId)))
            : or(lt(orderCol, primarySql as any), and(eq(orderCol, primarySql as any), lt(products.id, lastId)));

        conditions.push(cursorCond);
    }

    const orderBy = dirAsc
        ? [asc(orderCol), asc(products.id)]
        : [desc(orderCol), desc(products.id)];

    const rows = await db.select({
        id:            products.id,
        name:          products.name,
        slug:          products.slug,
        categorySlug:  products.categorySlug,
        brand:         products.brand,
        price:         products.price,
        discountPrice: products.discountPrice,
        mainImagePath: products.mainImagePath,
        stockStatus:   products.stockStatus,
        badgeTag:      products.badgeTag,
        isPublished:   products.isPublished,
        createdAt:     products.createdAt,
    })
        .from(products)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(limit + 1);

    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    return json({ items: rows, hasMore });
};

// ─── POST — create product ────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();

    const {
        name, slug, brand, description, categorySlug, productType,
        promotionTag, badgeTag, price, discountPrice, offers, whatsappMsg,
        specifications, inTheBox, stockStatus, isHero, isPublished,
        mainImagePath, galleryPaths, heroDesktopPath, heroMobilePath, colors,
        variants,
    } = body;

    if (!name || !slug || !brand || !description || !categorySlug || !productType || !price || !mainImagePath) {
        throw error(400, 'Missing required fields');
    }

    const productId = crypto.randomUUID();

    await db.transaction(async (tx) => {
        // 1. Insert product
        await tx.insert(products).values({
            id:              productId,
            name,
            slug,
            brand,
            description,
            categorySlug,
            productType,
            promotionTag:    promotionTag ?? null,
            badgeTag:        badgeTag ?? null,
            price:           parseInt(price),
            discountPrice:   discountPrice ? parseInt(discountPrice) : null,
            offers:          offers ?? [],
            whatsappMsg:     whatsappMsg ?? null,
            specifications:  specifications ?? [],
            inTheBox:        inTheBox ?? [],
            stockStatus:     stockStatus ?? 'in_stock',
            isHero:          isHero ?? false,
            isPublished:     isPublished ?? false,
            mainImagePath,
            galleryPaths:    galleryPaths ?? [],
            heroDesktopPath: heroDesktopPath ?? null,
            heroMobilePath:  heroMobilePath ?? null,
            colors:          colors ?? [],
        });

        // 2. Insert variants
        if (variants?.length) {
            await tx.insert(productVariants).values(
                variants.map((v: any) => ({
                    id:            crypto.randomUUID(),
                    productId,
                    colorName:     v.colorName,
                    hex:           v.hex,
                    mainImagePath: v.mainImagePath,
                    galleryPaths:  v.galleryPaths ?? [],
                }))
            );
        }

        // 3. Insert productAvailability for every location (stock = 0)
        const allLocations = await tx.select({ id: locations.id }).from(locations);
        if (allLocations.length) {
            await tx.insert(productAvailability).values(
                allLocations.map((loc) => ({
                    productId,
                    locationId:      loc.id,
                    stockCount:      0,
                    deliveryRangeKm: 100,
                }))
            );
        }
    });

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     isPublished ? 'created' : 'created',
        entityType: 'product',
        entityId:   productId,
        entityName: name,
    });

    return json({ id: productId }, { status: 201 });
};

// ─── PATCH — update product (including bulk publish/unpublish) ────────────────

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();

    // Bulk action: { ids: string[], action: 'publish' | 'unpublish' | 'delete' }
    if (body.bulk) {
        const { ids, action } = body;
        if (!ids?.length) throw error(400, 'No ids provided');

        if (action === 'publish' || action === 'unpublish') {
            const isPublished = action === 'publish';
            await db.update(products)
                .set({ isPublished })
                .where(inArray(products.id, ids));

            for (const id of ids) {
                const product = await db.select({ name: products.name })
                    .from(products).where(eq(products.id, id)).limit(1);
                await writeAuditLog({
                    adminId:    admin.id,
                    adminEmail: admin.email,
                    action:     isPublished ? 'published' : 'unpublished',
                    entityType: 'product',
                    entityId:   id,
                    entityName: product[0]?.name ?? id,
                });
            }

            return json({ ok: true });
        }

        if (action === 'delete') {
            // Fetch names before deletion for audit
            const toDelete = await db.select({ id: products.id, name: products.name })
                .from(products).where(inArray(products.id, ids));

            await db.delete(products).where(inArray(products.id, ids));

            for (const p of toDelete) {
                await writeAuditLog({
                    adminId:    admin.id,
                    adminEmail: admin.email,
                    action:     'deleted',
                    entityType: 'product',
                    entityId:   p.id,
                    entityName: p.name,
                });
            }

            return json({ ok: true });
        }

        throw error(400, 'Unknown bulk action');
    }

    // Single product update
    const { id, ...fields } = body;
    if (!id) throw error(400, 'Missing id');

    const existing = await db.select({ name: products.name })
        .from(products).where(eq(products.id, id)).limit(1);
    if (!existing.length) throw error(404, 'Product not found');

    const updateData: Record<string, any> = {};
    const allowed = [
        'name', 'slug', 'brand', 'description', 'categorySlug', 'productType',
        'promotionTag', 'badgeTag', 'price', 'discountPrice', 'offers',
        'whatsappMsg', 'specifications', 'inTheBox', 'stockStatus', 'isHero',
        'isPublished', 'mainImagePath', 'galleryPaths', 'heroDesktopPath',
        'heroMobilePath', 'colors',
    ];
    for (const key of allowed) {
        if (key in fields) updateData[key] = fields[key];
    }

    if (!Object.keys(updateData).length) throw error(400, 'Nothing to update');

    await db.update(products).set(updateData).where(eq(products.id, id));

    // Update variants if provided
    if (fields.variants) {
        await db.delete(productVariants).where(eq(productVariants.productId, id));
        if (fields.variants.length) {
            await db.insert(productVariants).values(
                fields.variants.map((v: any) => ({
                    id:            crypto.randomUUID(),
                    productId:     id,
                    colorName:     v.colorName,
                    hex:           v.hex,
                    mainImagePath: v.mainImagePath,
                    galleryPaths:  v.galleryPaths ?? [],
                }))
            );
        }
    }

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'updated',
        entityType: 'product',
        entityId:   id,
        entityName: fields.name ?? existing[0].name,
    });

    return json({ ok: true });
};

// ─── DELETE — single product ──────────────────────────────────────────────────

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const admin = assertAdmin(locals);
    const id    = url.searchParams.get('id');
    if (!id) throw error(400, 'Missing id');

    const existing = await db.select({ name: products.name })
        .from(products).where(eq(products.id, id)).limit(1);
    if (!existing.length) throw error(404, 'Product not found');

    await db.delete(products).where(eq(products.id, id));

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'deleted',
        entityType: 'product',
        entityId:   id,
        entityName: existing[0].name,
    });

    return json({ ok: true });
};