import { loadPageContent, getPageDefaults } from '$lib/server/contentHelper';

export async function load() {
  const { merged, imagekitUrl } = await loadPageContent('home');
  const defaults = getPageDefaults('home');
  return { content: { ...defaults, ...merged }, imagekitUrl };
}
