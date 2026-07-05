// routes/api/admin/catalog/+server.ts
import { env } from '$env/dynamic/private';
import { writeAuditLog } from '$lib/server/audit';
import { db } from '$lib/server/db';
import { brands, categories, products, productTypes, brandProductTypes } from '$lib/server/db/schema';
import { error, json } from '@sveltejs/kit';
import { asc, count, desc, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const CHUNK = 15;

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
            .orderBy(desc(brands.createdAt), asc(brands.slug))
            .limit(CHUNK)
            .offset(offset);

        // Fetch brand×type associations for each brand
        const allAssocs = await db.select().from(brandProductTypes);
        const assocMap = new Map<string, string[]>();
        for (const a of allAssocs) {
            const list = assocMap.get(a.brand) ?? [];
            list.push(a.productType);
            assocMap.set(a.brand, list);
        }
        const itemsWithAssocs = rows.map((b) => ({
            ...b,
            productTypes: assocMap.get(b.slug) ?? [],
        }));

        const [{ total }] = await db.select({ total: count() }).from(brands);
        return json({ items: itemsWithAssocs, hasMore: offset + CHUNK < total, total });
    }

    if (section === 'categories') {
        const rows = await db
            .select()
            .from(categories)
            .orderBy(desc(categories.createdAt), asc(categories.slug))
            .limit(CHUNK)
            .offset(offset);

        const [{ total }] = await db.select({ total: count() }).from(categories);
        return json({ items: rows, hasMore: offset + CHUNK < total, total });
    }

    if (section === 'product-types') {
        const rows = await db
            .select()
            .from(productTypes)
            .orderBy(desc(productTypes.createdAt), asc(productTypes.slug))
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
        const { slug, name, logoPath, logoFileId, productTypes: newTypes } = body;
        if (!slug || !name) throw error(400, 'slug and name are required');

        await db.insert(brands).values({
            slug,
            name,
            logoPath:   logoPath   ?? null,
            logoFileId: logoFileId ?? null,
        });

        // Insert brand×type associations
        if (Array.isArray(newTypes) && newTypes.length) {
            await db.insert(brandProductTypes).values(
                newTypes.map((t: string) => ({ brand: slug, productType: t }))
            );
        }

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
        const { slug, name, categorySlug, bannerPath, bannerMsg, bannerFileId } = body;
        if (!slug || !name) throw error(400, 'slug and name are required');
        if (!categorySlug) throw error(400, 'categorySlug is required');

        await db.insert(productTypes).values({
            slug,
            name,
            categorySlug,
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
		const { name, logoPath, logoFileId, productTypes: newTypes } = body;
		const existing = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
		if (!existing.length) throw error(404, 'Brand not found');

		const updateData: Record<string, any> = {};
		if (name       !== undefined) updateData.name       = name;
		if (logoPath   !== undefined) updateData.logoPath   = logoPath;
		if (logoFileId !== undefined) updateData.logoFileId = logoFileId;

		// Delete old IK file if replaced
		if (logoFileId !== undefined && logoFileId !== existing[0].logoFileId) {
			await deleteIKFile(existing[0].logoFileId);
		}

		await db.update(brands).set(updateData).where(eq(brands.slug, slug));

		// Update brand×type associations if provided
		if (Array.isArray(newTypes)) {
			await db.delete(brandProductTypes).where(eq(brandProductTypes.brand, slug));
			if (newTypes.length) {
				await db.insert(brandProductTypes).values(
					newTypes.map((t: string) => ({ brand: slug, productType: t }))
				);
			}
		}

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

		// Delete old IK file if replaced
		if (bannerFileId !== undefined && bannerFileId !== existing[0].bannerFileId) {
			await deleteIKFile(existing[0].bannerFileId);
		}

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

		// Delete old IK file if replaced
		if (bannerFileId !== undefined && bannerFileId !== existing[0].bannerFileId) {
			await deleteIKFile(existing[0].bannerFileId);
		}

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
                const linkedProducts = await db
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.brand, slug));

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