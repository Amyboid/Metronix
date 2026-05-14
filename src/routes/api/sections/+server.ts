// src/routes/api/sections/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageSections } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sectionFetchers } from '$lib/server/services/sectionService';

export const GET = async ({ url, setHeaders }) => {
    console.log(`🚀 API REQUEST: Fetching data for ${url.searchParams.get('id')}`);

    setHeaders({
        'cache-control': 'public, max-age=60, s-maxage=3600'
    });

    const sectionId = url.searchParams.get('id');
    if (!sectionId) return json({ error: 'Missing ID' }, { status: 400 });

    try {
        const section = await db.query.pageSections.findFirst({
            where: eq(pageSections.id, sectionId)
        });

        if (!section) return json({ error: 'Not found' }, { status: 404 });

        // Dynamic Lookup: Find the right fetcher based on templateSlug
        const fetcher = sectionFetchers[section.templateSlug as keyof typeof sectionFetchers];

        const data = fetcher ? await fetcher(section.config) : [];

        return json({ ...section, data });

    } catch (err) {
        console.error(err);
        return json({ error: 'Server Error' }, { status: 500 });
    }
};