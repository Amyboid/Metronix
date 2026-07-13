import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageContent } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// ─── GET — public endpoint, published content only ───────────────────────────

export const GET: RequestHandler = async ({ url }) => {
  const pageName = url.searchParams.get('page');
  if (!pageName) throw error(400, 'Missing ?page= param');

  const rows = await db.select().from(pageContent).where(eq(pageContent.pageName, pageName));
  const content = Object.fromEntries(rows.map(r => [r.fieldKey, r.value]));

  return json(content);
};
