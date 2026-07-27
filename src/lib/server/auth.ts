import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { ac, adminRole, superAdminRole, editorRole } from '$lib/server/permissions';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),

	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},

	session: {
		expiresIn: 60 * 60 * 24,
		updateAge: 60 * 60,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},

	plugins: [
		admin({
			ac,
		roles: {
			admin: adminRole,
			super_admin: superAdminRole,
			editor: editorRole,
		},
			defaultRole: 'admin',
			adminRoles: ['admin', 'super_admin'],
		}),
		sveltekitCookies(getRequestEvent), // ← must be last
	],
});