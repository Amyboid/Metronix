import { fetchProductsFiltered } from '$lib/data/products';
import { error } from '@sveltejs/kit';

export async function load({ fetch, url }) {

    console.log('url from page.server.ts of /products', url);

    try {
        // Fetch 4 items for 'consumer-electronics' directly
        const entertainmentEssentialsResponse = await fetchProductsFiltered(fetch, 'category', 'consumer-electronics', 1, 4, undefined, true);
        const entertainmentEssentials = entertainmentEssentialsResponse.products; // Access the 'products' array

        // Fetch 4 items for 'self-care-appliances' directly
        const selfCareEssentialsResponse = await fetchProductsFiltered(fetch, 'category', 'self-care-appliances', 1, 4, undefined, true);
        const selfCareEssentials = selfCareEssentialsResponse.products;

        // Fetch 4 items for 'kitchen-appliances' directly
        const kitchenEssentialsResponse = await fetchProductsFiltered(fetch, 'category', 'kitchen-appliances', 1, 4, undefined, true);
        const kitchenEssentials = kitchenEssentialsResponse.products;

        return {
            entertainmentEssentials,
            selfCareEssentials,
            kitchenEssentials
        };
    } catch (err) {
        console.error('Error loading categorized products:', err);
        throw error(500, `Could not load essential product categories: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}