import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
    return locals.user as { id: string; email: string; role: string };
}

export const GET: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const type = url.searchParams.get('type'); // "promotion" | "badge" | null (all)

    const rows = type
        ? await db.select().from(tags).where(eq(tags.type, type))
        : await db.select().from(tags);

    return json({ items: rows });
};
