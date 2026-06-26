import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = 'src/lib/server/db/drizzle';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
  const sql = neon(process.env.DATABASE_URL);

  // Ensure migrations tracking table exists
  await sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id serial PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  )`;

  // Read applied migrations
  const applied = await sql`SELECT hash FROM __drizzle_migrations ORDER BY created_at`;
  const appliedHashes = new Set((applied as any[]).map(r => r.hash));

  // Get migration files sorted
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    const hash = file.replace('.sql', '');
    if (appliedHashes.has(hash)) continue;

    const sqlText = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const statements = sqlText
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await sql.query(stmt);
    }

    await sql`INSERT INTO __drizzle_migrations (hash, created_at) VALUES (${hash}, ${Date.now()})`;
    count++;
    console.log(`  ✓ ${file}`);
  }

  if (count === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Applied ${count} migration(s).`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
