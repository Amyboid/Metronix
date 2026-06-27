import { json, error } from '@sveltejs/kit';
import { requireSuperAdmin } from '$lib/server/adminGuard';
import { auth } from '$lib/server/auth';
import { writeAuditLog } from '$lib/server/audit';
import type { RequestHandler } from './$types';

// ─── POST — invite admin user (super_admin only) ──────────────────────────────

export const POST: RequestHandler = async ({ locals, request }) => {
    const admin = requireSuperAdmin(locals);
    const body  = await request.json();
    const { email } = body;

    if (!email) throw error(400, 'Email is required');

    try {
        const result = await auth.api.inviteUser({
            body: { email, role: 'admin' },
        });

        await writeAuditLog({
            adminId:    admin.id,
            adminEmail: admin.email,
            action:     'created',
            entityType: 'admin_user',
            entityId:   (result as any)?.user?.id ?? email,
            entityName: email,
        });

        return json({ ok: true });
    } catch (err: any) {
        const message = err?.body?.message ?? err?.message ?? 'Invite failed';
        throw error(400, message);
    }
};
