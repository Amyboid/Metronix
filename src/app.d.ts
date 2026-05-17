import type { auth } from '$lib/server/auth';
import type { Session, User } from 'better-auth';

// Infer the user type from the auth instance so it includes the `role` field
// added by the admin plugin.
type AuthUser = typeof auth.$Infer.Session.user;
type AuthSession = typeof auth.$Infer.Session.session;

declare global {
	namespace App {
		interface Locals {
			user: AuthUser | null;
			session: AuthSession | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};