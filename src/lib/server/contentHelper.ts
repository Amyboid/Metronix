import { db } from '$lib/server/db';
import { pageContent, pageDrafts, settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { pages } from '$lib/contentRegistry';

export async function loadPageContent(pageName: string) {
  const [published, drafts] = await Promise.all([
    db.select().from(pageContent).where(eq(pageContent.pageName, pageName)),
    db.select().from(pageDrafts).where(eq(pageDrafts.pageName, pageName)),
  ]);
  const publishedMap = Object.fromEntries(published.map(r => [r.fieldKey, r.value]));
  const draftMap = Object.fromEntries(drafts.map(r => [r.fieldKey, r.value]));

  // Fetch imagekit_url from settings
  let imagekitUrl = '';
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, 'imagekit_url'));
    imagekitUrl = rows[0]?.value ?? '';
  } catch {
    // settings table might not have imagekit_url yet
  }

  return {
    published: publishedMap,
    drafts: draftMap,
    merged: { ...publishedMap, ...draftMap },
    imagekitUrl,
  };
}

export function getPageDefaults(pageName: string): Record<string, string> {
  const page = pages.find(p => p.name === pageName);
  if (!page) return {};
  return Object.fromEntries(page.fields.map(f => [f.key, f.default ?? '']));
}
