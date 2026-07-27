import { error } from '@sveltejs/kit';

/**
 * Throws a 403 error if the current user is not a super_admin.
 * Use this at the top of any +page.server.ts or +server.ts that
 * should be restricted to super admins only.
 *
 * @example
 * // src/routes/admin/settings/+page.server.ts
 * import { requireSuperAdmin } from '$lib/server/adminGuard';
 *
 * export async function load({ locals }) {
 *   requireSuperAdmin(locals);
 *   // ... rest of load
 * }
 */
export function requireSuperAdmin(locals: App.Locals) {
	if (locals.user?.role !== 'super_admin') {
		throw error(403, 'Super admin access required');
	}
	return locals.user as { id: string; email: string; role: string };
}

/**
 * Returns true if the current user is a super_admin.
 * Use this for conditional UI rendering in load functions.
 */
export function isSuperAdmin(locals: App.Locals): boolean {
	return locals.user?.role === 'super_admin';
}

/**
 * For write operations (POST/PATCH/DELETE).
 * Allows admin and super_admin roles only.
 */
export function requireAdmin(locals: App.Locals) {
	if (!locals.user) throw error(401, 'Unauthorized');
	const role = locals.user.role;
	if (role !== 'admin' && role !== 'super_admin') {
		throw error(403, "You don't have permission to perform this action.");
	}
	return locals.user as { id: string; email: string; role: string };
}

/**
 * For read operations (GET).
 * Allows admin, super_admin, and editor roles.
 */
export function requireAdminOrEditor(locals: App.Locals) {
	if (!locals.user) throw error(401, 'Unauthorized');
	const role = locals.user.role;
	if (role !== 'admin' && role !== 'super_admin' && role !== 'editor') {
		throw error(403, "You don't have permission to perform this action.");
	}
	return locals.user as { id: string; email: string; role: string };
}
