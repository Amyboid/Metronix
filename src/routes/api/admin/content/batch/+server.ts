import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageDrafts } from '$lib/server/db/schema';
import { writeAuditLog } from '$lib/server/audit';
import { requireAdmin } from '$lib/server/adminGuard';
import type { RequestHandler } from './$types';

// ─── POST — batch save multiple drafts ───────────────────────────────────────
// Body: { pageName: string, drafts: [{ fieldKey, value, fieldType }] }

export const POST: RequestHandler = async ({ locals, request }) => {
  const admin = requireAdmin(locals);

  const body = await request.json();
  const { pageName, drafts } = body;

  if (!pageName) throw error(400, 'Missing pageName');
  if (!Array.isArray(drafts) || drafts.length === 0) throw error(400, 'Missing or empty drafts array');

  for (const draft of drafts) {
    if (!draft.fieldKey || draft.value === undefined) continue;

    await db.insert(pageDrafts)
      .values({
        pageName,
        fieldKey: draft.fieldKey,
        value: draft.value,
        fieldType: draft.fieldType || 'text',
        fileId: draft.fileId || null,
        createdBy: admin.id,
      })
      .onConflictDoUpdate({
        target: [pageDrafts.pageName, pageDrafts.fieldKey],
        set: { value: draft.value, fieldType: draft.fieldType || 'text', fileId: draft.fileId || null, createdBy: admin.id },
      });
  }

  await writeAuditLog({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'synced',
    entityType: 'page_draft',
    entityId: pageName,
    entityName: `${pageName} (${drafts.length} fields)`,
  });

  return json({ ok: true, synced: drafts.length });
};
