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
export function requireSuperAdmin(locals: App.Locals): void {
	if (locals.user?.role !== 'super_admin') {
		throw error(403, 'Super admin access required');
	}
}

/**
 * Returns true if the current user is a super_admin.
 * Use this for conditional UI rendering in load functions.
 */
export function isSuperAdmin(locals: App.Locals): boolean {
	return locals.user?.role === 'super_admin';
}
