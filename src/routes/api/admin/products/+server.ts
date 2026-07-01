// routes/api/admin/products/+server.ts
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
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

// ─── ImageKit cleanup helpers ────────────────────────────────────────────────

async function deleteIKFile(fileId: string | null) {
    if (!fileId) return;
    try {
        const credentials = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
        await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Basic ${credentials}` },
        });
    } catch (e) {
        console.error('[products] IK delete failed for fileId', fileId);
    }
}

async function cleanupProductImages(productId: string) {
    // Fetch product for hero fileIds
    const [product] = await db.select({
        heroDesktopFileId: products.heroDesktopFileId,
        heroMobileFileId:  products.heroMobileFileId,
    }).from(products).where(eq(products.id, productId)).limit(1);

    if (product) {
        await deleteIKFile(product.heroDesktopFileId);
        await deleteIKFile(product.heroMobileFileId);
    }

    // Fetch variants for their fileIds
    const variants = await db.select({
        mainFileId:     productVariants.mainFileId,
        galleryFileIds: productVariants.galleryFileIds,
    }).from(productVariants).where(eq(productVariants.productId, productId));

    for (const v of variants) {
        await deleteIKFile(v.mainFileId);
        for (const fid of (v.galleryFileIds ?? []) as string[]) {
            await deleteIKFile(fid);
        }
    }
}

// ─── GET — list products (cursor pagination + filters) ───────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    // Single product lookup by slug (includes variants)
    const slug = url.searchParams.get('slug');
    if (slug) {
        const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
        if (!rows.length) throw error(404, 'Product not found');
        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, rows[0].id));
        return json({ items: [{ ...rows[0], variants }] });
    }

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
        heroDesktopFileId, heroMobileFileId,
        variants,
    } = body;

    if (!name || !slug || !brand || !description || !categorySlug || !productType || !price || !mainImagePath) {
        throw error(400, 'Missing required fields');
    }

    const productId = crypto.randomUUID();

    // 1. Insert product
    await db.insert(products).values({
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
        heroDesktopFileId: heroDesktopFileId ?? null,
        heroMobilePath:  heroMobilePath ?? null,
        heroMobileFileId: heroMobileFileId ?? null,
        colors:          colors ?? [],
    });

    // 2. Insert variants
    if (variants?.length) {
        await db.insert(productVariants).values(
            variants.map((v: any) => ({
                id:              crypto.randomUUID(),
                productId,
                colorName:       v.colorName,
                hex:             v.hex,
                mainImagePath:   v.mainImagePath,
                mainFileId:      v.mainFileId ?? null,
                galleryPaths:    v.galleryPaths ?? [],
                galleryFileIds:  v.galleryFileIds ?? [],
            }))
        );
    }

    // 3. Insert productAvailability for every location (stock = 0)
    const allLocations = await db.select({ id: locations.id }).from(locations);
    if (allLocations.length) {
        await db.insert(productAvailability).values(
            allLocations.map((loc) => ({
                productId,
                locationId:      loc.id,
                stockCount:      0,
                deliveryRangeKm: 100,
            }))
        );
    }

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
            // Fetch names + clean up IK files before deletion
            const toDelete = await db.select({ id: products.id, name: products.name })
                .from(products).where(inArray(products.id, ids));

            for (const p of toDelete) {
                await cleanupProductImages(p.id);
            }

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
        'heroDesktopFileId', 'heroMobilePath', 'heroMobileFileId', 'colors',
    ];
    for (const key of allowed) {
        if (key in fields) updateData[key] = fields[key];
    }

    if (!Object.keys(updateData).length) throw error(400, 'Nothing to update');

    await db.update(products).set(updateData).where(eq(products.id, id));

    // Update variants if provided — only delete IK files that were actually removed
    if (fields.variants) {
        const oldVariants = await db.select({
            mainFileId:     productVariants.mainFileId,
            galleryFileIds: productVariants.galleryFileIds,
        }).from(productVariants).where(eq(productVariants.productId, id));

        // Collect all fileIds the user wants to KEEP
        const keepMainFileIds = new Set(
            fields.variants.map((v: any) => v.mainFileId).filter(Boolean)
        );
        const keepGalleryFileIds = new Set(
            fields.variants.flatMap((v: any) => v.galleryFileIds ?? []).filter(Boolean)
        );

        // Delete only old IK files that are NOT in the new set
        for (const old of oldVariants) {
            if (old.mainFileId && !keepMainFileIds.has(old.mainFileId)) {
                await deleteIKFile(old.mainFileId);
            }
            for (const fid of (old.galleryFileIds ?? []) as string[]) {
                if (!keepGalleryFileIds.has(fid)) {
                    await deleteIKFile(fid);
                }
            }
        }

        await db.delete(productVariants).where(eq(productVariants.productId, id));
        if (fields.variants.length) {
            await db.insert(productVariants).values(
                fields.variants.map((v: any) => ({
                    id:              crypto.randomUUID(),
                    productId:       id,
                    colorName:       v.colorName,
                    hex:             v.hex,
                    mainImagePath:   v.mainImagePath,
                    mainFileId:      v.mainFileId ?? null,
                    galleryPaths:    v.galleryPaths ?? [],
                    galleryFileIds:  v.galleryFileIds ?? [],
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

    // Clean up ImageKit files before deleting from DB
    await cleanupProductImages(id);

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