// routes/api/admin/settings/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { writeAuditLog } from '$lib/server/audit';
import { requireAdmin, requireAdminOrEditor } from '$lib/server/adminGuard';
import type { RequestHandler } from './$types';

// Valid setting keys (source of truth)
const SETTING_KEYS = [
    'store_name',
    'page_size',
    'whatsapp_number',
    'contact_phone',
    'store_address',
    'imagekit_url',
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

// ─── GET — read all settings (or specific keys) ───────────────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    requireAdminOrEditor(locals);

    const keys = url.searchParams.getAll('key') as SettingKey[];

    let rows: { key: string; value: string }[];

    if (keys.length) {
        rows = await db.select().from(settings).where(inArray(settings.key, keys));
    } else {
        rows = await db.select().from(settings);
    }

    // Return as a key-value map for easy consumption
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return json({ settings: map });
};

// ─── PATCH — update one or more settings ─────────────────────────────────────
// Body: { updates: { key: string; value: string }[] }

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const admin = requireAdmin(locals);
    const body  = await request.json();

    const updates: { key: string; value: string }[] = body.updates;
    if (!updates?.length) throw error(400, 'No updates provided');

    // Validate keys
    const invalid = updates.filter((u) => !SETTING_KEYS.includes(u.key as SettingKey));
    if (invalid.length) {
        throw error(400, `Unknown setting keys: ${invalid.map((u) => u.key).join(', ')}`);
    }

    await Promise.all(
        updates.map(({ key, value }) =>
            db
                .insert(settings)
                .values({ key, value })
                .onConflictDoUpdate({ target: settings.key, set: { value } })
        )
    );

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'updated',
        entityType: 'settings',
        entityId:   updates.map((u) => u.key).join(','),
        entityName: updates.map((u) => `${u.key}=${u.value}`).join('; '),
    });

    return json({ ok: true });
};