import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Skip guard on the login page itself
	const isLoginPage = url.pathname === '/admin';
	if (isLoginPage) return {};

	if (!locals.user || !locals.session) {
		throw redirect(302, '/admin');
	}

	// Allow admin, super_admin, and editor roles
	const role = locals.user.role;
	if (role !== 'admin' && role !== 'super_admin' && role !== 'editor') {
		throw redirect(302, '/admin');
	}

	return {};
};