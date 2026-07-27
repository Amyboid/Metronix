import { permissionDenied } from '$lib/stores/permissionDenied';

/**
 * Shared API error handler. Checks for 403 and shows the permission-denied popup.
 * Always throws an Error with the server message so the caller's catch block still runs.
 */
export async function handleApiError(res: Response): Promise<never> {
	const body = await res.json().catch(() => ({ message: 'Operation failed' }));
	if (res.status === 403) {
		permissionDenied.show(body.message);
	}
	throw new Error(body.message);
}
