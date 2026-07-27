import { writable } from 'svelte/store';

function createPermissionDenied() {
	const { subscribe, set } = writable<{ open: boolean; message: string }>({
		open: false,
		message: ''
	});

	return {
		subscribe,
		show(message = "You don't have permission to perform this action.") {
			set({ open: true, message });
		},
		hide() {
			set({ open: false, message: '' });
		}
	};
}

export const permissionDenied = createPermissionDenied();
