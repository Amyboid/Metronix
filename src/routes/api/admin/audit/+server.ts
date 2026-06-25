// routes/api/admin/audit/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import { eq, and, desc, lt, gte, lte, asc, or, inArray, ilike, count, gt } from 'drizzle-orm';
import { requireSuperAdmin } from '$lib/server/adminGuard';
import type { RequestHandler } from './$types';

// ─── GET — read audit logs (super_admin only) ─────────────────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    requireSuperAdmin(locals);

    const limit      = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200);
    const lastId     = url.searchParams.get('lastId');
    const lastDate   = url.searchParams.get('lastDate');
    const entityType = url.searchParams.get('entityType');
    const adminEmail = url.searchParams.get('adminEmail');
    const dateFrom   = url.searchParams.get('dateFrom');
    const dateTo     = url.searchParams.get('dateTo');

    const conditions: any[] = [];

    if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
    if (adminEmail) conditions.push(ilike(auditLogs.adminEmail, `%${adminEmail}%`));
    if (dateFrom)   conditions.push(gte(auditLogs.createdAt, new Date(dateFrom)));
    if (dateTo)     conditions.push(lte(auditLogs.createdAt, new Date(dateTo)));

    // Cursor: newest-first using (createdAt DESC, id DESC)
    if (lastId && lastDate) {
        conditions.push(
            or(
                lt(auditLogs.createdAt, new Date(lastDate)),
                and(eq(auditLogs.createdAt, new Date(lastDate)), lt(auditLogs.id, lastId))
            )
        );
    }

    const rows = await db.select()
        .from(auditLogs)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
        .limit(limit + 1);

    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    return json({ items: rows, hasMore });
};

// ─── DELETE — delete logs before a cutoff date (super_admin only) ─────────────
// Body: { before: ISO date string }

export const DELETE: RequestHandler = async ({ locals, request }) => {
    requireSuperAdmin(locals);

    const body = await request.json();
    const { before } = body;

    if (!before) throw error(400, 'Missing before date');

    const cutoff = new Date(before);
    if (isNaN(cutoff.getTime())) throw error(400, 'Invalid date');

    const result = await db.delete(auditLogs).where(lt(auditLogs.createdAt, cutoff));

    return json({ ok: true, deleted: result.rowCount ?? 0 });
};