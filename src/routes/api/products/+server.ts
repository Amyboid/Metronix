import Product from "$lib/models/ProductModel";
import { json } from "@sveltejs/kit";
import connectToDatabase from "$lib/server/connectDatabase";
import mongoose from "mongoose";


export async function GET(requestEvent) {
    const { url } = requestEvent;
    console.log('api called /api/products/server.ts', url.href);
    try {
        await connectToDatabase();

        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '9');
        const categoryFilter = url.searchParams.get('category');
        const productTypeFilter = url.searchParams.get('productType');
        const excludeId = url.searchParams.get('excludeId');
        const minimal = url.searchParams.get('minimal');

        const skip = (page - 1) * limit; 

        let query: any = {};

        if (categoryFilter) {
            query.category = categoryFilter;
        } else if (productTypeFilter) {
            query.productType = productTypeFilter;
        }

        // IMPORTANT ADDITION: Exclude a specific product by its _id
        if (excludeId) {
            if (!mongoose.Types.ObjectId.isValid(excludeId)) {
                return json({ message: 'Invalid excludeId format' }, { status: 400 });
            }
            query._id = { $ne: excludeId }; // Add condition to exclude the product
        }

 

        let products;

        if (minimal) {
            products = await Product.find(query, 'src name price')
                .skip(skip)
                .limit(limit)
                .lean();
        }
        else {
            products = await Product.find(query)
                .skip(skip)
                .limit(limit)
                .lean();

        }

        const totalProducts = await Product.countDocuments(query);

        return json({
            products,
            page,
            limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit)
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching products from API:', error);
        return json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
    }
}