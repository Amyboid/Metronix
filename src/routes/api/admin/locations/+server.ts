// routes/api/admin/locations/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { locations, productAvailability, products } from '$lib/server/db/schema';
import { eq, asc, desc, gt, and, count, sql } from 'drizzle-orm';
import { writeAuditLog } from '$lib/server/audit';
import type { RequestHandler } from './$types';

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

// ─── GET — list locations OR stock for a location ─────────────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const locationId = url.searchParams.get('locationId');

    // Stock sub-resource: /api/admin/locations?locationId=xxx&stock=true
    if (locationId && url.searchParams.get('stock') === 'true') {
        const limit    = Math.min(parseInt(url.searchParams.get('limit') ?? '30'), 100);
        const lastId   = url.searchParams.get('lastId');
        const lastName = url.searchParams.get('lastName');

        const conditions: any[] = [eq(productAvailability.locationId, locationId)];

        if (lastId && lastName) {
            conditions.push(
                sql`(${products.name}, ${products.id}) > (${lastName}, ${lastId})`
            );
        }

        const rows = await db.select({
            productId:       productAvailability.productId,
            productName:     products.name,
            productSlug:     products.slug,
            mainImagePath:   products.mainImagePath,
            stockCount:      productAvailability.stockCount,
            deliveryRangeKm: productAvailability.deliveryRangeKm,
        })
            .from(productAvailability)
            .innerJoin(products, eq(products.id, productAvailability.productId))
            .where(and(...conditions))
            .orderBy(asc(products.name), asc(products.id))
            .limit(limit + 1);

        const hasMore = rows.length > limit;
        if (hasMore) rows.pop();

        return json({ items: rows, hasMore });
    }

    // Location list
    const rows = await db.select().from(locations).orderBy(asc(locations.city), asc(locations.storeName));
    return json({ items: rows });
};

// ─── POST — create location ───────────────────────────────────────────────────

export const POST: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();

    const { storeName, address, city, latitude, longitude, phone } = body;
    if (!storeName || !address || !city || latitude == null || longitude == null) {
        throw error(400, 'Missing required fields');
    }

    const id = crypto.randomUUID();
    await db.insert(locations).values({ id, storeName, address, city, latitude, longitude, phone: phone ?? null });

    // Create availability rows for all existing products (stock = 0)
    const allProducts = await db.select({ id: products.id }).from(products);
    if (allProducts.length) {
        await db.insert(productAvailability).values(
            allProducts.map((p) => ({
                productId:       p.id,
                locationId:      id,
                stockCount:      0,
                deliveryRangeKm: 100,
            }))
        );
    }

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'created',
        entityType: 'location',
        entityId:   id,
        entityName: storeName,
    });

    return json({ id }, { status: 201 });
};

// ─── PATCH — update location OR stock count ───────────────────────────────────

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();

    // Stock update: { locationId, productId, stockCount }
    if ('stockCount' in body && body.locationId && body.productId) {
        const { locationId, productId, stockCount } = body;

        await db.update(productAvailability)
            .set({ stockCount: parseInt(stockCount) })
            .where(
                and(
                    eq(productAvailability.locationId, locationId),
                    eq(productAvailability.productId, productId)
                )
            );

        const product = await db.select({ name: products.name })
            .from(products).where(eq(products.id, productId)).limit(1);

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'updated',
            entityType: 'stock',
            entityId:   `${productId}::${locationId}`,
            entityName: `${product[0]?.name ?? productId} @ location ${locationId} → ${stockCount}`,
        });

        return json({ ok: true });
    }

    // Delivery range update: { locationId, deliveryRangeKm }
    if ('deliveryRangeKm' in body && body.locationId) {
        const { locationId, deliveryRangeKm } = body;
        await db.update(productAvailability)
            .set({ deliveryRangeKm: parseInt(deliveryRangeKm) })
            .where(eq(productAvailability.locationId, locationId));
        return json({ ok: true });
    }

    // Location update
    const { id, ...fields } = body;
    if (!id) throw error(400, 'Missing id');

    const existing = await db.select({ storeName: locations.storeName })
        .from(locations).where(eq(locations.id, id)).limit(1);
    if (!existing.length) throw error(404, 'Location not found');

    const allowed = ['storeName', 'address', 'city', 'latitude', 'longitude', 'phone'];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
        if (key in fields) updateData[key] = fields[key];
    }
    if (!Object.keys(updateData).length) throw error(400, 'Nothing to update');

    await db.update(locations).set(updateData).where(eq(locations.id, id));

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'updated',
        entityType: 'location',
        entityId:   id,
        entityName: fields.storeName ?? existing[0].storeName,
    });

    return json({ ok: true });
};

// ─── DELETE — delete location ─────────────────────────────────────────────────

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const admin = assertAdmin(locals);
    const id    = url.searchParams.get('id');
    if (!id) throw error(400, 'Missing id');

    const existing = await db.select({ storeName: locations.storeName })
        .from(locations).where(eq(locations.id, id)).limit(1);
    if (!existing.length) throw error(404, 'Location not found');

    await db.delete(locations).where(eq(locations.id, id));

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'deleted',
        entityType: 'location',
        entityId:   id,
        entityName: existing[0].storeName,
    });

    return json({ ok: true });
};