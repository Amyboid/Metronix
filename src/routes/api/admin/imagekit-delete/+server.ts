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

async function deleteIKFileByPath(filePath: string | null) {
    if (!filePath) return;
    const credentials = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
    const authHeader = { Authorization: `Basic ${credentials}` };

    // Extract folder and filename from path
    const lastSlash = filePath.lastIndexOf('/');
    const folder = lastSlash > 0 ? filePath.substring(0, lastSlash + 1) : '/';
    const fileName = filePath.substring(lastSlash + 1);

    // List files in folder to find the fileId
    const listRes = await fetch(
        `https://api.imagekit.io/v1/files?path=${encodeURIComponent(folder)}&searchQuery=name:${encodeURIComponent(fileName)}`,
        { headers: authHeader }
    );
    if (!listRes.ok) {
        console.error('[IK] list files failed', folder, listRes.status);
        return;
    }

    const files = await listRes.json();
    if (!files.length) {
        console.warn('[IK] file not found for path:', filePath);
        return;
    }

    // Delete by fileId
    const fileId = files[0].fileId;
    const deleteRes = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: authHeader,
    });
    if (!deleteRes.ok) {
        const body = await deleteRes.text();
        console.error('[IK] delete by fileId failed', fileId, deleteRes.status, body);
    }
}

// DELETE /api/admin/imagekit-delete?fileId=xxx  or  ?filePath=xxx
// Deletes a single file from ImageKit by fileId or filePath.
export const DELETE: RequestHandler = async ({ locals, url }) => {
    assertAdmin(locals);

    const fileId = url.searchParams.get('fileId');
    const filePath = url.searchParams.get('filePath');

    if (!fileId && !filePath) throw error(400, 'Missing fileId or filePath');

    try {
        if (fileId) {
            await deleteIKFile(fileId);
        } else {
            await deleteIKFileByPath(filePath);
        }
        return json({ ok: true });
    } catch (e: any) {
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