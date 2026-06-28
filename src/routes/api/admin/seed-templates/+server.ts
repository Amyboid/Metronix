// routes/api/admin/seed-templates/+server.ts
// One-time endpoint to update section templates in the DB
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sectionTemplates } from '$lib/server/db/schema';
import { requireSuperAdmin } from '$lib/server/adminGuard';
import { sectionTemplateData } from '$lib/mockData/sectionTemplates';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    requireSuperAdmin(locals);

    await Promise.all(
        sectionTemplateData.map((tpl) =>
            db.insert(sectionTemplates).values(tpl).onConflictDoUpdate({
                target: sectionTemplates.slug,
                set: {
                    name: tpl.name,
                    schemaDefinition: tpl.schemaDefinition,
                },
            })
        )
    );

    return json({ ok: true, updated: sectionTemplateData.length });
};
