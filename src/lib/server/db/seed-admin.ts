/**
 * Creates the initial super_admin account.
 * Usage: bun run src/lib/server/db/seed-admin.ts
 *
 * Requires DATABASE_URL in your .env
 */
import { neon } from '@neondatabase/serverless';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { hex } from '@better-auth/utils/hex';

const EMAIL    = 'admin@example.com';
const PASSWORD = 'changeme123';
const NAME     = 'Super Admin';

async function hashPassword(password: string): Promise<string> {
  const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
  const key = await scryptAsync(password.normalize('NFKC'), salt, {
    N: 16384, r: 16, p: 1, dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${hex.encode(key)}`;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

  const sql = neon(process.env.DATABASE_URL);

  const existing = await sql`SELECT id FROM "user" WHERE email = ${EMAIL}`;
  if (existing.length) {
    console.log('⚠️  Admin user already exists:', EMAIL);
    return;
  }

  const id = crypto.randomUUID();
  const hashedPassword = await hashPassword(PASSWORD);

  await sql`INSERT INTO "user" (id, name, email, email_verified, role, banned, created_at, updated_at)
    VALUES (${id}, ${NAME}, ${EMAIL}, true, 'super_admin', false, now(), now())`;

  await sql`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES (${crypto.randomUUID()}, ${EMAIL}, 'credential', ${id}, ${hashedPassword}, now(), now())`;

  console.log('✅ super_admin created');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('   User ID :', id);
  console.log('\n⚠️  Change the password after first login.');
}

main().catch(e => { console.error('❌ Failed:', e); process.exit(1); });
