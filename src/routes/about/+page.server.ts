import { loadPageContent, getPageDefaults } from '$lib/server/contentHelper';

export async function load() {
  const { merged, imagekitUrl } = await loadPageContent('about');
  const defaults = getPageDefaults('about');
  return { content: { ...defaults, ...merged }, imagekitUrl };
}
