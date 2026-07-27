import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { colors } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin, requireAdminOrEditor } from '$lib/server/adminGuard';
import type { RequestHandler } from './$types';

// GET /api/admin/colors?brand=xxx&productType=xxx
export const GET: RequestHandler = async ({ locals, url }) => {
    requireAdminOrEditor(locals);

    const brand = url.searchParams.get('brand');
    const productType = url.searchParams.get('productType');

    const conditions = [];
    if (brand) conditions.push(eq(colors.brand, brand));
    if (productType) conditions.push(eq(colors.productType, productType));

    const rows = conditions.length
        ? await db.select().from(colors).where(and(...conditions))
        : await db.select().from(colors);

    return json({ items: rows });
};

// POST /api/admin/colors  { brand, productType, hex, name }
export const POST: RequestHandler = async ({ locals, request }) => {
    requireAdmin(locals);
    const body = await request.json();
    const { brand, productType, hex, name } = body;

    if (!brand || !productType || !hex || !name) {
        throw error(400, 'brand, productType, hex, and name are required');
    }

    const normalizedHex = hex.toUpperCase().trim();
    const trimmedName = name.trim();
    if (!/^#[0-9A-F]{6}$/.test(normalizedHex)) {
        throw error(400, 'Invalid hex color');
    }

    // Check if hex already exists for this brand+type
    const existingByHex = await db.select().from(colors)
        .where(and(
            eq(colors.brand, brand),
            eq(colors.productType, productType),
            eq(colors.hex, normalizedHex)
        )).limit(1);

    if (existingByHex.length) {
        // Hex exists — check if name matches
        if (existingByHex[0].name === trimmedName) {
            return json({ ok: true, existing: true });
        }
        // Hex exists but name is different — update the name
        await db.update(colors)
            .set({ name: trimmedName })
            .where(and(
                eq(colors.brand, brand),
                eq(colors.productType, productType),
                eq(colors.hex, normalizedHex)
            ));
        return json({ ok: true, existing: true, updated: true });
    }

    // Check if name already exists for this brand+type (different hex)
    const existingByName = await db.select().from(colors)
        .where(and(
            eq(colors.brand, brand),
            eq(colors.productType, productType),
            eq(colors.name, trimmedName)
        )).limit(1);

    if (existingByName.length) {
        throw error(409, `Color name "${trimmedName}" already exists for this brand and product type with hex ${existingByName[0].hex}`);
    }

    // New combination — insert
    await db.insert(colors).values({
        brand,
        productType,
        hex: normalizedHex,
        name: trimmedName,
    });

    return json({ ok: true, existing: false }, { status: 201 });
};
