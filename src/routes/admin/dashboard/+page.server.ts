import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Auth guard: the layout.server.ts handles the redirect for unauthenticated
	// users, but we double-check here for safety.
	if (!locals.user || !locals.session) {
		throw redirect(302, '/admin');
	}

	return {
		user: {
			id: locals.user.id,
			name: locals.user.name,
			email: locals.user.email,
			role: locals.user.role ?? 'admin',
		},
	};
};