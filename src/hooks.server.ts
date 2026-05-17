import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export async function handle({ event, resolve }) {
	// Always fetch session and populate locals — svelteKitHandler doesn't do this automatically
	const session = await auth.api.getSession({
		headers: event.request.headers,
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	}

	// Guard all /admin/* routes except the login page itself
	if (event.url.pathname.startsWith('/admin') && event.url.pathname !== '/admin') {
		if (!session) {
			return Response.redirect(new URL('/admin', event.url), 302);
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
}