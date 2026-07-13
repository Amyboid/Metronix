import { loadPageContent } from '$lib/server/contentHelper';
import { getPageByName } from '$lib/contentRegistry';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const pageDef = getPageByName(params.page);
  if (!pageDef) throw error(404, 'Unknown page');

  // Auth is already handled by /admin/+layout.server.ts
  const { published, drafts, merged } = await loadPageContent(params.page);

  return {
    pageName: params.page,
    pageDef,
    content: merged,
    published,
    drafts,
    hasDrafts: Object.keys(drafts).length > 0,
    draftCount: Object.keys(drafts).length,
  };
}
