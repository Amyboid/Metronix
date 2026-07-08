import { db } from '$lib/server/db';
import { pageSections } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { asc, eq, and } from 'drizzle-orm';

export async function load({ setHeaders }) {
    // 1. Set Caching: 
    // public: allows CDNs/Browsers to cache
    // max-age: browser cache (1 hour)
    // s-maxage: CDN/Server cache (1 day)
    setHeaders({
        'cache-control': 'private, no-cache'
    });
    console.log("request to /products/+page.server.ts");

    try {
        // 2. The Streaming Promise
        const layoutPromise = db.query.pageSections.findMany({
            where: and(eq(pageSections.pageName, 'products_home'), eq(pageSections.isActive, true)),
            orderBy: [asc(pageSections.order)]
        }).catch(err => {
            // Internal error handling for the stream
            console.error('Streaming Drizzle Error:', err);
            return []; // Return empty array so the UI doesn't crash
        });

        return {
            streamed: {
                layout: layoutPromise
            }
        };
    } catch (err) {
        // This catch handles critical failures before the stream starts
        console.error('Critical Load Error:', err);
        throw error(500, 'Could not initialize page layout');
    }
}