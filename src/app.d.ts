
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				username: string;
				role: string;
			} | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export { }; 
