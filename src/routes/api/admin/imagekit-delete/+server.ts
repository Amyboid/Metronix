// routes/api/admin/imagekit-delete/+server.ts
import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function assertAdmin(locals: App.Locals) {
    if (!locals.user) throw error(401, 'Unauthorized');
    const role = locals.user.role;
    if (role !== 'admin' && role !== 'super_admin') throw error(403, 'Forbidden');
}

async function deleteIKFile(fileId: string | null) {
    if (!fileId) return;
    try {
        const credentials = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
        await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Basic ${credentials}` },
        });
    } catch (e) {
        console.error('[catalog] IK delete failed for fileId', fileId);
    }
}

// DELETE /api/admin/imagekit-delete?fileId=xxx
// Deletes a single file from ImageKit by fileId.
// fileId is returned by ImageKit on upload and stored in DB alongside filePath.
export const DELETE: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const fileId = url.searchParams.get('fileId');
    if (!fileId) throw error(400, 'Missing fileId');

    try {
        await deleteIKFile(fileId);
        return json({ ok: true });
    } catch (e: any) {
        // If file not found on IK side, treat as success (already gone)
        if (e?.message?.includes('not found') || e?.statusNumber === 404) {
            return json({ ok: true, note: 'File not found on ImageKit — skipped' });
        }
        console.error('[imagekit-delete]', e);
        throw error(500, e?.message ?? 'ImageKit delete failed');
    }
};

// POST /api/admin/imagekit-delete/bulk
// Body: { fileIds: string[] }
// Bulk-deletes multiple files — used when force-deleting a brand/category/product-type.
export const POST: RequestHandler = async ({ locals, request }) => {
    assertAdmin(locals);

    const body = await request.json();
    const fileIds: string[] = body.fileIds ?? [];

    if (!fileIds.length) return json({ ok: true, deleted: 0 });

    let deleted = 0;
    const errors: string[] = [];

    await Promise.allSettled(
        fileIds.map(async (fileId) => {
            try {
                await deleteIKFile(fileId);
                deleted++;
            } catch (e: any) {
                if (e?.message?.includes('not found') || e?.statusNumber === 404) {
                    deleted++; // already gone — counts as success
                } else {
                    errors.push(`${fileId}: ${e?.message ?? 'unknown error'}`);
                }
            }
        })
    );

    if (errors.length) {
        console.error('[imagekit-delete bulk] partial errors:', errors);
    }

    return json({ ok: true, deleted, errors });
};