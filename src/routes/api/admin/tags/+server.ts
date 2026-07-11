import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tags } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

// ─── GET — list all tags ─────────────────────────────────────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const type = url.searchParams.get('type'); // "promotion" | "badge" | null (all)

    const rows = type
        ? await db.select().from(tags).where(eq(tags.type, type))
        : await db.select().from(tags);

    return json({ items: rows });
};

// ─── POST — create tag ──────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ locals, request }) => {
    assertAdmin(locals);

    const { type, value, label } = await request.json();

    if (!type || !value?.trim() || !label?.trim()) {
        throw error(400, 'Type, value, and label are required');
    }
    if (type !== 'promotion' && type !== 'badge') {
        throw error(400, 'Type must be "promotion" or "badge"');
    }

    const existing = await db.select().from(tags).where(and(eq(tags.type, type), eq(tags.value, value.trim()))).limit(1);
    if (existing.length) {
        throw error(409, 'Tag with this value already exists for this type');
    }

    await db.insert(tags).values({ type, value: value.trim(), label: label.trim() });
    return json({ ok: true }, { status: 201 });
};

// ─── PATCH — update tag ─────────────────────────────────────────────────────

export const PATCH: RequestHandler = async ({ locals, request }) => {
    assertAdmin(locals);

    const { id, value, label } = await request.json();

    if (!id) throw error(400, 'Tag ID is required');

    const updates: Record<string, string> = {};
    if (value?.trim()) updates.value = value.trim();
    if (label?.trim()) updates.label = label.trim();

    if (Object.keys(updates).length === 0) {
        throw error(400, 'Nothing to update');
    }

    await db.update(tags).set(updates).where(eq(tags.id, id));
    return json({ ok: true });
};

// ─── DELETE — delete tags ───────────────────────────────────────────────────

export const DELETE: RequestHandler = async ({ locals, request }) => {
    assertAdmin(locals);

    const { ids } = await request.json();

    if (!ids?.length) throw error(400, 'No tag IDs provided');

    for (const id of ids) {
        await db.delete(tags).where(eq(tags.id, id));
    }

    return json({ ok: true, deleted: ids.length });
};
