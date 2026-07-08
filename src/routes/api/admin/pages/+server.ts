// routes/api/admin/pages/+server.ts
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { pageSections, sectionTemplates } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { writeAuditLog } from '$lib/server/audit';
import type { RequestHandler } from './$types';

async function deleteIKFile(fileId: string | null) {
    if (!fileId) return;
    try {
        const credentials = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
        await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Basic ${credentials}` },
        });
    } catch (e) {
        console.error('[pages] IK delete failed for fileId', fileId);
    }
}

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

// ─── GET — list sections for a page + all templates ──────────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    // Check which sections use a specific template
    const checkTemplate = url.searchParams.get('templateSlug');
    if (url.searchParams.get('pageName') === '__check_sections' && checkTemplate) {
        const sections = await db.select({ id: pageSections.id, pageName: pageSections.pageName })
            .from(pageSections).where(eq(pageSections.templateSlug, checkTemplate));
        return json({ sections });
    }

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
        isActive:     pageSections.isActive,
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

    // ── Create new template ──
    if (body.action === 'createTemplate') {
        const { slug, name, schemaDefinition } = body;
        if (!slug || !name || !schemaDefinition?.length) {
            throw error(400, 'slug, name, and schemaDefinition are required');
        }

        // Check uniqueness
        const existing = await db.select().from(sectionTemplates)
            .where(eq(sectionTemplates.slug, slug)).limit(1);
        if (existing.length) throw error(409, 'Template with this slug already exists');

        const id = crypto.randomUUID();
        await db.insert(sectionTemplates).values({
            slug,
            name,
            schemaDefinition,
        });

        await writeAuditLog({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'created',
            entityType: 'section_template',
            entityId: slug,
            entityName: name,
        });

        return json({ slug, name, schemaDefinition }, { status: 201 });
    }

    // ── Create section instance ──
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

    // ── Update template schema ──
    if (body.action === 'updateTemplate') {
        const { slug, schemaDefinition } = body;
        if (!slug || !schemaDefinition?.length) throw error(400, 'slug and schemaDefinition required');

        const existing = await db.select().from(sectionTemplates)
            .where(eq(sectionTemplates.slug, slug)).limit(1);
        if (!existing.length) throw error(404, 'Template not found');

        await db.update(sectionTemplates).set({ schemaDefinition })
            .where(eq(sectionTemplates.slug, slug));

        // Find sections using this template and deactivate them
        const sections = await db.select({ id: pageSections.id })
            .from(pageSections).where(eq(pageSections.templateSlug, slug));
        if (sections.length) {
            await db.update(pageSections).set({ isActive: false })
                .where(eq(pageSections.templateSlug, slug));
        }

        await writeAuditLog({
            adminId: admin.id, adminEmail: admin.email,
            action: 'updated', entityType: 'section_template',
            entityId: slug, entityName: existing[0].name,
        });

        return json({ ok: true, deactivatedSections: sections.length });
    }

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
    const templateSlug = url.searchParams.get('templateSlug');

    // Delete a section
    if (id) {
        const existing = await db.select()
            .from(pageSections).where(eq(pageSections.id, id)).limit(1);
        if (!existing.length) throw error(404, 'Section not found');

        // Clean up ImageKit files from section config
        const config = existing[0].config as Record<string, any>;
        for (const [key, val] of Object.entries(config)) {
            if (key.endsWith('FileId') && val) {
                await deleteIKFile(val);
            }
        }

        await db.delete(pageSections).where(eq(pageSections.id, id));

        // Renumber remaining sections to close gaps
        const remaining = await db.select({ id: pageSections.id })
            .from(pageSections)
            .where(eq(pageSections.pageName, existing[0].pageName))
            .orderBy(asc(pageSections.order));

        await Promise.all(
            remaining.map((s, i) =>
                db.update(pageSections).set({ order: i + 1 }).where(eq(pageSections.id, s.id))
            )
        );

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'deleted',
            entityType: 'page_section',
            entityId:   id,
            entityName: `${existing[0].pageName} / ${existing[0].templateSlug}`,
        });

        return json({ ok: true });
    }

    // Delete a template
    if (templateSlug) {
        const existing = await db.select()
            .from(sectionTemplates).where(eq(sectionTemplates.slug, templateSlug)).limit(1);
        if (!existing.length) throw error(404, 'Template not found');

        // Find all sections using this template and clean up their IK files
        const sectionsUsingTemplate = await db.select()
            .from(pageSections).where(eq(pageSections.templateSlug, templateSlug));

        for (const section of sectionsUsingTemplate) {
            const config = section.config as Record<string, any>;
            for (const [key, val] of Object.entries(config)) {
                if (key.endsWith('FileId') && val) {
                    await deleteIKFile(val);
                }
            }
        }

        // Delete all sections using this template
        await db.delete(pageSections).where(eq(pageSections.templateSlug, templateSlug));
        // Delete the template itself
        await db.delete(sectionTemplates).where(eq(sectionTemplates.slug, templateSlug));

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'deleted',
            entityType: 'section_template',
            entityId:   templateSlug,
            entityName: existing[0].name,
        });

        return json({ ok: true, deletedSections: sectionsUsingTemplate.length });
    }

    throw error(400, 'Missing id or templateSlug');
};