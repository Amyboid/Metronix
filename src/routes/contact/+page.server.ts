import { loadPageContent, getPageDefaults } from '$lib/server/contentHelper';

export async function load() {
  const { merged, imagekitUrl } = await loadPageContent('contact');
  const defaults = getPageDefaults('contact');
  return { content: { ...defaults, ...merged }, imagekitUrl };
}
