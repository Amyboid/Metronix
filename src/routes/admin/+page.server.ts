import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin/dashboard');
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		try {
			await auth.api.signInEmail({
				body: { email, password },
				headers: request.headers,
			});
		} catch (err: any) {
			const message: string =
				err?.body?.message ?? err?.message ?? 'Invalid email or password.';
			return fail(401, { error: message });
		}

		// sveltekitCookies plugin handles setting the cookie automatically
		throw redirect(302, '/admin/dashboard');
	},
};