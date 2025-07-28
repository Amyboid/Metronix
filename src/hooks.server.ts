import { redirect, type Handle } from '@sveltejs/kit';
import { PUBLIC_AUTH_COOKIE_NAME } from '$env/static/public';
import { verifySession, invalidateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(PUBLIC_AUTH_COOKIE_NAME);
    console.log('sessionId from hook', sessionId);

    if (sessionId) { 
        const user = await verifySession(sessionId);
        if (user) {
            event.locals.user = user;
        } else {
            console.log('delete session cookie...'); 
            event.cookies.delete(PUBLIC_AUTH_COOKIE_NAME, { path: '/' });
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    const protectedPaths = ['/admin']; // Any path starting with /admin is protected

    const isProtectedRoute = protectedPaths.some(path => event.url.pathname.startsWith(path));

    if (isProtectedRoute && !event.locals.user) {
        throw redirect(302, '/login');
    }

    const response = await resolve(event);

    return response;
};
 