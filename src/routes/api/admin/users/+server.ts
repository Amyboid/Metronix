import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireSuperAdmin } from '$lib/server/adminGuard';
import { writeAuditLog } from '$lib/server/audit';
import type { RequestHandler } from './$types';

// ─── GET — list admin users (super_admin only) ────────────────────────────────

export const GET: RequestHandler = async ({ locals }) => {
    requireSuperAdmin(locals);

    const rows = await db.select({
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        banned:    user.banned,
        createdAt: user.createdAt,
    })
        .from(user)
        .orderBy(desc(user.createdAt));

    return json({ items: rows });
};

// ─── PATCH — update user role or banned status (super_admin only) ─────────────

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const admin = requireSuperAdmin(locals);
    const body  = await request.json();
    const { id, role, banned } = body;

    if (!id) throw error(400, 'Missing user id');

    // Prevent self-deactivation
    if (id === admin.id && banned === true) {
        throw error(400, 'Cannot deactivate your own account');
    }

    const updateData: Record<string, any> = {};
    if (role !== undefined)  updateData.role  = role;
    if (banned !== undefined) updateData.banned = banned;

    if (!Object.keys(updateData).length) throw error(400, 'Nothing to update');

    await db.update(user).set(updateData).where(eq(user.id, id));

    const target = await db.select({ email: user.email }).from(user).where(eq(user.id, id)).limit(1);

    await writeAuditLog({
        adminId:    admin.id,
        adminEmail: admin.email,
        action:     role ? 'role_changed' : (banned ? 'deactivated' : 'activated'),
        entityType: 'admin_user',
        entityId:   id,
        entityName: target[0]?.email ?? id,
    });

    return json({ ok: true });
};
