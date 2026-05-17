import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Skip guard on the login page itself
	const isLoginPage = url.pathname === '/admin';
	if (isLoginPage) return {};

	if (!locals.user || !locals.session) {
		throw redirect(302, '/admin');
	}

	// Only allow users with admin or super_admin role
	const role = locals.user.role;
	if (role !== 'admin' && role !== 'super_admin') {
		throw redirect(302, '/admin');
	}

	return {};
};