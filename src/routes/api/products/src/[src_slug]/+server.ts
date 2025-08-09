// src/routes/api/products/by-src/[src_slug]/+server.ts

import { json } from '@sveltejs/kit';
import Product from '$lib/models/ProductModel';
import connectToDatabase from '$lib/server/connectDatabase';

export async function GET({ params }) {
    try {
        await connectToDatabase();

        const productSrc = decodeURIComponent(params.src_slug); // Decode the URL-encoded src from the route param

        const product = await Product.findOne({ src: productSrc }).lean(); // Find the product by its src

        if (!product) {
            return json({ message: 'Product not found' }, { status: 404 });
        }
        return json(product, { status: 200 });
    } catch (error: any) {
        console.error(`Error fetching product by src (${params.src_slug}):`, error);
        return json({ message: 'Failed to fetch product by src', error: error.message }, { status: 500 });
    }
}