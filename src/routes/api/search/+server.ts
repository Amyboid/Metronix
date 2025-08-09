import Product from '$lib/models/ProductModel.js';
import connectToDatabase from '$lib/server/connectDatabase.js';
import { json } from '@sveltejs/kit';

export async function GET(requestEvent) {
    console.log('api called /api/search...');

    try {
        await connectToDatabase();

        const { url } = requestEvent;
        const searchQuery = url.searchParams.get('searchQuery') || '';

        const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);

        let query = {};
        if (searchWords.length > 0) {
            const regexQueries = searchWords.map(word => {
                const regex = new RegExp(word, 'i');
                return {
                    $or: [
                        { name: { $regex: regex } },
                        { category: { $regex: regex } },
                        { brand: { $regex: regex } },
                        { productType: { $regex: regex } }
                    ]
                };
            });
            query = { $and: regexQueries };
        }

        const result = await Product.find(query, {
            src: 1,
            name: 1,
            _id: 0
        }).lean().limit(10); 
        return json({ result });
    } catch (error) {
        console.error("Error getting search result:", error);
        return json({ message: "error getting search result..", error: error }, { status: 500 });
    }
}