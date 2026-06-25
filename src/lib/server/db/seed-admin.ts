/**
 * Run once to create the initial super_admin account.
 * Usage: npx tsx src/scripts/seed-admin.ts
 *
 * Requires DATABASE_URL + BETTER_AUTH_URL in your .env
 */
import { auth } from '$lib/server/auth';

const EMAIL    = 'admin@example.com';
const PASSWORD = 'changeme123';
const NAME     = 'Super Admin';

async function main() {
	// 1. Create the user via better-auth (hashes password, writes to DB)
	const { user, error } = await auth.api.createUser({
		body: {
			email: EMAIL,
			password: PASSWORD,
			name: NAME,
			role: 'super_admin',
		},
	});

	if (error) {
		console.error('❌ Failed to create user:', error);
		process.exit(1);
	}

	console.log('✅ super_admin created');
	console.log('   Email   :', EMAIL);
	console.log('   Password:', PASSWORD);
	console.log('   User ID :', user.id);
	console.log('\n⚠️  Change the password after first login.');
}

main();