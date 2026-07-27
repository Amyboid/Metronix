import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageContent, pageDrafts } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { writeAuditLog } from '$lib/server/audit';
import { requireAdmin, requireAdminOrEditor } from '$lib/server/adminGuard';
import type { RequestHandler } from './$types';

// ─── GET — read published + drafts + merged for a page ───────────────────────

export const GET: RequestHandler = async ({ locals, url }) => {
  requireAdminOrEditor(locals);

  const pageName = url.searchParams.get('page');
  if (!pageName) throw error(400, 'Missing ?page= param');

  const [published, drafts] = await Promise.all([
    db.select().from(pageContent).where(eq(pageContent.pageName, pageName)),
    db.select().from(pageDrafts).where(eq(pageDrafts.pageName, pageName)),
  ]);

  const publishedMap = Object.fromEntries(published.map(r => [r.fieldKey, r.value]));
  const draftMap = Object.fromEntries(drafts.map(r => [r.fieldKey, r.value]));
  const publishedFileIds = Object.fromEntries(published.filter(r => r.fileId).map(r => [r.fieldKey, r.fileId]));
  const merged = { ...publishedMap, ...draftMap };

  return json({ published: publishedMap, publishedFileIds, drafts: draftMap, merged });
};

// ─── POST — save a draft ─────────────────────────────────────────────────────
// Body: { pageName, fieldKey, value, fieldType?, fileId? }

export const POST: RequestHandler = async ({ locals, request, url }) => {
  const admin = requireAdmin(locals);

  // Handle publish action
  if (url.searchParams.get('publish') === 'true') {
    const body = await request.json();
    const pageName = body.pageName;
    if (!pageName) throw error(400, 'Missing pageName');

    const drafts = await db.select().from(pageDrafts).where(eq(pageDrafts.pageName, pageName));

    for (const draft of drafts) {
      await db.insert(pageContent)
        .values({
          pageName,
          fieldKey: draft.fieldKey,
          value: draft.value,
          fieldType: draft.fieldType,
          fileId: draft.fileId,
        })
        .onConflictDoUpdate({
          target: [pageContent.pageName, pageContent.fieldKey],
          set: { value: draft.value, fieldType: draft.fieldType, fileId: draft.fileId },
        });
    }

    await db.delete(pageDrafts).where(eq(pageDrafts.pageName, pageName));

    await writeAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'published',
      entityType: 'page_content',
      entityId: pageName,
      entityName: pageName,
    });

    return json({ ok: true, published: drafts.length });
  }

  // Save a single draft
  const body = await request.json();
  const { pageName, fieldKey, value, fieldType = 'text', fileId = null } = body;

  if (!pageName || !fieldKey) throw error(400, 'Missing pageName or fieldKey');

  await db.insert(pageDrafts)
    .values({ pageName, fieldKey, value, fieldType, fileId, createdBy: admin.id })
    .onConflictDoUpdate({
      target: [pageDrafts.pageName, pageDrafts.fieldKey],
      set: { value, fieldType, fileId, createdBy: admin.id },
    });

  return json({ ok: true });
};

// ─── DELETE — discard drafts ─────────────────────────────────────────────────

export const DELETE: RequestHandler = async ({ locals, url }) => {
  const admin = requireAdmin(locals);

  const pageName = url.searchParams.get('page');
  const key = url.searchParams.get('key');
  const all = url.searchParams.get('all') === 'true';

  if (!pageName) throw error(400, 'Missing ?page= param');

  if (all) {
    await db.delete(pageDrafts).where(eq(pageDrafts.pageName, pageName));
  } else if (key) {
    await db.delete(pageDrafts).where(
      and(eq(pageDrafts.pageName, pageName), eq(pageDrafts.fieldKey, key))
    );
  } else {
    throw error(400, 'Missing ?key= or ?all=true');
  }

  await writeAuditLog({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'discarded',
    entityType: 'page_draft',
    entityId: pageName,
    entityName: all ? `${pageName} (all)` : `${pageName}.${key}`,
  });

  return json({ ok: true });
};
