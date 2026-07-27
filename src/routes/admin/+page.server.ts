import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin/dashboard');
	}
};

export const actions: Actions = {
	login: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const role = String(form.get('role') ?? '').trim().toLowerCase();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		// 1. Sign in via better-auth
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

		// 2. Validate selected role matches the user's DB role
		const [row] = await db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.email, email))
			.limit(1);

		const dbRole = row?.role ?? '';

		const isAllowed = role === 'admin'
			? (dbRole === 'admin' || dbRole === 'super_admin')
			: dbRole === role;
		if (role && !isAllowed) {
			// Sign out — role mismatch
			await auth.api.signOut({ headers: request.headers }).catch(() => {});
			return fail(401, {
				error: `Selected role does not match your account. Your role is "${dbRole}".`,
			});
		}

		// sveltekitCookies plugin handles setting the cookie automatically
		throw redirect(302, '/admin/dashboard');
	},
};
