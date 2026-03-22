// import Product from "$lib/models/ProductModel";
// import { json } from "@sveltejs/kit";
// import connectToDatabase from "$lib/server/connectDatabase";
// import mongoose from "mongoose";


// export async function GET(requestEvent) {
//     const { url } = requestEvent;
//     console.log('api called /api/products/server.ts', url.href);
//     try {
//         await connectToDatabase();

//         const page = parseInt(url.searchParams.get('page') || '1');
//         const limit = parseInt(url.searchParams.get('limit') || '9');
//         const categoryFilter = url.searchParams.get('category');
//         const productTypeFilter = url.searchParams.get('productType');
//         const excludeId = url.searchParams.get('excludeId');
//         const minimal = url.searchParams.get('minimal');

//         const skip = (page - 1) * limit; 

//         let query: any = {};

//         if (categoryFilter) {
//             query.category = categoryFilter;
//         } else if (productTypeFilter) {
//             query.productType = productTypeFilter;
//         }

//         // IMPORTANT ADDITION: Exclude a specific product by its _id
//         if (excludeId) {
//             if (!mongoose.Types.ObjectId.isValid(excludeId)) {
//                 return json({ message: 'Invalid excludeId format' }, { status: 400 });
//             }
//             query._id = { $ne: excludeId }; // Add condition to exclude the product
//         }

 

//         let products;

//         if (minimal) {
//             products = await Product.find(query, 'src name price')
//                 .skip(skip)
//                 .limit(limit)
//                 .lean();
//         }
//         else {
//             products = await Product.find(query)
//                 .skip(skip)
//                 .limit(limit)
//                 .lean();

//         }

//         const totalProducts = await Product.countDocuments(query);

//         return json({
//             products,
//             page,
//             limit,
//             totalProducts,
//             totalPages: Math.ceil(totalProducts / limit)
//         }, { status: 200 });

//     } catch (error: any) {
//         console.error('Error fetching products from API:', error);
//         return json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
//     }
// }



import { json } from "@sveltejs/kit";
import { db } from "$lib/db/connect";
import { demoUsers } from "$lib/db/schema";
import { count } from "drizzle-orm";

export async function GET({ url,request }) {
    console.log('API called /api/products/+server.ts', request);

    try {
        // 1. Query all users (Similar to Product.find().lean())
        // select() with no arguments selects all columns (*)
        const allUsers = await db.select().from(demoUsers);

        // 2. Log them to your terminal
        console.log('Current users in Database:', allUsers);

        // 3. Count total users (Similar to countDocuments)
        const [totalCountResult] = await db.select({ value: count() }).from(demoUsers);
        const totalUsers = totalCountResult.value;

        console.log(`Total count: ${totalUsers}`);

        // Return empty JSON as requested
        return json({allUsers});

    } catch (error: any) {
        console.error('Error fetching from Drizzle/Neon:', error);
        return json(
            { message: 'Failed to fetch users', error: error.message }, 
            { status: 500 }
        );
    }
}