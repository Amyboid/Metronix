// routes/api/admin/imagekit-auth/+server.ts
import { json, error } from '@sveltejs/kit';
import ImageKit from '@imagekit/nodejs';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');

    const ik = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });
    const auth = ik.helper.getAuthenticationParameters();

    return json({
        ...auth,
        publicKey:   env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
};