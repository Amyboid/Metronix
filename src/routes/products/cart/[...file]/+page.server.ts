import { fetchProductBySrc, fetchProductsFiltered } from '$lib/data/products';
import { error } from '@sveltejs/kit';


export async function load({ params, fetch }) {
    try { 
        
        const item = await fetchProductBySrc(fetch, params.file);

        if (!item) {
            throw error(404, 'Product not found');
        }
 

        // Filter similar products based on category
        const similarProductsPromise = await fetchProductsFiltered(
            fetch,
            'productType',
            item.productType,
            1,
            3,
            item._id       
        ) 
        
        const similarProducts = similarProductsPromise?.products 
        
        return {
            item,
            similarProducts
        };
    }
    catch (err) {
        console.error('Error in page(/routes/products/cart) load:', err);
        throw error(500, `Could not load product data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}