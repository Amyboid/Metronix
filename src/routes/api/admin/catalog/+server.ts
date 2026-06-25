// routes/api/admin/catalog/+server.ts
import { env } from '$env/dynamic/private';
import { writeAuditLog } from '$lib/server/audit';
import { db } from '$lib/server/db';
import { brands, categories, products, productTypes, productVariants } from '$lib/server/db/schema';
import { error, json } from '@sveltejs/kit';
import { asc, count, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const CHUNK = 5;

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

async function deleteIKFile(fileId: string | null) {
    if (!fileId) return;
    try {
        const credentials = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
        await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Basic ${credentials}` },
        });
    } catch (e) {
        console.error('[catalog] IK delete failed for fileId', fileId);
    }
}

async function deleteIKFiles(fileIds: (string | null)[]) {
    const valid = fileIds.filter(Boolean) as string[];
    if (!valid.length) return;
    await Promise.allSettled(valid.map(deleteIKFile));
}

// Collect all IK fileIds for a product and its variants
async function collectProductFileIds(productId: string): Promise<string[]> {
    const [prod] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));

    const ids: (string | null)[] = [
        prod?.mainImageFileId ?? null,
        prod?.heroDesktopFileId ?? null,
        prod?.heroMobileFileId ?? null,
        ...(prod?.galleryFileIds ?? []),
        ...variants.flatMap(v => [v.mainImageFileId ?? null, ...(v.galleryFileIds ?? [])]),
    ];

    return ids.filter(Boolean) as string[];
}

// ─── GET ──────────────────────────────────────────────────────────────────────
// ?section=brands|categories|product-types  — paginated list
// ?section=product-count&entity=brand|category|product-type&slug=xxx  — count linked products

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const section = url.searchParams.get('section');

    // ── Product count check (for force-delete modal) ──
    if (section === 'product-count') {
        const entity = url.searchParams.get('entity'); // 'brand' | 'category' | 'product-type'
        const slug   = url.searchParams.get('slug');
        if (!entity || !slug) throw error(400, 'Missing entity or slug');

        let result: { count: number }[];

        if (entity === 'brand') {
            result = await db
                .select({ count: count() })
                .from(products)
                .where(eq(products.brand, slug));
        } else if (entity === 'category') {
            result = await db
                .select({ count: count() })
                .from(products)
                .where(eq(products.categorySlug, slug));
        } else if (entity === 'product-type') {
            result = await db
                .select({ count: count() })
                .from(products)
                .where(eq(products.productType, slug));
        } else {
            throw error(400, 'Unknown entity type');
        }

        return json({ count: result[0]?.count ?? 0 });
    }

    // ── Paginated list ──
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);

    if (section === 'brands') {
        const rows = await db
            .select()
            .from(brands)
            .orderBy(asc(brands.name))
            .limit(CHUNK)
            .offset(offset);

        const [{ total }] = await db.select({ total: count() }).from(brands);
        return json({ items: rows, hasMore: offset + CHUNK < total, total });
    }

    if (section === 'categories') {
        const rows = await db
            .select()
            .from(categories)
            .orderBy(asc(categories.name))
            .limit(CHUNK)
            .offset(offset);

        const [{ total }] = await db.select({ total: count() }).from(categories);
        return json({ items: rows, hasMore: offset + CHUNK < total, total });
    }

    if (section === 'product-types') {
        const rows = await db
            .select()
            .from(productTypes)
            .orderBy(asc(productTypes.name))
            .limit(CHUNK)
            .offset(offset);

        const [{ total }] = await db.select({ total: count() }).from(productTypes);
        return json({ items: rows, hasMore: offset + CHUNK < total, total });
    }

    // Return all three unpaginated (used to populate product wizard selects)
    const [allBrands, allCategories, allTypes] = await Promise.all([
        db.select().from(brands).orderBy(asc(brands.name)),
        db.select().from(categories).orderBy(asc(categories.name)),
        db.select().from(productTypes).orderBy(asc(productTypes.name)),
    ]);

    return json({ brands: allBrands, categories: allCategories, productTypes: allTypes });
};

// ─── POST ─────────────────────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();
    const { section } = body;

    if (section === 'brand') {
        const { slug, name, logoPath, logoFileId } = body;
        if (!slug || !name) throw error(400, 'slug and name are required');

        await db.insert(brands).values({
            slug,
            name,
            logoPath:   logoPath   ?? null,
            logoFileId: logoFileId ?? null,
        });

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'created',
            entityType: 'brand',
            entityId:   slug,
            entityName: name,
        });

        return json({ slug }, { status: 201 });
    }

    if (section === 'category') {
        const { slug, name, bannerPath, bannerMsg, bannerFileId } = body;
        if (!slug || !name) throw error(400, 'slug and name are required');

        await db.insert(categories).values({
            slug,
            name,
            bannerPath:   bannerPath   ?? null,
            bannerMsg:    bannerMsg    ?? null,
            bannerFileId: bannerFileId ?? null,
        });

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'created',
            entityType: 'category',
            entityId:   slug,
            entityName: name,
        });

        return json({ slug }, { status: 201 });
    }

    if (section === 'product-type') {
        const { slug, name, bannerPath, bannerMsg, bannerFileId } = body;
        if (!slug || !name) throw error(400, 'slug and name are required');

        await db.insert(productTypes).values({
            slug,
            name,
            bannerPath:   bannerPath   ?? null,
            bannerMsg:    bannerMsg    ?? null,
            bannerFileId: bannerFileId ?? null,
        });

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'created',
            entityType: 'product_type',
            entityId:   slug,
            entityName: name,
        });

        return json({ slug }, { status: 201 });
    }

    throw error(400, 'Unknown section');
};

// ─── PATCH ────────────────────────────────────────────────────────────────────

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();
    const { section, slug } = body;

    if (!slug) throw error(400, 'Missing slug');

    if (section === 'brand') {
        const { name, logoPath, logoFileId } = body;
        const existing = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
        if (!existing.length) throw error(404, 'Brand not found');

        const updateData: Record<string, any> = {};
        if (name       !== undefined) updateData.name       = name;
        if (logoPath   !== undefined) updateData.logoPath   = logoPath;
        if (logoFileId !== undefined) updateData.logoFileId = logoFileId;

        await db.update(brands).set(updateData).where(eq(brands.slug, slug));

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'updated',
            entityType: 'brand',
            entityId:   slug,
            entityName: name ?? existing[0].name,
        });

        return json({ ok: true });
    }

    if (section === 'category') {
        const { name, bannerPath, bannerMsg, bannerFileId } = body;
        const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
        if (!existing.length) throw error(404, 'Category not found');

        const updateData: Record<string, any> = {};
        if (name         !== undefined) updateData.name         = name;
        if (bannerPath   !== undefined) updateData.bannerPath   = bannerPath;
        if (bannerMsg    !== undefined) updateData.bannerMsg    = bannerMsg;
        if (bannerFileId !== undefined) updateData.bannerFileId = bannerFileId;

        await db.update(categories).set(updateData).where(eq(categories.slug, slug));

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'updated',
            entityType: 'category',
            entityId:   slug,
            entityName: name ?? existing[0].name,
        });

        return json({ ok: true });
    }

    if (section === 'product-type') {
        const { name, bannerPath, bannerMsg, bannerFileId } = body;
        const existing = await db.select().from(productTypes).where(eq(productTypes.slug, slug)).limit(1);
        if (!existing.length) throw error(404, 'Product type not found');

        const updateData: Record<string, any> = {};
        if (name         !== undefined) updateData.name         = name;
        if (bannerPath   !== undefined) updateData.bannerPath   = bannerPath;
        if (bannerMsg    !== undefined) updateData.bannerMsg    = bannerMsg;
        if (bannerFileId !== undefined) updateData.bannerFileId = bannerFileId;

        await db.update(productTypes).set(updateData).where(eq(productTypes.slug, slug));

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'updated',
            entityType: 'product_type',
            entityId:   slug,
            entityName: name ?? existing[0].name,
        });

        return json({ ok: true });
    }

    throw error(400, 'Unknown section');
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
// ?section=brand|category|product-type&slug=xxx
// ?force=true  → delete linked products + their IK images first, then the parent

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const admin   = assertAdmin(locals);
    const section = url.searchParams.get('section');
    const slug    = url.searchParams.get('slug');
    const force   = url.searchParams.get('force') === 'true';

    if (!section || !slug) throw error(400, 'Missing section or slug');

    try {
        // ── BRAND ──────────────────────────────────────────────────────────────
        if (section === 'brand') {
            const existing = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
            if (!existing.length) throw error(404, 'Brand not found');

            if (force) {
                // Collect all product IDs for this brand
                const linkedProducts = await db
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.brand, slug));

                // Collect + delete all IK images for each product
                const allFileIds: string[] = [];
                for (const p of linkedProducts) {
                    const ids = await collectProductFileIds(p.id);
                    allFileIds.push(...ids);
                }
                await deleteIKFiles(allFileIds);

                // Delete all linked products (cascade handles variants/availability)
                for (const p of linkedProducts) {
                    await db.delete(products).where(eq(products.id, p.id));
                }
            }

            // Delete brand's own IK logo
            await deleteIKFile(existing[0].logoFileId ?? null);

            await db.delete(brands).where(eq(brands.slug, slug));

            await writeAuditLog({
                adminId:    admin.id,
                adminEmail: admin.email,
                action:     'deleted',
                entityType: 'brand',
                entityId:   slug,
                entityName: existing[0].name,
            });

            return json({ ok: true });
        }

        // ── CATEGORY ───────────────────────────────────────────────────────────
        if (section === 'category') {
            const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
            if (!existing.length) throw error(404, 'Category not found');

            if (force) {
                const linkedProducts = await db
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.categorySlug, slug));

                const allFileIds: string[] = [];
                for (const p of linkedProducts) {
                    const ids = await collectProductFileIds(p.id);
                    allFileIds.push(...ids);
                }
                await deleteIKFiles(allFileIds);

                for (const p of linkedProducts) {
                    await db.delete(products).where(eq(products.id, p.id));
                }
            }

            await deleteIKFile(existing[0].bannerFileId ?? null);
            await db.delete(categories).where(eq(categories.slug, slug));

            await writeAuditLog({
                adminId:    admin.id,
                adminEmail: admin.email,
                action:     'deleted',
                entityType: 'category',
                entityId:   slug,
                entityName: existing[0].name,
            });

            return json({ ok: true });
        }

        // ── PRODUCT TYPE ────────────────────────────────────────────────────────
        if (section === 'product-type') {
            const existing = await db.select().from(productTypes).where(eq(productTypes.slug, slug)).limit(1);
            if (!existing.length) throw error(404, 'Product type not found');

            if (force) {
                const linkedProducts = await db
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.productType, slug));

                const allFileIds: string[] = [];
                for (const p of linkedProducts) {
                    const ids = await collectProductFileIds(p.id);
                    allFileIds.push(...ids);
                }
                await deleteIKFiles(allFileIds);

                for (const p of linkedProducts) {
                    await db.delete(products).where(eq(products.id, p.id));
                }
            }

            await deleteIKFile(existing[0].bannerFileId ?? null);
            await db.delete(productTypes).where(eq(productTypes.slug, slug));

            await writeAuditLog({
                adminId:    admin.id,
                adminEmail: admin.email,
                action:     'deleted',
                entityType: 'product_type',
                entityId:   slug,
                entityName: existing[0].name,
            });

            return json({ ok: true });
        }

        throw error(400, 'Unknown section');

    } catch (e: any) {
        if (e?.code === '23503') {
            throw error(409, 'Cannot delete: products are referencing this entry.');
        }
        throw e;
    }
};