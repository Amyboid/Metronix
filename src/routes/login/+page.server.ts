// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { findUserByUsername, comparePassword, createSession } from '$lib/server/auth';
import { PUBLIC_AUTH_COOKIE_NAME } from '$env/static/public';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(302, '/admin');
    } 
};


export const actions: Actions = {
    login: async (event: RequestEvent) => {
        const { request, cookies } = event;

        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();
        const userRole = data.get('role')?.toString();

        if (!username || !password) {
            return fail(400, { message: 'Username and password are required.' });
        }

        const user = await findUserByUsername(username); 
        
        if (!user || !(await comparePassword(password, user.passwordHash)) || (user.role !== userRole)) {
            return fail(400, { message: "invalid username or password or role" });
        }

        console.log("User authenticated:", user);

        const sessionId = await createSession(user.id, user.role);
        console.log("Session created:", sessionId); 

        cookies.set(PUBLIC_AUTH_COOKIE_NAME, sessionId, {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            secure: false
        });

        throw redirect(302, '/admin');
    },

    logout: async (event: RequestEvent) => {
        const { cookies, locals } = event;
        const { invalidateSession } = await import('$lib/server/auth');
        const sessionId = cookies.get(PUBLIC_AUTH_COOKIE_NAME);

        if (sessionId) {
            await invalidateSession(sessionId);
            cookies.delete(PUBLIC_AUTH_COOKIE_NAME, { path: '/' });
        }
        locals.user = null;

        throw redirect(302, '/login');
    }
};
