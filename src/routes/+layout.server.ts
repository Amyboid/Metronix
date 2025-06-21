// src/routes/+layout.server.ts
import { fetchProductsFiltered } from '$lib/data/products'; // Assuming fetchProductsFiltered can fetch all now

export async function load({ fetch }) {
    let essentials = [];
    try {
        essentials = await fetchProductsFiltered(fetch, undefined, undefined, 1, 99999); 
    } catch (e) {
        console.error("Could not fetch all products for fuzzy search:", e); 
    }

    return {
        essentials
    };
}