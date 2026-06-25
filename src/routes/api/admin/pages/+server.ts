// routes/api/admin/pages/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageSections, sectionTemplates } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { writeAuditLog } from '$lib/server/audit';
import type { RequestHandler } from './$types';

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

// ─── GET — list sections for a page + all templates ──────────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    // Return all available section templates
    if (url.searchParams.get('templates') === 'true') {
        const templates = await db.select().from(sectionTemplates).orderBy(asc(sectionTemplates.name));
        return json({ templates });
    }

    const pageName = url.searchParams.get('pageName');
    if (!pageName) throw error(400, 'Missing pageName');

    const sections = await db.select({
        id:           pageSections.id,
        pageName:     pageSections.pageName,
        templateSlug: pageSections.templateSlug,
        order:        pageSections.order,
        priority:     pageSections.priority,
        dataSource:   pageSections.dataSource,
        config:       pageSections.config,
        // isActive added via migration — include when schema is updated
    })
        .from(pageSections)
        .where(eq(pageSections.pageName, pageName))
        .orderBy(asc(pageSections.order));

    return json({ sections });
};

// ─── POST — add a section ─────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();

    const { pageName, templateSlug, config, priority, dataSource } = body;
    if (!pageName || !templateSlug || !config) throw error(400, 'Missing required fields');

    // Determine next order value
    const existing = await db.select({ order: pageSections.order })
        .from(pageSections)
        .where(eq(pageSections.pageName, pageName))
        .orderBy(asc(pageSections.order));

    const maxOrder = existing.length ? Math.max(...existing.map((s) => s.order)) : 0;

    const id = crypto.randomUUID();
    await db.insert(pageSections).values({
        id,
        pageName,
        templateSlug,
        order:      maxOrder + 1,
        priority:   priority ?? 'high',
        dataSource: dataSource ?? 'products',
        config,
    });

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'created',
        entityType: 'page_section',
        entityId:   id,
        entityName: `${pageName} / ${templateSlug}`,
    });

    return json({ id }, { status: 201 });
};

// ─── PATCH — update config | reorder | enable | disable ──────────────────────

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const admin = assertAdmin(locals);
    const body  = await request.json();

    // Reorder: { reorder: [{ id, order }] }
    if (body.reorder) {
        const items: { id: string; order: number }[] = body.reorder;
        await Promise.all(
            items.map(({ id, order }) =>
                db.update(pageSections).set({ order }).where(eq(pageSections.id, id))
            )
        );

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'reordered',
            entityType: 'page_section',
            entityId:   items.map((i) => i.id).join(','),
            entityName: body.pageName ?? 'page sections',
        });

        return json({ ok: true });
    }

    const { id, ...fields } = body;
    if (!id) throw error(400, 'Missing id');

    const existing = await db.select()
        .from(pageSections).where(eq(pageSections.id, id)).limit(1);
    if (!existing.length) throw error(404, 'Section not found');

    const updateData: Record<string, any> = {};

    if ('config' in fields)     updateData.config     = fields.config;
    if ('priority' in fields)   updateData.priority   = fields.priority;
    if ('dataSource' in fields) updateData.dataSource = fields.dataSource;
    if ('isActive' in fields)   updateData.isActive   = fields.isActive;

    if (!Object.keys(updateData).length) throw error(400, 'Nothing to update');

    await db.update(pageSections).set(updateData).where(eq(pageSections.id, id));

    let action = 'updated';
    if ('isActive' in fields) action = fields.isActive ? 'enabled' : 'disabled';

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action,
        entityType: 'page_section',
        entityId:   id,
        entityName: `${existing[0].pageName} / ${existing[0].templateSlug}`,
    });

    return json({ ok: true });
};

// ─── DELETE — remove a section ────────────────────────────────────────────────

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const admin = assertAdmin(locals);
    const id    = url.searchParams.get('id');
    if (!id) throw error(400, 'Missing id');

    const existing = await db.select()
        .from(pageSections).where(eq(pageSections.id, id)).limit(1);
    if (!existing.length) throw error(404, 'Section not found');

    await db.delete(pageSections).where(eq(pageSections.id, id));

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     'deleted',
        entityType: 'page_section',
        entityId:   id,
        entityName: `${existing[0].pageName} / ${existing[0].templateSlug}`,
    });

    return json({ ok: true });
};