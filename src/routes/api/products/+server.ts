import Product from "$lib/models/ProductModel";
import { json } from "@sveltejs/kit";
import connectToDatabase from "$lib/server/connectDatabase";
import mongoose from "mongoose";

// import Test from '$lib/models/testModel.js';  

// export async function POST(request) {
//     const productData = await request;
//     try {
//         const newProduct = new Test(productData);
//         await newProduct.save();
//         return new Response(JSON.stringify(newProduct), {
//             status: 201,
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         return new Response(JSON.stringify({ error: 'Failed to create product' }), {
//             status: 500
//         });
//     }
// }


export async function GET(requestEvent) {
    const { url } = requestEvent;
    try {
        await connectToDatabase();

        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '9');
        const categoryFilter = url.searchParams.get('category');
        const productTypeFilter = url.searchParams.get('productType');
        const excludeId = url.searchParams.get('excludeId'); // Get the excludeId parameter

        const skip = (page - 1) * limit;

        let query: any = {}; // Mongoose query object

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
        // END IMPORTANT ADDITION

        console.log('query', query);
        
        const products = await Product.find(query) // Apply the filter query
            .skip(skip)
            .limit(limit)
            .lean(); // Use .lean() for better performance

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